import {
  Card,
  CardContent,
  Link as MuiLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { CheckCircleOutline, RadioButtonUnchecked } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import type { FC } from "react";
import type { SetupProgress } from "../types";

interface OnboardingGuideProps {
  setup: SetupProgress;
}

const setupItems = [
  {
    label: "Create Palettiers",
    path: "/palettiers",
    key: "hasPalettiers" as const,
  },
  { label: "Add Products", path: "/products", key: "hasProducts" as const },
  { label: "Define Rules", path: "/rules", key: "hasRules" as const },
  { label: "Register Stock", path: "/intake", key: "hasStock" as const },
];

const OnboardingGuide: FC<OnboardingGuideProps> = ({ setup }) => {
  if (setup.completedSteps >= setup.totalSteps) {
    return null;
  }

  return (
    <Card sx={{ borderLeft: 4, borderColor: "info.main" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
          Get Started — Set up your warehouse
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {setup.completedSteps} of {setup.totalSteps} setup steps complete
        </Typography>
        <List disablePadding>
          {setupItems.map((item) => {
            const completed = setup[item.key];
            return (
              <ListItem key={item.key} disableGutters disablePadding>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {completed ? (
                    <CheckCircleOutline color="success" />
                  ) : (
                    <RadioButtonUnchecked color="action" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink
                      component={RouterLink}
                      to={item.path}
                      underline="none"
                      color="inherit"
                      sx={{ opacity: completed ? 0.5 : 1 }}
                    >
                      {item.label}
                    </MuiLink>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
};

export default OnboardingGuide;
