// Types khớp BE module reports (report-response.dto.ts). Tất cả endpoint chỉ ADMIN.
declare namespace ReportMgmt {
	// GET /dashboard/overview — số liệu tổng quan 1 call (RP-01).
	export interface IDashboardOverview {
		revenue: { thisMonth: number; today: number };
		bookings: { total: number; byStatus: Record<string, number> };
		servicesCompleted: number;
		lowStockCount: number;
		topServices: IServiceRevenueRow[];
	}

	// Dòng thống kê theo dịch vụ (by-service + breakdown trong revenue + topServices).
	export interface IServiceRevenueRow {
		serviceId: string;
		serviceName: string;
		count: number; // Σ items.quantity
		revenue: number; // Σ items.subtotal
	}

	// GET /reports/revenue (RP-02/RP-03).
	export interface IRevenueReport {
		period: { fromDate: string; toDate: string };
		serviceId: string | null;
		totalRevenue: number; // Σ totalAmount (đã trừ giảm giá)
		invoiceCount: number; // số HĐ PAID trong kỳ
		breakdown: IServiceRevenueRow[];
		note: string;
	}

	// GET /reports/by-staff (RP-05).
	export interface IStaffStats {
		staffId: string;
		staffName: string;
		serviceCount: number; // Σ items.quantity
		revenueGenerated: number; // Σ items.subtotal
		totalCommission: number; // Σ items.commissionAmount
	}

	// GET /reports/service-invoices (RP-06).
	export interface IServiceInvoiceRow {
		invoiceId: string;
		invoiceCode: string;
		customerName: string;
		paidAt: string;
		serviceName: string;
		quantity: number;
		subtotal: number;
	}

	export interface IPeriodQuery {
		fromDate: string; // YYYY-MM-DD
		toDate: string; // YYYY-MM-DD
	}

	export interface IRevenueQuery extends IPeriodQuery {
		serviceId?: string;
	}

	export interface IServiceInvoicesQuery extends IPeriodQuery {
		serviceId: string;
		page?: number;
		limit?: number;
	}

	export interface IPaginationMeta {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}
}
