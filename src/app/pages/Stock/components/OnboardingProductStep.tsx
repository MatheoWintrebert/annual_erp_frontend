import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { FC } from "react";
import type { OnboardingProductEntry, ProductOption } from "../types";
import { useGetProductsForOnboarding, useGetUnitsOfMeasure } from "../api";

interface OnboardingProductStepProps {
  products: OnboardingProductEntry[];
  onProductsChange: (products: OnboardingProductEntry[]) => void;
  showEmptyError?: boolean;
}

const OnboardingProductStep: FC<OnboardingProductStepProps> = ({
  products,
  onProductsChange,
  showEmptyError = false,
}) => {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );
  const [lotReference, setLotReference] = useState("");
  const [manualLot, setManualLot] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");

  const { data: productsData, isLoading } = useGetProductsForOnboarding(search);
  const { data: unitsData } = useGetUnitsOfMeasure();
  const productOptions = useMemo(
    () => productsData?.products ?? [],
    [productsData?.products]
  );
  const unitsOfMeasure = useMemo(
    () => unitsData?.unitsOfMeasure ?? [],
    [unitsData?.unitsOfMeasure]
  );

  const resolvedUnitName = useMemo(() => {
    if (!selectedProduct) return "";
    return (
      unitsOfMeasure.find((u) => u.id === selectedProduct.unitOfMeasureId)
        ?.name ?? ""
    );
  }, [selectedProduct, unitsOfMeasure]);

  const resetForm = () => {
    setSelectedProduct(null);
    setSearch("");
    setLotReference("");
    setManualLot(false);
    setExpiryDate("");
    setQuantity("");
  };

  const handleAddProduct = () => {
    if (!selectedProduct || quantity === "" || quantity <= 0) return;

    const entry: OnboardingProductEntry = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productReference: selectedProduct.reference,
      lotReference: manualLot ? lotReference : "",
      manualLot,
      expiryDate: expiryDate || null,
      quantity,
      unitOfMeasureName: resolvedUnitName,
    };

    onProductsChange([...products, entry]);
    resetForm();
  };

  const handleRemoveProduct = (index: number) => {
    onProductsChange(products.filter((_, i) => i !== index));
  };

  const [addAttempted, setAddAttempted] = useState(false);

  const canAdd =
    selectedProduct !== null &&
    quantity !== "" &&
    quantity > 0 &&
    (!manualLot || lotReference.trim() !== "");

  const handleAddWithValidation = () => {
    setAddAttempted(true);
    if (canAdd) {
      handleAddProduct();
      setAddAttempted(false);
    }
  };

  const productError =
    addAttempted && !selectedProduct ? "Product is required" : "";
  const quantityError =
    addAttempted && (quantity === "" || quantity <= 0)
      ? "Quantity is required and must be greater than 0"
      : "";
  const lotError =
    addAttempted && manualLot && lotReference.trim() === ""
      ? "Lot number is required"
      : "";

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle1" color="text.primary">
        Add products to this palette
      </Typography>

      {showEmptyError && products.length === 0 && (
        <Alert severity="error">
          Add at least one product before proceeding.
        </Alert>
      )}

      <Autocomplete
        options={productOptions}
        getOptionLabel={(option) => `${option.reference} — ${option.name}`}
        value={selectedProduct}
        onChange={(_event, newValue) => {
          setSelectedProduct(newValue);
        }}
        onInputChange={(_event, value, reason) => {
          if (reason === "input") {
            setSearch(value);
          }
        }}
        filterOptions={(x) => x}
        loading={isLoading}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        noOptionsText="No products found"
        renderInput={(params) => (
          <TextField
            {...params}
            label="Product"
            fullWidth
            error={!!productError}
            helperText={productError}
          />
        )}
      />

      {selectedProduct && (
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={manualLot}
                onChange={(_e, checked) => {
                  setManualLot(checked);
                }}
              />
            }
            label="Enter lot number manually"
          />

          {manualLot ? (
            <TextField
              value={lotReference}
              onChange={(e) => {
                setLotReference(e.target.value);
              }}
              label="Lot Number"
              fullWidth
              error={!!lotError}
              helperText={lotError}
            />
          ) : (
            <TextField
              disabled
              value="Auto-generated on registration"
              label="Lot Number"
              fullWidth
            />
          )}

          <TextField
            type="date"
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => {
              setExpiryDate(e.target.value);
            }}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value === "" ? "" : Number(e.target.value));
            }}
            fullWidth
            error={!!quantityError}
            helperText={
              quantityError ||
              (resolvedUnitName ? `Unit: ${resolvedUnitName}` : "")
            }
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleAddWithValidation}
          >
            Add to palette
          </Button>
        </Stack>
      )}

      {products.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Products on palette ({products.length})
          </Typography>
          <Stack spacing={1}>
            {products.map((product, index) => (
              <Box
                key={`${String(product.productId)}-${String(index)}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 1,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.primary">
                    {product.productReference} — {product.productName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.quantity}
                    {product.unitOfMeasureName
                      ? ` ${product.unitOfMeasureName}`
                      : ""}
                  </Typography>
                </Box>
                <IconButton
                  aria-label={`Remove ${product.productName}`}
                  onClick={() => {
                    handleRemoveProduct(index);
                  }}
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default OnboardingProductStep;
