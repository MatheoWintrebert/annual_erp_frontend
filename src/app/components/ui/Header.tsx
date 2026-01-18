import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Header: React.FC = () => (
  <AppBar
    position="static"
    color="transparent"
    elevation={0}
    sx={{ borderBottom: 1, borderColor: "divider" }}
  >
    <Toolbar>
      <Button
        component={RouterLink}
        to="/home"
        sx={{
          p: 0,
          minWidth: 0,
          background: "none",
          boxShadow: "none",
          "&:hover": { background: "none", boxShadow: "none" },
          display: "flex",
          alignItems: "center",
        }}
        disableRipple
        disableElevation
      >
        <img
          src="/icon.png"
          alt="Annual ERP Logo"
          style={{ height: 40, marginRight: 16 }}
        />
        <Typography variant="h6" color="text.primary" fontWeight={700}>
          Annual ERP
        </Typography>
      </Button>
      <Button
        component={RouterLink}
        to="/selling"
        color="secondary"
        sx={{ ml: 2, fontWeight: 600 }}
      >
        Sell
      </Button>
      <Button
        component={RouterLink}
        to="/setup"
        color="secondary"
        sx={{ ml: 2, fontWeight: 600 }}
      >
        Setup
      </Button>
      <Box flexGrow={1} />
      <Button
        color="primary"
        variant="outlined"
        sx={{ ml: 2, fontWeight: 600 }}
        onClick={() => {
          //handleLogin();
        }}
      >
        Login
      </Button>
    </Toolbar>
  </AppBar>
);

export default Header;
