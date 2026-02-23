import { Box, Card, CardContent, Typography } from "@mui/material";
import type { FC, ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, subtitle, icon }) => (
  <Card>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Typography variant="overline">{title}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        {icon}
      </Box>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default MetricCard;
