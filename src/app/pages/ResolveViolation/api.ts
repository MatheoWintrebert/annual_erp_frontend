import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import { API_BASE, apiFetch } from "../../api-config";
import type { PlacementResult } from "../Intake/types";

const fetchRecommendedPlacement = async (
  productIds: number[]
): Promise<PlacementResult> => {
  const response = await apiFetch(
    `${API_BASE}/palettes/intake/recommend-placement`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    }
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PlacementResult>;
};

export const useGetRecommendedPlacement = (productIds: number[]) =>
  useQuery({
    queryKey: ["placement-recommendation", productIds],
    queryFn: () => fetchRecommendedPlacement(productIds),
    enabled: productIds.length > 0,
  });
