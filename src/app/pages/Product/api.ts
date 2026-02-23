import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import type {
  ProductResponse,
  ProductsListResponse,
  CreateProductPayload,
  UpdateProductPayload,
  UpdateProductResponse,
  Category,
  CategoriesListResponse,
  UnitOfMeasure,
  UnitsOfMeasureListResponse,
  RulesListResponse,
  CreateCategoryPayload,
  CreateUnitOfMeasurePayload,
} from "./types";

const API_BASE = "http://localhost:3333";

const fetchProducts = async (): Promise<ProductsListResponse> => {
  const response = await fetch(`${API_BASE}/products?limit=100`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<ProductsListResponse>;
};

const fetchProductById = async (id: number): Promise<ProductResponse> => {
  const response = await fetch(`${API_BASE}/products/${String(id)}`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<ProductResponse>;
};

const createProduct = async (
  data: CreateProductPayload
): Promise<ProductResponse> => {
  const response = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<ProductResponse>;
};

const updateProduct = async ({
  id,
  ...data
}: UpdateProductPayload & { id: number }): Promise<UpdateProductResponse> => {
  const response = await fetch(`${API_BASE}/products/${String(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<UpdateProductResponse>;
};

const deleteProduct = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/products/${String(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
};

const fetchProductPaletteCount = async (
  id: number
): Promise<{ count: number }> => {
  const response = await fetch(
    `${API_BASE}/products/${String(id)}/palette-count`
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<{ count: number }>;
};

const fetchCategories = async (): Promise<CategoriesListResponse> => {
  const response = await fetch(`${API_BASE}/categories?limit=100`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<CategoriesListResponse>;
};

const fetchUnitsOfMeasure = async (): Promise<UnitsOfMeasureListResponse> => {
  const response = await fetch(`${API_BASE}/units-of-measure?limit=100`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<UnitsOfMeasureListResponse>;
};

const createCategory = async (
  data: CreateCategoryPayload
): Promise<Category> => {
  const response = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<Category>;
};

const createUnitOfMeasure = async (
  data: CreateUnitOfMeasurePayload
): Promise<UnitOfMeasure> => {
  const response = await fetch(`${API_BASE}/units-of-measure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<UnitOfMeasure>;
};

const fetchRules = async (): Promise<RulesListResponse> => {
  const response = await fetch(`${API_BASE}/rules?limit=100`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RulesListResponse>;
};

export const useGetProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

export const useGetProductById = (id: number) =>
  useQuery({
    queryKey: ["products", id],
    queryFn: () => fetchProductById(id),
    enabled: id > 0,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useGetProductPaletteCount = (id: number) =>
  useQuery({
    queryKey: ["products", id, "palette-count"],
    queryFn: () => fetchProductPaletteCount(id),
    enabled: id > 0,
  });

export const useGetCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

export const useGetUnitsOfMeasure = () =>
  useQuery({
    queryKey: ["units-of-measure"],
    queryFn: fetchUnitsOfMeasure,
  });

export const useGetRulesForSelect = () =>
  useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useCreateUnitOfMeasure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUnitOfMeasure,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["units-of-measure"] });
    },
  });
};
