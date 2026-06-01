// Types module BOM (Service-Material) — khớp BE /bom.
declare namespace BomMgmt {
	export interface IServiceBrief {
		id: string;
		code: string;
		name: string;
	}

	export interface IMaterialBrief {
		id: string;
		code: string;
		name: string;
		unit: string;
		type: 'CONSUMABLE' | 'DEPRECIATION';
		stockQuantity: number;
	}

	export interface IBom {
		id: string;
		serviceId: string;
		materialId: string;
		standardQuantity: number;
		note: string;
		isActive: boolean;
		service?: IServiceBrief;
		material?: IMaterialBrief;
		createdAt: string;
		updatedAt: string;
	}

	export interface IQuery {
		serviceId?: string;
		materialId?: string;
		isActive?: boolean;
	}

	export interface ICreatePayload {
		serviceId: string;
		materialId: string;
		standardQuantity: number;
		note?: string;
	}

	export interface IUpdatePayload {
		standardQuantity?: number;
		note?: string;
		isActive?: boolean;
	}
}
