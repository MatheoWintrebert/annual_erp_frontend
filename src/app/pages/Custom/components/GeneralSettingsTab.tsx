import { Stack, Typography, TextField, MenuItem } from "@mui/material";
import { Controller } from "react-hook-form";
import type { FC } from "react";
import type { TabPanelProps } from "../types";
import { LANGUAGES, TIMEZONES } from "../types";

const GeneralSettingsTab: FC<TabPanelProps> = ({ control, errors }) => (
  <Stack spacing={3}>
    <Typography variant="h6" fontWeight={600}>
      General Settings
    </Typography>

    <Controller
      name="name"
      control={control}
      rules={{
        required: "Company name is required",
        minLength: {
          value: 2,
          message: "Company name must be at least 2 characters",
        },
      }}
      render={({ field }) => (
        <TextField
          {...field}
          label="Company Name"
          fullWidth
          error={!!errors.name}
          helperText={
            errors.name?.message ??
            "This will appear in the header and documents"
          }
          required
        />
      )}
    />

    <Controller
      name="language"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label="Language"
          fullWidth
          helperText="Select your preferred language"
        >
          {LANGUAGES.map((lang) => (
            <MenuItem key={lang.value} value={lang.value}>
              {lang.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />

    <Controller
      name="timezone"
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          select
          label="Time Zone"
          fullWidth
          helperText="Used for timestamps and scheduling"
        >
          {TIMEZONES.map((tz) => (
            <MenuItem key={tz.value} value={tz.value}>
              {tz.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  </Stack>
);

export default GeneralSettingsTab;
