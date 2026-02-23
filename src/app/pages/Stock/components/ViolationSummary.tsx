import { Alert } from "@mui/material";
import { WarningAmber } from "@mui/icons-material";

interface ViolationSummaryProps {
  violatedPaletteCount: number;
  totalViolationCount: number;
}

export default function ViolationSummary({
  violatedPaletteCount,
  totalViolationCount,
}: ViolationSummaryProps) {
  return (
    <Alert severity="warning" icon={<WarningAmber />} sx={{ mb: 2 }}>
      {violatedPaletteCount} palette(s) with {totalViolationCount} rule
      violation(s)
    </Alert>
  );
}
