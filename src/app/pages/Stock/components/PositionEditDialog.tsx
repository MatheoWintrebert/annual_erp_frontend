import { useEffect } from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import type { FC } from "react";
import type { EditPaletteData } from "../types";
import { useGetPalettiers, useUpdatePalettePosition } from "../api";
import type { PalettierOption } from "../api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { useApiError } from "../../../hooks/useApiError";

interface PositionEditDialogProps {
  open: boolean;
  onClose: () => void;
  palette: EditPaletteData | null;
}

interface PositionEditFormValues {
  palettier: PalettierOption | null;
  positionX: number;
  positionY: number;
  positionZ: number;
}

const PositionEditDialog: FC<PositionEditDialogProps> = ({
  open,
  onClose,
  palette,
}) => {
  const { data: palettiers = [] } = useGetPalettiers();
  const updatePosition = useUpdatePalettePosition();
  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const { control, handleSubmit, reset } = useForm<PositionEditFormValues>({
    defaultValues: {
      palettier: null,
      positionX: 0,
      positionY: 0,
      positionZ: 0,
    },
  });

  useEffect(() => {
    if (palette && palettiers.length > 0) {
      const currentPalettier =
        palettiers.find((p) => p.id === palette.palettierId) ?? null;
      reset({
        palettier: currentPalettier,
        positionX: palette.positionX,
        positionY: palette.positionY,
        positionZ: palette.positionZ,
      });
    }
  }, [palette, palettiers, reset]);

  const onSubmit = async (data: PositionEditFormValues): Promise<void> => {
    if (!palette || !data.palettier) return;

    try {
      await updatePosition.mutateAsync({
        paletteId: palette.paletteId,
        palettierId: data.palettier.id,
        positionX: data.positionX,
        positionY: data.positionY,
        positionZ: data.positionZ,
      });
      showSnackbar("Palette position updated", "success");
      onClose();
    } catch (error) {
      await handleError(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Palette Position</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Controller
            name="palettier"
            control={control}
            rules={{ required: "Palettier is required" }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Autocomplete
                options={palettiers}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, val) => option.id === val.id}
                value={value}
                onChange={(_event, newValue) => {
                  onChange(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Palettier"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            )}
          />
          <Controller
            name="positionX"
            control={control}
            rules={{
              required: "Position X is required",
              min: { value: 0, message: "Minimum 0" },
              validate: (value) =>
                Number.isInteger(value) || "Must be an integer",
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                type="number"
                label="Position X"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                error={!!error}
                helperText={error?.message}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
          <Controller
            name="positionY"
            control={control}
            rules={{
              required: "Position Y is required",
              min: { value: 0, message: "Minimum 0" },
              validate: (value) =>
                Number.isInteger(value) || "Must be an integer",
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                type="number"
                label="Position Y"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                error={!!error}
                helperText={error?.message}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
          <Controller
            name="positionZ"
            control={control}
            rules={{
              required: "Position Z is required",
              min: { value: 0, message: "Minimum 0" },
              validate: (value) =>
                Number.isInteger(value) || "Must be an integer",
            }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                type="number"
                label="Position Z"
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                error={!!error}
                helperText={error?.message}
                onChange={(e) => {
                  field.onChange(Number(e.target.value));
                }}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={updatePosition.isPending}
          startIcon={
            updatePosition.isPending ? <CircularProgress size={20} /> : undefined
          }
          onClick={() => void handleSubmit(onSubmit)()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PositionEditDialog;
