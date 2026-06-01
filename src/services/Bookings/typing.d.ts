// Types module Booking — khớp BE /bookings.
declare namespace BookingMgmt {
	export type TStatus =
		| 'PENDING_OTP'
		| 'CONFIRMED'
		| 'CHECKED_IN'
		| 'IN_PROGRESS'
		| 'COMPLETED'
		| 'CANCELLED'
		| 'NO_SHOW';
	export type TSource = 'LANDING_PAGE' | 'OPERATOR';

	export interface ICustomerSnapshot {
		fullName: string;
		phone: string;
		email: string;
	}

	export interface IServiceSnapshot {
		code: string;
		name: string;
		price: number;
		durationMinutes: number;
		cleanupMinutes: number;
	}

	export interface IStaffSnapshot {
		fullName: string;
	}

	export interface ICustomerLite {
		id: string;
		fullName: string;
		phone: string;
		email: string;
	}

	export interface IServiceLite {
		id: string;
		code: string;
		name: string;
		price: number;
	}

	export interface IBooking {
		id: string;
		bookingCode: string;
		customerId: string;
		serviceId: string;
		staffId: string;
		customerSnapshot: ICustomerSnapshot;
		serviceSnapshot: IServiceSnapshot;
		staffSnapshot: IStaffSnapshot;
		scheduledStart: string;
		scheduledEnd: string;
		status: TStatus;
		source: TSource;
		otpExpiresAt: string | null;
		otpAttempts: number;
		verifiedAt: string | null;
		note: string;
		serviceOrderId: string | null;
		createdBy: string | null;
		cancelledAt: string | null;
		cancelledBy: string | null;
		cancelReason: string | null;
		customer?: ICustomerLite;
		service?: IServiceLite;
		createdAt: string;
		updatedAt: string;
	}

	export interface ICheckInResponse {
		booking: IBooking;
		serviceOrder: SvcOrderMgmt.IServiceOrder;
	}

	export interface IAvailability {
		date: string;
		serviceId: string;
		serviceName: string;
		staffName: string;
		suggestedSlots: string[];
	}

	export interface ISlotInfo {
		time: string;
		status: 'FREE' | 'BUSY';
		bookingId?: string;
	}

	export interface IAvailabilityGrid {
		date: string;
		serviceId: string;
		slots: ISlotInfo[];
	}

	export interface ICreatePublicPayload {
		serviceId: string;
		scheduledStart: string;
		fullName: string;
		phone: string;
		email?: string;
		note?: string;
	}

	// Đặt lịch qua OTP email: email bắt buộc (BE gửi mã về email này).
	export interface IRequestOtpPayload {
		serviceId: string;
		scheduledStart: string;
		fullName: string;
		phone: string;
		email: string;
		note?: string;
	}

	export interface ICreateOperatorPayload {
		customerId: string;
		serviceId: string;
		scheduledStart: string;
		note?: string;
	}

	export interface IUpdatePayload {
		note?: string;
		status?: 'IN_PROGRESS' | 'COMPLETED';
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		customerId?: string;
		staffId?: string;
		status?: TStatus;
		search?: string;
		fromDate?: string;
		toDate?: string;
		sortBy?: 'scheduledStart' | 'createdAt';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: IBooking[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}
}
