// Types module Bảng lương — khớp BE /payrolls.
declare namespace PayrollMgmt {
	export type TStatus = 'FINALIZED' | 'PAID' | 'CANCELLED';

	export interface IStaffSnapshot {
		fullName: string;
		role: string;
	}

	export interface ICommissionBreakdown {
		serviceId: string;
		serviceName: string;
		serviceCount: number;
		totalCommission: number;
	}

	// Phiếu lương đã lưu (FINALIZED / PAID / CANCELLED).
	export interface IPayroll {
		id: string;
		payrollCode: string;
		periodYear: number;
		periodMonth: number;
		staffId: string;
		staffSnapshot: IStaffSnapshot;
		baseSalary: number;
		totalCommission: number;
		adjustment: number;
		totalIncome: number;
		commissionBreakdown: ICommissionBreakdown[];
		sourceInvoiceIds: string[];
		invoiceCount: number;
		status: TStatus;
		finalizedBy: string;
		finalizedByName: string;
		finalizedAt: string;
		paidAt: string | null;
		paidBy: string | null;
		cancelledAt: string | null;
		cancelledBy: string | null;
		cancelReason: string | null;
		note: string;
		createdAt: string;
		updatedAt: string;
	}

	// Kết quả preview — tính live, KHÔNG lưu DB. Không có id/status/audit.
	export interface IPreview {
		staffId: string;
		staffSnapshot: IStaffSnapshot;
		periodYear: number;
		periodMonth: number;
		baseSalary: number;
		totalCommission: number;
		adjustment: number;
		totalIncome: number;
		commissionBreakdown: ICommissionBreakdown[];
		sourceInvoiceIds: string[];
		invoiceCount: number;
	}

	export interface IBatchResultDetail {
		staffId: string;
		status: 'created' | 'skipped' | 'error';
		payrollCode?: string;
		reason?: string;
	}

	export interface IBatchResult {
		created: number;
		skipped: number;
		details: IBatchResultDetail[];
	}

	export interface IFinalizePayload {
		staffId: string;
		periodYear: number;
		periodMonth: number;
		adjustment?: number;
		note?: string;
	}

	export interface IFinalizeBatchPayload {
		periodYear: number;
		periodMonth: number;
		onlyWithCommission?: boolean;
	}

	export interface IPreviewParams {
		staffId: string;
		periodYear: number;
		periodMonth: number;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		periodYear?: number;
		periodMonth?: number;
		staffId?: string;
		status?: TStatus;
		sortBy?: 'finalizedAt' | 'totalIncome';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: IPayroll[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}
}
