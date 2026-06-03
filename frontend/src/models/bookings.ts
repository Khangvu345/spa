// State + logic cho Booking.
import { useCallback, useState } from 'react';
import { message } from 'antd';
import * as api from '@/services/Bookings/api';
import { DEFAULT_PAGE_SIZE } from '@/services/Bookings/constant';

export default () => {
	const [list, setList] = useState<BookingMgmt.IBooking[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [detail, setDetail] = useState<BookingMgmt.IBooking | null>(null);
	const [query, setQuery] = useState<BookingMgmt.IQuery>({
		page: 1,
		limit: DEFAULT_PAGE_SIZE,
		sortBy: 'scheduledStart',
		sortOrder: 'asc',
	});

	const fetch = useCallback(async (override?: Partial<BookingMgmt.IQuery>) => {
		setLoading(true);
		try {
			const next = { ...query, ...(override ?? {}) };
			setQuery(next);
			const res = await api.getBookings(next);
			setList(res.items);
			setTotal(res.meta.total);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được danh sách lịch hẹn');
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadDetail = useCallback(async (id: string) => {
		try {
			const res = await api.getBooking(id);
			setDetail(res.data);
			return res.data;
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được lịch hẹn');
			return null;
		}
	}, []);

	const wrapAction = useCallback(
		async <T,>(fn: () => Promise<T>, successMsg: string, failMsg: string) => {
			setSubmitting(true);
			try {
				const r = await fn();
				message.success(successMsg);
				return r;
			} catch (e: any) {
				const msg = e?.response?.data?.message;
				message.error(Array.isArray(msg) ? msg.join(', ') : msg || failMsg);
				return null;
			} finally {
				setSubmitting(false);
			}
		},
		[],
	);

	const createPublic = useCallback(
		(payload: BookingMgmt.ICreatePublicPayload) =>
			wrapAction(() => api.createPublic(payload), 'Đặt lịch thành công', 'Đặt lịch thất bại'),
		[wrapAction],
	);

	const createOperator = useCallback(
		(payload: BookingMgmt.ICreateOperatorPayload) =>
			wrapAction(() => api.createOperator(payload), 'Tạo lịch hẹn thành công', 'Tạo lịch hẹn thất bại'),
		[wrapAction],
	);

	const update = useCallback(
		(id: string, payload: BookingMgmt.IUpdatePayload) =>
			wrapAction(() => api.updateBooking(id, payload), 'Cập nhật thành công', 'Cập nhật thất bại'),
		[wrapAction],
	);

	const checkIn = useCallback(
		(id: string) =>
			wrapAction(() => api.checkInBooking(id), 'Đã check-in & tạo phiếu DV', 'Check-in thất bại'),
		[wrapAction],
	);

	const cancel = useCallback(
		(id: string, reason: string) =>
			wrapAction(() => api.cancelBooking(id, reason), 'Đã huỷ lịch', 'Huỷ lịch thất bại'),
		[wrapAction],
	);

	const noShow = useCallback(
		(id: string) =>
			wrapAction(() => api.noShowBooking(id), 'Đã đánh dấu khách không đến', 'Thao tác thất bại'),
		[wrapAction],
	);

	return {
		list,
		total,
		loading,
		submitting,
		detail,
		query,
		fetch,
		loadDetail,
		setDetail,
		createPublic,
		createOperator,
		update,
		checkIn,
		cancel,
		noShow,
	};
};
