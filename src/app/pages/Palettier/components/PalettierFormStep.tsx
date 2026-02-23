import {
  Alert,
  Box,
  Collapse,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { FC, KeyboardEvent } from "react";
import AddIcon from "@mui/icons-material/Add";
import type { PalettierWizardFormData, PalettierType } from "../types";

interface PalettierFormStepProps {
  methods: UseFormReturn<PalettierWizardFormData>;
  palettierTypes: PalettierType[];
  onAddNewType: (name: string) => Promise<void>;
  paletteWarning?: string;
}

const ALLOWED_NUMERIC_KEYS = [
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "Tab",
];

const handleNumericKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
  const isAllowedKey = ALLOWED_NUMERIC_KEYS.includes(e.key);
  const isDigit = e.key >= "0" && e.key <= "9";
  const isModifier = e.ctrlKey || e.metaKey;

  if (!isAllowedKey && !isDigit && !isModifier) {
    e.preventDefault();
  }
};

const PalettierFormStep: FC<PalettierFormStepProps> = ({
  methods,
  palettierTypes,
  onAddNewType,
  paletteWarning,
}) => {
  const { control, watch, setValue, getValues } = methods;
  const isNewType = watch("isNewType");

  const handleAddType = async (): Promise<void> => {
    const isValid = await methods.trigger("newTypeName");
    if (!isValid) return;
    const newTypeName = getValues("newTypeName").trim();
    await onAddNewType(newTypeName);
  };

  return (
    <Stack spacing={2}>
      {paletteWarning && <Alert severity="info">{paletteWarning}</Alert>}

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
            label="Palettier Name"
            fullWidth
            error={!!error}
            helperText={error?.message ?? "Unique identifier (e.g. PAL-A01)"}
            placeholder="PAL-A01"
          />
        )}
      />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          Storage Type
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Controller
            name="typeId"
            control={control}
            rules={{
              validate: (value) => {
                if (isNewType) return true;
                if (value !== "") return true;
                return "Storage type is required";
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                select
                label="Existing Type"
                fullWidth
                disabled={isNewType || palettierTypes.length === 0}
                error={!!error}
                helperText={error?.message}
              >
                {palettierTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <FormControlLabel
            control={
              <Controller
                name="isNewType"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    {...field}
                    checked={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      if (!e.target.checked) {
                        setValue("newTypeName", "");
                      }
                    }}
                    icon={<AddIcon />}
                    checkedIcon={<AddIcon color="primary" />}
                  />
                )}
              />
            }
            label="New"
            sx={{ whiteSpace: "nowrap" }}
          />
        </Stack>

        <Collapse in={isNewType}>
          <Stack direction="row" spacing={2} mt={2} alignItems="flex-start">
            <Controller
              name="newTypeName"
              control={control}
              rules={{
                required: isNewType ? "Type name is required" : false,
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="New Type Name"
                  fullWidth
                  error={!!error}
                  helperText={
                    error?.message ?? "Add the type to make it available"
                  }
                  placeholder="e.g. High Security Zone"
                />
              )}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => void handleAddType()}
              sx={{ whiteSpace: "nowrap", minWidth: "auto", px: 3, height: 56 }}
            >
              Add
            </Button>
          </Stack>
        </Collapse>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          Dimensions (number of slots)
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Controller
            name="width"
            control={control}
            rules={{
              required: "Width is required",
              min: { value: 1, message: "Minimum 1" },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value}
                type="number"
                label="Width"
                fullWidth
                onKeyDown={handleNumericKeyDown}
                slotProps={{ htmlInput: { min: 1 } }}
                error={!!error}
                helperText={error?.message}
                onChange={(e) => {
                  field.onChange(Number(e.target.value) || 1);
                }}
              />
            )}
          />
          <Controller
            name="depth"
            control={control}
            rules={{
              required: "Depth is required",
              min: { value: 1, message: "Minimum 1" },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value}
                type="number"
                label="Depth"
                fullWidth
                onKeyDown={handleNumericKeyDown}
                slotProps={{ htmlInput: { min: 1 } }}
                error={!!error}
                helperText={error?.message}
                onChange={(e) => {
                  field.onChange(Number(e.target.value) || 1);
                }}
              />
            )}
          />
          <Controller
            name="height"
            control={control}
            rules={{
              required: "Height is required",
              min: { value: 1, message: "Minimum 1" },
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                value={field.value}
                type="number"
                label="Height"
                fullWidth
                onKeyDown={handleNumericKeyDown}
                slotProps={{ htmlInput: { min: 1 } }}
                error={!!error}
                helperText={error?.message}
                onChange={(e) => {
                  field.onChange(Number(e.target.value) || 1);
                }}
              />
            )}
          />
        </Stack>
      </Box>
    </Stack>
  );
};

export default PalettierFormStep;
