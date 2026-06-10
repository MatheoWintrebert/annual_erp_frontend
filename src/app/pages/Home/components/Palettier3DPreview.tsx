import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { FC } from "react";
import PalettierViewer3D from "../../Palettier/components/PalettierViewer3D";
import type { SlotData } from "../../Palettier/components/PalettierViewer3D";
import { useGetPalettiers } from "../../Palettier/api";
import { useGetPalettes } from "../../Stock/api";
import type { PalettierResponse } from "../../Palettier/types";
import type { PaletteListItem } from "../../Stock/types";

const PREVIEW_HEIGHT = 280;

const Palettier3DPreview: FC = () => {
  const navigate = useNavigate();
  const { data: palettiers = [], isPending: isLoadingPalettiers } =
    useGetPalettiers();

  const firstPalettier: PalettierResponse | null = palettiers[0] ?? null;

  const { data: palettes = [], isPending: isLoadingPalettes } = useGetPalettes(
    firstPalettier ? { palettierId: firstPalettier.id } : undefined
  );

  const slots: SlotData[] = useMemo(
    () =>
      palettes.map((palette: PaletteListItem) => ({
        x: palette.positionX,
        y: palette.positionY,
        z: palette.positionZ,
        paletteId: palette.id,
        products: palette.items.map((item) => item.productName),
      })),
    [palettes]
  );

  const isLoading = isLoadingPalettiers || (firstPalettier && isLoadingPalettes);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ViewInArIcon color="secondary" />
        <Typography variant="h5" sx={{ flex: 1 }}>
          Palettier Preview
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={() => {
            const target = firstPalettier
              ? `/palettier/3d?palettierId=${String(firstPalettier.id)}`
              : "/palettier/3d";
            void navigate(target);
          }}
        >
          Open 3D View
        </Button>
      </Box>

      <Paper
        sx={{
          position: "relative",
          height: PREVIEW_HEIGHT,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress color="secondary" size={28} />
          </Box>
        ) : !firstPalettier ? (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary" variant="body2">
              No palettier configured
            </Typography>
          </Box>
        ) : (
          <PalettierViewer3D
            name={firstPalettier.name}
            width={firstPalettier.width}
            depth={firstPalettier.depth}
            height={firstPalettier.height}
            slots={slots}
          />
        )}
      </Paper>
    </Box>
  );
};

export default Palettier3DPreview;
