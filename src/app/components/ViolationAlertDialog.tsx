import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { FC } from "react";
import type { RuleViolation } from "../types/rule-violation";

export type { RuleViolation };

interface ViolationAlertDialogProps {
  open: boolean;
  onClose: () => void;
  violations: RuleViolation[];
}

const ViolationAlertDialog: FC<ViolationAlertDialogProps> = ({
  open,
  onClose,
  violations,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>
      Rule Violations Detected
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Placement Rule Violations Detected</AlertTitle>
        The following palettes currently violate placement rules. Consider
        re-intaking these palettes for compliant placement.
      </Alert>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Palettier</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Rule</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {violations.map((violation) => (
              <TableRow
                key={`${String(violation.paletteId)}-${violation.ruleName}-${violation.productName}`}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {violation.palettierName}
                  </Typography>
                </TableCell>
                <TableCell>
                  ({violation.positionX}, {violation.positionY},{" "}
                  {violation.positionZ})
                </TableCell>
                <TableCell>{violation.productName}</TableCell>
                <TableCell>{violation.ruleName}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {violation.violationReason}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="secondary" variant="contained">
        OK
      </Button>
    </DialogActions>
  </Dialog>
);

export default ViolationAlertDialog;
