import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Paper,
  Divider,
  Collapse,
  Chip,
  IconButton,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Header from "../../components/ui/Header.tsx";
import Footer from "../../components/ui/Footer.tsx";
import NumberSpinner from "../../components/NumberSpinner.tsx";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const RULE_TYPES = [
  {
    value: "zone_priority",
    label: "Priorité de zone",
    description:
      "Privilégier certaines zones ou palettiers pour ce type de produit",
  },
  {
    value: "incompatibility",
    label: "Incompatibilité produit",
    description:
      "Maintenir une distance minimale avec certains types de produits",
  },
  {
    value: "storage_condition",
    label: "Conditions de stockage",
    description: "Contraintes de température, humidité ou environnement",
  },
  {
    value: "placement",
    label: "Contraintes de placement",
    description: "Restrictions sur la position physique (hauteur, sol, etc.)",
  },
] as const;

type RuleType = (typeof RULE_TYPES)[number]["value"];

const ZONE_OPTIONS = [
  { value: "zone_a", label: "Zone A - Entrée" },
  { value: "zone_b", label: "Zone B - Central" },
  { value: "zone_c", label: "Zone C - Fond" },
  { value: "zone_cold", label: "Zone Froide" },
  { value: "zone_secure", label: "Zone Sécurisée" },
];

const PALETTIER_OPTIONS = [
  { value: "PAL-A01", label: "Palettier A01" },
  { value: "PAL-A02", label: "Palettier A02" },
  { value: "PAL-B01", label: "Palettier B01" },
  { value: "PAL-B02", label: "Palettier B02" },
  { value: "PAL-C01", label: "Palettier C01 (Froid)" },
  { value: "PAL-C02", label: "Palettier C02 (Froid)" },
  { value: "PAL-S01", label: "Palettier S01 (Sécurisé)" },
];

const PALETTIER_TYPE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "company", label: "Entreprise" },
  { value: "refrigerated", label: "Réfrigéré" },
  { value: "dangerous", label: "Matières dangereuses" },
  { value: "chemical", label: "Produits chimiques" },
  { value: "fragile", label: "Fragile" },
];

const SELECTION_MODES = [
  { value: "types", label: "Par type de palettier" },
  { value: "palettiers", label: "Par palettiers spécifiques" },
] as const;

const PRODUCT_CATEGORIES = [
  { value: "flammable", label: "Produits inflammables" },
  { value: "oxidizer", label: "Produits oxydants" },
  { value: "corrosive", label: "Produits corrosifs" },
  { value: "food", label: "Produits alimentaires" },
  { value: "chemical", label: "Produits chimiques" },
  { value: "fragile", label: "Produits fragiles" },
];

const CONDITION_TYPES = [
  { value: "temperature_controlled", label: "Température contrôlée" },
  { value: "humidity_controlled", label: "Humidité contrôlée" },
  { value: "ventilated", label: "Zone ventilée" },
  { value: "dark", label: "À l'abri de la lumière" },
];

const PLACEMENT_CONSTRAINTS = [
  { value: "ground_only", label: "Sol uniquement" },
  { value: "no_stack", label: "Ne pas empiler" },
  { value: "max_height", label: "Hauteur maximale" },
  { value: "easy_access", label: "Accès facile requis" },
];

interface ZonePriorityConfig {
  zones: string[];
  priority: number;
}

interface IncompatibilityConfig {
  incompatibleCategories: string[];
  minimumDistance: number;
}

interface StorageConditionConfig {
  conditionType: string;
  selectionMode: "types" | "palettiers";
  palettierTypes: string[];
  palettiers: string[];
}

interface PlacementConfig {
  constraint: string;
  maxHeight?: number;
}

interface RuleFormData {
  name: string;
  description: string;
  ruleType: RuleType | "";
  zonePriority: ZonePriorityConfig;
  incompatibility: IncompatibilityConfig;
  storageCondition: StorageConditionConfig;
  placement: PlacementConfig;
}

