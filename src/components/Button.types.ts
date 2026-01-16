import type { ButtonProps } from '@mui/material/Button';

// Reusable primary themed button component
type PrimaryButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: 'contained' | 'text' | 'outlined';
  color?: 'primary' | 'inherit' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  sx?: ButtonProps['sx'];
};

type SecondaryButtonProps = Omit<ButtonProps, 'variant' | 'color'> & {
  variant?: 'contained' | 'text' | 'outlined';
  color?: 'primary' | 'inherit' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  sx?: ButtonProps['sx'];
};

export type { PrimaryButtonProps, SecondaryButtonProps };