import { Box, Typography, Card, Stack, Avatar, Chip } from "@mui/material";
import { Business } from "@mui/icons-material";
import type { FC } from "react";
import { useWatch } from "react-hook-form";
import type { SettingsPreviewProps } from "../types";

const SettingsPreview: FC<SettingsPreviewProps> = ({ control }) => {
  const values = useWatch({ control });
  return (
    <Stack spacing={3}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Preview
        </Typography>
        <Box
          sx={{
            p: 2,
            bgcolor: values.primaryColor ?? "grey.500",
            color: "white",
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            {values.brandingLogoUrl ? (
              <Avatar
                src={values.brandingLogoUrl}
                variant="rounded"
                sx={{ width: 40, height: 40, bgcolor: "white" }}
              />
            ) : (
              <Avatar variant="rounded" sx={{ bgcolor: "white" }}>
                <Business color="primary" />
              </Avatar>
            )}
            <Typography variant="h6" fontWeight={700}>
              {values.name || "Your Company"}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label="Primary Color"
            sx={{
              bgcolor: values.primaryColor ?? "grey.500",
              color: "white",
            }}
          />
          <Chip
            label="Secondary Color"
            sx={{
              bgcolor: values.secondaryColor ?? "grey.500",
              color: "white",
            }}
          />
        </Box>
      </Card>

      <Card variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Need Help?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          We offer custom integration services to connect your existing systems,
          automate data transfers, and fully configure the palette storage tool.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Each setup is tailored to your operational workflows and data formats.
        </Typography>
      </Card>
    </Stack>
  );
};

export default SettingsPreview;
