// useModel('auth') — lưu trạng thái đăng nhập của staff (Luna Spa BE).
import { useCallback, useEffect, useState } from 'react';
import * as authApi from '@/services/Auth/api';
import {
	AUTH_TOKEN_KEY,
	AUTH_USER_KEY,
	EStaffRole,
} from '@/services/Auth/constant';

const readJSON = <T,>(key: string): T | null => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : null;
	} catch {
		return null;
	}
};

export default () => {
	const [currentUser, setCurrentUser] = useState<Auth.IStaff | null>(() =>
		readJSON<Auth.IStaff>(AUTH_USER_KEY),
	);
	const [accessToken, setAccessToken] = useState<string | null>(() =>
		localStorage.getItem(AUTH_TOKEN_KEY),
	);
	const [loading, setLoading] = useState(false);

	const persist = useCallback((token: string, user: Auth.IStaff) => {
		localStorage.setItem(AUTH_TOKEN_KEY, token);
		localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
		setAccessToken(token);
		setCurrentUser(user);
	}, []);

	const clear = useCallback(() => {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_USER_KEY);
		setAccessToken(null);
		setCurrentUser(null);
	}, []);

	const login = useCallback(
		async (payload: Auth.ILoginPayload) => {
			setLoading(true);
			try {
				const res = await authApi.login(payload);
				const data = res.data;
				persist(data.accessToken, data.user);
				return data;
			} finally {
				setLoading(false);
			}
		},
		[persist],
	);

	const refreshMe = useCallback(async () => {
		try {
			const res = await authApi.getMe();
			const user = res.data;
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
			setCurrentUser(user);
			return user;
		} catch {
			clear();
			return null;
		}
	}, [clear]);

	const logout = useCallback(() => {
		clear();
	}, [clear]);

	const isAdmin = currentUser?.role === EStaffRole.ADMIN;
	const isOperator = currentUser?.role === EStaffRole.OPERATOR;
	const isStaff = currentUser?.role === EStaffRole.STAFF;

	useEffect(() => {
		// Đồng bộ user mới nhất từ BE nếu đã có token (chạy 1 lần khi mount).
		if (accessToken && !currentUser) {
			refreshMe();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return {
		currentUser,
		accessToken,
		loading,
		isAdmin,
		isOperator,
		isStaff,
		login,
		logout,
		refreshMe,
	};
};
