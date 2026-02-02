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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Header from "../../components/ui/Header.tsx";
import Footer from "../../components/ui/Footer.tsx";
import NumberSpinner from "../../components/NumberSpinner.tsx";
import AddIcon from "@mui/icons-material/Add";

interface PalettierType {
  id: string;
  name: string;
  isCustom: boolean;
}

interface PalettierFormData {
  name: string;
  typeId: string | null;
  isNewType: boolean;
  newTypeName: string;
  dimensionX: number;
  dimensionY: number;
  dimensionZ: number;
}

interface FormData {
  palettierCount: number;
  palettiers: PalettierFormData[];
}

// Default palettier types (would come from API in real app)
const DEFAULT_PALETTIER_TYPES: PalettierType[] = [
  { id: "client", name: "Client", isCustom: false },
  { id: "company", name: "Entreprise", isCustom: false },
  { id: "refrigerated", name: "Réfrigéré", isCustom: false },
  { id: "dangerous", name: "Matières dangereuses", isCustom: false },
  { id: "chemical", name: "Produits chimiques", isCustom: false },
  { id: "fragile", name: "Fragile", isCustom: false },
];

const getDefaultPalettier = (): PalettierFormData => ({
  name: "",
  typeId: DEFAULT_PALETTIER_TYPES[0].id,
  isNewType: false,
  newTypeName: "",
  dimensionX: 1,
  dimensionY: 1,
  dimensionZ: 1,
});

