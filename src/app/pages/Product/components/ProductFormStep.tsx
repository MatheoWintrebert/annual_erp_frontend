import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Controller } from "react-hook-form";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FC } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type {
  ProductWizardFormData,
  Category,
  UnitOfMeasure,
  RuleOption,
  CreateCategoryPayload,
  CreateUnitOfMeasurePayload,
} from "../types";

interface ProductFormStepProps {
  methods: UseFormReturn<ProductWizardFormData>;
  categories: Category[];
  unitsOfMeasure: UnitOfMeasure[];
  rules: RuleOption[];
  createCategoryMutation: UseMutationResult<
    Category,
    unknown,
    CreateCategoryPayload
  >;
  createUnitMutation: UseMutationResult<
    UnitOfMeasure,
    unknown,
    CreateUnitOfMeasurePayload
  >;
  onCategoryCreated: (category: Category) => void;
  onUnitCreated: (unit: UnitOfMeasure) => void;
}

const ProductFormStep: FC<ProductFormStepProps> = ({
  methods,
  categories,
  unitsOfMeasure,
  rules,
  createCategoryMutation,
  createUnitMutation,
  onCategoryCreated,
  onUnitCreated,
}) => {
  const { control } = methods;

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitAbbreviation, setNewUnitAbbreviation] = useState("");
  const [unitNameError, setUnitNameError] = useState("");
  const [unitAbbreviationError, setUnitAbbreviationError] = useState("");

  const handleCreateCategory = async (): Promise<void> => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError("Category name is required");
      return;
    }
    if (trimmed.length > 100) {
      setCategoryError("Maximum 100 characters");
      return;
    }

    try {
      const created = await createCategoryMutation.mutateAsync({
        name: trimmed,
      });
      onCategoryCreated(created);
      setCategoryDialogOpen(false);
      setNewCategoryName("");
      setCategoryError("");
    } catch {
      setCategoryError("Failed to create category. Please try again.");
    }
  };

  const handleCreateUnit = async (): Promise<void> => {
    const trimmedName = newUnitName.trim();
    const trimmedAbbr = newUnitAbbreviation.trim();
    let hasError = false;

    if (!trimmedName) {
      setUnitNameError("Unit name is required");
      hasError = true;
    } else if (trimmedName.length > 50) {
      setUnitNameError("Maximum 50 characters");
      hasError = true;
    } else {
      setUnitNameError("");
    }

    if (!trimmedAbbr) {
      setUnitAbbreviationError("Abbreviation is required");
      hasError = true;
    } else if (trimmedAbbr.length > 10) {
      setUnitAbbreviationError("Maximum 10 characters");
      hasError = true;
    } else {
      setUnitAbbreviationError("");
    }

    if (hasError) return;

    try {
      const created = await createUnitMutation.mutateAsync({
        name: trimmedName,
        abbreviation: trimmedAbbr,
      });
      onUnitCreated(created);
      setUnitDialogOpen(false);
      setNewUnitName("");
      setNewUnitAbbreviation("");
      setUnitNameError("");
      setUnitAbbreviationError("");
    } catch {
      setUnitNameError("Failed to create unit. Please try again.");
    }
  };

  return (
    <>
      <Stack spacing={2}>
        <Controller
          name="reference"
          control={control}
          rules={{
            required: "Reference code is required",
            maxLength: { value: 100, message: "Maximum 100 characters" },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Reference Code"
              fullWidth
              error={!!error}
              helperText={error?.message}
              placeholder="e.g. REF-001"
            />
          )}
        />

        <Controller
          name="name"
          control={control}
          rules={{
            required: "Product name is required",
            maxLength: { value: 255, message: "Maximum 255 characters" },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Product Name"
              fullWidth
              error={!!error}
              helperText={error?.message}
              placeholder="e.g. Organic Flour"
            />
          )}
        />

        <Box display="flex" gap={1} alignItems="flex-start">
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Category"
                fullWidth
                value={field.value}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? "" : Number(val));
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setCategoryDialogOpen(true);
            }}
            sx={{ minWidth: "auto", px: 1, mt: "8px" }}
            aria-label="Add new category"
          >
            <AddIcon />
          </Button>
        </Box>

        <Box display="flex" gap={1} alignItems="flex-start">
          <Controller
            name="unitOfMeasureId"
            control={control}
            rules={{ required: "Unit of measure is required" }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                select
                label="Unit of Measure"
                fullWidth
                error={!!error}
                helperText={error?.message}
                value={field.value}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              >
                {unitsOfMeasure.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setUnitDialogOpen(true);
            }}
            sx={{ minWidth: "auto", px: 1, mt: "8px" }}
            aria-label="Add new unit of measure"
          >
            <AddIcon />
          </Button>
        </Box>

        <Controller
          name="minimumStock"
          control={control}
          rules={{
            validate: (value) =>
              value === "" ||
              (typeof value === "number" && value >= 0) ||
              "Must be 0 or greater",
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              type="number"
              label="Low-Stock Alert Threshold (quantity)"
              fullWidth
              error={!!error}
              helperText={error?.message ?? "Leave empty if not applicable"}
              slotProps={{ htmlInput: { min: 0 } }}
              onChange={(e) => {
                field.onChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                );
              }}
            />
          )}
        />

        <Controller
          name="expiryAlertThreshold"
          control={control}
          rules={{
            validate: (value) =>
              value === "" ||
              (typeof value === "number" && value > 0) ||
              "Must be a positive number",
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              type="number"
              label="Expiry Alert Threshold (days)"
              fullWidth
              error={!!error}
              helperText={
                error?.message ?? "Alert when expiry is within this many days"
              }
              slotProps={{ htmlInput: { min: 1 } }}
              onChange={(e) => {
                field.onChange(
                  e.target.value === "" ? "" : Number(e.target.value)
                );
              }}
            />
          )}
        />

        <Controller
          name="ruleIds"
          control={control}
          render={({ field }) => (
            <Autocomplete
              multiple
              options={rules.map((r) => r.id)}
              getOptionLabel={(id) => {
                const r = rules.find((rule) => rule.id === id);
                return r?.name ?? String(id);
              }}
              value={field.value}
              onChange={(_, newValue) => {
                field.onChange(newValue);
              }}
              renderValue={(value, getTagProps) =>
                value.map((id, index) => {
                  const r = rules.find((rule) => rule.id === id);
                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={r?.name ?? String(id)}
                      size="small"
                      {...rest}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Placement Rules"
                  placeholder="Select rules..."
                />
              )}
            />
          )}
        />
      </Stack>

      <Dialog
        open={categoryDialogOpen}
        onClose={() => {
          setCategoryDialogOpen(false);
          setNewCategoryName("");
          setCategoryError("");
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Category Name"
            fullWidth
            value={newCategoryName}
            onChange={(e) => {
              setNewCategoryName(e.target.value);
              setCategoryError("");
            }}
            error={!!categoryError}
            helperText={categoryError}
            placeholder="e.g. Frozen Goods"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCategoryDialogOpen(false);
              setNewCategoryName("");
              setCategoryError("");
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreateCategory()}
            variant="contained"
            color="secondary"
            disabled={createCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={unitDialogOpen}
        onClose={() => {
          setUnitDialogOpen(false);
          setNewUnitName("");
          setNewUnitAbbreviation("");
          setUnitNameError("");
          setUnitAbbreviationError("");
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add New Unit of Measure</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Unit Name"
              fullWidth
              value={newUnitName}
              onChange={(e) => {
                setNewUnitName(e.target.value);
                setUnitNameError("");
              }}
              error={!!unitNameError}
              helperText={unitNameError}
              placeholder="e.g. Kilogram"
            />
            <TextField
              label="Abbreviation"
              fullWidth
              value={newUnitAbbreviation}
              onChange={(e) => {
                setNewUnitAbbreviation(e.target.value);
                setUnitAbbreviationError("");
              }}
              error={!!unitAbbreviationError}
              helperText={unitAbbreviationError}
              placeholder="e.g. kg"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUnitDialogOpen(false);
              setNewUnitName("");
              setNewUnitAbbreviation("");
              setUnitNameError("");
              setUnitAbbreviationError("");
            }}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreateUnit()}
            variant="contained"
            color="secondary"
            disabled={createUnitMutation.isPending}
          >
            {createUnitMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProductFormStep;
