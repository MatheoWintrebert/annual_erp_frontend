import { Box, Button, CircularProgress, Stack } from "@mui/material";
import type { FC } from "react";
import { DirectiveCard } from "../../../components/cards";
import type { PlacementRecommendation } from "../types";

interface PlacementStepProps {
  recommendation: PlacementRecommendation;
  onDone: () => void;
  onRegisterAnother: () => void;
  isSubmitting: boolean;
}

const PlacementStep: FC<PlacementStepProps> = ({
  recommendation,
  onDone,
  onRegisterAnother,
  isSubmitting,
}) => (
  <Stack spacing={3}>
    <DirectiveCard
      palettierName={recommendation.palettierName}
      positionX={recommendation.positionX}
      positionY={recommendation.positionY}
      positionZ={recommendation.positionZ}
      reasoning={recommendation.reasoning}
    />

    <Box display="flex" justifyContent="flex-end" gap={2}>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onDone}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Registering...
          </>
        ) : (
          "Done"
        )}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={onRegisterAnother}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
            Registering...
          </>
        ) : (
          "Register Another"
        )}
      </Button>
    </Box>
  </Stack>
);

export default PlacementStep;
