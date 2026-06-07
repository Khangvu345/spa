import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as bookingsApi from '@/services/Bookings/api';
import * as servicesApi from '@/services/DichVu/api';

export const perks = [
	'Miễn phí tư vấn cho khách lần đầu',
	'Đổi lịch linh hoạt trước 24 giờ',
	'Giảm 10% cho thành viên trên mọi liệu trình',
];

export default () => {
	const [loading, setLoading] = useState(false);
	const [services, setServices] = useState<{ id: string; name: string }[]>([]);
	// Các khung giờ TRỐNG gợi ý cho khách — endpoint public /availability (tối đa 8 slot).
	const [slots, setSlots] = useState<string[]>([]);
	const [loadingSlots, setLoadingSlots] = useState(false);
	// Booking PENDING_OTP đang chờ nhập mã (null = modal OTP đóng).
	const [otpBooking, setOtpBooking] = useState<BookingMgmt.IBooking | null>(null);
	const [verifying, setVerifying] = useState(false);
	const [resending, setResending] = useState(false);

	const loadServices = useCallback(async () => {
		try {
			const items = await servicesApi.getLandingServices(100);
			setServices(items.map((s) => ({ id: (s as any)._id, name: s.name })));
		} catch {
			// silent — landing không cần báo lỗi
		}
	}, []);

	const loadSlots = useCallback(async (serviceId: string, date: string) => {
		if (!serviceId || !date) {
			setSlots([]);
			return;
		}
		setLoadingSlots(true);
		try {
			const res = await bookingsApi.getAvailability(serviceId, date);
			setSlots(res.data.suggestedSlots ?? []);
		} catch (e: any) {
			setSlots([]);
			const msg = e?.response?.data?.message;
			if (msg) message.warning(Array.isArray(msg) ? msg.join(', ') : msg);
		} finally {
			setLoadingSlots(false);
		}
	}, []);

	// Mã lỗi BE (đi qua HttpExceptionFilter) — dò nhiều path để chắc chắn.
	const errorCode = (e: any): string | undefined => {
		const d = e?.response?.data;
		return d?.detail?.errorCode || d?.errorCode || d?.code || d?.detail?.code;
	};

	// Submit form → tạo booking PENDING_OTP + gửi mã OTP qua email, mở modal nhập mã.
	// Trả { ok, conflict }: conflict = true khi slot vừa bị đặt (409) để FE tải lại khung giờ.
	const requestOtp = useCallback(async (payload: BookingMgmt.IRequestOtpPayload) => {
		setLoading(true);
		try {
			const res = await bookingsApi.requestBookingOtp(payload);
			setOtpBooking(res.data);
			return { ok: true, conflict: false, errorMsg: '' };
		} catch (e: any) {
			const code = errorCode(e);
			const conflict = code === 'BOOKING_SLOT_UNAVAILABLE';
			// Map mã lỗi BE → thông báo thân thiện (tiếng Việt có dấu) cho khách.
			let friendly: string;
			if (conflict) {
				friendly = 'Khung giờ vừa chọn đã có người đặt. Vui lòng chọn khung giờ khác.';
			} else if (code === 'BOOKING_OUTSIDE_OPEN_HOURS') {
				friendly = 'Khung giờ nằm ngoài giờ mở cửa (08:00–22:00) hoặc không đủ thời gian cho dịch vụ. Vui lòng chọn lại.';
			} else {
				const raw = e?.response?.data?.message;
				friendly = (Array.isArray(raw) ? raw.join(', ') : raw) || 'Không gửi được mã OTP, vui lòng thử lại.';
			}
			message.error(friendly);
			return { ok: false, conflict, errorMsg: friendly };
		} finally {
			setLoading(false);
		}
	}, []);

	const verifyOtp = useCallback(
		async (code: string) => {
			if (!otpBooking) return { ok: false, error: '', closed: true };
			setVerifying(true);
			try {
				const res = await bookingsApi.verifyBookingOtp(otpBooking.id, code);
				if (res.data?.confirmed) {
					message.success('Xác thực thành công! Lịch hẹn của bạn đã được xác nhận.');
					setOtpBooking(null);
					setSlots([]);
					return { ok: true, error: '', closed: false };
				}
				return { ok: false, error: 'Mã OTP không đúng. Vui lòng kiểm tra và nhập lại.', closed: false };
			} catch (e: any) {
				const code2 = errorCode(e);
				// BE đã huỷ booking khi quá số lần / sai trạng thái → đóng modal, yêu cầu đặt lại.
				if (code2 === 'OTP_MAX_ATTEMPTS_EXCEEDED' || code2 === 'BOOKING_INVALID_STATUS') {
					setOtpBooking(null);
					const error =
						code2 === 'OTP_MAX_ATTEMPTS_EXCEEDED'
							? 'Bạn đã nhập sai mã quá số lần cho phép. Lịch đặt đã bị huỷ, vui lòng đặt lại.'
							: 'Phiên đặt lịch đã kết thúc. Vui lòng đặt lại.';
					message.error(error);
					return { ok: false, error, closed: true };
				}
				const raw = e?.response?.data?.message;
				const error =
					(Array.isArray(raw) ? raw.join(', ') : raw) || 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.';
				message.error(error);
				return { ok: false, error, closed: false };
			} finally {
				setVerifying(false);
			}
		},
		[otpBooking],
	);

	const resendOtp = useCallback(async () => {
		if (!otpBooking) return { ok: false, error: '' };
		setResending(true);
		try {
			await bookingsApi.resendBookingOtp(otpBooking.id);
			message.success('Đã gửi lại mã OTP, vui lòng kiểm tra email.');
			return { ok: true, error: '' };
		} catch (e: any) {
			const raw = e?.response?.data?.message;
			const error = (Array.isArray(raw) ? raw.join(', ') : raw) || 'Không gửi lại được mã, vui lòng thử lại sau.';
			message.error(error);
			return { ok: false, error };
		} finally {
			setResending(false);
		}
	}, [otpBooking]);

	const closeOtp = useCallback(() => setOtpBooking(null), []);

	return {
		loading,
		perks,
		services,
		slots,
		loadingSlots,
		loadServices,
		loadSlots,
		requestOtp,
		verifyOtp,
		resendOtp,
		closeOtp,
		otpBooking,
		verifying,
		resending,
	};
};