const PalettierPage: React.FC = () => {
  const [palettierCount, setPalettierCount] = React.useState(1);
  const [palettierTypes, setPalettierTypes] = React.useState<PalettierType[]>(
    DEFAULT_PALETTIER_TYPES
  );

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
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

  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      palettierCount: 1,
      palettiers: [getDefaultPalettier()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "palettiers",
  });

  const handleCountChange = (newCount: number) => {
    setPalettierCount(newCount);
    const currentCount = fields.length;

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        append(getDefaultPalettier());
      }
    } else if (newCount < currentCount) {
      for (let i = currentCount - 1; i >= newCount; i--) {
        remove(i);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    const processedPalettiers = data.palettiers.map((palettier) => {
      const processed = { ...palettier };

      if (palettier.isNewType && palettier.newTypeName.trim()) {
        const newTypeId = `custom-${palettier.newTypeName.toLowerCase().replace(/\s+/g, "-")}`;
        const existingType = palettierTypes.find((t) => t.id === newTypeId);

        if (!existingType) {
          const newType: PalettierType = {
            id: newTypeId,
            name: palettier.newTypeName.trim(),
            isCustom: true,
          };
          setPalettierTypes((prev) => [...prev, newType]);
        }

        processed.typeId = newTypeId;
      }

      return {
        name: processed.name,
        typeId: processed.typeId,
        dimensionX: processed.dimensionX,
        dimensionY: processed.dimensionY,
        dimensionZ: processed.dimensionZ,
      };
    });

    console.log("Palettiers submitted:", processedPalettiers);
    console.log("All palettier types:", palettierTypes);
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
            Configuration des palettiers
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ marginBottom: 4, marginTop: 3 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h6" color="text.secondary" mb={2}>
                  Nombre de palettiers
                </Typography>
                <NumberSpinner
                  value={palettierCount}
                  onChange={handleCountChange}
                  min={1}
                  label="Nombre de palettiers"
                />
              </Box>

              <Divider />

              {fields.map((field, index) => {
                const watchIsNewType = watch(`palettiers.${index}.isNewType`);

                return (
                  <Paper
                    key={field.id}
                    elevation={2}
                    sx={{ padding: 3, backgroundColor: "background.paper" }}
                  >
                    <Typography variant="h6" color="text.primary" mb={2}>
                      Palettier {index + 1}
                    </Typography>

                    <Stack spacing={2}>
                      {/* Name */}
                      <Controller
                        name={`palettiers.${index}.name`}
                        control={control}
                        rules={{ required: "Le nom est requis" }}
                        render={({ field, fieldState: { error } }) => (
                          <TextField
                            {...field}
                            label="Nom du palettier"
                            fullWidth
                            error={!!error}
                            helperText={
                              error?.message ||
                              "Identifiant unique du palettier (ex: PAL-A01)"
                            }
                            placeholder="PAL-A01"
                          />
                        )}
                      />

                      {/* Type Selection */}
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          Type de palettier
                        </Typography>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          alignItems="center"
                        >
                          <Controller
                            name={`palettiers.${index}.typeId`}
                            control={control}
                            rules={{
                              required: !watchIsNewType
                                ? "Le type est requis"
                                : false,
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                select
                                label="Type existant"
                                fullWidth
                                disabled={watchIsNewType}
                                error={!!error}
                                helperText={error?.message}
                                value={field.value ?? ""}
                              >
                                {palettierTypes.map((type) => (
                                  <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                    {type.isCustom && " (personnalisé)"}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                          <FormControlLabel
                            control={
                              <Controller
                                name={`palettiers.${index}.isNewType`}
                                control={control}
                                render={({ field }) => (
                                  <Checkbox
                                    {...field}
                                    checked={field.value}
                                    onChange={(e) => {
                                      field.onChange(e.target.checked);
                                      if (!e.target.checked) {
                                        setValue(
                                          `palettiers.${index}.newTypeName`,
                                          ""
                                        );
                                      }
                                    }}
                                    icon={<AddIcon />}
                                    checkedIcon={<AddIcon color="primary" />}
                                  />
                                )}
                              />
                            }
                            label="Nouveau"
                            sx={{ whiteSpace: "nowrap" }}
                          />
                        </Stack>

                        <Collapse in={watchIsNewType}>
                          <Stack
                            direction="row"
                            spacing={2}
                            mt={2}
                            alignItems="flex-start"
                          >
                            <Controller
                              name={`palettiers.${index}.newTypeName`}
                              control={control}
                              rules={{
                                required: watchIsNewType
                                  ? "Le nom du type est requis"
                                  : false,
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <TextField
                                  {...field}
                                  label="Nom du nouveau type"
                                  fullWidth
                                  error={!!error}
                                  helperText={
                                    error?.message ||
                                    "Ajoutez le type pour le rendre disponible"
                                  }
                                  placeholder="Ex: Zone haute sécurité"
                                />
                              )}
                            />
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => {
                                const newTypeName = watch(
                                  `palettiers.${index}.newTypeName`
                                );
                                if (newTypeName?.trim()) {
                                  const newTypeId = `custom-${newTypeName.toLowerCase().replace(/\s+/g, "-")}`;
                                  const exists = palettierTypes.find(
                                    (t) => t.id === newTypeId
                                  );
                                  if (!exists) {
                                    setPalettierTypes((prev) => [
                                      ...prev,
                                      {
                                        id: newTypeId,
                                        name: newTypeName.trim(),
                                        isCustom: true,
                                      },
                                    ]);
                                  }
                                  setValue(
                                    `palettiers.${index}.typeId`,
                                    newTypeId
                                  );
                                  setValue(
                                    `palettiers.${index}.isNewType`,
                                    false
                                  );
                                  setValue(
                                    `palettiers.${index}.newTypeName`,
                                    ""
                                  );
                                }
                              }}
                              sx={{
                                whiteSpace: "nowrap",
                                minWidth: "auto",
                                px: 3,
                                height: 56,
                              }}
                            >
                              Ajouter
                            </Button>
                          </Stack>
                        </Collapse>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          Dimensions en nombre de cases
                        </Typography>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                        >
                          <Controller
                            name={`palettiers.${index}.dimensionX`}
                            control={control}
                            rules={{
                              required: "La dimension X est requise",
                              min: { value: 1, message: "Minimum 1" },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                type="number"
                                label="Largeur (X)"
                                fullWidth
                                onKeyDown={handleNumericKeyDown}
                                slotProps={{ htmlInput: { min: 1 } }}
                                error={!!error}
                                helperText={error?.message}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 1)
                                }
                              />
                            )}
                          />

                          <Controller
                            name={`palettiers.${index}.dimensionY`}
                            control={control}
                            rules={{
                              required: "La dimension Y est requise",
                              min: { value: 1, message: "Minimum 1" },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                type="number"
                                label="Profondeur (Y)"
                                fullWidth
                                onKeyDown={handleNumericKeyDown}
                                slotProps={{ htmlInput: { min: 1 } }}
                                error={!!error}
                                helperText={error?.message}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 1)
                                }
                              />
                            )}
                          />

                          <Controller
                            name={`palettiers.${index}.dimensionZ`}
                            control={control}
                            rules={{
                              required: "La dimension Z est requise",
                              min: { value: 1, message: "Minimum 1" },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                type="number"
                                label="Hauteur (Z)"
                                fullWidth
                                onKeyDown={handleNumericKeyDown}
                                slotProps={{ htmlInput: { min: 1 } }}
                                error={!!error}
                                helperText={error?.message}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value) || 1)
                                }
                              />
                            )}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  Valider la configuration
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

export default PalettierPage;
