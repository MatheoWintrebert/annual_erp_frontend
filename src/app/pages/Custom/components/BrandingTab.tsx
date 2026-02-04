import {
  Stack,
  Typography,
  TextField,
  Box,
  Avatar,
  InputAdornment,
} from "@mui/material";
import { Controller } from "react-hook-form";
import type { FC } from "react";
import type { TabPanelProps } from "../types";
import { URL_PATTERN } from "../types";

const BrandingTab: FC<TabPanelProps> = ({ control, errors }) => (
  <Stack spacing={3}>
    <Typography variant="h6" fontWeight={600}>
      Brand Identity
    </Typography>

    <Controller
      name="brandingLogoUrl"
      control={control}
      rules={{
        pattern: {
          value: URL_PATTERN,
          message:
            "Please enter a valid URL (e.g., https://example.com/logo.png)",
        },
      }}
      render={({ field }) => (
        <TextField
          {...field}
          label="Logo URL"
          fullWidth
          placeholder="https://example.com/logo.png"
          error={!!errors.brandingLogoUrl}
          helperText={
            errors.brandingLogoUrl?.message ??
            "Enter a direct link to your company logo image"
          }
          slotProps={{
            input: {
              startAdornment: field.value ? (
                <InputAdornment position="start">
                  <Avatar
                    src={field.value}
                    variant="rounded"
                    sx={{ width: 32, height: 32 }}
                  />
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      )}
    />

    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Controller
          name="primaryColor"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Primary Color"
              fullWidth
              type="color"
              helperText="Main theme color"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: field.value,
                          border: 1,
                          borderColor: "divider",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Controller
          name="secondaryColor"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Secondary Color"
              fullWidth
              type="color"
              helperText="Accent color"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: field.value,
                          border: 1,
                          borderColor: "divider",
                        }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />
      </Box>
    </Box>
  </Stack>
);

export default BrandingTab;
