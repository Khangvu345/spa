// Types module ServiceOrders — khớp BE /service-orders.
declare namespace SvcOrderMgmt {
	export type TStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CANCELLED';
	export type TSortField = 'createdAt' | 'totalAmount';
	export type TSortOrder = 'asc' | 'desc';

	export interface ICustomerBrief {
		id: string;
		fullName: string;
		phone: string;
	}

	export interface IItem {
		id: string;
		serviceId: string;
		serviceCode: string;
		serviceName: string;
		unitPrice: number;
		quantity: number;
		subtotal: number;
		staffId: string;
		staffName: string;
		commissionRate: number;
		note: string;
		addedAt: string;
	}

	export interface IServiceOrder {
		id: string;
		orderCode: string;
		customerId: string;
		customer?: ICustomerBrief;
		items: IItem[];
		itemsSubtotal: number;
		extraCharge: number;
		totalAmount: number;
		status: TStatus;
		note: string;
		createdBy: string;
		createdByName: string;
		bookingId: string | null;
		startedAt: string | null;
		completedAt: string | null;
		invoicedAt: string | null;
		cancelledAt: string | null;
		createdAt: string;
		updatedAt: string;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		customerId?: string;
		status?: TStatus;
		fromDate?: string;
		toDate?: string;
		sortBy?: TSortField;
		sortOrder?: TSortOrder;
	}

	export interface ICreatePayload {
		customerId: string;
		note?: string;
		bookingId?: string | null;
	}

	export interface IUpdatePayload {
		note?: string;
		extraCharge?: number;
		status?: 'IN_PROGRESS';
	}

	export interface IAddItemPayload {
		serviceId: string;
		quantity?: number;
		note?: string;
	}

	export interface IUpdateItemPayload {
		quantity?: number;
		note?: string;
	}

	export interface IPagedMeta {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	}
}
