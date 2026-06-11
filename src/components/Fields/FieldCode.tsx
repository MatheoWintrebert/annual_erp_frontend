import {
  Typography,
  FormControl,
  FormHelperText,
  TextField,
  useTheme,
} from "@mui/material";

import { fieldCannotBeEmpty } from "@/constants/messages";
import type { FieldProps } from "./types";

export const FieldCode = ({
  InputProps,
  autoComplete = "on",
  disabled = false,
  formState: { errors },
  helperText,
  label,
  labelAccount,
  name = "email",
  placeholder,
  register,
  sx,
  sxForm,
}: FieldProps) => {
  const { palette } = useTheme();
  const { grey } = palette;

  return (
    <FormControl error={!!errors[name]} sx={sxForm ?? { width: "100%" }}>
      {label &&
        (labelAccount ? (
          <Typography variant={"body3"} color={grey[500]} width={"30%"}>
            {label}
          </Typography>
        ) : (
          <Typography
            component={"label"}
            variant={"body3"}
            mb={0.5}
            htmlFor={name}
            sx={{ cursor: "pointer" }}
          >
            {label}
          </Typography>
        ))}
      <TextField
        id={name}
        type={"email"}
        fullWidth
        autoComplete={autoComplete}
        placeholder={placeholder}
        hiddenLabel
        variant={"filled"}
        sx={sx}
        slotProps={{ input: InputProps }}
        className={errors[name] && "error"}
        disabled={disabled}
        {...register(name, {
          required: !disabled ? fieldCannotBeEmpty : false,
        })}
      />
      {errors[name] && (
        <FormHelperText>{errors[name].message as string}</FormHelperText>
      )}

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
