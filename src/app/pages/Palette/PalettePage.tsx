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
  IconButton,
} from "@mui/material";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Header from "../../components/ui/Header.tsx";
import Footer from "../../components/ui/Footer.tsx";
import NumberSpinner from "../../components/NumberSpinner.tsx";

interface ProductInPalette {
  productId: number;
  quantity: number;
  expirationDate?: string;
}

interface PaletteFormData {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  products: ProductInPalette[];
}

interface FormData {
  paletteCount: number;
  palettes: PaletteFormData[];
}

const MOCK_PALETTIERS = [
  {
    id: 1,
    name: "Palettier Principal A",
    dimensionX: 10,
    dimensionY: 8,
    dimensionZ: 5,
  },
  {
    id: 2,
    name: "Palettier Réfrigéré B",
    dimensionX: 6,
    dimensionY: 6,
    dimensionZ: 4,
  },
  {
    id: 3,
    name: "Palettier Client C",
    dimensionX: 12,
    dimensionY: 10,
    dimensionZ: 6,
  },
  {
    id: 4,
    name: "Palettier Dangereux D",
    dimensionX: 8,
    dimensionY: 8,
    dimensionZ: 3,
  },
] as const;

const MOCK_PRODUCTS = [
  { id: 1, name: "Produit A", unit: null },
  { id: 2, name: "Produit B", unit: null },
  { id: 3, name: "Produit C", unit: null },
  { id: 4, name: "Produit D", unit: "liter" },
  { id: 5, name: "Produit E", unit: "kg" },
] as const;

