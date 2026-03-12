import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQuery } from "@/services/baseQuery";
// import { setAccount, setCounties } from '@/store/account/slice';
// import type { AccountResponse, AccountRequestParams, CountiesResponse } from '@/services/account/types';

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    // getAccount: builder.query<AccountResponse, void>({
    // 	query: () => ({
    // 		url: '/users/me',
    // 	}),
    // 	onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
    // 		queryFulfilled.then(result => {
    // 			dispatch(setAccount(result.data));
    // 		});
    // 	},
    // }),

    // setAccount: builder.mutation<AccountResponse, Partial<AccountRequestParams>>({
    // 	query: body => ({
    // 		url: '/users/me',
    // 		method: 'PUT',
    // 		body,
    // 	}),
    // 	onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
    // 		queryFulfilled.then(result => {
    // 			dispatch(setAccount(result.data));
    // 		});
    // 	},
    // }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/users/me",
        method: "DELETE",
      }),
    }),

    // getCounties: builder.query<CountiesResponse, void>({
    // 	query: () => ({
    // 		url: '/common/counties',
    // 	}),
    // 	onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
    // 		queryFulfilled.then(result => {
    // 			dispatch(setCounties(result.data));
    // 		});
    // 	},
    // }),
  }),
});

// export const { useDeleteAccountMutation, useGetAccountQuery, useGetCountiesQuery, useSetAccountMutation } = accountApi;
export const { useDeleteAccountMutation } = accountApi;
