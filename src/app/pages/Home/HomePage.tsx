import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import DashboardPlaceholder from "./components/DashboardPlaceholder";
const dashboards = [
  { title: "Fullness Dashboard", data: [] },
  { title: "Expiry Dashboard", data: [] },
  { title: "Operation Dashboard", data: [] },
  {
    title: "Prevision Dashboard",
    data: [],
  },
];

const HomePage: React.FC = () => {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography
            variant="h4"
            color="text.primary"
            gutterBottom
            fontWeight={600}
          >
            Welcome to Annual ERP
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Your dashboards will appear here soon.
          </Typography>
          <Box mt={4}>
            <Grid container spacing={4} justifyContent="center">
              {dashboards.map((dashboard) => (
                <Grid sx={{}} key={dashboard.title}>
                  <DashboardPlaceholder
                    title={dashboard.title}
                    data={dashboard.data}
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
