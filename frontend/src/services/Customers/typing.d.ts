// Types module Quản lý khách hàng — khớp BE /customers.
declare namespace CustomerMgmt {
	export type TSource = 'WALK_IN' | 'ONLINE_BOOKING' | 'MANUAL';

	export interface ICustomer {
		id: string;
		fullName: string;
		phone: string;
		email?: string;
		source: TSource;
		note?: string;
		phoneVerified: boolean;
		emailVerified: boolean;
		lastVerifiedAt: string | null;
		isActive: boolean;
		createdAt?: string;
		updatedAt?: string;
	}

	export interface IFindOrCreateResult extends ICustomer {
		wasCreated: boolean;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		search?: string;
		source?: TSource;
		isActive?: boolean;
		sortBy?: 'fullName' | 'createdAt';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: ICustomer[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}

	export interface ICreatePayload {
		fullName: string;
		phone: string;
		email?: string;
		source?: TSource;
		note?: string;
	}

	export interface IFindOrCreatePayload {
		fullName: string;
		phone: string;
		email?: string;
		source?: TSource;
	}

	export interface IUpdatePayload extends Partial<ICreatePayload> {}
}
