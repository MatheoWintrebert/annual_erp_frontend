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
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Header from "../../components/ui/Header.tsx";
import Footer from "../../components/ui/Footer.tsx";
import NumberSpinner from "../../components/NumberSpinner.tsx";
import AddIcon from "@mui/icons-material/Add";

interface ProductReference {
  reference: string;
  name: string;
  minimalStock?: number;
  rulesId: number;
  unit: string | null;
}

interface LotFormData {
  lotNumber: string;
  autoGenerateLot: boolean;
  productReference: string | null;
  isNewProduct: boolean;
  newProduct: ProductReference;
  autoGenerateRef: boolean;
  quantity: number;
  receivedDate: string;
  expirationDate?: string;
  supplier?: string;
}

interface FormData {
  lotCount: number;
  lots: LotFormData[];
}

const EXISTING_PRODUCTS: ProductReference[] = [
  {
    reference: "SUGAR-C12",
    name: "Sucrose (C₁₂H₂₂O₁₁)",
    minimalStock: 100,
    rulesId: 1,
    unit: "kg",
  },
  {
    reference: "SUGAR-C6",
    name: "Glucose (C₆H₁₂O₆)",
    minimalStock: 50,
    rulesId: 1,
    unit: "kg",
  },
];

const PRODUCT_RULES = [
  [0, "No restrictions"],
  [1, "Temperature controlled"],
  [2, "Fragile"],
  [3, "Heavy"],
] as const;

const PRODUCT_UNITS = [
  { value: null, label: "Aucune unité" },
  { value: "kg", label: "Kilogramme (kg)" },
  { value: "g", label: "Gramme (g)" },
  { value: "liter", label: "Litre (L)" },
  { value: "ml", label: "Millilitre (mL)" },
  { value: "unit", label: "Unité" },
  { value: "box", label: "Boîte" },
  { value: "pallet", label: "Palette" },
] as const;

