// Gọi BE /stock — nhập / xuất / lịch sử / cảnh báo tồn thấp.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/stock`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export function stockIn(payload: StockLedger.IStockInPayload) {
	return unwrap<StockLedger.ILedgerEntry>(axios.post(`${BASE}/in`, payload));
}

export function stockOutManual(payload: StockLedger.IStockOutManualPayload) {
	return unwrap<StockLedger.ILedgerEntry>(axios.post(`${BASE}/out/manual`, payload));
}

export async function getLedger(query: StockLedger.IQuery = {}) {
	const res = await axios.get(`${BASE}/ledger`, { params: query });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as StockLedger.ILedgerEntry[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as StockLedger.IPagedResponse['meta'],
	};
}

export async function getLedgerByMaterial(materialId: string, query: StockLedger.IQuery = {}) {
	const res = await axios.get(`${BASE}/ledger/by-material/${materialId}`, { params: query });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as StockLedger.ILedgerEntry[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as StockLedger.IPagedResponse['meta'],
	};
}

export function getLedgerByReference(type: StockLedger.TReferenceType, id: string) {
	return unwrap<StockLedger.ILedgerEntry[]>(axios.get(`${BASE}/ledger/by-reference/${type}/${id}`));
}

export function getSummary(fromDate?: string, toDate?: string) {
	return unwrap<StockLedger.ISummary>(axios.get(`${BASE}/summary`, { params: { fromDate, toDate } }));
}

export function getLowStock() {
	return unwrap<StockLedger.ILowStockItem[]>(axios.get(`${BASE}/low-stock`));
}
