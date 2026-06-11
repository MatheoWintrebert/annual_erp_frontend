import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import GppBadIcon from "@mui/icons-material/GppBad";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { AlertCard } from "../../../components/cards";
import type { RuleViolation } from "../../../types/rule-violation";
import type { FC } from "react";
import { useNavigate } from "react-router-dom";

interface RuleViolationPanelProps {
  violations: RuleViolation[];
  loading?: boolean;
}

const RuleViolationPanel: FC<RuleViolationPanelProps> = ({
  violations,
  loading = false,
}) => {
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h5">Rule Violations</Typography>
        {!loading && violations.length > 0 && (
          <Chip label={violations.length} size="small" color="error" />
        )}
      </Box>

      {loading ? (
        <Alert severity="info">Checking for rule violations...</Alert>
      ) : violations.length === 0 ? (
        <Alert severity="success" icon={<CheckCircleOutlineIcon />}>
          No rule violations — all palettes comply with active rules
        </Alert>
      ) : (
        <Stack spacing={2}>
          {violations.map((violation) => (
            <AlertCard
              key={`violation-${String(violation.paletteId)}-${violation.ruleName}`}
              title={violation.productName}
              severity="error"
              icon={<GppBadIcon color="error" />}
            >
              <Typography variant="body2" color="text.secondary">
                <strong>{violation.palettierName}</strong>
                {" — "}
                Position ({violation.positionX}, {violation.positionY},{" "}
                {violation.positionZ})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rule: <strong>{violation.ruleName}</strong>
                {" — "}
                {violation.violationReason}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    void navigate(
                      `/resolve-violation/${String(violation.paletteId)}`,
                      { state: { violation } }
                    );
                  }}
                >
                  Resolve
                </Button>
              </Box>
            </AlertCard>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default RuleViolationPanel;
