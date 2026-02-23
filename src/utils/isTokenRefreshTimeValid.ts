import { storage } from '@/utils';

export const isTokenRefreshTimeValid = (): boolean => {
	const refreshTime = storage.getItem('tokenRefreshTime');
	if (!refreshTime) return false;

	const refreshDate = new Date(refreshTime);
	const now = new Date();

	return now < refreshDate;
};
