import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AlertCard } from "../../../components/cards";
import type { LowStockAlert } from "../types";
import type { FC } from "react";

interface LowStockPanelProps {
  alerts: LowStockAlert[];
}

const LowStockPanel: FC<LowStockPanelProps> = ({ alerts }) => {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h5">Low Stock Warnings</Typography>
        {alerts.length > 0 && (
          <Chip label={alerts.length} size="small" color="warning" />
        )}
      </Box>

      {alerts.length === 0 ? (
        <Alert
          severity="success"
          icon={<CheckCircleOutlineIcon />}
        >
          All stock levels healthy
        </Alert>
      ) : (
        <Stack spacing={2}>
          {alerts.map((alert) => (
            <AlertCard
              key={`lowstock-${String(alert.productId)}`}
              title={alert.productName}
              severity="warning"
              icon={<TrendingDownIcon color="warning" />}
            >
              <Typography variant="body2" color="text.secondary">
                <strong>{alert.productReference}</strong>
                {" — "}
                {alert.currentQuantity} / {alert.minimumStock}{" "}
                {alert.unitOfMeasureName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {String(alert.deficit)} {alert.unitOfMeasureName} below minimum
              </Typography>
            </AlertCard>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default LowStockPanel;
