import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/services/auth/type";

export interface AccountState {
  user: User | null;
}

const initialState: AccountState = {
  user: null,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<User | null>) => {
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
