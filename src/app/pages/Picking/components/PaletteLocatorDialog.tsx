import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import type { FC } from "react";
import { useMemo } from "react";
import PalettierViewer3D from "../../Palettier/components/PalettierViewer3D";
import type { SlotData } from "../../Palettier/components/PalettierViewer3D";
import { useGetPalettiers } from "../../Palettier/api";
import { useGetPalettes } from "../../Stock/api";
import type { PalettierResponse } from "../../Palettier/types";
import type { PaletteListItem } from "../../Stock/types";

interface PaletteLocatorDialogProps {
  open: boolean;
  onClose: () => void;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  productName: string;
}

const PaletteLocatorDialog: FC<PaletteLocatorDialogProps> = ({
  open,
  onClose,
  palettierName,
  positionX,
  positionY,
  positionZ,
  productName,
}) => {
  const { data: palettiers = [], isPending: isLoadingPalettiers } =
    useGetPalettiers();

  const palettier = useMemo(
    () =>
      palettiers.find((p: PalettierResponse) => p.name === palettierName) ??
      null,
    [palettiers, palettierName]
  );

  const { data: palettes = [], isPending: isLoadingPalettes } = useGetPalettes(
    palettier ? { palettierId: palettier.id } : undefined
  );

  const slots: SlotData[] = useMemo(() => {
    if (!palettier) return [];
    return palettes.map((palette: PaletteListItem) => ({
      x: palette.positionX,
      y: palette.positionY,
      z: palette.positionZ,
      paletteId: palette.id,
      products: palette.items.map((item) => item.productName),
    }));
  }, [palettes, palettier]);

  const isLoading = isLoadingPalettiers || isLoadingPalettes;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            height: "80vh",
            maxHeight: "80vh",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pb: 1,
        }}
      >
        <PlaceIcon color="warning" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" component="span">
            Localiser: {productName}
          </Typography>
          <Box display="flex" gap={1} mt={0.5}>
            <Chip
              size="small"
              label={palettierName}
              color="primary"
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Position: ${String(positionX)}-${String(positionY)}-${String(positionZ)}`}
              color="warning"
              variant="outlined"
            />
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{ p: 0, position: "relative", flex: 1, overflow: "hidden" }}
      >
        {isLoading || !palettier ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <PalettierViewer3D
            name={palettier.name}
            width={palettier.width}
            depth={palettier.depth}
            height={palettier.height}
            slots={slots}
            targetPosition={{ x: positionX, y: positionY, z: positionZ }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaletteLocatorDialog;
