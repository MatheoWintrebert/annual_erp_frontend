import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useMemo, type FC } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { DirectiveCard } from "../../components/cards";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { useApiError } from "../../hooks/useApiError";
import { useGetPalettes, useUpdatePalettePosition } from "../Stock/api";
import { useGetRecommendedPlacement } from "./api";
import type { RuleViolation } from "../../types/rule-violation";

const ResolveViolationPage: FC = () => {
  const { paletteId: paletteIdParam } = useParams<{ paletteId: string }>();
  const paletteId = Number(paletteIdParam);
  const location = useLocation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const violation = (
    location.state as { violation?: RuleViolation } | null
  )?.violation;

  const palettesQuery = useGetPalettes();
  const palette = palettesQuery.data?.find((p) => p.id === paletteId);

  const productIds = useMemo(
    () =>
      palette ? [...new Set(palette.items.map((i) => i.productId))] : [],
    [palette]
  );

  const recommendQuery = useGetRecommendedPlacement(productIds);
  const updatePositionMutation = useUpdatePalettePosition();

  const handleConfirm = (): void => {
    if (recommendQuery.data?.status !== "resolved") return;
    const { palettierId, positionX, positionY, positionZ } =
      recommendQuery.data.recommendation;

    void (async () => {
      try {
        await updatePositionMutation.mutateAsync({
          paletteId,
          palettierId,
          positionX,
          positionY,
          positionZ,
        });
        showSnackbar("Palette relocated successfully", "success");
        navigate("/home");
      } catch (err) {
        void handleError(err);
      }
    })();
  };

  const isLoading =
    palettesQuery.isPending ||
    (productIds.length > 0 && recommendQuery.isPending);

  const paletteNotFound =
    !palettesQuery.isPending && palette === undefined;

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/home")}
            sx={{ mb: 3 }}
            color="secondary"
          >
            Back to Dashboard
          </Button>

          <Typography variant="h3" sx={{ mb: 4 }}>
            Resolve Rule Violation
          </Typography>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {paletteNotFound && (
            <Alert severity="error">
              Palette #{paletteId} not found in stock.
            </Alert>
          )}

          {!isLoading && !paletteNotFound && (
            <Stack spacing={3}>
              {violation ? (
                <Alert severity="error">
                  <Typography fontWeight={600}>{violation.productName}</Typography>
                  <Typography variant="body2">
                    Currently at <strong>{violation.palettierName}</strong> —
                    Position ({violation.positionX}, {violation.positionY},{" "}
                    {violation.positionZ})
                  </Typography>
                  <Typography variant="body2">
                    Violates rule <strong>{violation.ruleName}</strong>:{" "}
                    {violation.violationReason}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning">
                  Palette #{paletteId} — violation details unavailable.
                  Showing placement recommendation only.
                </Alert>
              )}

              <Divider />

              <Typography variant="h5">Suggested New Placement</Typography>

              {recommendQuery.data?.status === "resolved" && (
                <>
                  <DirectiveCard
                    palettierName={
                      recommendQuery.data.recommendation.palettierName
                    }
                    positionX={recommendQuery.data.recommendation.positionX}
                    positionY={recommendQuery.data.recommendation.positionY}
                    positionZ={recommendQuery.data.recommendation.positionZ}
                    reasoning={recommendQuery.data.recommendation.reasoning}
                  />
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleConfirm}
                      disabled={updatePositionMutation.isPending}
                    >
                      {updatePositionMutation.isPending ? (
                        <>
                          <CircularProgress
                            size={20}
                            color="inherit"
                            sx={{ mr: 1 }}
                          />
                          Relocating...
                        </>
                      ) : (
                        "Confirm Relocation"
                      )}
                    </Button>
                  </Box>
                </>
              )}

              {recommendQuery.data?.status === "conflict" && (
                <Alert severity="warning">
                  {recommendQuery.data.conflictExplanation} — No fully
                  compliant position available. Resolve rule conflicts before
                  relocating this palette.
                </Alert>
              )}

              {recommendQuery.isError && (
                <Alert severity="error">
                  Failed to get placement recommendation. Please try again.
                </Alert>
              )}
            </Stack>
          )}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default ResolveViolationPage;
