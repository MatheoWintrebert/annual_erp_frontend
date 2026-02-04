import { createTheme, alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

interface ThemeColors {
  secondary?: string;
  accent?: string;
}

const DEFAULT_COLORS = {
  primary: "#ffffff",
  secondary: "#77A53C",
  accent: "#dc1dbc",
  background: {
    default: "#0a0a0a",
    paper: "#141414",
    surface: "#1a1a1a",
  },
  text: {
    primary: "#ffffff",
    secondary: "rgba(255, 255, 255, 0.7)",
    muted: "rgba(255, 255, 255, 0.5)",
  },
};

const createAppTheme = (customColors: ThemeColors = {}): Theme => {
  const colors = {
    ...DEFAULT_COLORS,
    secondary: customColors.secondary ?? DEFAULT_COLORS.secondary,
    accent: customColors.accent ?? DEFAULT_COLORS.accent,
  };

  return createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: colors.primary,
      },
      secondary: {
        main: colors.secondary,
        light: "#8FBF4E",
        dark: "#5A8029",
      },
      info: {
        main: colors.accent,
        light: "#E94DD0",
        dark: "#B0159A",
      },
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
      },
      divider: "rgba(255, 255, 255, 0.08)",
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 700,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      h3: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 600,
        letterSpacing: "-0.01em",
      },
      h4: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 600,
        letterSpacing: "-0.005em",
      },
      h5: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 600,
      },
      h6: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
        letterSpacing: "0.01em",
      },
      subtitle2: {
        fontWeight: 500,
        letterSpacing: "0.01em",
      },
      body1: {
        letterSpacing: "0.01em",
        lineHeight: 1.6,
      },
      body2: {
        letterSpacing: "0.01em",
        lineHeight: 1.6,
      },
      button: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 600,
        letterSpacing: "0.02em",
        textTransform: "none",
      },
      caption: {
        letterSpacing: "0.03em",
        color: colors.text.muted,
      },
      overline: {
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: `${colors.secondary} ${colors.background.paper}`,
            "&::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              background: colors.background.paper,
            },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(colors.secondary, 0.5),
              borderRadius: 4,
              "&:hover": {
                background: colors.secondary,
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: "8px 20px",
            transition: "all 0.2s ease-in-out",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: `0 4px 20px ${alpha(colors.secondary, 0.4)}`,
              transform: "translateY(-1px)",
            },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${colors.secondary} 0%, ${alpha(colors.secondary, 0.8)} 100%)`,
            "&:hover": {
              background: `linear-gradient(135deg, #8FBF4E 0%, ${colors.secondary} 100%)`,
            },
          },
          outlined: {
            borderWidth: 1.5,
            "&:hover": {
              borderWidth: 1.5,
              background: alpha(colors.primary, 0.05),
            },
          },
          outlinedPrimary: {
            borderColor: alpha(colors.primary, 0.3),
            "&:hover": {
              borderColor: colors.primary,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: colors.background.paper,
          },
          elevation1: {
            boxShadow: `0 2px 8px ${alpha("#000", 0.3)}`,
          },
          elevation3: {
            boxShadow: `0 4px 16px ${alpha("#000", 0.4)}`,
          },
          elevation6: {
            boxShadow: `0 8px 32px ${alpha("#000", 0.5)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${alpha(colors.primary, 0.06)}`,
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              borderColor: alpha(colors.secondary, 0.3),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              transition: "all 0.2s ease-in-out",
              "& fieldset": {
                borderColor: alpha(colors.primary, 0.15),
                borderWidth: 1.5,
              },
              "&:hover fieldset": {
                borderColor: alpha(colors.primary, 0.3),
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.secondary,
                borderWidth: 2,
                boxShadow: `0 0 0 3px ${alpha(colors.secondary, 0.15)}`,
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: colors.secondary,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
          colorSecondary: {
            background: alpha(colors.secondary, 0.15),
            borderColor: alpha(colors.secondary, 0.3),
            "&:hover": {
              background: alpha(colors.secondary, 0.25),
            },
          },
          colorInfo: {
            background: alpha(colors.accent, 0.15),
            borderColor: alpha(colors.accent, 0.3),
            color: colors.accent,
            "&:hover": {
              background: alpha(colors.accent, 0.25),
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${alpha(colors.secondary, 0.3)}`,
            marginTop: 4,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            transition: "all 0.15s ease-in-out",
            "&:hover": {
              backgroundColor: alpha(colors.secondary, 0.1),
            },
            "&.Mui-selected": {
              backgroundColor: alpha(colors.secondary, 0.15),
              "&:hover": {
                backgroundColor: alpha(colors.secondary, 0.2),
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: alpha(colors.primary, 0.08),
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          standardSuccess: {
            backgroundColor: alpha(colors.secondary, 0.1),
            borderLeft: `4px solid ${colors.secondary}`,
          },
          standardInfo: {
            backgroundColor: alpha(colors.accent, 0.1),
            borderLeft: `4px solid ${colors.accent}`,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: colors.secondary,
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            "&.Mui-selected": {
              color: colors.secondary,
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: colors.background.surface,
            border: `1px solid ${alpha(colors.primary, 0.1)}`,
            fontSize: "0.8125rem",
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": {
              color: colors.secondary,
              "& + .MuiSwitch-track": {
                backgroundColor: colors.secondary,
              },
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            "&.Mui-checked": {
              color: colors.secondary,
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            "&.Mui-checked": {
              color: colors.secondary,
            },
          },
        },
      },
    },
  });
};

const theme = createAppTheme();

export { DEFAULT_COLORS as colors, createAppTheme };
export default theme;
