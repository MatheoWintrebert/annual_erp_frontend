import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { FC } from "react";

interface EmptyStateProps {
  onOnboard: () => void;
}

const EmptyState: FC<EmptyStateProps> = ({ onOnboard }) => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      gap={2}
    >
      <Typography variant="h6">No palettes in the warehouse yet</Typography>
      <Typography variant="body2" color="text.secondary">
        Register palettes through Intake or onboard your existing stock
      </Typography>
      <Box display="flex" gap={2} mt={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            void navigate("/intake");
          }}
        >
          Go to Intake
        </Button>
        <Button variant="outlined" onClick={onOnboard}>
          Onboard Existing Stock
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyState;
