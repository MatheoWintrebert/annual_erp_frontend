import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AlertCard } from "../../../components/cards";
import type { ExpiryAlert } from "../types";
import type { FC } from "react";

interface ExpiryAlertPanelProps {
  alerts: ExpiryAlert[];
}

const severityMap: Record<
  ExpiryAlert["severity"],
  "error" | "warning" | "info"
> = {
  expired: "error",
  critical: "warning",
  warning: "info",
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
};

const ExpiryAlertPanel: FC<ExpiryAlertPanelProps> = ({ alerts }) => {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h5">Expiry Alerts</Typography>
        {alerts.length > 0 && (
          <Chip label={alerts.length} size="small" color="warning" />
        )}
      </Box>

      {alerts.length === 0 ? (
        <Alert severity="success" icon={<CheckCircleOutlineIcon />}>
          No expiry alerts — all stock within safe thresholds
        </Alert>
      ) : (
        <Stack spacing={2}>
          {alerts.map((alert) => (
            <AlertCard
              key={`expiry-${String(alert.productId)}`}
              title={alert.productName}
              severity={severityMap[alert.severity]}
              icon={
                alert.severity === "warning" ? (
                  <InfoOutlinedIcon color="info" />
                ) : (
                  <WarningAmberIcon
                    color={alert.severity === "expired" ? "error" : "warning"}
                  />
                )
              }
            >
              <Typography variant="body2" color="text.secondary">
                <strong>{alert.productReference}</strong>
                {" — "}
                {alert.totalQuantity} {alert.unitOfMeasureName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expiry: {formatDate(alert.nearestExpiryDate)}
                {" — "}
                {alert.daysRemaining <= 0
                  ? "Expired"
                  : `${String(alert.daysRemaining)} days remaining`}
              </Typography>
            </AlertCard>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ExpiryAlertPanel;