const PalettePage: React.FC = () => {
  const [paletteCount, setPaletteCount] = React.useState(1);

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

  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      paletteCount: 1,
      palettes: [
        {
          palettierId: MOCK_PALETTIERS[0].id,
          positionX: 1,
          positionY: 1,
          positionZ: 1,
          products: [
            {
              productId: MOCK_PRODUCTS[0].id,
              quantity: 1,
              expirationDate: undefined,
            },
          ],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "palettes",
  });

  const handleCountChange = (newCount: number) => {
    setPaletteCount(newCount);
    const currentCount = fields.length;

    if (newCount > currentCount) {
      for (let i = currentCount; i < newCount; i++) {
        append({
          palettierId: MOCK_PALETTIERS[0].id,
          positionX: 1,
          positionY: 1,
          positionZ: 1,
          products: [
            {
              productId: MOCK_PRODUCTS[0].id,
              quantity: 1,
              expirationDate: undefined,
            },
          ],
        });
      }
    } else if (newCount < currentCount) {
      for (let i = currentCount - 1; i >= newCount; i--) {
        remove(i);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
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
            Initialisation du stock de palettes
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3} sx={{ marginBottom: 4, marginTop: 3 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h6" color="text.secondary" mb={2}>
                  Nombre de palettes à ajouter
                </Typography>
                <NumberSpinner
                  value={paletteCount}
                  onChange={handleCountChange}
                  min={1}
                  label="Nombre de palettes"
                />
              </Box>

              <Divider />

              {fields.map((field, paletteIndex) => (
                <PaletteFormSection
                  key={field.id}
                  paletteIndex={paletteIndex}
                  control={control}
                  handleNumericKeyDown={handleNumericKeyDown}
                />
              ))}

              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  Valider l'initialisation du stock
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

interface PaletteFormSectionProps {
  paletteIndex: number;
  control: any;
  handleNumericKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

interface QuantityFieldProps {
  paletteIndex: number;
  productIndex: number;
  control: any;
  handleNumericKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const QuantityField: React.FC<QuantityFieldProps> = ({
  paletteIndex,
  productIndex,
  control,
  handleNumericKeyDown,
}) => {
  const selectedProductId = useWatch({
    control,
    name: `palettes.${paletteIndex}.products.${productIndex}.productId`,
  });

  const selectedProduct = MOCK_PRODUCTS.find(
    (p) => p.id === selectedProductId
  );

  const quantityLabel = selectedProduct?.unit
    ? `Quantité (${selectedProduct.unit})`
    : "Quantité";

  return (
    <Controller
      name={`palettes.${paletteIndex}.products.${productIndex}.quantity`}
      control={control}
      rules={{
        required: "La quantité est requise",
        min: { value: 1, message: "Minimum 1" },
      }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          type="number"
          label={quantityLabel}
          fullWidth
          onKeyDown={handleNumericKeyDown}
          slotProps={{
            htmlInput: { min: 1 },
          }}
          error={!!error}
          helperText={error?.message}
        />
      )}
    />
  );
};

const PaletteFormSection: React.FC<PaletteFormSectionProps> = ({
  paletteIndex,
  control,
  handleNumericKeyDown,
}) => {
  const selectedPalettierId = useWatch({
    control,
    name: `palettes.${paletteIndex}.palettierId`,
  });

  const selectedPalettier = MOCK_PALETTIERS.find(
    (p) => p.id === selectedPalettierId
  );

  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: `palettes.${paletteIndex}.products`,
  });

  const handleAddProduct = () => {
    appendProduct({
      productId: MOCK_PRODUCTS[0].id,
      quantity: 1,
      expirationDate: undefined,
    });
  };

  const handleRemoveProduct = (productIndex: number) => {
    if (productFields.length > 1) {
      removeProduct(productIndex);
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{ padding: 3, backgroundColor: "background.paper" }}
    >
      <Typography variant="h6" color="text.primary" mb={2}>
        Palette {paletteIndex + 1}
      </Typography>

      <Stack spacing={3}>
        <Controller
          name={`palettes.${paletteIndex}.palettierId`}
          control={control}
          rules={{ required: "Le palettier est requis" }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              select
              label="Palettier"
              fullWidth
              error={!!error}
              helperText={error?.message}
            >
              {MOCK_PALETTIERS.map((palettier) => (
                <MenuItem key={palettier.id} value={palettier.id}>
                  {palettier.name} ({palettier.dimensionX}x
                  {palettier.dimensionY}x{palettier.dimensionZ})
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Box>
          <Typography variant="subtitle1" color="text.secondary" mb={1}>
            Position (en nombre de cases)
            {selectedPalettier && (
              <Typography
                component="span"
                variant="caption"
                color="text.disabled"
                ml={1}
              >
                Max: X={selectedPalettier.dimensionX}, Y=
                {selectedPalettier.dimensionY}, Z={selectedPalettier.dimensionZ}
              </Typography>
            )}
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Controller
              name={`palettes.${paletteIndex}.positionX`}
              control={control}
              rules={{
                required: "La position X est requise",
                min: { value: 1, message: "Minimum 1" },
                max: selectedPalettier
                  ? {
                      value: selectedPalettier.dimensionX,
                      message: `Maximum ${selectedPalettier.dimensionX}`,
                    }
                  : undefined,
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Position X"
                  fullWidth
                  onKeyDown={handleNumericKeyDown}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: selectedPalettier?.dimensionX,
                    },
                  }}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name={`palettes.${paletteIndex}.positionY`}
              control={control}
              rules={{
                required: "La position Y est requise",
                min: { value: 1, message: "Minimum 1" },
                max: selectedPalettier
                  ? {
                      value: selectedPalettier.dimensionY,
                      message: `Maximum ${selectedPalettier.dimensionY}`,
                    }
                  : undefined,
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Position Y"
                  fullWidth
                  onKeyDown={handleNumericKeyDown}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: selectedPalettier?.dimensionY,
                    },
                  }}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            <Controller
              name={`palettes.${paletteIndex}.positionZ`}
              control={control}
              rules={{
                required: "La position Z est requise",
                min: { value: 1, message: "Minimum 1" },
                max: selectedPalettier
                  ? {
                      value: selectedPalettier.dimensionZ,
                      message: `Maximum ${selectedPalettier.dimensionZ}`,
                    }
                  : undefined,
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Position Z"
                  fullWidth
                  onKeyDown={handleNumericKeyDown}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: selectedPalettier?.dimensionZ,
                    },
                  }}
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Produits dans cette palette
            </Typography>
            <Button
              size="small"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleAddProduct}
              color="secondary"
            >
              Ajouter un produit
            </Button>
          </Box>

          <Stack spacing={2}>
            {productFields.map((productField, productIndex) => (
              <Paper
                key={productField.id}
                variant="outlined"
                sx={{ padding: 2, backgroundColor: "background.default" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography
                    variant="body2"
                    color="text.primary"
                    fontWeight={500}
                  >
                    Produit {productIndex + 1}
                  </Typography>
                  {productFields.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveProduct(productIndex)}
                      color="error"
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  )}
                </Box>

                <Stack spacing={2}>
                  <Controller
                    name={`palettes.${paletteIndex}.products.${productIndex}.productId`}
                    control={control}
                    rules={{ required: "Le produit est requis" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        select
                        label="Produit"
                        fullWidth
                        error={!!error}
                        helperText={error?.message}
                      >
                        {MOCK_PRODUCTS.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <QuantityField
                      paletteIndex={paletteIndex}
                      productIndex={productIndex}
                      control={control}
                      handleNumericKeyDown={handleNumericKeyDown}
                    />

                    <Controller
                      name={`palettes.${paletteIndex}.products.${productIndex}.expirationDate`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          type="date"
                          label="Date de péremption (optionnel)"
                          fullWidth
                          slotProps={{
                            inputLabel: { shrink: true },
                          }}
                          error={!!error}
                          helperText={error?.message}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : value);
                          }}
                        />
                      )}
                    />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PalettePage;
