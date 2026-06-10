import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  Chip,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import type { FC } from "react";
import type { SelectChangeEvent } from "@mui/material";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import PalettierViewer3D from "./components/PalettierViewer3D";
import type { SlotData } from "./components/PalettierViewer3D";
import { useGetPalettiers } from "./api";
import { useGetPalettes } from "../Stock/api";
import type { PalettierResponse } from "./types";
import type { PaletteListItem } from "../Stock/types";

const Palettier3DPage: FC = () => {
  const [searchParams] = useSearchParams();
  const initialPalettierId = useMemo(() => {
    const raw = searchParams.get("palettierId");
    if (raw == null) return "" as const;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : ("" as const);
  }, [searchParams]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPalettierId, setSelectedPalettierId] = useState<number | "">(
    initialPalettierId
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const { data: palettiers = [], isPending: isLoadingPalettiers } =
    useGetPalettiers();
  const { data: palettes = [], isPending: isLoadingPalettes } = useGetPalettes(
    selectedPalettierId ? { palettierId: selectedPalettierId } : undefined
  );

  const effectivePalettierId =
    selectedPalettierId !== "" ? selectedPalettierId : (palettiers[0]?.id ?? "");

  const selectedPalettier = useMemo(
    () =>
      palettiers.find(
        (p: PalettierResponse) => p.id === effectivePalettierId
      ) ?? null,
    [palettiers, effectivePalettierId]
  );

  const handlePalettierChange = useCallback((event: SelectChangeEvent<number | "">) => {
    setSelectedPalettierId(event.target.value);
  }, []);

  const slots: SlotData[] = useMemo(() => {
    if (!selectedPalettier) return [];

    const searchLower = debouncedSearch.toLowerCase().trim();

    return palettes.map((palette: PaletteListItem) => {
      const productNames = palette.items.map((item) => item.productName);
      const isHighlighted =
        searchLower.length > 0 &&
        palette.items.some(
          (item) =>
            item.productName.toLowerCase().includes(searchLower) ||
            item.productReference.toLowerCase().includes(searchLower) ||
            item.lotReference.toLowerCase().includes(searchLower)
        );

      return {
        x: palette.positionX,
        y: palette.positionY,
        z: palette.positionZ,
        paletteId: palette.id,
        products: productNames,
        isHighlighted,
      };
    });
  }, [palettes, selectedPalettier, debouncedSearch]);

  const highlightedCount = slots.filter((s) => s.isHighlighted).length;

  const isLoading = isLoadingPalettiers || isLoadingPalettes;

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1} display="flex" flexDirection="column">
        <Container maxWidth="xl" sx={{ flex: 1, display: "flex", flexDirection: "column", pb: 2 }}>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mt={4}
            mb={2}
          >
            <ViewInArIcon color="secondary" fontSize="large" />
            <Typography variant="h4" color="text.primary" fontWeight={600}>
              Palettier 3D View
            </Typography>
          </Box>

          <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Palettier</InputLabel>
              <Select
                value={selectedPalettierId}
                onChange={handlePalettierChange}
                label="Palettier"
              >
                {palettiers.map((p: PalettierResponse) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({String(p.width)}x{String(p.depth)}x{String(p.height)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search product, reference, or lot..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              sx={{ minWidth: 300 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {debouncedSearch && (
              <Chip
                label={
                  highlightedCount > 0
                    ? `${String(highlightedCount)} palette${highlightedCount > 1 ? "s" : ""} found`
                    : "No match"
                }
                color={highlightedCount > 0 ? "info" : "default"}
                variant="outlined"
                size="small"
              />
            )}
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <CircularProgress color="secondary" />
            </Box>
          ) : !selectedPalettier ? (
            <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
              <Typography color="text.secondary">
                Select a palettier to view in 3D
              </Typography>
            </Box>
          ) : (
            <Paper
              sx={{
                flex: 1,
                minHeight: 600,
                height: "60vh",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
                position: "relative",
              }}
            >
              <PalettierViewer3D
                name={selectedPalettier.name}
                width={selectedPalettier.width}
                depth={selectedPalettier.depth}
                height={selectedPalettier.height}
                slots={slots}
              />
            </Paper>
          )}

          {selectedPalettier && !isLoading && (
            <Box display="flex" gap={2} mt={1} flexWrap="wrap">
              <Chip
                size="small"
                variant="outlined"
                label={`Capacity: ${String(selectedPalettier.totalCapacity)} slots`}
              />
              <Chip
                size="small"
                variant="outlined"
                color="secondary"
                label={`Occupied: ${String(selectedPalettier.occupiedPositions)} / ${String(selectedPalettier.totalCapacity)}`}
              />
              <Chip
                size="small"
                variant="outlined"
                sx={{ color: "rgba(255,255,255,0.5)" }}
                label="Drag to rotate | Scroll to zoom | Right-click to pan"
              />
            </Box>
          )}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Palettier3DPage;
