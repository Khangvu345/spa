// Gọi BE /payrolls — wire đủ 9 endpoint (8 nghiệp vụ + export PDF).
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/payrolls`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

// Danh sách phiếu lương (paginate). Response BE phẳng: { success, data: [...], meta }.
export async function getPayrolls(query: PayrollMgmt.IQuery = {}) {
	const res = await axios.get(BASE, { params: query });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as PayrollMgmt.IPayroll[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 }) as PayrollMgmt.IPagedResponse['meta'],
	};
}

// Phiếu lương của chính mình.
export async function getMyPayrolls(query: PayrollMgmt.IQuery = {}) {
	const res = await axios.get(`${BASE}/me`, { params: query });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as PayrollMgmt.IPayroll[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 }) as PayrollMgmt.IPagedResponse['meta'],
	};
}

export function getPayroll(id: string) {
	return unwrap<PayrollMgmt.IPayroll>(axios.get(`${BASE}/${id}`));
}

// Tính thử (chưa lưu) lương 1 NV cho 1 tháng.
export function previewPayroll(params: PayrollMgmt.IPreviewParams) {
	return unwrap<PayrollMgmt.IPreview>(axios.get(`${BASE}/preview`, { params }));
}

export function finalizePayroll(payload: PayrollMgmt.IFinalizePayload) {
	return unwrap<PayrollMgmt.IPayroll>(axios.post(`${BASE}/finalize`, payload));
}

export function finalizeBatchPayroll(payload: PayrollMgmt.IFinalizeBatchPayload) {
	return unwrap<PayrollMgmt.IBatchResult>(axios.post(`${BASE}/finalize-batch`, payload));
}

export function markPaidPayroll(id: string) {
	return unwrap<PayrollMgmt.IPayroll>(axios.post(`${BASE}/${id}/mark-paid`));
}

export function cancelPayroll(id: string, reason: string) {
	return unwrap<PayrollMgmt.IPayroll>(axios.post(`${BASE}/${id}/cancel`, { reason }));
}

// Xuất PDF — BE trả binary (KHÔNG wrap envelope). Lấy blob rồi mở tab mới.
export async function exportPayrollPdf(id: string, payrollCode?: string) {
	const res = await axios.get(`${BASE}/${id}/export-pdf`, { responseType: 'blob' });
	const blob = new Blob([res.data as any], { type: 'application/pdf' });
	const url = window.URL.createObjectURL(blob);
	const win = window.open(url, '_blank');
	// Trình duyệt chặn popup → fallback tải file.
	if (!win) {
		const a = document.createElement('a');
		a.href = url;
		a.download = `payroll-${payrollCode ?? id}.pdf`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
	// Giải phóng URL sau khi tab đã load.
	setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}
