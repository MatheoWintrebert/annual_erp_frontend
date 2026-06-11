import { useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { FC } from "react";
import type {
  OnboardingProductEntry,
  PlacementViolationWarning,
} from "../types";
import { useCheckPlacementViolations, useGetPalettiers } from "../api";
import type { PalettierOption } from "../api";

interface OnboardingPlacementStepProps {
  products: OnboardingProductEntry[];
  palettierId: number | null;
  positionX: number;
  positionY: number;
  positionZ: number;
  onPlacementChange: (placement: {
    palettierId: number | null;
    positionX: number;
    positionY: number;
    positionZ: number;
  }) => void;
}

const OnboardingPlacementStep: FC<OnboardingPlacementStepProps> = ({
  products,
  palettierId,
  positionX,
  positionY,
  positionZ,
  onPlacementChange,
}) => {
  const { data: palettiers = [] } = useGetPalettiers();
  const checkViolations = useCheckPlacementViolations();
  const [violations, setViolations] = useState<PlacementViolationWarning[]>([]);

  const selectedPalettier =
    palettiers.find((p) => p.id === palettierId) ?? null;

  useEffect(() => {
    if (!palettierId || products.length === 0) {
      setViolations([]);
      return;
    }

    let cancelled = false;
    const productIds = products.map((p) => p.productId);
    checkViolations
      .mutateAsync({ productIds, palettierId })
      .then((result) => {
        if (!cancelled) setViolations(result);
      })
      .catch(() => {
        if (!cancelled) setViolations([]);
      });

    return () => {
      cancelled = true;
    };
    // Only re-check when palettierId or products change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [palettierId, products]);

  const handlePalettierChange = (newPalettier: PalettierOption | null) => {
    onPlacementChange({
      palettierId: newPalettier?.id ?? null,
      positionX,
      positionY,
      positionZ,
    });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle1" color="text.primary">
        Specify current placement
      </Typography>

      <Autocomplete
        options={palettiers}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        value={selectedPalettier}
        onChange={(_event, newValue) => {
          handlePalettierChange(newValue);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Palettier" fullWidth />
        )}
      />

      <TextField
        type="number"
        label="Position X"
        value={positionX}
        onChange={(e) => {
          onPlacementChange({
            palettierId,
            positionX: Number(e.target.value),
            positionY,
            positionZ,
          });
        }}
        fullWidth
        slotProps={{ htmlInput: { min: 0, step: 1 } }}
      />

      <TextField
        type="number"
        label="Position Y"
        value={positionY}
        onChange={(e) => {
          onPlacementChange({
            palettierId,
            positionX,
            positionY: Number(e.target.value),
            positionZ,
          });
        }}
        fullWidth
        slotProps={{ htmlInput: { min: 0, step: 1 } }}
      />

      <TextField
        type="number"
        label="Position Z"
        value={positionZ}
        onChange={(e) => {
          onPlacementChange({
            palettierId,
            positionX,
            positionY,
            positionZ: Number(e.target.value),
          });
        }}
        fullWidth
        slotProps={{ htmlInput: { min: 0, step: 1 } }}
      />

      {violations.length > 0 && (
        <Alert severity="info">
          <AlertTitle>Placement rule warnings</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {violations.map((v, i) => (
              <li key={`${v.ruleName}-${String(i)}`}>
                <strong>{v.ruleName}:</strong> {v.reason}
              </li>
            ))}
          </ul>
          <Typography variant="caption" color="text.secondary" mt={1}>
            These warnings are advisory only. The palette will be saved with the
            current placement.
          </Typography>
        </Alert>
      )}
    </Stack>
  );
};

export default OnboardingPlacementStep;
