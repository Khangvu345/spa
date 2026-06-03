// Types module Quản lý vật liệu — khớp BE /materials.
declare namespace MaterialMgmt {
	export type TType = 'CONSUMABLE' | 'DEPRECIATION';

	export interface ISupplierBrief {
		id: string;
		name: string;
	}

	export interface IMaterial {
		id: string;
		code: string;
		name: string;
		description?: string;
		unit: string;
		type: TType;
		unitPrice: number;
		stockQuantity: number;
		reorderLevel: number;
		expectedUsesPerUnit: number;
		supplierId: string;
		supplier?: ISupplierBrief;
		isActive: boolean;
		createdAt?: string;
		updatedAt?: string;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
		type?: TType;
		supplierId?: string;
		sortBy?: 'name' | 'stockQuantity' | 'createdAt';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: IMaterial[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}

	export interface ICreatePayload {
		code: string;
		name: string;
		description?: string;
		unit: string;
		type: TType;
		unitPrice: number;
		stockQuantity?: number;
		reorderLevel?: number;
		expectedUsesPerUnit?: number;
		supplierId: string;
	}

	export interface IUpdatePayload extends Partial<ICreatePayload> {
		isActive?: boolean;
	}
}
