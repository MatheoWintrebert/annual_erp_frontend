import { Box, Divider, Stack, Typography } from "@mui/material";
import type { FC } from "react";
import type { PalettierWizardFormData, PalettierType } from "../types";
import { getTypeName } from "../types";

interface PalettierReviewStepProps {
  values: PalettierWizardFormData;
  palettierTypes: PalettierType[];
}

const PalettierReviewStep: FC<PalettierReviewStepProps> = ({
  values,
  palettierTypes,
}) => {
  const totalCapacity = values.width * values.depth * values.height;

  return (
    <Stack spacing={2}>
      <Typography variant="h6" color="text.primary">
        Review Palettier Details
      </Typography>

      <Divider />

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Name
        </Typography>
        <Typography variant="body1">{values.name || "—"}</Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Storage Type
        </Typography>
        <Typography variant="body1">
          {getTypeName(values.typeId, palettierTypes)}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Dimensions (W × D × H)
        </Typography>
        <Typography variant="body1">
          {values.width} × {values.depth} × {values.height}
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">
          Total Capacity
        </Typography>
        <Typography variant="body1">
          {totalCapacity} position{totalCapacity !== 1 ? "s" : ""}
        </Typography>
      </Box>
    </Stack>
  );
};

export default PalettierReviewStep;
