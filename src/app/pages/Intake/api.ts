import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import { API_BASE, apiFetch } from "../../api-config";
import type {
  PalettierOption,
  PlacementResult,
  ProductsListResponse,
  RegisterConflictResolutionPayload,
  RegisterConflictResolutionResponse,
  RegisterPalettePayload,
  RegisterPaletteResponse,
  UnitsOfMeasureListResponse,
} from "./types";

const fetchProducts = async (search: string): Promise<ProductsListResponse> => {
  const params = new URLSearchParams({ limit: "20" });
  if (search.length > 0) {
    params.set("search", search);
  }
  const response = await apiFetch(`${API_BASE}/products?${params.toString()}`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<ProductsListResponse>;
};

const fetchUnitsOfMeasure = async (): Promise<UnitsOfMeasureListResponse> => {
  const response = await apiFetch(`${API_BASE}/units-of-measure?limit=100`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<UnitsOfMeasureListResponse>;
};

const recommendPlacement = async (data: {
  productIds: number[];
}): Promise<PlacementResult> => {
  const response = await apiFetch(
    `${API_BASE}/palettes/intake/recommend-placement`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PlacementResult>;
};

const registerPalette = async (
  data: RegisterPalettePayload
): Promise<RegisterPaletteResponse> => {
  const response = await apiFetch(`${API_BASE}/palettes/intake/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RegisterPaletteResponse>;
};

const registerConflictResolution = async (
  data: RegisterConflictResolutionPayload
): Promise<RegisterConflictResolutionResponse> => {
  const response = await apiFetch(
    `${API_BASE}/palettes/intake/register-conflict-resolution`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RegisterConflictResolutionResponse>;
};

const fetchPalettiers = async (): Promise<PalettierOption[]> => {
  const response = await apiFetch(`${API_BASE}/palettiers`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PalettierOption[]>;
};

export const useGetPalettiers = () =>
  useQuery({
    queryKey: ["palettiers"],
    queryFn: fetchPalettiers,
  });

export const useGetProductsForIntake = (search: string) =>
  useQuery({
    queryKey: ["products", "intake", search],
    queryFn: () => fetchProducts(search),
    placeholderData: (prev) => prev,
  });

export const useGetUnitsOfMeasure = () =>
  useQuery({
    queryKey: ["units-of-measure"],
    queryFn: fetchUnitsOfMeasure,
  });

export const useRecommendPlacement = () =>
  useMutation({
    mutationFn: recommendPlacement,
  });

export const useRegisterPalette = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerPalette,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettes"] });
    },
  });
};

export const useRegisterConflictResolution = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerConflictResolution,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettes"] });
    },
  });
};
