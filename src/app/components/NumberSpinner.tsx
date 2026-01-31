import React from "react";
import { Box, IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface NumberSpinnerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  error?: boolean;
  disabled?: boolean;
}

const NumberSpinner: React.FC<NumberSpinnerProps> = ({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  label,
  error = false,
  disabled = false,
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    } else if (e.target.value === "") {
      onChange(min);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <IconButton
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        size="small"
        color="primary"
      >
        <RemoveIcon />
      </IconButton>
      <TextField
        value={value}
        onChange={handleInputChange}
        label={label}
        error={error}
        disabled={disabled}
        sx={{ width: "120px" }}
      />
      <IconButton
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        size="small"
        color="primary"
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
};

export default NumberSpinner;
