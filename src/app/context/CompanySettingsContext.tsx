import { createContext, use, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material";
import { createAppTheme } from "../../theme";

interface CompanySettings {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  language: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
}

interface CompanySettingsContextValue {
  settings: CompanySettings | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: "",
  logoUrl: "",
  primaryColor: "#77A53C",
  secondaryColor: "#dc1dbc",
  language: "en",
  timezone: "UTC",
  contactEmail: "",
  contactPhone: "",
};

const API_BASE = "http://localhost:3333";

const CompanySettingsContext = createContext<CompanySettingsContextValue>({
  settings: null,
  isLoading: true,
  refetch: (): Promise<void> => Promise.resolve(),
});

// eslint-disable-next-line react-refresh/only-export-components
export const useCompanySettings = (): CompanySettingsContextValue =>
  use(CompanySettingsContext);

interface CompanySettingsProviderProps {
  children: ReactNode;
}

export const CompanySettingsProvider = ({
  children,
}: CompanySettingsProviderProps): ReactNode => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/company-settings`);
      if (response.status === 404) {
        setSettings(DEFAULT_SETTINGS);
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }
      const data = (await response.json()) as CompanySettings;
      setSettings(data);
    } catch (error) {
      console.error("Failed to load company settings:", error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const theme = useMemo(() => {
    const colors = settings ?? DEFAULT_SETTINGS;
    return createAppTheme({
      secondary: colors.primaryColor,
      accent: colors.secondaryColor,
    });
  }, [settings]);

  useEffect(() => {
    const colors = settings ?? DEFAULT_SETTINGS;
    const root = document.documentElement;
    root.style.setProperty("--color-secondary", colors.primaryColor);
    root.style.setProperty("--color-accent", colors.secondaryColor);
  }, [settings]);

  const contextValue = useMemo(
    () => ({
      settings,
      isLoading,
      refetch: fetchSettings,
    }),
    [settings, isLoading]
  );

  return (
    <CompanySettingsContext value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CompanySettingsContext>
  );
};
