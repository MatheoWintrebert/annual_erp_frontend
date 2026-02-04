import type { CompanySettings } from "./types";

const API_BASE = "http://localhost:3333";

export const fetchCompanySettings =
  async (): Promise<CompanySettings | null> => {
    const response = await fetch(`${API_BASE}/company-settings`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }
    return response.json() as Promise<CompanySettings>;
  };

export const updateCompanySettings = async (
  data: CompanySettings
): Promise<CompanySettings> => {
  const response = await fetch(`${API_BASE}/company-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to save settings: ${response.statusText}`);
  }
  return response.json() as Promise<CompanySettings>;
};
