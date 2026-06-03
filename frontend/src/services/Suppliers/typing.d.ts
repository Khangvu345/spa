// Types module Quản lý nhà cung cấp — khớp BE /suppliers.
declare namespace SupplierMgmt {
	export interface ISupplier {
		id: string;
		name: string;
		contactPerson: string;
		phone: string;
		email?: string;
		address: string;
		taxCode?: string;
		note?: string;
		isActive: boolean;
		createdAt?: string;
		updatedAt?: string;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
		sortBy?: 'name' | 'createdAt';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: ISupplier[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}

	export interface ICreatePayload {
		name: string;
		contactPerson: string;
		phone: string;
		email?: string;
		address: string;
		taxCode?: string;
		note?: string;
		isActive?: boolean;
	}

	export interface IUpdatePayload extends Partial<ICreatePayload> {}
}
