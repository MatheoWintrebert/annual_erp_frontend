import { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { FC } from "react";
import { getDefaultPickingEntry } from "../types";
import type {
  AvailableStockItem,
  PickingFormData,
  ProductOption,
} from "../types";
import { useSearchProducts } from "../api";

interface ProductSelectStepProps {
  control: Control<PickingFormData>;
  stockMap: Map<number, AvailableStockItem>;
}

interface ProductItemProps {
  index: number;
  control: Control<PickingFormData>;
  stockMap: Map<number, AvailableStockItem>;
  onRemove: () => void;
  canRemove: boolean;
}

const ProductItem: FC<ProductItemProps> = ({
  index,
  control,
  stockMap,
  onRemove,
  canRemove,
}) => {
  const [search, setSearch] = useState("");

  const { data: productsData, isLoading: isLoadingProducts } =
    useSearchProducts(search);
  const products = useMemo(
    () => productsData?.products ?? [],
    [productsData?.products]
  );

  const selectedProduct = useWatch({
    control,
    name: `items.${String(index)}.product` as const,
  }) as unknown as ProductOption | null;
  const requestedQuantity = useWatch({
    control,
    name: `items.${String(index)}.requestedQuantity` as const,
  }) as unknown as number;

  const stock = selectedProduct ? stockMap.get(selectedProduct.id) : undefined;
  const isInsufficient =
    stock != null && requestedQuantity > stock.availableQuantity;

  return (
    <Box
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="subtitle2" color="text.primary">
          Product {index + 1}
        </Typography>
        <IconButton
          aria-label={`Remove product ${String(index + 1)}`}
          onClick={onRemove}
          disabled={!canRemove}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      <Stack spacing={2}>
        <Controller
          name={`items.${String(index)}.product` as const}
          control={control}
          rules={{
            validate: (value) => value !== null || "Product is required",
          }}
          render={({ field: ctrlField, fieldState: { error } }) => (
            <Autocomplete
              options={products}
              getOptionLabel={(opt: ProductOption) =>
                `${opt.name} (${opt.reference})`
              }
              value={ctrlField.value}
              onChange={(_, val) => {
                ctrlField.onChange(val);
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

        <Controller
          name={`items.${String(index)}.requestedQuantity` as const}
          control={control}
          rules={{
            required: "Quantity is required",
            validate: (value) => value > 0 || "Must be greater than 0",
          }}
          render={({ field: ctrlField, fieldState: { error } }) => (
            <Box>
              <TextField
                {...ctrlField}
                type="number"
                label="Quantity"
                fullWidth
                error={!!error}
                helperText={
                  error?.message ??
                  (stock
                    ? `Available: ${String(stock.availableQuantity)} ${stock.unitOfMeasureName}`
                    : selectedProduct?.unitOfMeasureName
                      ? `Unit: ${selectedProduct.unitOfMeasureName}`
                      : "")
                }
                slotProps={{ htmlInput: { min: 1 } }}
                onChange={(e) => {
                  ctrlField.onChange(
                    e.target.value === "" ? 1 : Number(e.target.value)
                  );
                }}
              />
              {isInsufficient && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Only {stock.availableQuantity} {stock.unitOfMeasureName}{" "}
                  available
                </Alert>
              )}
            </Box>
          )}
        />
      </Stack>
    </Box>
  );
};

const ProductSelectStep: FC<ProductSelectStepProps> = ({
  control,
  stockMap,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <Stack spacing={2}>
      {fields.map((field, index) => (
        <ProductItem
          key={field.id}
          index={index}
          control={control}
          stockMap={stockMap}
          onRemove={() => {
            remove(index);
          }}
          canRemove={fields.length > 1}
        />
      ))}

      <Button
        variant="outlined"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={() => {
          append(getDefaultPickingEntry());
        }}
      >
        Add another product
      </Button>
    </Stack>
  );
};

export default ProductSelectStep;
