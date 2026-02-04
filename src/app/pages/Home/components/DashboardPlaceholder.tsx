import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  Skeleton,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";

interface DashboardPlaceholderProps {
  title: string;
  data: unknown[];
  coordinate?: string;
}

const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({
  title,
  data,
  coordinate = "0,0",
}) => (
  <Card
    sx={{
      minWidth: 280,
      width: "100%",
      position: "relative",
      overflow: "visible",
      background: (theme) =>
        `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
      border: "1px solid",
      borderColor: (theme) => alpha(theme.palette.secondary.main, 0.1),
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        borderColor: (theme) => alpha(theme.palette.secondary.main, 0.4),
        transform: "translateY(-4px)",
        boxShadow: (theme) =>
          `0 12px 40px ${alpha(theme.palette.secondary.main, 0.15)}`,
        "& .coordinate-badge": {
          opacity: 1,
          color: "secondary.main",
        },
        "& .gradient-border": {
          opacity: 1,
        },
      },
    }}
  >
    {/* Gradient top border accent */}
    <Box
      className="gradient-border"
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: (theme) =>
          `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`,
        borderRadius: "8px 8px 0 0",
        opacity: 0.5,
        transition: "opacity 0.3s ease",
      }}
    />

    {/* Coordinate badge - warehouse grid reference */}
    <Box
      className="coordinate-badge"
      sx={{
        position: "absolute",
        top: 12,
        right: 12,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.8),
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.divider, 0.3),
        opacity: 0.6,
        transition: "all 0.2s ease",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontFamily: '"Space Grotesk", monospace',
          fontSize: "0.65rem",
          letterSpacing: "0.05em",
        }}
      >
        [{coordinate}]
      </Typography>
    </Box>

    <CardContent sx={{ p: 3 }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={240}
      >
        {/* Icon with glow effect */}
        <Box
          sx={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
            mb: 3,
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: -2,
              borderRadius: 2.5,
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.3)} 0%, ${alpha(theme.palette.info.main, 0.2)} 100%)`,
              opacity: 0,
              transition: "opacity 0.3s ease",
            },
          }}
        >
          <GridViewIcon
            sx={{
              fontSize: 32,
              color: "secondary.main",
              position: "relative",
              zIndex: 1,
            }}
          />
        </Box>

        <Typography
          variant="h6"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 600, textAlign: "center" }}
        >
          {title}
        </Typography>

        {data.length === 0 ? (
          <Box sx={{ width: "100%", mt: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", mb: 3 }}
            >
              Dashboard coming soon...
            </Typography>

            {/* Skeleton loader preview */}
            <Box sx={{ px: 2 }}>
              <Skeleton
                variant="rectangular"
                height={8}
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                  borderRadius: 1,
                  mb: 1.5,
                }}
              />
              <Skeleton
                variant="rectangular"
                height={8}
                width="80%"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                  borderRadius: 1,
                  mb: 1.5,
                }}
              />
              <Skeleton
                variant="rectangular"
                height={8}
                width="60%"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.06),
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {String(data)}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default DashboardPlaceholder;
