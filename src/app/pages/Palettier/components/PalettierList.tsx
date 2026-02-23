import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import type { FC } from "react";
import type { RuleViolation } from "../../../components/ViolationAlertDialog";
import type { PalettierResponse, PalettierType } from "../types";
import { getTypeName } from "../types";

interface PalettierListProps {
  palettiers: PalettierResponse[];
  palettierTypes: PalettierType[];
  isLoading: boolean;
  error: Error | null;
  violations: RuleViolation[];
  onCreateNew: () => void;
  onEdit: (palettier: PalettierResponse) => void;
  onDelete: (palettier: PalettierResponse) => void;
}

const getViolationsForPalettier = (
  palettierName: string,
  violations: RuleViolation[]
): RuleViolation[] =>
  violations.filter((v) => v.palettierName === palettierName);

const formatViolationTooltip = (palettierViolations: RuleViolation[]): string =>
  palettierViolations
    .map((v) => `${v.ruleName}: ${v.violationReason}`)
    .join("\n");

const PalettierList: FC<PalettierListProps> = ({
  palettiers,
  palettierTypes,
  isLoading,
  error,
  violations,
  onCreateNew,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load palettiers. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
        >
          Create New Palettier
        </Button>
      </Box>

      {palettiers.length === 0 ? (
        <Alert severity="info">
          No palettiers configured yet. Create your first palettier to map your
          warehouse.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dimensions (W×D×H)</TableCell>
                <TableCell>Occupancy</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {palettiers.map((palettier) => (
                <TableRow
                  key={palettier.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    onEdit(palettier);
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {palettier.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getTypeName(palettier.palettierTypeId, palettierTypes)}
                  </TableCell>
                  <TableCell>
                    {palettier.width} × {palettier.depth} × {palettier.height}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {palettier.occupiedPositions} / {palettier.totalCapacity}
                      {(() => {
                        const palettierViolations = getViolationsForPalettier(
                          palettier.name,
                          violations
                        );
                        return palettierViolations.length > 0 ? (
                          <Tooltip
                            title={formatViolationTooltip(palettierViolations)}
                            arrow
                          >
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <WarningAmberIcon
                                color="warning"
                                fontSize="small"
                              />
                              <Typography
                                variant="caption"
                                color="warning.main"
                              >
                                Rule violation
                              </Typography>
                            </Box>
                          </Tooltip>
                        ) : null;
                      })()}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(palettier);
                      }}
                      aria-label={`Delete ${palettier.name}`}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PalettierList;
