import { Box, CircularProgress, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Inventory2Outlined, LocalShipping } from "@mui/icons-material";
import { type FC, useEffect } from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { MetricCard } from "../../components/cards";
import { useApiError } from "../../hooks/useApiError";
import { useGetDashboardAlerts, useGetDashboardSummary } from "./api";
import ExpiryAlertPanel from "./components/ExpiryAlertPanel";
import LowStockPanel from "./components/LowStockPanel";
import OnboardingGuide from "./components/OnboardingGuide";

const trendArrow: Record<string, string> = {
	increasing: "\u2191",
	decreasing: "\u2193",
	stable: "\u2192",
};

const HomePage: FC = () => {
	const alertsQuery = useGetDashboardAlerts();
	const summaryQuery = useGetDashboardSummary();
	const { handleError } = useApiError();

	useEffect(() => {
		if (alertsQuery.isError) {
			void handleError(alertsQuery.error);
		}
	}, [alertsQuery.isError, alertsQuery.error, handleError]);

	useEffect(() => {
		if (summaryQuery.isError) {
			void handleError(summaryQuery.error);
		}
	}, [summaryQuery.isError, summaryQuery.error, handleError]);

	const isLoading = alertsQuery.isPending || summaryQuery.isPending;

	return (
		<Box minHeight="100vh" display="flex" flexDirection="column">
			<Header />
			<Box flex={1}>
				<Container maxWidth="lg" sx={{ py: 4 }}>
					<Typography variant="h3" sx={{ mb: 4 }}>
						Dashboard
					</Typography>

					{isLoading && (
						<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
							<CircularProgress />
						</Box>
					)}

					{summaryQuery.data && (
						<>
							{summaryQuery.data.setup.completedSteps <
								summaryQuery.data.setup.totalSteps && (
								<Box sx={{ mb: 2 }}>
									<OnboardingGuide setup={summaryQuery.data.setup} />
								</Box>
							)}

							<Grid container spacing={2}>
								<Grid size={{ xs: 12, sm: 6 }}>
									<MetricCard
										title="Stock Summary"
										value={summaryQuery.data.stock.totalPalettes}
										subtitle={`${String(summaryQuery.data.stock.totalProducts)} products \u00B7 ${String(Math.round(summaryQuery.data.stock.capacityUtilization * 100))}% capacity`}
										icon={<Inventory2Outlined color="action" />}
									/>
								</Grid>
								<Grid size={{ xs: 12, sm: 6 }}>
									<MetricCard
										title="Intake Activity"
										value={summaryQuery.data.intake.palettesReceivedYesterday}
										subtitle={`yesterday \u00B7 ${trendArrow[summaryQuery.data.intake.trend] ?? "\u2192"} today: ${String(summaryQuery.data.intake.palettesReceivedToday)}`}
										icon={<LocalShipping color="action" />}
									/>
								</Grid>
							</Grid>
						</>
					)}

					{alertsQuery.data && (
						<>
							<Box sx={{ mb: 4 }}>
								<ExpiryAlertPanel alerts={alertsQuery.data.expiryAlerts} />
							</Box>
							<Box sx={{ mb: 4 }}>
								<LowStockPanel alerts={alertsQuery.data.lowStockAlerts} />
							</Box>
						</>
					)}
				</Container>
			</Box>
			<Footer />
		</Box>
	);
};

export default HomePage;
