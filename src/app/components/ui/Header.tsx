import React, { useState } from "react";
import {
	AppBar,
	Toolbar,
	Typography,
	Button,
	Box,
	Menu,
	MenuItem,
	alpha,
	Avatar,
	Tooltip,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticated, setToken, getAuth } from "@/store/auth/slice";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useCompanySettings } from "../../context/CompanySettingsContext";

const setupRoutes = [
	"/custom",
	"/palettier",
	"/rules",
	"/product",
	"/stock",
	"/users",
];

const Header: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { isAuthenticated } = useSelector(getAuth);
	const [setupAnchorEl, setSetupAnchorEl] = useState<null | HTMLElement>(null);
	const setupMenuOpen = Boolean(setupAnchorEl);
	const { settings } = useCompanySettings();

	const handleLogout = () => {
		dispatch(setAuthenticated(false));
		dispatch(setToken(null));
		void navigate("/signin");
	};

	const isSetupActive = setupRoutes.includes(location.pathname);

	const handleSetupMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setSetupAnchorEl(event.currentTarget);
	};

	const handleSetupMenuClose = () => {
		setSetupAnchorEl(null);
	};

	const primaryNavStyles = (isActive: boolean) => ({
		ml: 1,
		px: 2,
		fontWeight: 600,
		position: "relative",
		color: isActive ? "secondary.main" : "text.primary",
		bgcolor: isActive
			? (theme: { palette: { secondary: { main: string } } }) =>
					alpha(theme.palette.secondary.main, 0.1)
			: "transparent",
		borderRadius: 2,
		"&::after": {
			content: '""',
			position: "absolute",
			bottom: 4,
			left: "50%",
			transform: "translateX(-50%)",
			width: isActive ? "80%" : "0%",
			height: 2,
			bgcolor: "secondary.main",
			borderRadius: 1,
			transition: "width 0.2s ease-in-out",
		},
		"&:hover": {
			color: "secondary.main",
			bgcolor: (theme: { palette: { secondary: { main: string } } }) =>
				alpha(theme.palette.secondary.main, 0.08),
			"&::after": {
				width: "80%",
			},
		},
	});

	const setupButtonStyles = (isActive: boolean) => ({
		ml: 2,
		fontWeight: 600,
		position: "relative",
		color: isActive ? "secondary.main" : "text.secondary",
		"&::after": {
			content: '""',
			position: "absolute",
			bottom: 4,
			left: "50%",
			transform: "translateX(-50%)",
			width: isActive ? "80%" : "0%",
			height: 2,
			bgcolor: "secondary.main",
			borderRadius: 1,
			transition: "width 0.2s ease-in-out",
		},
		"&:hover": {
			color: "secondary.main",
			bgcolor: "transparent",
			"&::after": {
				width: "80%",
			},
		},
	});

	return (
		<AppBar
			position="sticky"
			color="transparent"
			elevation={0}
			sx={{
				borderBottom: 1,
				borderColor: (theme) => alpha(theme.palette.divider, 0.5),
				backdropFilter: "blur(12px)",
				bgcolor: (theme) => alpha(theme.palette.background.default, 0.8),
				top: 3,
			}}
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
						alt="PMS Logo"
						className="logo"
						style={{ height: 40, marginRight: 16 }}
					/>
					<Typography variant="h6" color="text.primary" fontWeight={700}>
						PMS
					</Typography>
				</Button>

				<Button
					component={RouterLink}
					to="/home"
					color="secondary"
					sx={primaryNavStyles(
						location.pathname === "/" || location.pathname === "/home",
					)}
				>
					Dashboard
				</Button>

				<Button
					component={RouterLink}
					to="/intake"
					color="secondary"
					sx={primaryNavStyles(location.pathname === "/intake")}
				>
					Intake
				</Button>

				<Button
					component={RouterLink}
					to="/pick"
					color="secondary"
					sx={primaryNavStyles(location.pathname === "/pick")}
				>
					Pick
				</Button>

				<Button
					color="secondary"
					sx={setupButtonStyles(isSetupActive)}
					onClick={handleSetupMenuOpen}
					endIcon={
						<KeyboardArrowDownIcon
							sx={{
								transition: "transform 0.2s ease-in-out",
								transform: setupMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
							}}
						/>
					}
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
								mt: 1,
								minWidth: 180,
							},
						},
					}}
				>
					<MenuItem
						component={RouterLink}
						to="/custom"
						onClick={handleSetupMenuClose}
						selected={location.pathname === "/custom"}
					>
						<Box
							component="span"
							sx={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								bgcolor:
									location.pathname === "/custom"
										? "secondary.main"
										: "transparent",
								mr: 1.5,
							}}
						/>
						Custom
					</MenuItem>

					<MenuItem
						component={RouterLink}
						to="/palettier"
						onClick={handleSetupMenuClose}
						selected={location.pathname === "/palettier"}
					>
						<Box
							component="span"
							sx={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								bgcolor:
									location.pathname === "/palettier"
										? "secondary.main"
										: "transparent",
								mr: 1.5,
							}}
						/>
						Palettier
					</MenuItem>

					<MenuItem
						component={RouterLink}
						to="/rules"
						onClick={handleSetupMenuClose}
						selected={location.pathname === "/rules"}
					>
						<Box
							component="span"
							sx={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								bgcolor:
									location.pathname === "/rules"
										? "secondary.main"
										: "transparent",
								mr: 1.5,
							}}
						/>
						Rules
					</MenuItem>

					<MenuItem
						component={RouterLink}
						to="/product"
						onClick={handleSetupMenuClose}
						selected={location.pathname === "/product"}
					>
						<Box
							component="span"
							sx={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								bgcolor:
									location.pathname === "/product"
										? "secondary.main"
										: "transparent",
								mr: 1.5,
							}}
						/>
						Products
					</MenuItem>

					<MenuItem
						component={RouterLink}
						to="/stock"
						onClick={handleSetupMenuClose}
						selected={location.pathname === "/stock"}
					>
						<Box
							component="span"
							sx={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								bgcolor:
									location.pathname === "/stock"
										? "secondary.main"
										: "transparent",
								mr: 1.5,
							}}
						/>
						Stock
					</MenuItem>

					<MenuItem
						component={RouterLink}
						to="/users"
						onClick={handleSetupMenuClose}
						selected={location.pathname === "/users"}
					>
						<Box
							component="span"
							sx={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								bgcolor:
									location.pathname === "/users"
										? "secondary.main"
										: "transparent",
								mr: 1.5,
							}}
						/>
						Users
					</MenuItem>
				</Menu>

				<Box flexGrow={1} />

				{settings?.logoUrl && (
					<Tooltip title={settings.companyName || "Company"}>
						<Avatar
							src={settings.logoUrl}
							alt={settings.companyName || "Company logo"}
							variant="rounded"
							sx={{
								width: 36,
								height: 36,
								border: 1,
								borderColor: (theme) => alpha(theme.palette.divider, 0.5),
							}}
						/>
					</Tooltip>
				)}

				{!isAuthenticated ? (
					<Button
						color="primary"
						variant="outlined"
						onClick={() => {
							void navigate("/signin");
						}}
						sx={{
							ml: 2,
							fontWeight: 600,
							borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
							"&:hover": {
								borderColor: "secondary.main",
								color: "secondary.main",
								bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
							},
						}}
					>
						Login
					</Button>
				) : (
					<>
						<Button
							component={RouterLink}
							to="/profile"
							color="primary"
							variant="outlined"
							sx={{
								ml: 2,
								fontWeight: 600,
								color:
									location.pathname === "/profile"
										? "secondary.main"
										: "text.primary",
								borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
								"&:hover": {
									borderColor: "secondary.main",
									color: "secondary.main",
									bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
								},
							}}
						>
							Profile
						</Button>
						<Button
							color="primary"
							variant="outlined"
							onClick={handleLogout}
							sx={{
								ml: 2,
								fontWeight: 600,
								borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
								"&:hover": {
									borderColor: "secondary.main",
									color: "secondary.main",
									bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
								},
							}}
						>
							Logout
						</Button>
					</>
				)}
			</Toolbar>
		</AppBar>
	);
};

export default Header;
