// Types cho module Quản lý nhân viên — khớp với BE NestJS Employees module.
declare namespace Employees {
	export interface IEmployee extends Auth.IStaff {
		createdAt?: string;
		updatedAt?: string;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		search?: string;
		role?: Auth.TStaffRole;
		workStatus?: Auth.TWorkStatus;
		sortBy?: 'fullName' | 'startedAt';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: IEmployee[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}

	export interface ICreatePayload {
		fullName: string;
		phone: string;
		email: string;
		password: string;
		role: Auth.TStaffRole;
		baseSalary: number;
		startedAt: string;
	}

	export interface IUpdatePayload {
		fullName?: string;
		phone?: string;
		role?: Auth.TStaffRole;
		baseSalary?: number;
		workStatus?: Auth.TWorkStatus;
		startedAt?: string;
	}
}
