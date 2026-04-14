import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import { API_BASE, apiFetch } from "../../api-config";
import type {
  DashboardAlertsResponse,
  DashboardSummaryResponse,
} from "./types";

const fetchDashboardAlerts = async (): Promise<DashboardAlertsResponse> => {
  const response = await apiFetch(`${API_BASE}/dashboard/alerts`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<DashboardAlertsResponse>;
};

export const useGetDashboardAlerts = () => {
  return useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: fetchDashboardAlerts,
  });
};

const fetchDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  const response = await apiFetch(`${API_BASE}/dashboard/summary`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<DashboardSummaryResponse>;
};

export const useGetDashboardSummary = () => {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
  });
};
