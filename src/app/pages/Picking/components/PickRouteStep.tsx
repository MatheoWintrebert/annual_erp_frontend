import {
  Box,
  Card,
  Checkbox,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import type { FC } from "react";
import type { PickExecutionItem } from "../types";

interface PickRouteStepProps {
  executionItems: PickExecutionItem[];
  onTogglePicked: (index: number) => void;
  onSkip: (index: number) => void;
  onQuantityChange: (index: number, quantity: number) => void;
}

function formatExpiryDate(isoDate: string | null): string {
  if (!isoDate) return "No expiry";
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `Expires: ${day}/${month}/${year}`;
}

const PickRouteStep: FC<PickRouteStepProps> = ({
  executionItems,
  onTogglePicked,
  onSkip,
  onQuantityChange,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {executionItems.map((item, index) => {
        const showDivider =
          index > 0 &&
          executionItems[index - 1].productId !== item.productId;

        const isSkipped = item.status === "skipped";
        const isPicked = item.status === "picked";

        return (
          <Box key={`${String(item.paletteLotId)}-${String(index)}`}>
            {showDivider && <Divider sx={{ my: 1 }} />}
            <Card
              sx={{
                borderLeft: 4,
                borderColor: isSkipped
                  ? "text.disabled"
                  : isPicked
                    ? "success.main"
                    : "primary.main",
                p: 2,
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                opacity: isSkipped ? 0.5 : 1,
              }}
            >
              <Checkbox
                checked={isPicked}
                disabled={isSkipped}
                onChange={() => { onTogglePicked(index); }}
                sx={{ mt: -0.5 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="primary.main"
                >
                  {item.palettierName} ({item.positionX}, {item.positionY},{" "}
                  {item.positionZ})
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    textDecoration: isSkipped ? "line-through" : "none",
                  }}
                >
                  {item.productName}
                </Typography>
                {!isSkipped ? (
                  <TextField
                    type="number"
                    label="Qty to pick"
                    size="small"
                    value={item.actualQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        onQuantityChange(
                          index,
                          Math.max(1, Math.min(val, item.quantityToPick)),
                        );
                      }
                    }}
                    slotProps={{
                      htmlInput: { min: 1, max: item.quantityToPick },
                    }}
                    sx={{ mt: 0.5, width: 120 }}
                  />
                ) : (
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{ textDecoration: "line-through" }}
                  >
                    Pick: {item.quantityToPick} units
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {formatExpiryDate(item.expiryDate)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.lotReference}
                </Typography>
              </Box>
              {!isPicked && !isSkipped && (
                <Tooltip title="Skip — item not found">
                  <IconButton
                    size="small"
                    onClick={() => { onSkip(index); }}
                    color="default"
                  >
                    <SkipNextIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Card>
          </Box>
        );
      })}
    </Box>
  );
};

export default PickRouteStep;
