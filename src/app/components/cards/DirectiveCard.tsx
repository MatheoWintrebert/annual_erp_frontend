import { Card, Typography } from "@mui/material";
import type { FC } from "react";

interface DirectiveCardProps {
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  reasoning: string;
}

const DirectiveCard: FC<DirectiveCardProps> = ({
  palettierName,
  positionX,
  positionY,
  positionZ,
  reasoning,
}) => (
  <Card
    sx={{
      borderLeft: 4,
      borderColor: "primary.main",
      p: 3,
    }}
  >
    <Typography variant="h4" fontWeight={700} color="primary.main">
      Place in: {palettierName}, Position ({positionX}, {positionY}, {positionZ}
      )
    </Typography>
    <Typography variant="body2" color="text.secondary" mt={1}>
      {reasoning}
    </Typography>
  </Card>
);

export default DirectiveCard;
