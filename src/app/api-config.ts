export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:3333";

import { store } from "../store/store";

export const apiFetch = (
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> => {
  const token = store.getState().auth.token;
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
};
