import type { Control } from "react-hook-form";

export interface CompanySettings {
  name: string;
  language: string;
  timezone: string;
  brandingLogoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface TabPanelProps {
  control: Control<CompanySettings>;
  errors: Partial<Record<keyof CompanySettings, { message?: string }>>;
}

export interface SettingsPreviewProps {
  values: CompanySettings;
}

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
] as const;

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
] as const;

export const URL_PATTERN =
  /^https?:\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;

export const PHONE_PATTERN = /^\+?[0-9]{7,15}$/;

export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const DEFAULT_SETTINGS: CompanySettings = {
  name: "",
  brandingLogoUrl: null,
  primaryColor: null,
  secondaryColor: null,
  language: "en",
  timezone: "UTC",
  contactEmail: null,
  contactPhone: null,
};
