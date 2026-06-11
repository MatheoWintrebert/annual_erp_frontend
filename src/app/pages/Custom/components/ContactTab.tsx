import { Stack, Typography, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import type { FC } from "react";
import type { TabPanelProps } from "../types";
import { EMAIL_PATTERN, PHONE_PATTERN } from "../types";

const ContactTab: FC<TabPanelProps> = ({ control, errors }) => (
  <Stack spacing={3}>
    <Typography variant="h6" fontWeight={600}>
      Contact Information
    </Typography>

    <Controller
      name="contactEmail"
      control={control}
      rules={{
        pattern: {
          value: EMAIL_PATTERN,
          message: "Invalid email address",
        },
      }}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          label="Contact Email"
          type="email"
          fullWidth
          error={!!errors.contactEmail}
          helperText={
            errors.contactEmail?.message ??
            "Primary contact email for support and notifications"
          }
        />
      )}
    />

    <Controller
      name="contactPhone"
      control={control}
      rules={{
        pattern: {
          value: PHONE_PATTERN,
          message:
            "Enter digits only, optionally starting with + (e.g., +33612345678 or 0612345678)",
        },
      }}
      render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          label="Contact Phone"
          type="tel"
          fullWidth
          placeholder="+33612345678"
          error={!!errors.contactPhone}
          helperText={
            errors.contactPhone?.message ??
            "Main phone number (digits only, e.g., +33612345678)"
          }
        />
      )}
    />
  </Stack>
);

export default ContactTab;