interface FormData {
  ruleCount: number;
  rules: RuleFormData[];
}

const getDefaultRule = (): RuleFormData => ({
  name: "",
  description: "",
  ruleType: "",
  zonePriority: {
    zones: [],
    priority: 5,
  },
  incompatibility: {
    incompatibleCategories: [],
    minimumDistance: 1,
  },
  storageCondition: {
    conditionType: "",
    selectionMode: "types",
    palettierTypes: [],
    palettiers: [],
  },
  placement: {
    constraint: "",
    maxHeight: undefined,
  },
});

const RulesPage: React.FC = () => {
  const [ruleCount, setRuleCount] = React.useState(1);

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "-",
    ];
    if (
      !allowedKeys.includes(e.key) &&
      (e.key < "0" || e.key > "9") &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      ruleCount: 1,
      rules: [getDefaultRule()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  const handleCountChange = (newCount: number) => {
    setRuleCount(newCount);
    const currentCount = fields.length;

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        append(getDefaultRule());
      }
    } else if (newCount < currentCount) {
      for (let i = currentCount - 1; i >= newCount; i--) {
        remove(i);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    const processedRules = data.rules.map((rule) => {
      const baseRule = {
        name: rule.name,
        description: rule.description,
        ruleType: rule.ruleType,
      };

      switch (rule.ruleType) {
        case "zone_priority":
          return { ...baseRule, config: rule.zonePriority };
        case "incompatibility":
          return { ...baseRule, config: rule.incompatibility };
        case "storage_condition":
          const storageConfig = {
            conditionType: rule.storageCondition.conditionType,
            selectionMode: rule.storageCondition.selectionMode,
            ...(rule.storageCondition.selectionMode === "types"
              ? { palettierTypes: rule.storageCondition.palettierTypes }
              : { palettiers: rule.storageCondition.palettiers }),
          };
          return { ...baseRule, config: storageConfig };
        case "placement":
          return { ...baseRule, config: rule.placement };
        default:
          return baseRule;
      }
    });

    console.log("Rules submitted:", processedRules);
  };

  const getRuleTypeInfo = (type: RuleType | "") => {
    return RULE_TYPES.find((t) => t.value === type);
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            color="text.primary"
            gutterBottom
            fontWeight={600}
            mt={4}
          >
            Création de règles
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Définissez les règles qui guideront le placement automatique des
            palettes dans l'entrepôt.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ marginBottom: 4, marginTop: 3 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h6" color="text.secondary" mb={2}>
                  Nombre de règles à créer
                </Typography>
                <NumberSpinner
                  value={ruleCount}
                  onChange={handleCountChange}
                  min={1}
                  label="Nombre de règles"
                />
              </Box>

              <Divider />

              {fields.map((field, index) => {
                const watchRuleType = watch(`rules.${index}.ruleType`);
                const watchPlacementConstraint = watch(
                  `rules.${index}.placement.constraint`
                );
                const ruleTypeInfo = getRuleTypeInfo(watchRuleType);

                return (
                  <Paper
                    key={field.id}
                    elevation={2}
                    sx={{ padding: 3, backgroundColor: "background.paper" }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="h6" color="text.primary">
                        Règle {index + 1}
                      </Typography>
                      {fields.length > 1 && (
                        <IconButton
                          color="error"
                          onClick={() => {
                            remove(index);
                            setRuleCount((prev) => prev - 1);
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          Informations de base
                        </Typography>
                        <Stack spacing={2}>
                          <Controller
                            name={`rules.${index}.name`}
                            control={control}
                            rules={{
                              required: "Le nom de la règle est requis",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                label="Nom de la règle"
                                fullWidth
                                error={!!error}
                                helperText={
                                  error?.message || "Un nom court et descriptif"
                                }
                                placeholder="Ex: Stockage produits frais"
                              />
                            )}
                          />

                          <Controller
                            name={`rules.${index}.description`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Description (optionnel)"
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Décrivez l'objectif de cette règle..."
                              />
                            )}
                          />
                        </Stack>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          Type de règle
                        </Typography>
                        <Controller
                          name={`rules.${index}.ruleType`}
                          control={control}
                          rules={{ required: "Sélectionnez un type de règle" }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              select
                              label="Type de règle"
                              fullWidth
                              error={!!error}
                              helperText={error?.message}
                            >
                              {RULE_TYPES.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                  <Box>
                                    <Typography>{type.label}</Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {type.description}
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />

                        {ruleTypeInfo && (
                          <Box
                            mt={1}
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <InfoOutlinedIcon fontSize="small" color="info" />
                            <Typography variant="body2" color="text.secondary">
                              {ruleTypeInfo.description}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {watchRuleType && (
                        <>
                          <Divider />
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              mb={1}
                            >
                              Configuration
                            </Typography>

                            <Collapse in={watchRuleType === "zone_priority"}>
                              <Stack spacing={2}>
                                <Controller
                                  name={`rules.${index}.zonePriority.zones`}
                                  control={control}
                                  rules={{
                                    validate: (value) =>
                                      watchRuleType !== "zone_priority" ||
                                      value.length > 0 ||
                                      "Sélectionnez au moins une zone",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <TextField
                                      select
                                      label="Zones prioritaires"
                                      fullWidth
                                      error={!!error}
                                      helperText={
                                        error?.message ||
                                        "Les produits avec cette règle seront placés en priorité dans ces zones"
                                      }
                                      slotProps={{
                                        select: {
                                          multiple: true,
                                          renderValue: (selected) => (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 0.5,
                                              }}
                                            >
                                              {(selected as string[]).map(
                                                (value) => (
                                                  <Chip
                                                    key={value}
                                                    label={
                                                      ZONE_OPTIONS.find(
                                                        (z) => z.value === value
                                                      )?.label
                                                    }
                                                    size="small"
                                                  />
                                                )
                                              )}
                                            </Box>
                                          ),
                                        },
                                      }}
                                      value={field.value}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                    >
                                      {ZONE_OPTIONS.map((zone) => (
                                        <MenuItem
                                          key={zone.value}
                                          value={zone.value}
                                        >
                                          {zone.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  )}
                                />

                                <Controller
                                  name={`rules.${index}.zonePriority.priority`}
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      select
                                      label="Niveau de priorité"
                                      fullWidth
                                      helperText="Plus le niveau est élevé, plus la règle est importante"
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                        (level) => (
                                          <MenuItem key={level} value={level}>
                                            {level}{" "}
                                            {level === 1
                                              ? "(Faible)"
                                              : level === 10
                                                ? "(Critique)"
                                                : ""}
                                          </MenuItem>
                                        )
                                      )}
                                    </TextField>
                                  )}
                                />
                              </Stack>
                            </Collapse>

                            <Collapse in={watchRuleType === "incompatibility"}>
                              <Stack spacing={2}>
                                <Controller
                                  name={`rules.${index}.incompatibility.incompatibleCategories`}
                                  control={control}
                                  rules={{
                                    validate: (value) =>
                                      watchRuleType !== "incompatibility" ||
                                      value.length > 0 ||
                                      "Sélectionnez au moins une catégorie",
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <TextField
                                      select
                                      label="Catégories incompatibles"
                                      fullWidth
                                      error={!!error}
                                      helperText={
                                        error?.message ||
                                        "Les produits avec cette règle seront éloignés de ces catégories"
                                      }
                                      slotProps={{
                                        select: {
                                          multiple: true,
                                          renderValue: (selected) => (
                                            <Box
                                              sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 0.5,
                                              }}
                                            >
                                              {(selected as string[]).map(
                                                (value) => (
                                                  <Chip
                                                    key={value}
                                                    label={
                                                      PRODUCT_CATEGORIES.find(
                                                        (c) => c.value === value
                                                      )?.label
                                                    }
                                                    size="small"
                                                    color="error"
                                                  />
                                                )
                                              )}
                                            </Box>
                                          ),
                                        },
                                      }}
                                      value={field.value}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                    >
                                      {PRODUCT_CATEGORIES.map((category) => (
                                        <MenuItem
                                          key={category.value}
                                          value={category.value}
                                        >
                                          {category.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  )}
                                />

                                <Controller
                                  name={`rules.${index}.incompatibility.minimumDistance`}
                                  control={control}
                                  rules={{
                                    min: {
                                      value: 1,
                                      message: "Distance minimale de 1",
                                    },
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <TextField
                                      {...field}
                                      type="number"
                                      label="Distance minimale (en emplacements)"
                                      fullWidth
                                      onKeyDown={handleNumericKeyDown}
                                      slotProps={{ htmlInput: { min: 1 } }}
                                      error={!!error}
                                      helperText={
                                        error?.message ||
                                        "Nombre d'emplacements minimum entre les produits incompatibles"
                                      }
                                      onChange={(e) =>
                                        field.onChange(
                                          Number(e.target.value) || 1
                                        )
                                      }
                                    />
                                  )}
                                />
                              </Stack>
                            </Collapse>

                            <Collapse
                              in={watchRuleType === "storage_condition"}
                            >
                              <Stack spacing={2}>
                                <Controller
                                  name={`rules.${index}.storageCondition.conditionType`}
                                  control={control}
                                  rules={{
                                    required:
                                      watchRuleType === "storage_condition"
                                        ? "Sélectionnez un type de condition"
                                        : false,
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <TextField
                                      {...field}
                                      select
                                      label="Type de condition"
                                      fullWidth
                                      error={!!error}
                                      helperText={error?.message}
                                    >
                                      {CONDITION_TYPES.map((condition) => (
                                        <MenuItem
                                          key={condition.value}
                                          value={condition.value}
                                        >
                                          {condition.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  )}
                                />

                                <Controller
                                  name={`rules.${index}.storageCondition.selectionMode`}
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      select
                                      label="Mode de sélection"
                                      fullWidth
                                      helperText="Choisissez comment sélectionner les emplacements concernés"
                                    >
                                      {SELECTION_MODES.map((mode) => (
                                        <MenuItem
                                          key={mode.value}
                                          value={mode.value}
                                        >
                                          {mode.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  )}
                                />

                                <Collapse
                                  in={
                                    watch(
                                      `rules.${index}.storageCondition.selectionMode`
                                    ) === "types"
                                  }
                                >
                                  <Controller
                                    name={`rules.${index}.storageCondition.palettierTypes`}
                                    control={control}
                                    rules={{
                                      validate: (value) =>
                                        watchRuleType !== "storage_condition" ||
                                        watch(
                                          `rules.${index}.storageCondition.selectionMode`
                                        ) !== "types" ||
                                        value.length > 0 ||
                                        "Sélectionnez au moins un type de palettier",
                                    }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        select
                                        label="Types de palettiers"
                                        fullWidth
                                        error={!!error}
                                        helperText={
                                          error?.message ||
                                          "Tous les palettiers de ces types seront concernés"
                                        }
                                        slotProps={{
                                          select: {
                                            multiple: true,
                                            renderValue: (selected) => (
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  flexWrap: "wrap",
                                                  gap: 0.5,
                                                }}
                                              >
                                                {(selected as string[]).map(
                                                  (value) => (
                                                    <Chip
                                                      key={value}
                                                      label={
                                                        PALETTIER_TYPE_OPTIONS.find(
                                                          (t) =>
                                                            t.value === value
                                                        )?.label
                                                      }
                                                      size="small"
                                                      color="secondary"
                                                    />
                                                  )
                                                )}
                                              </Box>
                                            ),
                                          },
                                        }}
                                        value={field.value}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                      >
                                        {PALETTIER_TYPE_OPTIONS.map((type) => (
                                          <MenuItem
                                            key={type.value}
                                            value={type.value}
                                          >
                                            {type.label}
                                          </MenuItem>
                                        ))}
                                      </TextField>
                                    )}
                                  />
                                </Collapse>

                                <Collapse
                                  in={
                                    watch(
                                      `rules.${index}.storageCondition.selectionMode`
                                    ) === "palettiers"
                                  }
                                >
                                  <Controller
                                    name={`rules.${index}.storageCondition.palettiers`}
                                    control={control}
                                    rules={{
                                      validate: (value) =>
                                        watchRuleType !== "storage_condition" ||
                                        watch(
                                          `rules.${index}.storageCondition.selectionMode`
                                        ) !== "palettiers" ||
                                        value.length > 0 ||
                                        "Sélectionnez au moins un palettier",
                                    }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        select
                                        label="Palettiers spécifiques"
                                        fullWidth
                                        error={!!error}
                                        helperText={
                                          error?.message ||
                                          "Sélectionnez les palettiers individuellement"
                                        }
                                        slotProps={{
                                          select: {
                                            multiple: true,
                                            renderValue: (selected) => (
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  flexWrap: "wrap",
                                                  gap: 0.5,
                                                }}
                                              >
                                                {(selected as string[]).map(
                                                  (value) => (
                                                    <Chip
                                                      key={value}
                                                      label={
                                                        PALETTIER_OPTIONS.find(
                                                          (p) =>
                                                            p.value === value
                                                        )?.label
                                                      }
                                                      size="small"
                                                      color="info"
                                                    />
                                                  )
                                                )}
                                              </Box>
                                            ),
                                          },
                                        }}
                                        value={field.value}
                                        onChange={(e) =>
                                          field.onChange(e.target.value)
                                        }
                                      >
                                        {PALETTIER_OPTIONS.map((palettier) => (
                                          <MenuItem
                                            key={palettier.value}
                                            value={palettier.value}
                                          >
                                            {palettier.label}
                                          </MenuItem>
                                        ))}
                                      </TextField>
                                    )}
                                  />
                                </Collapse>
                              </Stack>
                            </Collapse>

                            <Collapse in={watchRuleType === "placement"}>
                              <Stack spacing={2}>
                                <Controller
                                  name={`rules.${index}.placement.constraint`}
                                  control={control}
                                  rules={{
                                    required:
                                      watchRuleType === "placement"
                                        ? "Sélectionnez une contrainte"
                                        : false,
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <TextField
                                      {...field}
                                      select
                                      label="Contrainte de placement"
                                      fullWidth
                                      error={!!error}
                                      helperText={error?.message}
                                    >
                                      {PLACEMENT_CONSTRAINTS.map(
                                        (constraint) => (
                                          <MenuItem
                                            key={constraint.value}
                                            value={constraint.value}
                                          >
                                            {constraint.label}
                                          </MenuItem>
                                        )
                                      )}
                                    </TextField>
                                  )}
                                />

                                <Collapse
                                  in={watchPlacementConstraint === "max_height"}
                                >
                                  <Controller
                                    name={`rules.${index}.placement.maxHeight`}
                                    control={control}
                                    rules={{
                                      min: {
                                        value: 1,
                                        message: "Minimum 1 niveau",
                                      },
                                    }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...field}
                                        type="number"
                                        label="Hauteur maximale (niveaux)"
                                        fullWidth
                                        onKeyDown={handleNumericKeyDown}
                                        slotProps={{ htmlInput: { min: 1 } }}
                                        error={!!error}
                                        helperText={
                                          error?.message ||
                                          "Nombre maximum de niveaux depuis le sol"
                                        }
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          field.onChange(
                                            value === ""
                                              ? undefined
                                              : Number(value)
                                          );
                                        }}
                                      />
                                    )}
                                  />
                                </Collapse>
                              </Stack>
                            </Collapse>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Paper>
                );
              })}

              <Box display="flex" justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    append(getDefaultRule());
                    setRuleCount((prev) => prev + 1);
                  }}
                >
                  Ajouter une règle
                </Button>
              </Box>

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  Enregistrer les règles
                </Button>
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default RulesPage;
