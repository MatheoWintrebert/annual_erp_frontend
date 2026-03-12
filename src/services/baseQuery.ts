import {
  fetchBaseQuery,
  type BaseQueryApi,
  type FetchArgs,
} from "@reduxjs/toolkit/query";

import { setAuthenticated, setToken } from "@/store/auth";
import { isTokenRefreshTimeValid } from "@/utils";
import type { RootState } from "@/store/types";
import { clearAccount } from "@/store/account";

const rawBaseQuery = () =>
  fetchBaseQuery({
    // Vite exposes env vars through import.meta.env. Variables must begin
    // with "VITE_" in order to be statically injected at build time.
    baseUrl: import.meta.env.VITE_API_URL as string,
    prepareHeaders: (
      headers: Headers,
      { getState }: { getState: () => unknown }
    ) => {
      const token = (getState() as RootState).auth.token;
      const identityToken = (getState() as RootState).auth.identityToken;

      headers.set("content-type", "application/json");

      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      if (identityToken) {
        headers.set("X-User-Token", identityToken);
      }

      return headers;
    },
  });

export const baseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: Record<string, unknown>
) => {
  const result = await rawBaseQuery()(args, api, extraOptions);

  const logout = () => {
    api.dispatch(setAuthenticated(false));
    api.dispatch(setToken(null));
    api.dispatch(clearAccount());
  };

  if (result.error?.status === 401) {
    if (isTokenRefreshTimeValid()) {
      window.location.reload();
    } else {
      logout();
    }
  }

  if (result.error?.status === 500) {
    // todo
  }

  return result;
};