const generateLotNumber = (): string => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LOT-${dateStr}-${random}`;
};

const generateProductReference = (
  existingProducts: ProductReference[]
): string => {
  const existingRefs = existingProducts.map((p) => p.reference);
  let counter = existingRefs.length + 1;
  let newRef = `REF-${String(counter).padStart(4, "0")}`;
  while (existingRefs.includes(newRef)) {
    counter++;
    newRef = `REF-${String(counter).padStart(4, "0")}`;
  }
  return newRef;
};

const getDefaultLot = (): LotFormData => ({
  lotNumber: "",
  autoGenerateLot: true,
  productReference: null,
  isNewProduct: false,
  newProduct: {
    reference: "",
    name: "",
    minimalStock: undefined,
    rulesId: PRODUCT_RULES[0][0],
    unit: null,
  },
  autoGenerateRef: true,
  quantity: 1,
  receivedDate: new Date().toISOString().slice(0, 10),
  expirationDate: undefined,
  supplier: "",
});

const ProductPage: React.FC = () => {
  const [lotCount, setLotCount] = React.useState(1);
  const [products, setProducts] =
    React.useState<ProductReference[]>(EXISTING_PRODUCTS);

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
      lotCount: 1,
      lots: [getDefaultLot()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lots",
  });

  const handleCountChange = (newCount: number) => {
    setLotCount(newCount);
    const currentCount = fields.length;

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        append(getDefaultLot());
      }
    } else if (newCount < currentCount) {
      for (let i = currentCount - 1; i >= newCount; i--) {
        remove(i);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    const processedLots = data.lots.map((lot) => {
      const processedLot = { ...lot };

      if (lot.autoGenerateLot || !lot.lotNumber) {
        processedLot.lotNumber = generateLotNumber();
      }

      if (lot.isNewProduct) {
        const newProduct = { ...lot.newProduct };
        if (lot.autoGenerateRef || !newProduct.reference) {
          newProduct.reference = generateProductReference(products);
        }
        setProducts((prev) => [...prev, newProduct]);
        processedLot.productReference = newProduct.reference;
      }

      return processedLot;
    });

    console.log("Form submitted:", { ...data, lots: processedLots });
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
            Entrée de lots
          </Typography>

          <Box
            component="form"
            onSubmit={(e) => {
              void handleSubmit(onSubmit)(e);
            }}
          >
            <Stack spacing={3} sx={{ marginBottom: 4, marginTop: 3 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h6" color="text.secondary" mb={2}>
                  Nombre de lots à enregistrer
                </Typography>
                <NumberSpinner
                  value={lotCount}
                  onChange={handleCountChange}
                  min={1}
                  label="Nombre de lots"
                />
              </Box>

              <Divider />

              {fields.map((field, index) => {
                const watchIsNewProduct = watch(
                  `lots.${String(index)}.isNewProduct`
                ) as boolean;
                const watchAutoGenerateLot = watch(
                  `lots.${String(index)}.autoGenerateLot`
                ) as boolean;
                const watchAutoGenerateRef = watch(
                  `lots.${String(index)}.autoGenerateRef`
                ) as boolean;

                return (
                  <Paper
                    key={field.id}
                    elevation={2}
                    sx={{ padding: 3, backgroundColor: "background.paper" }}
                  >
                    <Typography variant="h6" color="text.primary" mb={2}>
                      Lot {index + 1}
                    </Typography>

                    <Stack spacing={3}>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          Identification du lot
                        </Typography>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={2}
                          alignItems="center"
                        >
                          <Controller
                            name={`lots.${String(index)}.lotNumber`}
                            control={control}
                            rules={{
                              required: !watchAutoGenerateLot
                                ? "Le numéro de lot est requis"
                                : false,
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                label="Numéro de lot"
                                fullWidth
                                disabled={watchAutoGenerateLot}
                                error={!!error}
                                helperText={
                                  error?.message ??
                                  (watchAutoGenerateLot
                                    ? "Sera généré automatiquement"
                                    : "")
                                }
                                placeholder={
                                  watchAutoGenerateLot
                                    ? "LOT-XXXXXXXX-XXXX"
                                    : ""
                                }
                              />
                            )}
                          />
                          <FormControlLabel
                            control={
                              <Controller
                                name={`lots.${String(index)}.autoGenerateLot`}
                                control={control}
                                render={({ field }) => (
                                  <Checkbox
                                    {...field}
                                    checked={field.value}
                                    onChange={(e) => {
                                      field.onChange(e.target.checked);
                                    }}
                                  />
                                )}
                              />
                            }
                            label="Auto"
                            sx={{ whiteSpace: "nowrap" }}
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
                          Référence produit
                        </Typography>
                        <Stack spacing={2}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            alignItems="center"
                          >
                            <Controller
                              name={`lots.${String(index)}.productReference`}
                              control={control}
                              rules={{
                                required: !watchIsNewProduct
                                  ? "Sélectionnez un produit ou créez-en un nouveau"
                                  : false,
                              }}
                              render={({ field, fieldState: { error } }) => (
                                <Autocomplete
                                  options={products}
                                  value={
                                    products.find(
                                      (p) => p.reference === field.value
                                    ) ?? null
                                  }
                                  getOptionLabel={(option) =>
                                    `${option.reference} - ${option.name}`
                                  }
                                  isOptionEqualToValue={(option, value) =>
                                    option.reference === value.reference
                                  }
                                  onChange={(_, newValue) => {
                                    field.onChange(
                                      newValue ? newValue.reference : null
                                    );
                                    if (newValue) {
                                      setValue(
                                        `lots.${String(index)}.isNewProduct`,
                                        false
                                      );
                                    }
                                  }}
                                  disabled={watchIsNewProduct}
                                  fullWidth
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label="Produit existant"
                                      error={!!error}
                                      helperText={error?.message}
                                    />
                                  )}
                                />
                              )}
                            />
                            <FormControlLabel
                              control={
                                <Controller
                                  name={`lots.${String(index)}.isNewProduct`}
                                  control={control}
                                  render={({ field }) => (
                                    <Checkbox
                                      {...field}
                                      checked={field.value}
                                      onChange={(e) => {
                                        field.onChange(e.target.checked);
                                        if (e.target.checked) {
                                          setValue(
                                            `lots.${String(index)}.productReference`,
                                            null
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

                          <Collapse in={watchIsNewProduct}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 2, backgroundColor: "action.hover" }}
                            >
                              <Typography
                                variant="subtitle2"
                                color="primary"
                                mb={2}
                              >
                                Nouveau produit
                              </Typography>
                              <Stack spacing={2}>
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={2}
                                  alignItems="center"
                                >
                                  <Controller
                                    name={`lots.${String(index)}.newProduct.reference`}
                                    control={control}
                                    rules={{
                                      required:
                                        watchIsNewProduct &&
                                        !watchAutoGenerateRef
                                          ? "La référence est requise"
                                          : false,
                                    }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...field}
                                        label="Référence"
                                        fullWidth
                                        disabled={watchAutoGenerateRef}
                                        error={!!error}
                                        helperText={
                                          error?.message ??
                                          (watchAutoGenerateRef
                                            ? "Sera générée automatiquement"
                                            : "")
                                        }
                                        placeholder={
                                          watchAutoGenerateRef ? "REF-XXXX" : ""
                                        }
                                      />
                                    )}
                                  />
                                  <FormControlLabel
                                    control={
                                      <Controller
                                        name={`lots.${String(index)}.autoGenerateRef`}
                                        control={control}
                                        render={({ field }) => (
                                          <Checkbox
                                            {...field}
                                            checked={field.value}
                                            onChange={(e) => {
                                              field.onChange(e.target.checked);
                                            }}
                                          />
                                        )}
                                      />
                                    }
                                    label="Auto"
                                    sx={{ whiteSpace: "nowrap" }}
                                  />
                                </Stack>

                                <Controller
                                  name={`lots.${String(index)}.newProduct.name`}
                                  control={control}
                                  rules={{
                                    required: watchIsNewProduct
                                      ? "Le nom est requis"
                                      : false,
                                  }}
                                  render={({
                                    field,
                                    fieldState: { error },
                                  }) => (
                                    <TextField
                                      {...field}
                                      label="Nom du produit"
                                      fullWidth
                                      error={!!error}
                                      helperText={error?.message}
                                    />
                                  )}
                                />

                                <Stack
                                  direction={{ xs: "column", md: "row" }}
                                  spacing={2}
                                >
                                  <Controller
                                    name={`lots.${String(index)}.newProduct.minimalStock`}
                                    control={control}
                                    rules={{
                                      min: { value: 0, message: "Minimum 0" },
                                    }}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...field}
                                        type="number"
                                        label="Stock minimal (optionnel)"
                                        fullWidth
                                        onKeyDown={handleNumericKeyDown}
                                        slotProps={{ htmlInput: { min: 0 } }}
                                        error={!!error}
                                        helperText={error?.message}
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

                                  <Controller
                                    name={`lots.${String(index)}.newProduct.unit`}
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...field}
                                        select
                                        label="Unité de mesure"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                        value={field.value ?? ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          field.onChange(
                                            value === "" ? null : value
                                          );
                                        }}
                                      >
                                        {PRODUCT_UNITS.map((unit) => (
                                          <MenuItem
                                            key={unit.value ?? "none"}
                                            value={unit.value ?? ""}
                                          >
                                            {unit.label}
                                          </MenuItem>
                                        ))}
                                      </TextField>
                                    )}
                                  />

                                  <Controller
                                    name={`lots.${String(index)}.newProduct.rulesId`}
                                    control={control}
                                    render={({
                                      field,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...field}
                                        select
                                        label="Règles"
                                        fullWidth
                                        error={!!error}
                                        helperText={error?.message}
                                      >
                                        {PRODUCT_RULES.map(([id, name]) => (
                                          <MenuItem key={id} value={id}>
                                            {name}
                                          </MenuItem>
                                        ))}
                                      </TextField>
                                    )}
                                  />
                                </Stack>
                              </Stack>
                            </Paper>
                          </Collapse>
                        </Stack>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          mb={1}
                        >
                          Détails du lot
                        </Typography>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={2}
                        >
                          <Controller
                            name={`lots.${String(index)}.quantity`}
                            control={control}
                            rules={{
                              required: "La quantité est requise",
                              min: { value: 1, message: "Minimum 1" },
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                type="number"
                                label="Quantité"
                                fullWidth
                                onKeyDown={handleNumericKeyDown}
                                slotProps={{ htmlInput: { min: 1 } }}
                                error={!!error}
                                helperText={error?.message}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === "" ? 1 : Number(value)
                                  );
                                }}
                              />
                            )}
                          />

                          <Controller
                            name={`lots.${String(index)}.receivedDate`}
                            control={control}
                            rules={{
                              required: "La date de réception est requise",
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                type="date"
                                label="Date de réception"
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />

                          <Controller
                            name={`lots.${String(index)}.expirationDate`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                type="date"
                                label="Date d'expiration (optionnel)"
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                                error={!!error}
                                helperText={error?.message}
                                value={field.value ?? ""}
                              />
                            )}
                          />
                        </Stack>

                        <Box mt={2}>
                          <Controller
                            name={`lots.${String(index)}.supplier`}
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                              <TextField
                                {...field}
                                label="Fournisseur (optionnel)"
                                fullWidth
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />
                        </Box>
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
                  Valider les lots
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

export default ProductPage;
