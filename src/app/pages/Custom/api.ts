import type { CompanySettings } from "./types";

import { API_BASE, apiFetch } from "../../api-config";

export const fetchCompanySettings =
	async (): Promise<CompanySettings | null> => {
		const response = await apiFetch(`${API_BASE}/company-settings`);
		if (response.status === 404) {
			return null;
		}
		if (!response.ok) {
			throw new Error(`Failed to fetch settings: ${response.statusText}`);
		}
		return response.json() as Promise<CompanySettings>;
	};

export const updateCompanySettings = async (
	data: CompanySettings,
): Promise<CompanySettings> => {
	const payload: CompanySettings = {
		...data,
		brandingLogoUrl: data.brandingLogoUrl ?? null,
		primaryColor: data.primaryColor ?? null,
		secondaryColor: data.secondaryColor ?? null,
		contactEmail: data.contactEmail ?? null,
		contactPhone: data.contactPhone ?? null,
	};
	const response = await apiFetch(`${API_BASE}/company-settings`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		throw new Error(`Failed to save settings: ${response.statusText}`);
	}
	return response.json() as Promise<CompanySettings>;
};
