// Types module Quản lý dịch vụ — khớp BE /services.
declare namespace SvcMgmt {
	export type TCategory = 'SWEDISH' | 'HOT_STONE' | 'THAI' | 'FOOT' | 'NECK_SHOULDER' | 'AROMA';

	export interface IService {
		id: string;
		code: string;
		name: string;
		category: TCategory;
		unitPrice: number;
		durationMinutes: number;
		bufferMinutes: number;
		slotsRequired: number;
		description?: string;
		imageUrl?: string | null;
		isActive: boolean;
		createdAt?: string;
		updatedAt?: string;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		search?: string;
		category?: TCategory;
		isActive?: boolean;
		minPrice?: number;
		maxPrice?: number;
		sortBy?: 'name' | 'unitPrice' | 'createdAt';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: IService[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}

	export interface ICreatePayload {
		code: string;
		name: string;
		category: TCategory;
		unitPrice: number;
		durationMinutes: number;
		bufferMinutes?: number;
		slotsRequired?: number;
		description?: string;
		imageUrl?: string;
		isActive?: boolean;
	}

	export interface IUpdatePayload extends Partial<ICreatePayload> {}
}
