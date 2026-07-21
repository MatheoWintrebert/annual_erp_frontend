import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "@/services/baseQuery";
import { setRegister, setToken, setAuthenticated } from "@/store/auth/slice";
import { setUser } from "@/store/account/slice";
import type {
  CreateUserParams,
  CreateUserResponse,
  EditPasswordParams,
  Generate2FAResponse,
  LoginRequestParams,
  LoginResponse,
  RegisterResponse,
  RegistrerRequestParams,
  TwoFactorAuthRequestParams,
  TwoFactorAuthResponse,
  UsersListResponse,
} from "./type";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegistrerRequestParams>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
        void queryFulfilled.then((result) => {
          dispatch(setRegister(result.data));
        });
      },
    }),

    // Step 1: authenticate with email + password only. Stores the
    // intermediate token so the following 2FA calls carry it, but does NOT
    // mark the session as authenticated yet.
    login: builder.mutation<LoginResponse, LoginRequestParams>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
        void queryFulfilled.then((result) => {
          dispatch(setToken(result.data.token));
          dispatch(setUser(result.data.user));
        });
      },
    }),

    // Generates a fresh 2FA secret + otpauth URI to display as a QR code.
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    generate2FA: builder.mutation<Generate2FAResponse, void>({
      query: () => ({
        url: "/auth/2fa/generate",
        method: "POST",
      }),
    }),

    // Step 2: validate the TOTP code and receive the final session token.
    verify2FA: builder.mutation<
      TwoFactorAuthResponse,
      TwoFactorAuthRequestParams
    >({
      query: (body) => ({
        url: "/auth/2fa/verify",
        method: "POST",
        body,
      }),
      onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
        void queryFulfilled.then((result) => {
          dispatch(setToken(result.data.token));
          dispatch(setAuthenticated(true));
        });
      },
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    editPassword: builder.mutation<void, EditPasswordParams>({
      query: (body) => ({
        url: "/auth/edit-password",
        method: "POST",
        body,
      }),
    }),

    createUser: builder.mutation<CreateUserResponse, CreateUserParams>({
      query: (body) => ({
        url: "/user",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Users"],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    getUsers: builder.query<UsersListResponse, void>({
      query: () => ({
        url: "/user",
      }),
      providesTags: ["Users"],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/user/${String(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGenerate2FAMutation,
  useVerify2FAMutation,
  useEditPasswordMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
} = authApi;
