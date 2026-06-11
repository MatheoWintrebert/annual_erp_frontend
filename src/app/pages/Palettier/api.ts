import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import type {
  PalettierResponse,
  PalettierType,
  CreatePalettierPayload,
  UpdatePalettierPayload,
  PaletteCountResponse,
} from "./types";

import { API_BASE, apiFetch } from "../../api-config";

const fetchPalettiers = async (): Promise<PalettierResponse[]> => {
  const response = await apiFetch(`${API_BASE}/palettiers`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PalettierResponse[]>;
};

const fetchPalettierById = async (id: number): Promise<PalettierResponse> => {
  const response = await apiFetch(`${API_BASE}/palettiers/${String(id)}`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PalettierResponse>;
};

const createPalettier = async (
  data: CreatePalettierPayload
): Promise<PalettierResponse> => {
  const response = await apiFetch(`${API_BASE}/palettiers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ palettiers: [data] }),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  const result = (await response.json()) as {
    palettiers: PalettierResponse[];
  };
  return result.palettiers[0];
};

const updatePalettier = async ({
  id,
  ...data
}: UpdatePalettierPayload & { id: number }): Promise<PalettierResponse> => {
  const response = await apiFetch(`${API_BASE}/palettiers/${String(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PalettierResponse>;
};

const deletePalettier = async (id: number): Promise<void> => {
  const response = await apiFetch(`${API_BASE}/palettiers/${String(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
};

const createPalettierType = async (data: {
  name: string;
  description: string;
}): Promise<PalettierType> => {
  const response = await apiFetch(`${API_BASE}/palettier-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PalettierType>;
};

const fetchPalettierTypes = async (): Promise<PalettierType[]> => {
  const response = await apiFetch(`${API_BASE}/palettier-types`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PalettierType[]>;
};

const fetchPaletteCountByPalettier = async (
  id: number
): Promise<PaletteCountResponse> => {
  const response = await apiFetch(
    `${API_BASE}/palettiers/${String(id)}/palette-count`
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PaletteCountResponse>;
};

export const useGetPalettiers = () =>
  useQuery({
    queryKey: ["palettiers"],
    queryFn: fetchPalettiers,
  });

export const useGetPalettierById = (id: number) =>
  useQuery({
    queryKey: ["palettiers", id],
    queryFn: () => fetchPalettierById(id),
    enabled: id > 0,
  });

export const useCreatePalettier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPalettier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettiers"] });
    },
  });
};

export const useUpdatePalettier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePalettier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettiers"] });
    },
  });
};

export const useDeletePalettier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePalettier,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettiers"] });
    },
  });
};

export const useCreatePalettierType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPalettierType,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["palettier-types"] });
    },
  });
};

export const useGetPalettierTypes = () =>
  useQuery({
    queryKey: ["palettier-types"],
    queryFn: fetchPalettierTypes,
  });

export const useGetPaletteCountByPalettier = (id: number) =>
  useQuery({
    queryKey: ["palettiers", id, "palette-count"],
    queryFn: () => fetchPaletteCountByPalettier(id),
    enabled: id > 0,
  });

export { useGetActiveViolations } from "../Rules/api";
