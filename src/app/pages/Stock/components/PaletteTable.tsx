import { useMemo, useState } from "react";
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { WarningAmber } from "@mui/icons-material";
import type { FC } from "react";
import type {
  EditPaletteData,
  PaletteTableRow,
  RuleViolation,
  SortField,
  SortDirection,
} from "../types";
import { formatPosition } from "../types";
import PositionEditDialog from "./PositionEditDialog";
import ViolationAlertDialog from "../../../components/ViolationAlertDialog";

interface PaletteTableProps {
  rows: PaletteTableRow[];
  violationsMap?: Map<number, RuleViolation[]>;
}

function compareRows(
  a: PaletteTableRow,
  b: PaletteTableRow,
  field: SortField,
  direction: SortDirection
): number {
  const multiplier = direction === "asc" ? 1 : -1;

  const valA = a[field];
  const valB = b[field];

  if (valA === null && valB === null) return 0;
  if (valA === null) return 1;
  if (valB === null) return -1;

  if (valA < valB) return -1 * multiplier;
  if (valA > valB) return 1 * multiplier;
  return 0;
}

const SortableHeader: FC<{
  label: string;
  field: SortField;
  activeField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
}> = ({ label, field, activeField, direction, onSort }) => (
  <TableCell>
    <TableSortLabel
      active={activeField === field}
      direction={activeField === field ? direction : "asc"}
      onClick={() => {
        onSort(field);
      }}
    >
      {label}
    </TableSortLabel>
  </TableCell>
);

const PaletteTable: FC<PaletteTableProps> = ({ rows, violationsMap }) => {
  const [sortField, setSortField] = useState<SortField>("receivedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [editPalette, setEditPalette] = useState<EditPaletteData | null>(null);
  const [viewViolationsPaletteId, setViewViolationsPaletteId] = useState<number | null>(null);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => compareRows(a, b, sortField, sortDirection)),
    [rows, sortField, sortDirection]
  );

  const firstPaletteRowIndices = useMemo(() => {
    const seen = new Set<number>();
    const indices = new Set<number>();
    sortedRows.forEach((row, index) => {
      if (!seen.has(row.paletteId)) {
        seen.add(row.paletteId);
        indices.add(index);
      }
    });
    return indices;
  }, [sortedRows]);

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <SortableHeader
                label="Palettier"
                field="palettierName"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <TableCell>Position</TableCell>
              <SortableHeader
                label="Product"
                field="productName"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <TableCell>Ref</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Lot #</TableCell>
              <SortableHeader
                label="Expiry"
                field="expiryDate"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <SortableHeader
                label="Received"
                field="receivedAt"
                activeField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((row, index) => {
              const isFirstForPalette = firstPaletteRowIndices.has(index);

              return (
                <TableRow
                  key={`${String(row.paletteId)}-${row.lotReference || "empty"}`}
                  hover
                >
                  <TableCell>{row.palettierName}</TableCell>
                  <TableCell>
                    {formatPosition(row.positionX, row.positionY, row.positionZ)}
                  </TableCell>
                  <TableCell>{row.productName || "\u2014"}</TableCell>
                  <TableCell>{row.productReference || "\u2014"}</TableCell>
                  <TableCell>
                    {row.unitOfMeasureName
                      ? `${String(row.quantity)} ${row.unitOfMeasureName}`
                      : "\u2014"}
                  </TableCell>
                  <TableCell>{row.lotReference || "\u2014"}</TableCell>
                  <TableCell>
                    {row.expiryDate
                      ? new Date(row.expiryDate).toLocaleDateString()
                      : "\u2014"}
                  </TableCell>
                  <TableCell>
                    {new Date(row.receivedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {isFirstForPalette && (
                      <>
                        <IconButton
                          size="small"
                          aria-label="edit position"
                          onClick={() => {
                            setEditPalette({
                              paletteId: row.paletteId,
                              palettierName: row.palettierName,
                              palettierId: row.palettierId,
                              positionX: row.positionX,
                              positionY: row.positionY,
                              positionZ: row.positionZ,
                            });
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {(() => {
                          const paletteViolations = violationsMap?.get(row.paletteId);
                          if (!paletteViolations) return null;
                          return (
                            <Chip
                              icon={<WarningAmber />}
                              label={`${String(paletteViolations.length)} violation(s)`}
                              aria-label={`View ${String(paletteViolations.length)} violation(s) details`}
                              color="warning"
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setViewViolationsPaletteId(row.paletteId);
                              }}
                            />
                          );
                        })()}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <PositionEditDialog
        open={editPalette !== null}
        onClose={() => {
          setEditPalette(null);
        }}
        palette={editPalette}
      />
      <ViolationAlertDialog
        open={viewViolationsPaletteId !== null}
        onClose={() => {
          setViewViolationsPaletteId(null);
        }}
        violations={violationsMap?.get(viewViolationsPaletteId ?? -1) ?? []}
      />
    </>
  );
};

export default PaletteTable;
