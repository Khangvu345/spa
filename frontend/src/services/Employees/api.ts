// Gọi BE /employees CRUD + lock/unlock/reset/delete.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/employees`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export async function getEmployees(query: Employees.IQuery = {}) {
	// List response của BE phẳng: { success, data: [...], meta: {...} }, không nested
	// nên không dùng unwrap (sẽ mất meta).
	const res = await axios.get(BASE, { params: query });
	const body: any = res.data;
	return {
		data: {
			data: (body?.data ?? []) as Employees.IEmployee[],
			meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as Employees.IPagedResponse['meta'],
		},
	};
}

export function getEmployee(id: string) {
	return unwrap<Employees.IEmployee>(axios.get(`${BASE}/${id}`));
}

export function createEmployee(payload: Employees.ICreatePayload) {
	return unwrap<Employees.IEmployee>(axios.post(BASE, payload));
}

export function updateEmployee(id: string, payload: Employees.IUpdatePayload) {
	return unwrap<Employees.IEmployee>(axios.patch(`${BASE}/${id}`, payload));
}

export function resetEmployeePassword(id: string) {
	return unwrap<{ defaultPassword?: string }>(axios.post(`${BASE}/${id}/reset-password`));
}

export function lockEmployee(id: string) {
	return unwrap<Employees.IEmployee>(axios.post(`${BASE}/${id}/lock`));
}

export function unlockEmployee(id: string) {
	return unwrap<Employees.IEmployee>(axios.post(`${BASE}/${id}/unlock`));
}

export function deleteEmployee(id: string) {
	return unwrap<{ deleted: boolean }>(axios.delete(`${BASE}/${id}`));
}
