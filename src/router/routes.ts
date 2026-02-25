export const ROUTES = {
	// auth
	AUTH: '/auth',
	SIGN_IN: '/auth/signin',
	SIGN_UP: '/auth/signup',

	// RESET_PASSWORD: '/auth/reset-password',
	// RESET_PASSWORD_CONFIRMATION: '/auth/reset-password/confirmation',

	// main
	HOME: '/',

	// account
	// ACCOUNT: '/profile/account',

} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
