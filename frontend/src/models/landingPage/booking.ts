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
	// Grid toàn bộ khung giờ FREE/BUSY trong ngày (giống modal tạo lịch hẹn của operator).
	const [grid, setGrid] = useState<BookingMgmt.IAvailabilityGrid | null>(null);
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

	const loadGrid = useCallback(async (serviceId: string, date: string) => {
		if (!serviceId || !date) {
			setGrid(null);
			return;
		}
		setLoadingSlots(true);
		try {
			const res = await bookingsApi.getAvailabilityGrid(serviceId, date);
			setGrid(res.data);
		} catch (e: any) {
			setGrid(null);
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
	// Trả { ok, conflict }: conflict = true khi slot vừa bị đặt (409) để FE tải lại grid.
	const requestOtp = useCallback(async (payload: BookingMgmt.IRequestOtpPayload) => {
		setLoading(true);
		try {
			const res = await bookingsApi.requestBookingOtp(payload);
			setOtpBooking(res.data);
			return { ok: true, conflict: false };
		} catch (e: any) {
			const conflict = errorCode(e) === 'BOOKING_SLOT_UNAVAILABLE';
			if (!conflict) {
				// 409 đã có notification toàn cục với message từ BE; lỗi khác mới cần báo thêm.
				const msg = e?.response?.data?.message;
				message.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Không gửi được mã OTP, vui lòng thử lại');
			}
			return { ok: false, conflict };
		} finally {
			setLoading(false);
		}
	}, []);

	const verifyOtp = useCallback(
		async (code: string) => {
			if (!otpBooking) return false;
			setVerifying(true);
			try {
				const res = await bookingsApi.verifyBookingOtp(otpBooking.id, code);
				if (res.data?.confirmed) {
					message.success('Xác thực thành công! Lịch hẹn của bạn đã được xác nhận.');
					setOtpBooking(null);
					setGrid(null);
					return true;
				}
				return false;
			} catch (e: any) {
				// BE đã huỷ booking khi quá số lần / sai trạng thái → đóng modal, yêu cầu đặt lại.
				const code2 = errorCode(e);
				if (code2 === 'OTP_MAX_ATTEMPTS_EXCEEDED' || code2 === 'BOOKING_INVALID_STATUS') {
					setOtpBooking(null);
				}
				return false;
			} finally {
				setVerifying(false);
			}
		},
		[otpBooking],
	);

	const resendOtp = useCallback(async () => {
		if (!otpBooking) return false;
		setResending(true);
		try {
			await bookingsApi.resendBookingOtp(otpBooking.id);
			message.success('Đã gửi lại mã OTP, vui lòng kiểm tra email.');
			return true;
		} catch {
			return false;
		} finally {
			setResending(false);
		}
	}, [otpBooking]);

	const closeOtp = useCallback(() => setOtpBooking(null), []);

	return {
		loading,
		perks,
		services,
		grid,
		loadingSlots,
		loadServices,
		loadGrid,
		requestOtp,
		verifyOtp,
		resendOtp,
		closeOtp,
		otpBooking,
		verifying,
		resending,
	};
};
