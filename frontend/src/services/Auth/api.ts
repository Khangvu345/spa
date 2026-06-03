// Gọi BE NestJS cho module Auth.
// BE wrap mọi response trong envelope { success, data } (xem
// common/interceptors/response.interceptor.ts), nên ta unwrap ở đây để
// caller chỉ phải làm việc với payload thật.
import axios from '@/utils/axios';

const API_BASE =
	(typeof APP_CONFIG_API_URL !== 'undefined' && APP_CONFIG_API_URL) ||
	'http://localhost:3000/api/v1';

export const authBaseUrl = API_BASE;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export function login(payload: Auth.ILoginPayload) {
	return unwrap<Auth.IAuthResponse>(
		axios.post(`${API_BASE}/auth/login`, payload),
	);
}

export function getMe() {
	return unwrap<Auth.IStaff>(axios.get(`${API_BASE}/auth/me`));
}

export function changePassword(payload: Auth.IChangePasswordPayload) {
	return unwrap<Auth.IAuthResponse>(
		axios.post(`${API_BASE}/auth/change-password`, payload),
	);
}
