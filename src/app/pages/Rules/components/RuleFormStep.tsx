import {
  Autocomplete,
  Box,
  Chip,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { FC } from "react";
import type { PalettierType } from "../../Palettier/types";
import type { PalettierResponse } from "../../Palettier/types";
import type {
  RuleWizardFormData,
  CategoryResponse,
  SelectionMode,
} from "../types";
import {
  RULE_TYPES,
  SELECTION_MODES,
  PLACEMENT_CONSTRAINT_TYPES,
} from "../types";

interface RuleFormStepProps {
  methods: UseFormReturn<RuleWizardFormData>;
  palettierTypes: PalettierType[];
  palettiers: PalettierResponse[];
  categories: CategoryResponse[];
  isEditing: boolean;
}

const RuleFormStep: FC<RuleFormStepProps> = ({
  methods,
  palettierTypes,
  palettiers,
  categories,
  isEditing,
}) => {
  const { control, watch } = methods;
  const ruleType = watch("type");
  const storageSelectionMode = watch("storageCondition.selectionMode");
  const placementConstraintType = watch("placementConstraint.constraintType");

  return (
    <Stack spacing={2}>
      <Controller
        name="name"
        control={control}
        rules={{
          required: "Name is required",
          maxLength: { value: 100, message: "Maximum 100 characters" },
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Rule Name"
            fullWidth
            error={!!error}
            helperText={error?.message}
            placeholder="e.g. Cold Storage Zone"
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Description"
            fullWidth
            multiline
            rows={2}
            placeholder="Describe what this rule enforces"
          />
        )}
      />

      <Controller
        name="type"
        control={control}
        rules={{ required: "Rule type is required" }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            select
            label="Rule Type"
            fullWidth
            error={!!error}
            helperText={error?.message}
            disabled={isEditing}
          >
            {RULE_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={field.onChange}
                color="secondary"
              />
            }
            label="Active"
          />
        )}
      />

      {ruleType === "zone_priority" && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Zone Priority Configuration
          </Typography>
          <Stack spacing={2}>
            <Controller
              name="zonePriority.priorityLevel"
              control={control}
              rules={{
                required: "Priority level is required",
                min: { value: 1, message: "Minimum priority is 1" },
                max: { value: 10, message: "Maximum priority is 10" },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Priority Level (1-10)"
                  fullWidth
                  error={!!error}
                  helperText={
                    error?.message ?? "Lower number = higher priority"
                  }
                  slotProps={{ htmlInput: { min: 1, max: 10 } }}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value) || 1);
                  }}
                />
              )}
            />

            <Controller
              name="zonePriority.palettierIds"
              control={control}
              rules={{
                validate: (value) =>
                  value.length > 0 || "Select at least one palettier",
              }}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  multiple
                  options={palettiers.map((p) => p.id)}
                  getOptionLabel={(id) => {
                    const p = palettiers.find((pal) => pal.id === id);
                    return p?.name ?? String(id);
                  }}
                  value={field.value}
                  onChange={(_, newValue) => {
                    field.onChange(newValue);
                  }}
                  renderValue={(value, getTagProps) =>
                    value.map((id, index) => {
                      const p = palettiers.find((pal) => pal.id === id);
                      const { key, ...rest } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={p?.name ?? String(id)}
                          size="small"
                          {...rest}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Palettiers"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              )}
            />
          </Stack>
        </Box>
      )}

      {ruleType === "product_incompatibility" && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Product Incompatibility Configuration
          </Typography>
          <Stack spacing={2}>
            <Controller
              name="productIncompatibility.categoryId"
              control={control}
              rules={{ required: "Category is required" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  select
                  label="Incompatible Category"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="productIncompatibility.minimumDistance"
              control={control}
              rules={{
                required: "Minimum distance is required",
                min: { value: 0, message: "Minimum is 0" },
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Minimum Distance (slots)"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  slotProps={{ htmlInput: { min: 0 } }}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value) || 0);
                  }}
                />
              )}
            />
          </Stack>
        </Box>
      )}

      {ruleType === "storage_condition" && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Storage Condition Configuration
          </Typography>
          <Stack spacing={2}>
            <Controller
              name="storageCondition.conditionType"
              control={control}
              rules={{ required: "Condition type is required" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Condition Type"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  placeholder="e.g. refrigerated, ventilated"
                />
              )}
            />

            <Controller
              name="storageCondition.selectionMode"
              control={control}
              rules={{ required: "Selection mode is required" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  select
                  label="Selection Mode"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                  onChange={(e) => {
                    field.onChange(e.target.value as SelectionMode);
                  }}
                >
                  {SELECTION_MODES.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {storageSelectionMode === "palettier_type" && (
              <Controller
                name="storageCondition.palettierTypeId"
                control={control}
                rules={{ required: "Palettier type is required" }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    label="Palettier Type"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                  >
                    {palettierTypes.map((pt) => (
                      <MenuItem key={pt.id} value={pt.id}>
                        {pt.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}

            {storageSelectionMode === "specific_palettier" && (
              <Controller
                name="storageCondition.palettierIds"
                control={control}
                rules={{
                  validate: (value) =>
                    value.length > 0 || "Select at least one palettier",
                }}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    multiple
                    options={palettiers.map((p) => p.id)}
                    getOptionLabel={(id) => {
                      const p = palettiers.find((pal) => pal.id === id);
                      return p?.name ?? String(id);
                    }}
                    value={field.value}
                    onChange={(_, newValue) => {
                      field.onChange(newValue);
                    }}
                    renderValue={(value, getTagProps) =>
                      value.map((id, index) => {
                        const p = palettiers.find((pal) => pal.id === id);
                        const { key, ...rest } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            label={p?.name ?? String(id)}
                            size="small"
                            {...rest}
                          />
                        );
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Palettiers"
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            )}
          </Stack>
        </Box>
      )}

      {ruleType === "placement_constraint" && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Placement Constraint Configuration
          </Typography>
          <Stack spacing={2}>
            <Controller
              name="placementConstraint.constraintType"
              control={control}
              rules={{ required: "Constraint type is required" }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  select
                  label="Constraint Type"
                  fullWidth
                  error={!!error}
                  helperText={error?.message}
                >
                  {PLACEMENT_CONSTRAINT_TYPES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {placementConstraintType === "max_height" && (
              <Controller
                name="placementConstraint.maxHeight"
                control={control}
                rules={{
                  required: "Max height is required",
                  min: { value: 1, message: "Minimum is 1" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Maximum Height (slots)"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    slotProps={{ htmlInput: { min: 1 } }}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value === "" ? "" : Number(e.target.value)
                      );
                    }}
                  />
                )}
              />
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default RuleFormStep;
