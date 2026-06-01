// Gọi BE /service-orders — CRUD phiếu + CRUD items + complete + cancel.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/service-orders`;

type Envelope<T> = { success: boolean; data: T; meta?: SvcOrderMgmt.IPagedMeta };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export async function getServiceOrders(query: SvcOrderMgmt.IQuery = {}) {
	const params: any = { ...query };
	const res = await axios.get(BASE, { params });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as SvcOrderMgmt.IServiceOrder[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as SvcOrderMgmt.IPagedMeta,
	};
}

export function getServiceOrder(id: string) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.get(`${BASE}/${id}`));
}

export function createServiceOrder(payload: SvcOrderMgmt.ICreatePayload) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.post(BASE, payload));
}

export function updateServiceOrder(id: string, payload: SvcOrderMgmt.IUpdatePayload) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.patch(`${BASE}/${id}`, payload));
}

export function addItem(id: string, payload: SvcOrderMgmt.IAddItemPayload) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.post(`${BASE}/${id}/items`, payload));
}

export function updateItem(id: string, itemId: string, payload: SvcOrderMgmt.IUpdateItemPayload) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.patch(`${BASE}/${id}/items/${itemId}`, payload));
}

export function removeItem(id: string, itemId: string) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.delete(`${BASE}/${id}/items/${itemId}`));
}

export function completeServiceOrder(id: string) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.post(`${BASE}/${id}/complete`));
}

export function cancelServiceOrder(id: string, reason: string) {
	return unwrap<SvcOrderMgmt.IServiceOrder>(axios.post(`${BASE}/${id}/cancel`, { reason }));
}
