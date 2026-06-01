// Gọi BE /invoices.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/invoices`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export async function getInvoices(query: InvoiceMgmt.IQuery = {}) {
	const res = await axios.get(BASE, { params: query });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as InvoiceMgmt.IInvoice[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as InvoiceMgmt.IPagedResponse['meta'],
	};
}

export function getInvoice(id: string) {
	return unwrap<InvoiceMgmt.IInvoice>(axios.get(`${BASE}/${id}`));
}

export function createInvoice(payload: InvoiceMgmt.ICreatePayload) {
	return unwrap<InvoiceMgmt.IInvoice>(axios.post(BASE, payload));
}

export function updateInvoice(id: string, payload: InvoiceMgmt.IUpdatePayload) {
	return unwrap<InvoiceMgmt.IInvoice>(axios.patch(`${BASE}/${id}`, payload));
}

export function finalizeInvoice(id: string) {
	return unwrap<InvoiceMgmt.IInvoice>(axios.post(`${BASE}/${id}/finalize`));
}

export function markPaidInvoice(id: string, payload: InvoiceMgmt.IMarkPaidPayload = {}) {
	return unwrap<InvoiceMgmt.IInvoice>(axios.post(`${BASE}/${id}/mark-paid`, payload));
}

export function cancelInvoice(id: string, reason: string) {
	return unwrap<InvoiceMgmt.IInvoice>(axios.post(`${BASE}/${id}/cancel`, { reason }));
}
