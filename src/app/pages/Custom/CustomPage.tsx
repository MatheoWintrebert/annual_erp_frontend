import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Chip,
  Stack,
  Alert,
  MenuItem,
  FormHelperText,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Business,
  Palette,
  ContactMail,
  CloudUpload,
  RestartAlt,
  Save,
  Close,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import Header from "../../components/ui/Header";
import Footer from "../../components/ui/Footer";

type CompanySettings = {
  companyName: string;
  logo: FileList | null;
  primaryColor: string;
  secondaryColor: string;
  language: string;
  timezone: string;
  contactEmail: string;
  contactPhone: string;
};

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

const CustomPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanySettings>({
    defaultValues: {
      companyName: "",
      logo: null,
      primaryColor: "#77A53C",
      secondaryColor: "#dc1dbc",
      language: "en",
      timezone: "UTC",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const watchedValues = watch();

  const handleLogoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: FileList | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      onChange(event.target.files);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = (onChange: (value: FileList | null) => void) => {
    onChange(null);
    setLogoPreview(null);
  };

  const onSubmit = async (data: CompanySettings) => {
    try {
      console.log("Form data:", data);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Save failed:", error);
      setSaveStatus("error");
    }
  };

  const handleReset = () => {
    reset();
    setLogoPreview(null);
    setSaveStatus("idle");
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
                  onChange={(_, newValue) => setActiveTab(newValue)}
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
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{ p: 4 }}
                >
                  {activeTab === 0 && (
                    <Stack spacing={3}>
                      <Typography variant="h6" fontWeight={600}>
                        General Settings
                      </Typography>

                      <Controller
                        name="companyName"
                        control={control}
                        rules={{
                          required: "Company name is required",
                          minLength: {
                            value: 2,
                            message:
                              "Company name must be at least 2 characters",
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Company Name"
                            fullWidth
                            error={!!errors.companyName}
                            helperText={
                              errors.companyName?.message ||
                              "This will appear in the header and documents"
                            }
                            required
                          />
                        )}
                      />

                      <Controller
                        name="language"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Language"
                            fullWidth
                            helperText="Select your preferred language"
                          >
                            {LANGUAGES.map((lang) => (
                              <MenuItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />

                      <Controller
                        name="timezone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Time Zone"
                            fullWidth
                            helperText="Used for timestamps and scheduling"
                          >
                            {TIMEZONES.map((tz) => (
                              <MenuItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Stack>
                  )}

                  {activeTab === 1 && (
                    <Stack spacing={3}>
                      <Typography variant="h6" fontWeight={600}>
                        Brand Identity
                      </Typography>

                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          gutterBottom
                        >
                          Company Logo
                        </Typography>
                        <Controller
                          name="logo"
                          control={control}
                          render={({
                            field: { onChange, value, ...field },
                          }) => (
                            <Box>
                              {logoPreview ? (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    p: 2,
                                    border: 1,
                                    borderColor: "divider",
                                    borderRadius: 1,
                                  }}
                                >
                                  <Avatar
                                    src={logoPreview}
                                    variant="rounded"
                                    sx={{ width: 80, height: 80 }}
                                  />
                                  <Box flex={1}>
                                    <Typography
                                      variant="body2"
                                      fontWeight={500}
                                    >
                                      {value?.[0]?.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {value?.[0]?.size
                                        ? `${(value[0].size / 1024).toFixed(1)} KB`
                                        : ""}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    onClick={() => clearLogo(onChange)}
                                    color="error"
                                  >
                                    <Close />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Button
                                  component="label"
                                  variant="outlined"
                                  startIcon={<CloudUpload />}
                                  fullWidth
                                  sx={{ py: 2 }}
                                >
                                  Upload Logo
                                  <input
                                    {...field}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(e) =>
                                      handleLogoChange(e, onChange)
                                    }
                                  />
                                </Button>
                              )}
                              <FormHelperText>
                                Recommended: PNG or SVG, max 2MB
                              </FormHelperText>
                            </Box>
                          )}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Controller
                            name="primaryColor"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Primary Color"
                                fullWidth
                                type="color"
                                helperText="Main theme color"
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Box
                                          sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 1,
                                            bgcolor: field.value,
                                            border: 1,
                                            borderColor: "divider",
                                          }}
                                        />
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            )}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Controller
                            name="secondaryColor"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Secondary Color"
                                fullWidth
                                type="color"
                                helperText="Accent color"
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Box
                                          sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 1,
                                            bgcolor: field.value,
                                            border: 1,
                                            borderColor: "divider",
                                          }}
                                        />
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            )}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  )}

                  {activeTab === 2 && (
                    <Stack spacing={3}>
                      <Typography variant="h6" fontWeight={600}>
                        Contact Information
                      </Typography>

                      <Controller
                        name="contactEmail"
                        control={control}
                        rules={{
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Contact Email"
                            type="email"
                            fullWidth
                            error={!!errors.contactEmail}
                            helperText={
                              errors.contactEmail?.message ||
                              "Primary contact email for support and notifications"
                            }
                          />
                        )}
                      />

                      <Controller
                        name="contactPhone"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Contact Phone"
                            type="tel"
                            fullWidth
                            helperText="Main phone number for your company"
                          />
                        )}
                      />
                    </Stack>
                  )}

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
              <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Preview
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: watchedValues.primaryColor,
                      color: "white",
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      {logoPreview ? (
                        <Avatar
                          src={logoPreview}
                          variant="rounded"
                          sx={{ width: 40, height: 40, bgcolor: "white" }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ bgcolor: "white" }}>
                          <Business color="primary" />
                        </Avatar>
                      )}
                      <Typography variant="h6" fontWeight={700}>
                        {watchedValues.companyName || "Your Company"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label="Primary Color"
                      sx={{
                        bgcolor: watchedValues.primaryColor,
                        color: "white",
                      }}
                    />
                    <Chip
                      label="Secondary Color"
                      sx={{
                        bgcolor: watchedValues.secondaryColor,
                        color: "white",
                      }}
                    />
                  </Box>
                </Card>

                <Card variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Need Help?
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    We offer custom integration services to connect your
                    existing systems, automate data transfers, and fully
                    configure the palette storage tool.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Each setup is tailored to your operational workflows and
                    data formats.
                  </Typography>
                </Card>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default CustomPage;
