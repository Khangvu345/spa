// Types module Staff-Service-Assignment — khớp BE /staff-service-assignments.
declare namespace AssignMgmt {
	export interface IStaffBrief {
		id: string;
		fullName: string;
		role: Auth.TStaffRole;
	}

	export interface IServiceBrief {
		id: string;
		code: string;
		name: string;
		price: number;
	}

	export interface IAssignment {
		id: string;
		staffId: string;
		serviceId: string;
		commissionRate: number;
		assignedSince: string;
		isActive: boolean;
		note: string;
		staff?: IStaffBrief;
		service?: IServiceBrief;
		createdAt: string;
		updatedAt: string;
	}

	export interface IQuery {
		staffId?: string;
		serviceId?: string;
		isActive?: boolean;
	}

	export interface ICreatePayload {
		staffId: string;
		serviceId: string;
		commissionRate: number;
		assignedSince?: string;
		note?: string;
	}

	export interface IUpdatePayload {
		commissionRate?: number;
		assignedSince?: string;
		note?: string;
		isActive?: boolean;
	}
}
