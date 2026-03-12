import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { setUser } from "../account/slice";

export interface AuthState {
  token: string | null;
  qrCode: string | null;
  identityToken: string | null;
  isAuthenticated: boolean;
  showStillHere: boolean;
}

const initialState: AuthState = {
  token: null,
  qrCode: null,
  identityToken: null,
  isAuthenticated: false,
  showStillHere: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setRegister: (
      state,
      { payload }: PayloadAction<{ token: string; qrCode: string }>
    ) => {
      state.token = payload.token;
      state.qrCode = payload.qrCode;
    },
    setLogin: (state, { payload }: PayloadAction<string>) => {
      state.token = payload;
    },
    setToken: (state, { payload }: PayloadAction<string | null>) => {
      state.token = payload;
    },
    setIdentityToken: (state, { payload }: PayloadAction<string | null>) => {
      state.identityToken = payload;
    },
    setAuthenticated: (state, { payload }: PayloadAction<boolean>) => {
      state.isAuthenticated = payload;
    },
    setAuthenticatedUser: (
      state,
      { payload }: PayloadAction<{ token: string; user: unknown }>
    ) => {
      state.isAuthenticated = true;
      state.token = payload.token;
      setUser(payload.user);
    },
  },
  selectors: {
    getAuth: (state) => state,
  },
});

export const {
  setAuthenticated,
  setIdentityToken,
  setRegister,
  setLogin,
  setAuthenticatedUser,
  setToken,
} = authSlice.actions;
export const { getAuth } = authSlice.selectors;
export const authReducer = authSlice.reducer;
