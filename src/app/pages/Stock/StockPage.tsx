import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { useApiError } from "../../hooks/useApiError";
import { useGetPalettes, useGetPaletteViolations } from "./api";
import { buildViolationsMap, flattenPalettes } from "./types";
import {
  PaletteTable,
  StockFilters,
  EmptyState,
  OnboardingWizard,
  ViolationSummary,
} from "./components";

const StockPage: FC = () => {
  const [filterParams, setFilterParams] = useState<{
    palettierId?: number;
    search?: string;
  }>({});
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [showViolationsOnly, setShowViolationsOnly] = useState(false);

  const {
    data: palettes = [],
    isPending,
    isError,
    error,
  } = useGetPalettes(filterParams);
  const {
    data: violations = [],
    isError: isViolationsError,
    error: violationsError,
  } = useGetPaletteViolations();
  const { handleError } = useApiError();

  useEffect(() => {
    if (isError) {
      void handleError(error);
    }
  }, [isError, error, handleError]);

  useEffect(() => {
    if (isViolationsError) {
      void handleError(violationsError);
    }
  }, [isViolationsError, violationsError, handleError]);

  const handleFilterChange = useCallback(
    (params: { palettierId?: number; search?: string }) => {
      setFilterParams(params);
    },
    []
  );

  const rows = useMemo(() => flattenPalettes(palettes), [palettes]);
  const violationsMap = useMemo(
    () => buildViolationsMap(violations),
    [violations]
  );
  const violatedPaletteCount = violationsMap.size;
  const totalViolationCount = violations.length;

  const filteredRows = useMemo(
    () =>
      showViolationsOnly
        ? rows.filter((row) => violationsMap.has(row.paletteId))
        : rows,
    [rows, showViolationsOnly, violationsMap]
  );

  const hasActiveFilters =
    filterParams.palettierId != null ||
    (filterParams.search != null && filterParams.search !== "") ||
    showViolationsOnly;

  if (isOnboarding) {
    return (
      <Box minHeight="100vh" display="flex" flexDirection="column">
        <Header />
        <Box flex={1}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              color="text.primary"
              gutterBottom
              fontWeight={600}
              mt={4}
            >
              Onboard Existing Stock
            </Typography>
            <OnboardingWizard
              onClose={() => {
                setIsOnboarding(false);
              }}
            />
          </Container>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
            mb={1}
          >
            <Typography variant="h3" color="text.primary" fontWeight={600}>
              Stock Overview
            </Typography>
            {(palettes.length > 0 || hasActiveFilters) && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setIsOnboarding(true);
                }}
              >
                Add Existing Stock
              </Button>
            )}
          </Box>

          <Box mb={3}>
            <StockFilters
              onFilterChange={handleFilterChange}
              onViolationsFilterChange={setShowViolationsOnly}
            />
          </Box>

          {violatedPaletteCount > 0 && (
            <ViolationSummary
              violatedPaletteCount={violatedPaletteCount}
              totalViolationCount={totalViolationCount}
            />
          )}

          {isPending ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress color="secondary" />
            </Box>
          ) : palettes.length === 0 && !hasActiveFilters ? (
            <EmptyState
              onOnboard={() => {
                setIsOnboarding(true);
              }}
            />
          ) : filteredRows.length === 0 && hasActiveFilters ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              No palettes match your filters
            </Typography>
          ) : (
            <PaletteTable rows={filteredRows} violationsMap={violationsMap} />
          )}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default StockPage;
