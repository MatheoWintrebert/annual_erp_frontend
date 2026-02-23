import { useCallback, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import { DirectiveCard } from "../../../components/cards";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { useApiError } from "../../../hooks/useApiError";
import { useGetPalettiers, useRegisterConflictResolution } from "../api";
import { buildConflictResolutionPayload } from "../types";
import type {
  ConflictGroupPlacement,
  ConflictPlacementResult,
  IntakeProductEntry,
  PalettierOption,
  ProductOption,
} from "../types";

const GROUP_COLORS = [
  "primary.main",
  "secondary.main",
  "info.main",
  "warning.main",
];

interface ConflictResolutionStepProps {
  conflictResult: ConflictPlacementResult;
  formItems: IntakeProductEntry[];
  products: ProductOption[];
  onConfirm: () => void;
  onRegisterAnother: () => void;
  onBack: () => void;
}

const buildDefaultPlacements = (
  conflictResult: ConflictPlacementResult
): ConflictGroupPlacement[] =>
  conflictResult.groups.map((group) => ({
    useSystemRecommendation: group.recommendation !== null,
    palettierId: "",
    positionX: "",
    positionY: "",
    positionZ: "",
  }));

// H7: Validate position against palettier dimensions
const getPositionError = (
  value: number | "",
  max: number,
  axis: string
): string => {
  if (value === "") return "";
  if (value < 0) return `${axis} must be >= 0`;
  if (value >= max) return `${axis} must be < ${String(max)}`;
  return "";
};

const ConflictResolutionStep: FC<ConflictResolutionStepProps> = ({
  conflictResult,
  formItems,
  products,
  onConfirm,
  onRegisterAnother,
  onBack,
}) => {
  const [placements, setPlacements] = useState<ConflictGroupPlacement[]>(() =>
    buildDefaultPlacements(conflictResult)
  );
  const [isRegistered, setIsRegistered] = useState(false);

  const { showSnackbar } = useSnackbar();
  const { handleError } = useApiError();

  const { data: palettiers } = useGetPalettiers();
  const palettierOptions: PalettierOption[] = palettiers ?? [];

  const registerMutation = useRegisterConflictResolution();

  const updatePlacement = useCallback(
    (index: number, updates: Partial<ConflictGroupPlacement>): void => {
      setPlacements((prev) =>
        prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
      );
    },
    []
  );

  // H7: Include position bounds check in validation
  const isAllValid = conflictResult.groups.every((group, index) => {
    const placement = placements[index];
    if (placement.useSystemRecommendation) {
      return group.recommendation !== null;
    }
    if (
      placement.palettierId === "" ||
      placement.positionX === "" ||
      placement.positionY === "" ||
      placement.positionZ === ""
    ) {
      return false;
    }
    const palettier = palettierOptions.find(
      (p) => p.id === placement.palettierId
    );
    if (!palettier) return false;
    return (
      placement.positionX >= 0 &&
      placement.positionX < palettier.width &&
      placement.positionY >= 0 &&
      placement.positionY < palettier.depth &&
      placement.positionZ >= 0 &&
      placement.positionZ < palettier.height
    );
  });

  // M6 fix: Guard against double-submit
  const handleConfirmAll = useCallback((): void => {
    if (registerMutation.isPending) return;

    const payload = buildConflictResolutionPayload(
      formItems,
      conflictResult.groups,
      placements
    );

    void (async () => {
      try {
        await registerMutation.mutateAsync(payload);
        showSnackbar("All palettes registered successfully", "success");
        setIsRegistered(true);
      } catch (err) {
        void handleError(err);
      }
    })();
  }, [
    formItems,
    conflictResult.groups,
    placements,
    registerMutation,
    showSnackbar,
    handleError,
  ]);

  if (isRegistered) {
    return (
      <Stack spacing={3}>
        <Alert severity="success">
          All product groups have been registered at their placements.
        </Alert>
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="secondary" onClick={onConfirm}>
            Done
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={onRegisterAnother}
          >
            Register Another
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Alert severity="info">{conflictResult.conflictExplanation}</Alert>

      {conflictResult.groups.map((group, index) => {
        const placement = placements[index];
        const borderColor = GROUP_COLORS[index % GROUP_COLORS.length];
        const selectedPalettier = palettierOptions.find(
          (p) => p.id === placement.palettierId
        );
        const groupLabel = `Group ${String(index + 1)}`;

        return (
          <Card
            key={`group-${String(index)}`}
            sx={{ borderLeft: 4, borderColor, p: 3 }}
          >
            <Typography variant="h6" fontWeight={700} mb={1}>
              {groupLabel}: {group.productNames.join(", ")}
            </Typography>

            {group.productIds.map((productId) => {
              const product = products.find((p) => p.id === productId);
              const entry = formItems.find(
                (e) => e.productId !== "" && e.productId === productId
              );

              return (
                <Typography
                  key={productId}
                  variant="body2"
                  color="text.secondary"
                >
                  {product
                    ? `${product.reference} — ${product.name}`
                    : `Product #${String(productId)}`}
                  {entry && entry.quantity !== ""
                    ? ` × ${String(entry.quantity)}`
                    : ""}
                </Typography>
              );
            })}

            {group.recommendation !== null ? (
              <Box mt={2}>
                <DirectiveCard
                  palettierName={group.recommendation.palettierName}
                  positionX={group.recommendation.positionX}
                  positionY={group.recommendation.positionY}
                  positionZ={group.recommendation.positionZ}
                  reasoning={group.recommendation.reasoning}
                />
              </Box>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {group.reasoning || "No available placement"} — enter position
                manually below.
              </Alert>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={placement.useSystemRecommendation}
                  disabled={group.recommendation === null}
                  onChange={(_, checked) => {
                    updatePlacement(index, {
                      useSystemRecommendation: checked,
                    });
                  }}
                  // L3 fix: group-specific ARIA label
                  slotProps={{
                    input: {
                      "aria-label": `Use system recommendation for ${groupLabel}`,
                    },
                  }}
                />
              }
              label="Use system recommendation"
              sx={{ mt: 2 }}
            />

            {!placement.useSystemRecommendation && (
              <Stack spacing={2} mt={2}>
                <Autocomplete
                  options={palettierOptions}
                  getOptionLabel={(option) => option.name}
                  // M5 fix: prevent MUI console warnings after background refetch
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  value={selectedPalettier ?? null}
                  onChange={(_, value) => {
                    updatePlacement(index, {
                      palettierId: value?.id ?? "",
                      positionX: "",
                      positionY: "",
                      positionZ: "",
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      // L3 fix: group-specific label
                      label={`Palettier for ${groupLabel}`}
                      size="small"
                    />
                  )}
                />
                {selectedPalettier && (
                  <FormHelperText>
                    Dimensions: {String(selectedPalettier.width)} ×{" "}
                    {String(selectedPalettier.depth)} ×{" "}
                    {String(selectedPalettier.height)} (W × D × H)
                  </FormHelperText>
                )}
                <Box display="flex" gap={2}>
                  <TextField
                    // L3 fix: group-specific label
                    label={`Position X (${groupLabel})`}
                    type="number"
                    size="small"
                    value={placement.positionX}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePlacement(index, {
                        positionX: val === "" ? "" : Number(val),
                      });
                    }}
                    // H7 fix: show bounds validation error
                    error={
                      selectedPalettier != null &&
                      getPositionError(
                        placement.positionX,
                        selectedPalettier.width,
                        "X"
                      ) !== ""
                    }
                    helperText={
                      selectedPalettier != null
                        ? getPositionError(
                            placement.positionX,
                            selectedPalettier.width,
                            "X"
                          ) || `0–${String(selectedPalettier.width - 1)}`
                        : undefined
                    }
                    fullWidth
                  />
                  <TextField
                    label={`Position Y (${groupLabel})`}
                    type="number"
                    size="small"
                    value={placement.positionY}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePlacement(index, {
                        positionY: val === "" ? "" : Number(val),
                      });
                    }}
                    error={
                      selectedPalettier != null &&
                      getPositionError(
                        placement.positionY,
                        selectedPalettier.depth,
                        "Y"
                      ) !== ""
                    }
                    helperText={
                      selectedPalettier != null
                        ? getPositionError(
                            placement.positionY,
                            selectedPalettier.depth,
                            "Y"
                          ) || `0–${String(selectedPalettier.depth - 1)}`
                        : undefined
                    }
                    fullWidth
                  />
                  <TextField
                    label={`Position Z (${groupLabel})`}
                    type="number"
                    size="small"
                    value={placement.positionZ}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePlacement(index, {
                        positionZ: val === "" ? "" : Number(val),
                      });
                    }}
                    error={
                      selectedPalettier != null &&
                      getPositionError(
                        placement.positionZ,
                        selectedPalettier.height,
                        "Z"
                      ) !== ""
                    }
                    helperText={
                      selectedPalettier != null
                        ? getPositionError(
                            placement.positionZ,
                            selectedPalettier.height,
                            "Z"
                          ) || `0–${String(selectedPalettier.height - 1)}`
                        : undefined
                    }
                    fullWidth
                  />
                </Box>
              </Stack>
            )}
          </Card>
        );
      })}

      <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          variant="text"
          color="secondary"
          onClick={onBack}
          disabled={registerMutation.isPending}
        >
          Back to Products
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleConfirmAll}
          disabled={!isAllValid || registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Registering...
            </>
          ) : (
            "Confirm All Placements"
          )}
        </Button>
      </Box>
    </Stack>
  );
};

export default ConflictResolutionStep;
