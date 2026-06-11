import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authSlice } from "./auth";
import { accountSlice } from "./account";
import type { RootState } from "@/store";
import { accountApi, authApi } from "@/services";

const AUTH_STORAGE_KEY = "pms_auth";

function loadAuthFromStorage(): Partial<RootState> {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return {};
    const { token, isAuthenticated } = JSON.parse(raw) as {
      token: string;
      isAuthenticated: boolean;
    };
    if (!token || !isAuthenticated) return {};
    return {
      auth: {
        token,
        isAuthenticated,
        qrCode: null,
        identityToken: null,
        showStillHere: false,
      },
    };
  } catch {
    return {};
  }
}

function saveAuthToStorage(state: RootState): void {
  try {
    const { token, isAuthenticated } = state.auth;
    if (token && isAuthenticated) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ token, isAuthenticated })
      );
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // storage unavailable — silently skip
  }
}

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
export const rootReducer = combineSlices(
  authSlice,
  accountSlice,
  authApi,
  accountApi
);

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware({ serializableCheck: false }).concat(
        accountApi.middleware,
        authApi.middleware
        /* add here others middlewares */
      );
    },
    preloadedState,
  });

  // configure listeners using the provided defaults
  // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
  setupListeners(store.dispatch);

  return store;
};

export const store = makeStore(loadAuthFromStorage());

store.subscribe(() => {
  saveAuthToStorage(store.getState());
});
