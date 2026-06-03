// Types module Hoá đơn — khớp BE /invoices.
declare namespace InvoiceMgmt {
	export type TStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';
	export type TPaymentMethod = 'CASH' | 'VNPAY';

	export interface ICustomerBrief {
		id: string;
		fullName: string;
		phone: string;
	}

	export interface ICustomerSnapshot {
		fullName: string;
		phone: string;
		email: string;
	}

	export interface IItem {
		id: string;
		serviceOrderItemId: string;
		serviceId: string;
		serviceCode: string;
		serviceName: string;
		unitPrice: number;
		quantity: number;
		subtotal: number;
		staffId: string;
		staffName: string;
		commissionRate: number;
		commissionAmount: number;
	}

	export interface IInvoice {
		id: string;
		invoiceCode: string;
		serviceOrderId: string;
		customerId: string;
		customer?: ICustomerBrief;
		customerSnapshot: ICustomerSnapshot;
		items: IItem[];
		itemsSubtotal: number;
		extraCharge: number;
		discountAmount: number;
		totalAmount: number;
		status: TStatus;
		paymentMethod: TPaymentMethod | null;
		createdBy: string;
		createdByName: string;
		paidAt: string | null;
		paidBy: string | null;
		paidByName: string | null;
		cancelledAt: string | null;
		cancelledBy: string | null;
		cancelReason: string | null;
		note: string;
		stockDeducted: boolean;
		createdAt: string;
		updatedAt: string;
	}

	export interface ICreatePayload {
		serviceOrderId: string;
		discountAmount?: number;
		note?: string;
	}

	export interface IUpdatePayload {
		discountAmount?: number;
		note?: string;
	}

	export interface IMarkPaidPayload {
		paymentMethod?: TPaymentMethod;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		customerId?: string;
		status?: TStatus;
		paymentMethod?: TPaymentMethod;
		invoiceCode?: string;
		fromDate?: string;
		toDate?: string;
		sortBy?: 'createdAt' | 'paidAt' | 'totalAmount';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: IInvoice[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}
}
