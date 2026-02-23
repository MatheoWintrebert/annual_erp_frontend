import { useCallback, useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import type { FC } from "react";
import type { PalettierOption } from "../api";
import { useGetPalettiers } from "../api";

interface StockFiltersProps {
  onFilterChange: (params: {
    palettierId?: number;
    search?: string;
  }) => void;
  onViolationsFilterChange: (showViolationsOnly: boolean) => void;
}

const StockFilters: FC<StockFiltersProps> = ({ onFilterChange, onViolationsFilterChange }) => {
  const { data: palettiers = [] } = useGetPalettiers();

  const [selectedPalettier, setSelectedPalettier] =
    useState<PalettierOption | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showViolationsOnly, setShowViolationsOnly] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onFilterChange({
      palettierId: selectedPalettier?.id,
      search: debouncedSearch || undefined,
    });
  }, [selectedPalettier, debouncedSearch, onFilterChange]);

  const hasActiveFilters = selectedPalettier !== null || searchText !== "" || showViolationsOnly;

  const handleClearFilters = useCallback(() => {
    setSelectedPalettier(null);
    setSearchText("");
    setShowViolationsOnly(false);
    onViolationsFilterChange(false);
  }, [onViolationsFilterChange]);

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Autocomplete
        options={palettiers}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={selectedPalettier}
        onChange={(_event, newValue) => {
          setSelectedPalettier(newValue);
        }}
        renderInput={(params) => (
          <TextField {...params} label="Palettier" size="small" />
        )}
        sx={{ minWidth: 200 }}
      />
      <TextField
        label="Search product"
        size="small"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        sx={{ minWidth: 200 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={showViolationsOnly}
            onChange={(e) => {
              setShowViolationsOnly(e.target.checked);
              onViolationsFilterChange(e.target.checked);
            }}
          />
        }
        label="Violations only"
      />
      {hasActiveFilters && (
        <Button
          variant="text"
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
        >
          Clear filters
        </Button>
      )}
    </Stack>
  );
};

export default StockFilters;
