import { useState, useEffect } from "react";
import type { FC } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Business,
  Palette,
  ContactMail,
  RestartAlt,
  Save,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";
import { useCompanySettings } from "../../context/CompanySettingsContext";
import {
  GeneralSettingsTab,
  BrandingTab,
  ContactTab,
  SettingsPreview,
} from "./components";
import { fetchCompanySettings, updateCompanySettings } from "./api";
import type { CompanySettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const CustomPage: FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { refetch: refetchGlobalSettings } = useCompanySettings();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanySettings>({
    defaultValues: DEFAULT_SETTINGS,
  });

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const settings = await fetchCompanySettings();
        if (settings) {
          reset(settings);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load settings";
        console.error("Failed to load company settings:", message);
        setLoadError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadSettings();
  }, [reset]);

  const onSubmit = async (data: CompanySettings): Promise<void> => {
    try {
      setSaveStatus("idle");
      await updateCompanySettings(data);
      await refetchGlobalSettings();
      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
    }
  };

  const handleReset = (): void => {
    reset();
    setSaveStatus("idle");
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  const renderTabContent = (): React.ReactNode => {
    const tabProps = { control, errors };

    switch (activeTab) {
      case 0:
        return <GeneralSettingsTab {...tabProps} />;
      case 1:
        return <BrandingTab {...tabProps} />;
      case 2:
        return <ContactTab {...tabProps} />;
      default:
        return null;
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex={1} bgcolor="background.default" py={4}>
        <Container maxWidth="xl">
          <Box mb={4}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Company Customization
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Personalize your ERP system with your company branding and
              preferences
            </Typography>
          </Box>

          {isLoading && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress color="secondary" />
            </Box>
          )}

          {loadError && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              }
            >
              {loadError}
            </Alert>
          )}

          {saveStatus === "success" && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Settings saved successfully!
            </Alert>
          )}
          {saveStatus === "error" && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to save settings. Please try again.
            </Alert>
          )}

          {!isLoading && !loadError && (
            <Box
              sx={{
                display: "flex",
                gap: 3,
                flexDirection: { xs: "column", lg: "row" },
              }}
            >
              <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 66%" } }}>
                <Paper sx={{ overflow: "hidden" }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, newValue: number) => {
                      setActiveTab(newValue);
                    }}
                    sx={{
                      borderBottom: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Tab
                      icon={<Business />}
                      label="General"
                      iconPosition="start"
                    />
                    <Tab
                      icon={<Palette />}
                      label="Branding"
                      iconPosition="start"
                    />
                    <Tab
                      icon={<ContactMail />}
                      label="Contact"
                      iconPosition="start"
                    />
                  </Tabs>

                  <Box
                    component="form"
                    onSubmit={(e) => {
                      void handleSubmit(onSubmit)(e);
                    }}
                    sx={{ p: 4 }}
                  >
                    {renderTabContent()}

                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        mt: 4,
                        pt: 3,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<Save />}
                        disabled={!isDirty}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<RestartAlt />}
                        onClick={handleReset}
                        disabled={!isDirty}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              <Box sx={{ flex: { xs: "1 1 100%", lg: "1 1 33%" } }}>
                <SettingsPreview control={control} />
              </Box>
            </Box>
          )}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default CustomPage;
