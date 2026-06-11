import { Box, Card, CardContent, Typography } from "@mui/material";
import type { FC, ReactNode } from "react";

interface AlertCardProps {
  title: string;
  severity: "info" | "warning" | "error";
  icon?: ReactNode;
  children: ReactNode;
}

const severityColorMap: Record<AlertCardProps["severity"], string> = {
  info: "info.main",
  warning: "warning.main",
  error: "error.main",
};

const AlertCard: FC<AlertCardProps> = ({ title, severity, icon, children }) => (
  <Card
    sx={{
      borderLeft: 4,
      borderColor: severityColorMap[severity],
      "&:hover": { borderColor: severityColorMap[severity] },
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
);

export default AlertCard;
