import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '@/services/baseQuery';
import { setRegister, setLogin, setAuthenticatedUser } from '@/store/auth/slice';
import type { LoginRequestParams, LoginResponse, RegisterResponse, RegistrerRequestParams, TwoFactorAuthRequestParams, TwoFactorAuthResponse } from './type';

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: baseQuery,
	endpoints: builder => ({
		register: builder.mutation<RegisterResponse, RegistrerRequestParams>({
			query: body => ({
				url: '/auth/register',
				method: 'POST',
				body,
			}),
			onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
				queryFulfilled.then(result => {
					dispatch(setRegister(result.data));
				});
			},
		}),

        login: builder.mutation<LoginResponse, LoginRequestParams>({
			query: body => ({
				url: '/auth/full-login',
				method: 'POST',
				body,
			}),
			onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
				queryFulfilled.then(result => {
					dispatch(setAuthenticatedUser(result.data));
				});
			},
		}),

        TwoFAVerif: builder.mutation<TwoFactorAuthResponse, TwoFactorAuthRequestParams>({
			query: body => ({
				url: '/auth/2faValidate',
				method: 'POST',
				body,
			}),
			onQueryStarted: (_arg, { dispatch, queryFulfilled }) => {
				queryFulfilled.then(result => {
					dispatch(setAuthenticatedUser(result.data));
				});
			},
		}),

	}),
});

export const { useTwoFAVerifMutation, useRegisterMutation, useLoginMutation } = authApi;
