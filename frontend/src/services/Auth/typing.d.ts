// Types cho module Auth — khớp với BE NestJS (StaffRole / AccountStatus enums).
declare namespace Auth {
	export type TStaffRole = 'ADMIN' | 'OPERATOR' | 'STAFF';
	export type TAccountStatus = 'ACTIVE' | 'LOCKED' | 'DELETED';
	export type TWorkStatus = 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';

	export interface IStaff {
		id: string;
		fullName: string;
		email: string;
		phone: string;
		role: TStaffRole;
		baseSalary: number;
		workStatus: TWorkStatus;
		accountStatus: TAccountStatus;
		startedAt: string;
		lockedAt?: string | null;
		mustChangePassword: boolean;
	}

	export interface ILoginPayload {
		email: string;
		password: string;
	}

	export interface IChangePasswordPayload {
		currentPassword: string;
		newPassword: string;
	}

	export interface IAuthResponse {
		user: IStaff;
		accessToken: string;
	}

	export interface IBackendError {
		code?: string;
		message?: string;
		statusCode?: number;
	}
}
