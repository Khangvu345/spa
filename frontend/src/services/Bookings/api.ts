// Gọi BE /bookings.
import axios from '@/utils/axios';
import { authBaseUrl } from '@/services/Auth/api';

const BASE = `${authBaseUrl}/bookings`;
const OTP_BASE = `${authBaseUrl}/public/bookings`;

type Envelope<T> = { success: boolean; data: T };

async function unwrap<T>(p: Promise<{ data: Envelope<T> | T }>): Promise<{ data: T }> {
	const res = await p;
	const body = res.data as any;
	const data: T = body && typeof body === 'object' && 'success' in body && 'data' in body ? body.data : body;
	return { ...res, data };
}

export function getAvailability(serviceId: string, date: string) {
	return unwrap<BookingMgmt.IAvailability>(
		axios.get(`${BASE}/availability`, { params: { serviceId, date } }),
	);
}

export function getAvailabilityGrid(serviceId: string, date: string) {
	return unwrap<BookingMgmt.IAvailabilityGrid>(
		axios.get(`${BASE}/availability/grid`, { params: { serviceId, date } }),
	);
}

export function createPublic(payload: BookingMgmt.ICreatePublicPayload) {
	return unwrap<BookingMgmt.IBooking>(axios.post(BASE, payload));
}

// Luồng OTP đặt lịch (landing page) — endpoint @Public ở /public/bookings.
export function requestBookingOtp(payload: BookingMgmt.IRequestOtpPayload) {
	return unwrap<BookingMgmt.IBooking>(axios.post(`${OTP_BASE}/request-otp`, payload));
}

export function verifyBookingOtp(bookingId: string, code: string) {
	return unwrap<{ confirmed: boolean }>(axios.post(`${OTP_BASE}/verify-otp`, { bookingId, code }));
}

export function resendBookingOtp(bookingId: string) {
	return unwrap<{ resent: boolean }>(axios.post(`${OTP_BASE}/resend-otp`, { bookingId }));
}

export function createOperator(payload: BookingMgmt.ICreateOperatorPayload) {
	return unwrap<BookingMgmt.IBooking>(axios.post(`${BASE}/operator`, payload));
}

export async function getBookings(query: BookingMgmt.IQuery = {}) {
	const res = await axios.get(BASE, { params: query });
	const body: any = res.data;
	return {
		items: (body?.data ?? []) as BookingMgmt.IBooking[],
		meta: (body?.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 }) as BookingMgmt.IPagedResponse['meta'],
	};
}

export function getBooking(id: string) {
	return unwrap<BookingMgmt.IBooking>(axios.get(`${BASE}/${id}`));
}

export function updateBooking(id: string, payload: BookingMgmt.IUpdatePayload) {
	return unwrap<BookingMgmt.IBooking>(axios.patch(`${BASE}/${id}`, payload));
}

export function checkInBooking(id: string) {
	return unwrap<BookingMgmt.ICheckInResponse>(axios.post(`${BASE}/${id}/check-in`));
}

export function cancelBooking(id: string, reason: string) {
	return unwrap<BookingMgmt.IBooking>(axios.post(`${BASE}/${id}/cancel`, { reason }));
}

export function noShowBooking(id: string) {
	return unwrap<BookingMgmt.IBooking>(axios.post(`${BASE}/${id}/no-show`));
}
