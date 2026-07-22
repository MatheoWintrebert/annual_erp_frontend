import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import { API_BASE, apiFetch } from "../../api-config";
import type {
  PaletteListItem,
  PlacementViolationWarning,
  ProductsListResponse,
  RuleViolation,
  UnitsOfMeasureListResponse,
} from "./types";

export interface PalettierOption {
  id: number;
  name: string;
}

const fetchPalettes = async (params?: {
  palettierId?: number;
  search?: string;
}): Promise<PaletteListItem[]> => {
  const url = new URL(`${API_BASE}/palettes`);
  if (params?.palettierId != null) {
    url.searchParams.set("palettierId", String(params.palettierId));
  }
  if (params?.search) {
    url.searchParams.set("search", params.search);
  }
  const response = await apiFetch(url.toString());
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PaletteListItem[]>;
};

const fetchPalettiers = async (): Promise<PalettierOption[]> => {
  const response = await apiFetch(`${API_BASE}/palettiers`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PalettierOption[]>;
};

export const useGetPalettes = (params?: {
  palettierId?: number;
  search?: string;
}) =>
  useQuery({
    queryKey: ["palettes", params],
    queryFn: () => fetchPalettes(params),
  });

const fetchPaletteViolations = async (): Promise<RuleViolation[]> => {
  const response = await apiFetch(`${API_BASE}/palettes/violations`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RuleViolation[]>;
};

export const useGetPaletteViolations = () =>
  useQuery({
    queryKey: ["palettes", "violations"],
    queryFn: fetchPaletteViolations,
    staleTime: 30_000,
  });

export const useGetPalettiers = () =>
  useQuery({
    queryKey: ["palettiers"],
    queryFn: fetchPalettiers,
  });

export interface UpdatePalettePositionInput {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

const updatePalettePosition = async (
  paletteId: number,
  data: UpdatePalettePositionInput
): Promise<void> => {
  const response = await apiFetch(
    `${API_BASE}/palettes/${String(paletteId)}/position`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
};

export const useUpdatePalettePosition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paletteId,
      ...data
    }: UpdatePalettePositionInput & { paletteId: number }) =>
      updatePalettePosition(paletteId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettes"] });
      void queryClient.invalidateQueries({ queryKey: ["rules", "violations"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

const fetchProducts = async (search: string): Promise<ProductsListResponse> => {
  const url = new URL(`${API_BASE}/products`);
  url.searchParams.set("limit", "20");
  if (search) {
    url.searchParams.set("search", search);
  }
  const response = await apiFetch(url.toString());
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<ProductsListResponse>;
};

export const useGetProductsForOnboarding = (search: string) =>
  useQuery({
    queryKey: ["products", "onboarding", search],
    queryFn: () => fetchProducts(search),
    placeholderData: (prev) => prev,
  });

const fetchUnitsOfMeasure = async (): Promise<UnitsOfMeasureListResponse> => {
  const response = await apiFetch(`${API_BASE}/units-of-measure?limit=100`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<UnitsOfMeasureListResponse>;
};

export const useGetUnitsOfMeasure = () =>
  useQuery({
    queryKey: ["units-of-measure"],
    queryFn: fetchUnitsOfMeasure,
  });

const checkPlacementViolations = async (data: {
  productIds: number[];
  palettierId: number;
}): Promise<PlacementViolationWarning[]> => {
  const response = await apiFetch(
    `${API_BASE}/palettes/check-placement-violations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PlacementViolationWarning[]>;
};

export const useCheckPlacementViolations = () =>
  useMutation({
    mutationFn: checkPlacementViolations,
  });

export interface RegisterOnboardingPayload {
  palettierId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  items: {
    productId: number;
    lotReference?: string;
    expiryDate?: string;
    quantity: number;
  }[];
}

export interface RegisterOnboardingResponse {
  paletteId: number;
  palettierId: number;
  palettierName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  createdAt: string;
  items: {
    lotId: number;
    lotReference: string;
    productId: number;
    productName: string;
    quantity: number;
    expiryDate: string | null;
  }[];
}

const registerOnboardingPalette = async (
  data: RegisterOnboardingPayload
): Promise<RegisterOnboardingResponse> => {
  const response = await apiFetch(`${API_BASE}/palettes/intake/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RegisterOnboardingResponse>;
};

export const useRegisterOnboardingPalette = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerOnboardingPalette,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettes"] });
    },
  });
};

const deletePalette = async (paletteId: number): Promise<void> => {
  const response = await apiFetch(`${API_BASE}/palettes/${String(paletteId)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
};

export const useDeletePalette = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paletteId: number) => deletePalette(paletteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettes"] });
    },
  });
};
