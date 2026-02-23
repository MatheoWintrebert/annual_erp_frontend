import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import { API_BASE } from "../../api-config";
import type {
  AvailableStockItem,
  CancelPickingListResponse,
  CompletePickingListPayload,
  CreatePickingListPayload,
  PickingCompletionResponse,
  PickingListResponse,
  PickRouteItem,
  ProductOption,
} from "./types";

interface ProductsListResponse {
  products: ProductOption[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const fetchProducts = async (search: string): Promise<ProductsListResponse> => {
  const params = new URLSearchParams({ limit: "20" });
  if (search.length > 0) {
    params.set("search", search);
  }
  const response = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<ProductsListResponse>;
};

export const useSearchProducts = (search: string) =>
  useQuery({
    queryKey: ["products", "picking", search],
    queryFn: () => fetchProducts(search),
    enabled: true,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

const fetchAvailableStock = async (
  productIds: number[],
): Promise<AvailableStockItem[]> => {
  if (productIds.length === 0) return [];
  const params = new URLSearchParams();
  params.set("productIds", productIds.join(","));
  const response = await fetch(
    `${API_BASE}/picking-lists/available-stock?${params.toString()}`,
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<AvailableStockItem[]>;
};

export const useGetAvailableStock = (productIds: number[]) => {
  const results = useQueries({
    queries: productIds.map((id) => ({
      queryKey: ["picking-lists", "available-stock", id],
      queryFn: () => fetchAvailableStock([id]),
      staleTime: 15_000,
    })),
  });

  const data: AvailableStockItem[] = [];
  for (const result of results) {
    if (result.data) {
      for (const item of result.data) {
        data.push(item);
      }
    }
  }

  return { data: data.length > 0 ? data : undefined };
};

const createPickingList = async (
  payload: CreatePickingListPayload,
): Promise<PickingListResponse> => {
  const response = await fetch(`${API_BASE}/picking-lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PickingListResponse>;
};

export const useCreatePickingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPickingList,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["picking-lists"] });
      void queryClient.invalidateQueries({ queryKey: ["palettes"] });
    },
  });
};

const generatePickRoute = async (
  pickingListId: number,
): Promise<PickRouteItem[]> => {
  const response = await fetch(
    `${API_BASE}/picking-lists/${String(pickingListId)}/generate-route`,
    { method: "POST" },
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PickRouteItem[]>;
};

export const useGeneratePickRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generatePickRoute,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["picking-lists"] });
    },
  });
};

// Complete picking list (deduct stock)
const completePickingList = async (
  pickingListId: number,
  payload: CompletePickingListPayload,
): Promise<PickingCompletionResponse> => {
  const response = await fetch(
    `${API_BASE}/picking-lists/${String(pickingListId)}/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<PickingCompletionResponse>;
};

export const useCompletePickingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pickingListId,
      payload,
    }: {
      pickingListId: number;
      payload: CompletePickingListPayload;
    }) => completePickingList(pickingListId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["picking-lists"] });
      void queryClient.invalidateQueries({ queryKey: ["palettes"] });
    },
  });
};

// Cancel picking list (no stock deduction)
const cancelPickingList = async (
  pickingListId: number,
): Promise<CancelPickingListResponse> => {
  const response = await fetch(
    `${API_BASE}/picking-lists/${String(pickingListId)}/cancel`,
    { method: "POST" },
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<CancelPickingListResponse>;
};

export const useCancelPickingList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPickingList,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["picking-lists"] });
    },
  });
};
