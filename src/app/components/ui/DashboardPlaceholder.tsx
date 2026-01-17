import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface DashboardPlaceholderProps {
  title: string;
  data: any[];
}

const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({
  title,
  data,
}) => (
  <Card sx={{ minWidth: 500, bgcolor: "background.paper", boxShadow: 3 }}>
    <CardContent>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={320}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {data.length === 0 ? "Dashboard coming soon..." : data}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default DashboardPlaceholder;
