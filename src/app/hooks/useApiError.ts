import { useCallback } from "react";
import { useSnackbar } from "../components/ui/SnackbarProvider";

export class ApiError extends Error {
  public readonly response: Response;

  constructor(response: Response) {
    super(`API error: ${String(response.status)} ${response.statusText}`);
    this.name = "ApiError";
    this.response = response;
  }
}

interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details: Record<string, unknown>;
}

const isApiErrorResponse = (data: unknown): data is ApiErrorResponse => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.statusCode === "number" &&
    typeof obj.code === "string" &&
    typeof obj.message === "string" &&
    typeof obj.details === "object"
  );
};

export const useApiError = () => {
  const { showSnackbar } = useSnackbar();

  const handleResponseError = useCallback(
    async (response: Response) => {
      try {
        const data: unknown = await response.json();
        if (isApiErrorResponse(data)) {
          showSnackbar(data.message, "error");
          return data;
        }
      } catch {
        // JSON parsing failed
      }
      showSnackbar("An unexpected error occurred", "error");
      return undefined;
    },
    [showSnackbar]
  );

  const handleError = useCallback(
    async (error: unknown) => {
      if (error instanceof ApiError) {
        await handleResponseError(error.response);
        return;
      }

      if (isApiErrorResponse(error)) {
        showSnackbar(error.message, "error");
        return;
      }

      if (error instanceof Error) {
        showSnackbar(error.message, "error");
        return;
      }

      showSnackbar("An unexpected error occurred", "error");
    },
    [showSnackbar, handleResponseError]
  );

  return { handleError, handleResponseError };
};
