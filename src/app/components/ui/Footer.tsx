import React from "react";
import { Box, Typography, Container, alpha } from "@mui/material";

const Footer: React.FC = () => (
	<Box
		component="footer"
		sx={{
			py: 3,
			mt: "auto",
			bgcolor: (theme) => alpha(theme.palette.background.paper, 0.6),
			borderTop: 1,
			borderColor: (theme) => alpha(theme.palette.divider, 0.5),
			backdropFilter: "blur(8px)",
		}}
	>
		<Container maxWidth="lg">
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					gap: 1,
				}}
			>
				<Box
					sx={{
						width: 6,
						height: 6,
						borderRadius: "50%",
						background: (theme) =>
							`linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
					}}
				/>
				<Typography variant="body2" color="text.secondary">
					© {new Date().getFullYear()} PMS. All rights reserved.
				</Typography>
			</Box>
		</Container>
	</Box>
);

export default Footer;
