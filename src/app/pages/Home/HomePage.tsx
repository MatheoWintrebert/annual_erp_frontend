import React from "react";
import { Box, Container, Typography, Chip, alpha } from "@mui/material";
import Grid from "@mui/material/Grid";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import DashboardPlaceholder from "./components/DashboardPlaceholder";
import WarehouseIcon from "@mui/icons-material/Warehouse";

const dashboards = [
  { title: "Fullness Dashboard", data: [], coordinate: "A1" },
  { title: "Expiry Dashboard", data: [], coordinate: "A2" },
  { title: "Operation Dashboard", data: [], coordinate: "B1" },
  { title: "Prevision Dashboard", data: [], coordinate: "B2" },
];

const HomePage: React.FC = () => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          {/* Hero section */}
          <Box
            sx={{
              mb: 6,
              position: "relative",
            }}
          >
            <Chip
              icon={<WarehouseIcon sx={{ fontSize: 16 }} />}
              label="Inventory Management"
              color="info"
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />

            <Typography
              variant="h3"
              color="text.primary"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
              }}
            >
              Welcome to{" "}
              <Box
                component="span"
                sx={{
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Annual ERP
              </Box>
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: 600,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Intelligent palette placement system. Monitor your warehouse
              capacity, track expiry dates, and optimize storage operations.
            </Typography>

            {/* Decorative element */}
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: 0,
                width: 200,
                height: 200,
                background: (theme) =>
                  `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
                borderRadius: "50%",
                filter: "blur(40px)",
                pointerEvents: "none",
                display: { xs: "none", md: "block" },
              }}
            />
          </Box>

          {/* Dashboard grid */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 4,
                gap: 2,
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Dashboard Overview
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  bgcolor: "divider",
                }}
              />
            </Box>

            <Grid container spacing={3}>
              {dashboards.map((dashboard) => (
                <Grid key={dashboard.title} size={{ xs: 12, sm: 6, lg: 6 }}>
                  <DashboardPlaceholder
                    title={dashboard.title}
                    data={dashboard.data}
                    coordinate={dashboard.coordinate}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default HomePage;
