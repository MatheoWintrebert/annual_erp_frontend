import Button from "@mui/material/Button";
import type {
  PrimaryButtonProps as ThemedPrimaryButtonProps,
  SecondaryButtonProps as ThemedSecondaryButtonProps,
} from "./Button.types";

// Reusable primary themed button component

const PrimaryButton: React.FC<ThemedPrimaryButtonProps> = ({
  variant = "contained",
  color = "primary",
  sx = {},
  ...props
}) => (
  <Button
    variant={variant}
    color={color}
    sx={{
      borderRadius: 2,
      fontWeight: 600,
      border: variant === "outlined" ? "1px solid" : "1px solid transparent",
      borderColor: "info.main",
      transition: "0.25s",
      "&:hover": {
        border: variant === "outlined" ? "2px solid" : "1px solid transparent",
        borderColor: "info.main",
        color: "info.main",
        boxShadow: variant !== "outlined" ? "0 0 0 2px" : undefined,
        backgroundColor: variant !== "outlined" ? `${color}.main` : undefined,
      },
      ...sx,
    }}
    {...props}
  />
);

// Reusable secondary themed button component
const SecondaryButton: React.FC<ThemedSecondaryButtonProps> = ({
  variant = "contained",
  color = "secondary",
  sx = {},
  ...props
}) => (
  <Button
    variant={variant}
    color={color}
    sx={{
      borderRadius: 2,
      fontWeight: 600,
      border: variant === "outlined" ? "1px solid" : "1px solid transparent",
      transition: "0.25s",
      "&:hover": {
        borderColor: "primary.main",
        color: "primary.main",
        boxShadow: variant !== "outlined" ? "0 0 0 2px" : undefined,
        backgroundColor: `${color}.main`,
      },
      ...sx,
    }}
    {...props}
  />
);
export { PrimaryButton, SecondaryButton };
