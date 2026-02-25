import { useState } from "react";
import {
  Typography,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";

import {
  fieldCannotBeEmpty,
  passwordValidationTextMin,
  passwordValidationTextMax,
} from "@/constants/messages";

import type { FieldProps } from "./types";

interface FieldPasswordProps extends FieldProps {
  name?: string;
}

export const FieldPassword = ({
  InputProps,
  autoComplete = "new-password",
  formState: { errors },
  helperText,
  label,
  name = "password",
  placeholder,
  register,
  validation = null,
}: FieldPasswordProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <FormControl error={!!errors[name]} sx={{ width: "100%" }}>
      {label && (
        <Typography
          component={"label"}
          mb={0.5}
          variant={"body3"}
          htmlFor={name}
          sx={{ cursor: "pointer" }}
        >
          {label}
        </Typography>
      )}
      <TextField
        id={name}
        type={showPassword ? "text" : "password"}
        fullWidth
        autoComplete={autoComplete}
        placeholder={placeholder}
        hiddenLabel
        variant="filled"
        data-testid="password"
        className={errors[name] && "error"}
        {...register(
          name,
          validation || {
            required: fieldCannotBeEmpty,
            maxLength: {
              value: 32,
              message: passwordValidationTextMax,
            },
            minLength: {
              value: 12,
              message: passwordValidationTextMin,
            },
          }
        )}
      />
      {errors[name] && (
        <FormHelperText>{errors[name]?.message as string}</FormHelperText>
      )}

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};
