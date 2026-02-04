import {
  Box,
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
import { Controller, useWatch } from "react-hook-form";
import type { KeyboardEvent, FC } from "react";
import AddIcon from "@mui/icons-material/Add";
import type { FormData, PalettierFormCardProps } from "../types";

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

type PalettierFieldName =
  | `palettiers.${number}`
  | `palettiers.${number}.name`
  | `palettiers.${number}.typeId`
  | `palettiers.${number}.isNewType`
  | `palettiers.${number}.newTypeName`
  | `palettiers.${number}.width`
  | `palettiers.${number}.depth`
  | `palettiers.${number}.height`;

const PalettierFormCard: FC<PalettierFormCardProps> = ({
  index,
  control,
  setValue,
  palettierTypes,
  onAddNewType,
}) => {
  const idx = String(index);

  const palettierData = useWatch({
    control,
    name: `palettiers.${idx}` as PalettierFieldName,
  }) as FormData["palettiers"][number] | undefined;

  const isNewType = palettierData?.isNewType ?? false;

  return (
    <Paper
      elevation={2}
      sx={{ padding: 3, backgroundColor: "background.paper" }}
    >
      <Typography variant="h6" color="text.primary" mb={2}>
        Palettier {index + 1}
      </Typography>

      <Stack spacing={2}>
        <Controller
          name={`palettiers.${idx}.name` as PalettierFieldName}
          control={control}
          rules={{ required: "Le nom est requis" }}
          render={({ field, fieldState: { error: nameError } }) => (
            <TextField
              {...field}
              label="Nom du palettier"
              fullWidth
              error={!!nameError}
              helperText={
                nameError?.message ??
                "Identifiant unique du palettier (ex: PAL-A01)"
              }
              placeholder="PAL-A01"
            />
          )}
        />

        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Type de palettier
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <Controller
              name={`palettiers.${idx}.typeId` as PalettierFieldName}
              control={control}
              rules={{
                validate: (value) => {
                  if (isNewType) return true;
                  if (value !== "") return true;
                  return "Le type est requis";
                },
              }}
              render={({ field, fieldState: { error: typeError } }) => (
                <TextField
                  {...field}
                  select
                  label="Type existant"
                  fullWidth
                  disabled={isNewType || palettierTypes.length === 0}
                  error={!!typeError}
                  helperText={typeError?.message}
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
                  name={`palettiers.${idx}.isNewType` as PalettierFieldName}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={(field.value as boolean | undefined) ?? false}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        if (!e.target.checked) {
                          setValue(
                            `palettiers.${idx}.newTypeName` as PalettierFieldName,
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

          <Collapse in={isNewType}>
            <Stack direction="row" spacing={2} mt={2} alignItems="flex-start">
              <Controller
                name={`palettiers.${idx}.newTypeName` as PalettierFieldName}
                control={control}
                rules={{
                  required: isNewType ? "Le nom du type est requis" : false,
                }}
                render={({ field, fieldState: { error: newTypeError } }) => (
                  <TextField
                    {...field}
                    label="Nom du nouveau type"
                    fullWidth
                    error={!!newTypeError}
                    helperText={
                      newTypeError?.message ??
                      "Ajoutez le type pour le rendre disponible"
                    }
                    placeholder="Ex: Zone haute sécurité"
                  />
                )}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={() => void onAddNewType(index)}
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
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Dimensions en nombre de cases
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Controller
              name={`palettiers.${idx}.width` as PalettierFieldName}
              control={control}
              rules={{
                required: "La largeur est requise",
                min: { value: 1, message: "Minimum 1" },
              }}
              render={({ field, fieldState: { error: widthError } }) => (
                <TextField
                  {...field}
                  value={(field.value as number | undefined) ?? 1}
                  type="number"
                  label="Largeur"
                  fullWidth
                  onKeyDown={handleNumericKeyDown}
                  slotProps={{ htmlInput: { min: 1 } }}
                  error={!!widthError}
                  helperText={widthError?.message}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value) || 1);
                  }}
                />
              )}
            />

            <Controller
              name={`palettiers.${idx}.depth` as PalettierFieldName}
              control={control}
              rules={{
                required: "La profondeur est requise",
                min: { value: 1, message: "Minimum 1" },
              }}
              render={({ field, fieldState: { error: depthError } }) => (
                <TextField
                  {...field}
                  value={(field.value as number | undefined) ?? 1}
                  type="number"
                  label="Profondeur"
                  fullWidth
                  onKeyDown={handleNumericKeyDown}
                  slotProps={{ htmlInput: { min: 1 } }}
                  error={!!depthError}
                  helperText={depthError?.message}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value) || 1);
                  }}
                />
              )}
            />

            <Controller
              name={`palettiers.${idx}.height` as PalettierFieldName}
              control={control}
              rules={{
                required: "La hauteur est requise",
                min: { value: 1, message: "Minimum 1" },
              }}
              render={({ field, fieldState: { error: heightError } }) => (
                <TextField
                  {...field}
                  value={(field.value as number | undefined) ?? 1}
                  type="number"
                  label="Hauteur"
                  fullWidth
                  onKeyDown={handleNumericKeyDown}
                  slotProps={{ htmlInput: { min: 1 } }}
                  error={!!heightError}
                  helperText={heightError?.message}
                  onChange={(e) => {
                    field.onChange(Number(e.target.value) || 1);
                  }}
                />
              )}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

export default PalettierFormCard;
