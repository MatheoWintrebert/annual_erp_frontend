import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface AccountState {
  user: unknown;
}

const initialState: AccountState = {
  user: null,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<unknown>) => {
      state.user = payload;
    },
    clearAccount: (state) => {
      state.user = null;
    },
  },
  selectors: {
    getAuth: (state) => state,
  },
});

export const { setUser, clearAccount } = accountSlice.actions;
export const { getAuth } = accountSlice.selectors;
export const accountReducer = accountSlice.reducer;
