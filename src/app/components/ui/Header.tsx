import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const Header: React.FC = () => {
  const [setupAnchorEl, setSetupAnchorEl] = useState<null | HTMLElement>(null);
  const setupMenuOpen = Boolean(setupAnchorEl);

  const handleSetupMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSetupAnchorEl(event.currentTarget);
  };

  const handleSetupMenuClose = () => {
    setSetupAnchorEl(null);
  };

  return (
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
          color="secondary"
          sx={{ ml: 2, fontWeight: 600 }}
          onClick={handleSetupMenuOpen}
          endIcon={<KeyboardArrowDownIcon />}
        >
          Setup
        </Button>
        <Menu
          anchorEl={setupAnchorEl}
          open={setupMenuOpen}
          onClose={handleSetupMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          slotProps={{
            paper: {
              sx: {
                border: 1,
                borderColor: "secondary.main",
              },
            },
          }}
        >
          <MenuItem
            component={RouterLink}
            to="/custom"
            onClick={handleSetupMenuClose}
          >
            Custom
          </MenuItem>

          <MenuItem
            component={RouterLink}
            to="/palettier"
            onClick={handleSetupMenuClose}
          >
            Palettier
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/rules"
            onClick={handleSetupMenuClose}
          >
            Rules
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/product"
            onClick={handleSetupMenuClose}
          >
            Products
          </MenuItem>
          <MenuItem
            component={RouterLink}
            to="/palette"
            onClick={handleSetupMenuClose}
          >
            Palettes
          </MenuItem>
        </Menu>
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
};

export default Header;
