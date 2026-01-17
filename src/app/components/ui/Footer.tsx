import React from "react";
import { Box, Typography, Container } from "@mui/material";

const Footer: React.FC = () => (
  <Box
    component="footer"
    sx={{
      py: 3,
      mt: 6,
      bgcolor: "background.paper",
      borderTop: 1,
      borderColor: "divider",
    }}
  >
    <Container maxWidth="lg">
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} Annual ERP. All rights reserved.
      </Typography>
    </Container>
  </Box>
);

export default Footer;
