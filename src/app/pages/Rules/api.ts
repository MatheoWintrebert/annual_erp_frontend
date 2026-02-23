import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../hooks/useApiError";
import type {
  RulesListResponse,
  RuleBatchResponse,
  CreateRulePayload,
  UpdateRulePayload,
  UpdateRuleResponse,
  CategoriesListResponse,
  RuleViolation,
} from "./types";
import type { RuleResponse } from "./types";

const API_BASE = "http://localhost:3333";

const fetchRules = async (): Promise<RulesListResponse> => {
  const response = await fetch(
    `${API_BASE}/rules?limit=100&includeProducts=true`
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RulesListResponse>;
};

const fetchRuleById = async (id: number): Promise<RuleResponse> => {
  const response = await fetch(
    `${API_BASE}/rules/${String(id)}?includeProducts=true`
  );
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RuleResponse>;
};

const createRule = async (
  data: CreateRulePayload
): Promise<RuleBatchResponse> => {
  const response = await fetch(`${API_BASE}/rules/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rules: [data] }),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RuleBatchResponse>;
};

const updateRule = async ({
  id,
  ...data
}: UpdateRulePayload & { id: number }): Promise<UpdateRuleResponse> => {
  const response = await fetch(`${API_BASE}/rules/${String(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<UpdateRuleResponse>;
};

const fetchActiveViolations = async (): Promise<RuleViolation[]> => {
  const response = await fetch(`${API_BASE}/rules/violations`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<RuleViolation[]>;
};

const deleteRule = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/rules/${String(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new ApiError(response);
  }
};

const fetchCategories = async (): Promise<CategoriesListResponse> => {
  const response = await fetch(`${API_BASE}/categories?limit=100`);
  if (!response.ok) {
    throw new ApiError(response);
  }
  return response.json() as Promise<CategoriesListResponse>;
};

export const useGetRules = () =>
  useQuery({
    queryKey: ["rules"],
    queryFn: fetchRules,
  });

export const useGetRuleById = (id: number) =>
  useQuery({
    queryKey: ["rules", id],
    queryFn: () => fetchRuleById(id),
    enabled: id > 0,
  });

export const useCreateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
};

export const useUpdateRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateRule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
};

export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
};

export const useGetCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

export const useGetActiveViolations = () =>
  useQuery({
    queryKey: ["rules", "violations"],
    queryFn: fetchActiveViolations,
  });
