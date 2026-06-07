// Gọi BE module reports (dashboard/overview + reports/*). Tất cả chỉ ADMIN.
// BE wrap envelope { success, data } (+ meta khi paginate) — unwrap như các service khác.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = authBaseUrl;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<T> {
	const res = await p;
	const body = res.data as any;
	return body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
}

// RP-01 — tổng quan dashboard (1 call).
export function getDashboardOverview() {
	return unwrap<ReportMgmt.IDashboardOverview>(axios.get(`${BASE}/dashboard/overview`));
}

// RP-02/RP-03 — doanh thu theo kỳ (+ lọc serviceId).
export function getRevenueReport(query: ReportMgmt.IRevenueQuery) {
	return unwrap<ReportMgmt.IRevenueReport>(axios.get(`${BASE}/reports/revenue`, { params: query }));
}

// RP-04 — thống kê theo dịch vụ.
export function getReportByService(query: ReportMgmt.IRevenueQuery) {
	return unwrap<ReportMgmt.IServiceRevenueRow[]>(axios.get(`${BASE}/reports/by-service`, { params: query }));
}

// RP-05 — thống kê theo nhân viên.
export function getReportByStaff(query: ReportMgmt.IRevenueQuery) {
	return unwrap<ReportMgmt.IStaffStats[]>(axios.get(`${BASE}/reports/by-staff`, { params: query }));
}

// RP-06 — chi tiết hoá đơn của 1 dịch vụ trong kỳ (paginate).
export async function getServiceInvoices(query: ReportMgmt.IServiceInvoicesQuery) {
	const res = await axios.get(`${BASE}/reports/service-invoices`, { params: query });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as ReportMgmt.IServiceInvoiceRow[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as ReportMgmt.IPaginationMeta,
	};
}

// RP-07 — export Excel (.xlsx). BE trả binary thuần (KHÔNG envelope) → responseType blob.
export async function exportRevenueExcel(query: ReportMgmt.IRevenueQuery): Promise<void> {
	const res = await axios.get(`${BASE}/reports/revenue/export`, {
		params: query,
		responseType: 'blob',
	});
	const blob = new Blob([res.data], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	});
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = `bao-cao-doanh-thu-${query.fromDate}-${query.toDate}.xlsx`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}

// RP-07B — export PDF. BE trả binary (KHÔNG envelope) → blob, mở tab mới để xem/in.
export async function exportRevenuePdf(query: ReportMgmt.IRevenueQuery): Promise<void> {
	const res = await axios.get(`${BASE}/reports/revenue/export-pdf`, {
		params: query,
		responseType: 'blob',
	});
	const blob = new Blob([res.data], { type: 'application/pdf' });
	const url = window.URL.createObjectURL(blob);
	const win = window.open(url, '_blank');
	// Trình duyệt chặn popup → fallback tải file.
	if (!win) {
		const a = document.createElement('a');
		a.href = url;
		a.download = `bao-cao-doanh-thu-${query.fromDate}-${query.toDate}.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}
	// Giải phóng URL sau khi tab đã load.
	setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}
