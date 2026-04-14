import { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Controller, useFieldArray } from "react-hook-form";
import type { Control, UseFormWatch } from "react-hook-form";
import type { FC } from "react";
import { getDefaultProductEntry, getUnitName } from "../types";
import type { IntakeFormData, ProductOption, UnitOfMeasure } from "../types";
import { useGetProductsForIntake } from "../api";

interface ProductEntryStepProps {
  control: Control<IntakeFormData>;
  watch: UseFormWatch<IntakeFormData>;
  unitsOfMeasure: UnitOfMeasure[];
  onProductSelect: (product: ProductOption) => void;
}

interface ProductEntryItemProps {
  index: number;
  control: Control<IntakeFormData>;
  watch: UseFormWatch<IntakeFormData>;
  unitsOfMeasure: UnitOfMeasure[];
  onRemove: () => void;
  canRemove: boolean;
  isExpanded: boolean;
  onExpand: () => void;
  onProductSelect: (product: ProductOption) => void;
}

const ProductEntryItem: FC<ProductEntryItemProps> = ({
  index,
  control,
  watch,
  unitsOfMeasure,
  onRemove,
  canRemove,
  isExpanded,
  onExpand,
  onProductSelect,
}) => {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null
  );

  const { data: productsData, isLoading: isLoadingProducts } =
    useGetProductsForIntake(search);
  const products = useMemo(
    () => productsData?.products ?? [],
    [productsData?.products]
  );

  const selectedProductId = watch(`items.${String(index)}.productId`);
  const isManualLot = watch(
    `items.${String(index)}.isManualLot`
  ) as unknown as boolean;
  const quantity = watch(`items.${String(index)}.quantity`);
  const unitName = getUnitName(selectedProductId, products, unitsOfMeasure);

  // Derive display product: prefer live list, fall back to manually cached selection
  const cachedProduct = useMemo(() => {
    if (selectedProductId === "") return null;
    return (
      products.find((p) => p.id === selectedProductId) ??
      (selectedProduct?.id === selectedProductId ? selectedProduct : null)
    );
  }, [selectedProductId, products, selectedProduct]);

  const isComplete =
    selectedProductId !== "" && quantity !== "" && quantity > 0;
  const showCompact = !isExpanded && isComplete && cachedProduct != null;

  return (
    <Card variant="outlined">
      {showCompact ? (
        <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
              onClick={onExpand}
              sx={{ cursor: "pointer", flex: 1, minWidth: 0 }}
            >
              <Chip
                label={`#${String(index + 1)}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
              <Typography
                variant="body1"
                color="text.primary"
                noWrap
                sx={{ flex: 1, minWidth: 0 }}
              >
                {cachedProduct.reference} — {cachedProduct.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {typeof quantity === "number" ? String(quantity) : ""}{" "}
                {getUnitName(
                  selectedProductId,
                  [cachedProduct],
                  unitsOfMeasure
                ) || "units"}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <IconButton
                aria-label={`Edit product ${String(index + 1)}`}
                onClick={onExpand}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                aria-label={`Remove product ${String(index + 1)}`}
                onClick={onRemove}
                disabled={!canRemove}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      ) : null}

      {/* Form fields — always mounted to preserve react-hook-form registration, hidden when compact */}
      <CardContent sx={{ display: showCompact ? "none" : undefined }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="subtitle1" color="text.primary">
            Product {index + 1}
          </Typography>
          <IconButton
            aria-label={`Remove product ${String(index + 1)}`}
            onClick={onRemove}
            disabled={!canRemove}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <Controller
            name={`items.${String(index)}.productId`}
            control={control}
            rules={{ required: "Product is required" }}
            render={({ field: ctrlField, fieldState: { error } }) => (
              <Autocomplete
                options={products}
                getOptionLabel={(opt) => `${opt.reference} — ${opt.name}`}
                value={products.find((p) => p.id === ctrlField.value) ?? null}
                onChange={(_, val) => {
                  ctrlField.onChange(val?.id ?? "");
                  if (val) {
                    setSelectedProduct(val);
                    onProductSelect(val);
                  }
                }}
                onInputChange={(_, value, reason) => {
                  if (reason === "input") {
                    setSearch(value);
                  }
                }}
                filterOptions={(x) => x}
                loading={isLoadingProducts}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                noOptionsText="Product not in catalog? Ask your manager to add it."
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Product"
                    error={!!error}
                    helperText={error?.message}
                    fullWidth
                  />
                )}
              />
            )}
          />

          <FormControlLabel
            control={
              <Controller
                name={`items.${String(index)}.isManualLot`}
                control={control}
                render={({ field: ctrlField }) => (
                  <Switch
                    checked={ctrlField.value}
                    onChange={(_, checked) => {
                      ctrlField.onChange(checked);
                    }}
                  />
                )}
              />
            }
            label="Enter lot number manually"
          />

          {isManualLot ? (
            <Controller
              name={`items.${String(index)}.lotReference`}
              control={control}
              rules={{
                required: "Lot number is required",
              }}
              render={({ field: ctrlField, fieldState: { error } }) => (
                <TextField
                  {...ctrlField}
                  label="Lot Number"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />
          ) : (
            <TextField
              disabled
              value="Auto-generated on registration"
              label="Lot Number"
              fullWidth
            />
          )}

          <Controller
            name={`items.${String(index)}.expiryDate`}
            control={control}
            render={({ field: ctrlField }) => (
              <TextField
                {...ctrlField}
                type="date"
                label="Expiry Date"
                fullWidth
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: new Date().toISOString().split("T")[0] },
                }}
              />
            )}
          />

          <Controller
            name={`items.${String(index)}.quantity`}
            control={control}
            rules={{
              required: "Quantity is required",
              validate: (value) =>
                value === "" ||
                (typeof value === "number" && value > 0) ||
                "Must be greater than 0",
            }}
            render={({ field: ctrlField, fieldState: { error } }) => (
              <TextField
                {...ctrlField}
                type="number"
                label="Quantity"
                fullWidth
                error={!!error}
                helperText={
                  error?.message ?? (unitName !== "" ? `Unit: ${unitName}` : "")
                }
                slotProps={{ htmlInput: { min: 1 } }}
                onChange={(e) => {
                  ctrlField.onChange(
                    e.target.value === "" ? "" : Number(e.target.value)
                  );
                }}
              />
            )}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

const ProductEntryStep: FC<ProductEntryStepProps> = ({
  control,
  watch,
  unitsOfMeasure,
  onProductSelect,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleRemove = (index: number) => {
    remove(index);
    if (index === expandedIndex) {
      setExpandedIndex(Math.max(0, index - 1));
    } else if (index < expandedIndex) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  return (
    <Stack spacing={3}>
      {fields.map((field, index) => (
        <ProductEntryItem
          key={field.id}
          index={index}
          control={control}
          watch={watch}
          unitsOfMeasure={unitsOfMeasure}
          onRemove={() => {
            handleRemove(index);
          }}
          canRemove={fields.length > 1}
          isExpanded={expandedIndex === index}
          onExpand={() => {
            setExpandedIndex(index);
          }}
          onProductSelect={onProductSelect}
        />
      ))}

      <Button
        variant="outlined"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={() => {
          append(getDefaultProductEntry());
          setExpandedIndex(fields.length);
        }}
      >
        Add another product
      </Button>
    </Stack>
  );
};

export default ProductEntryStep;
