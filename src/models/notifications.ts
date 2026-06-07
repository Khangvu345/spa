// Thông báo (chuông) — KHÔNG cần BE làm endpoint riêng.
// Poll các endpoint SẴN CÓ mỗi 45s, gom thành danh sách noti, đánh dấu đã đọc
// bằng localStorage (theo id). 4 nguồn:
//  - Khách đặt lịch online  (bookings, source=LANDING_PAGE)
//  - Tồn kho thấp           (/stock/low-stock)
//  - Lịch hẹn sắp tới hôm nay (bookings CONFIRMED, ≤60' tới)
//  - Hoá đơn chờ thanh toán (invoices PENDING_PAYMENT)
import { useCallback, useEffect, useState } from 'react';
import { useModel } from 'umi';
import moment from 'moment';
import * as bookingsApi from '@/services/Bookings/api';
import * as stockApi from '@/services/StockLedger/api';
import * as invoicesApi from '@/services/Invoices/api';
import { fmtQty } from '@/services/Materials/constant';

export type TNotiType = 'booking' | 'lowstock' | 'upcoming' | 'invoice';

export type AppNoti = {
	id: string;
	type: TNotiType;
	title: string;
	desc: string;
	time: string; // ISO — để sắp xếp
	timeLabel: string;
	link: string;
};

const LS_KEY = 'spa_noti_read_ids';
const POLL_MS = 45000;
const TOKEN_KEY = 'spa_access_token';

const loadRead = (): string[] => {
	try {
		return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
	} catch {
		return [];
	}
};
const saveRead = (ids: string[]) => {
	try {
		localStorage.setItem(LS_KEY, JSON.stringify(ids.slice(-300)));
	} catch {
		/* ignore */
	}
};

export default () => {
	const { initialState } = useModel('@@initialState');
	const role = (initialState as any)?.currentUser?.role;
	const [items, setItems] = useState<AppNoti[]>([]);
	const [readIds, setReadIds] = useState<string[]>(loadRead);

	const refresh = useCallback(async () => {
		// Chưa đăng nhập → không poll (tránh 401 spam).
		if (!localStorage.getItem(TOKEN_KEY)) {
			setItems([]);
			return;
		}

		const now = moment();
		const todayStart = now.clone().startOf('day').format('YYYY-MM-DD');
		const todayEnd = now.clone().endOf('day').format('YYYY-MM-DD');

		const sources = await Promise.allSettled([
			// 1) Khách đặt lịch online
			bookingsApi
				.getBookings({ limit: 30, sortBy: 'createdAt', sortOrder: 'desc' } as any)
				.then((r: any) =>
					(r.items || [])
						.filter((b: any) => b.source === 'LANDING_PAGE')
						.slice(0, 15)
						.map(
							(b: any): AppNoti => ({
								id: `booking-${b.id}`,
								type: 'booking',
								title: 'Khách đặt lịch online',
								desc: `${b.customerSnapshot?.fullName} · ${b.serviceSnapshot?.name} — ${moment(
									b.scheduledStart,
								).format('HH:mm DD/MM')}`,
								time: b.createdAt,
								timeLabel: moment(b.createdAt).fromNow(),
								link: '/lich-hen',
							}),
						),
				),
			// 2) Tồn kho thấp — endpoint chỉ ADMIN; role khác bỏ qua để tránh 403
			// (interceptor axios sẽ bắn toast "Không có quyền" với OPERATOR).
			role === 'ADMIN'
				? stockApi.getLowStock().then((r: any) =>
						(r.data || []).map(
							(m: any): AppNoti => ({
								id: `lowstock-${m.materialId}`,
								type: 'lowstock',
								title: 'Tồn kho thấp',
								desc: `${m.materialName} · còn ${fmtQty(m.stockQuantity)}/${fmtQty(m.reorderLevel)} ${m.unit}`,
								time: now.toISOString(),
								timeLabel: 'Hiện tại',
								link: '/vat-lieu',
							}),
						),
				  )
				: Promise.resolve([] as AppNoti[]),
			// 3) Lịch hẹn sắp tới hôm nay (CONFIRMED, ≤ 60 phút tới)
			bookingsApi
				.getBookings({ fromDate: todayStart, toDate: todayEnd, limit: 50 } as any)
				.then((r: any) =>
					(r.items || [])
						.filter((b: any) => b.status === 'CONFIRMED')
						.filter((b: any) => {
							const diff = moment(b.scheduledStart).diff(now, 'minutes');
							return diff >= 0 && diff <= 60;
						})
						.map(
							(b: any): AppNoti => ({
								id: `upcoming-${b.id}`,
								type: 'upcoming',
								title: 'Lịch hẹn sắp tới',
								desc: `${b.customerSnapshot?.fullName} · ${b.serviceSnapshot?.name} — ${moment(
									b.scheduledStart,
								).format('HH:mm')}`,
								time: b.scheduledStart,
								timeLabel: moment(b.scheduledStart).fromNow(),
								link: '/lich-hen',
							}),
						),
				),
			// 4) Hoá đơn chờ thanh toán
			invoicesApi
				.getInvoices({
					status: 'PENDING_PAYMENT',
					limit: 20,
					sortBy: 'createdAt',
					sortOrder: 'desc',
				} as any)
				.then((r: any) =>
					(r.items || []).map(
						(inv: any): AppNoti => ({
							id: `invoice-${inv.id}`,
							type: 'invoice',
							title: 'Hoá đơn chờ thanh toán',
							desc: `${inv.invoiceCode} · ${(inv.totalAmount ?? 0).toLocaleString('vi-VN')}đ`,
							time: inv.createdAt,
							timeLabel: moment(inv.createdAt).fromNow(),
							link: '/thu-ngan',
						}),
					),
				),
		]);

		const all = sources.flatMap((s) => (s.status === 'fulfilled' ? (s.value as AppNoti[]) : []));
		all.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
		setItems(all.slice(0, 40));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [role]);

	useEffect(() => {
		refresh();
		const t = window.setInterval(refresh, POLL_MS);
		return () => window.clearInterval(t);
	}, [refresh]);

	const readSet = new Set(readIds);
	const unreadCount = items.filter((n) => !readSet.has(n.id)).length;

	const markAllRead = useCallback(() => {
		setReadIds((prev) => {
			const merged = Array.from(new Set([...prev, ...items.map((n) => n.id)]));
			saveRead(merged);
			return merged;
		});
	}, [items]);

	return { items, unreadCount, readIds, markAllRead, refresh };
};
