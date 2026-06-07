// Aggregator dashboard — đọc data thật từ /service-orders, /customers, /services, /materials
// và compute KPI / chart data client-side.
import * as ordersApi from '@/services/ServiceOrders/api';
import * as customersApi from '@/services/Customers/api';
import * as invoicesApi from '@/services/Invoices/api';
import * as reportsApi from '@/services/Reports/api';

const startOfDay = (d: Date) => {
	const r = new Date(d);
	r.setHours(0, 0, 0, 0);
	return r;
};

const endOfDay = (d: Date) => {
	const r = new Date(d);
	r.setHours(23, 59, 59, 999);
	return r;
};

const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export interface IDashboardData {
	revenueToday: number;
	revenueThisMonth: number;
	revenueYesterday: number;
	ordersToday: number;
	ordersYesterday: number;
	completedToday: number;
	newCustomersToday: number;
	totalCustomers: number;
	lowStockCount: number;
	revenue7days: Dashboard.IRevenueData[];
	statusBreakdown: Dashboard.IAppointmentStatus[];
	recentAppointments: Dashboard.IAppointment[];
	popularServices: Dashboard.IPopularService[];
}

const AVATAR_COLORS = ['#FDA4AF', '#93C5FD', '#A78BFA', '#FCD34D', '#86EFAC', '#F9A8D4', '#FCA5A5'];
const SVC_PALETTE = [
	{ icon: '💆', color: '#c47070', bgColor: '#FFF0F0' },
	{ icon: '✨', color: '#2563EB', bgColor: '#DBEAFE' },
	{ icon: '🔥', color: '#7C3AED', bgColor: '#EDE9FE' },
	{ icon: '💧', color: '#059669', bgColor: '#D1FAE5' },
	{ icon: '🧴', color: '#D97706', bgColor: '#FEF3C7' },
];

const statusToView = (s: SvcOrderMgmt.TStatus): Dashboard.IAppointment['status'] => {
	switch (s) {
		case 'COMPLETED':
		case 'INVOICED':
			return 'completed';
		case 'IN_PROGRESS':
			return 'confirmed';
		case 'CANCELLED':
			return 'cancelled';
		default:
			return 'pending';
	}
};

export async function getDashboard(): Promise<IDashboardData> {
	const now = new Date();
	const todayStart = startOfDay(now);
	const todayEnd = endOfDay(now);
	const yesterdayStart = startOfDay(new Date(now.getTime() - 86400000));
	const yesterdayEnd = endOfDay(new Date(now.getTime() - 86400000));
	const sevenDaysAgo = startOfDay(new Date(now.getTime() - 6 * 86400000));

	// `overview` là source of truth cho các số tổng hợp (BE tính trọn kho dữ liệu,
	// không bị cap 100 như aggregate client-side). Các phần overview chưa expose
	// (chuỗi 7 ngày, lịch hẹn gần đây, breakdown phiếu DV) vẫn tính client-side.
	const [ordersRes, customersRes, paidInvoicesRes, overview] = await Promise.all([
		ordersApi.getServiceOrders({ page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }),
		customersApi.getCustomers({ page: 1, limit: 1 }),
		invoicesApi.getInvoices({
			status: 'PAID',
			fromDate: sevenDaysAgo.toISOString(),
			limit: 100,
			sortBy: 'paidAt',
			sortOrder: 'desc',
		}),
		reportsApi.getDashboardOverview(),
	]);

	const orders = ordersRes.items;
	const paidInvoices = paidInvoicesRes.items;
	const totalCustomers = (customersRes.data as any).meta?.total ?? 0;
	const lowStockCount = overview.lowStockCount ?? 0;

	let revenueToday = 0;
	let revenueYesterday = 0;
	let ordersToday = 0;
	let ordersYesterday = 0;
	let completedToday = 0;
	const statusCount: Record<string, number> = {};
	const revenueByDay = new Map<string, number>();
	const serviceCount = new Map<string, { name: string; price: number; count: number }>();

	// Doanh thu lấy từ invoice PAID (source of truth).
	for (const inv of paidInvoices) {
		const paidAt = inv.paidAt ? new Date(inv.paidAt) : new Date(inv.createdAt);
		if (paidAt >= todayStart && paidAt <= todayEnd) revenueToday += inv.totalAmount;
		if (paidAt >= yesterdayStart && paidAt <= yesterdayEnd) revenueYesterday += inv.totalAmount;
		if (paidAt >= sevenDaysAgo) {
			const key = startOfDay(paidAt).toISOString();
			revenueByDay.set(key, (revenueByDay.get(key) || 0) + inv.totalAmount);
		}
	}

	// Doanh thu hôm nay lấy số authoritative từ BE overview (không cap 100).
	revenueToday = overview.revenue.today ?? revenueToday;

	for (const o of orders) {
		const created = new Date(o.createdAt);
		if (created >= todayStart && created <= todayEnd) ordersToday++;
		if (created >= yesterdayStart && created <= yesterdayEnd) ordersYesterday++;

		statusCount[o.status] = (statusCount[o.status] || 0) + 1;

		const isCompleted = o.status === 'COMPLETED' || o.status === 'INVOICED';
		if (isCompleted) {
			const completedAt = o.completedAt ? new Date(o.completedAt) : created;
			if (completedAt >= todayStart && completedAt <= todayEnd) completedToday++;
		}

		// Đếm dịch vụ cho "phổ biến" — BỎ phiếu đã huỷ để không thổi phồng số lượt.
		if (o.status !== 'CANCELLED') {
			for (const it of o.items) {
				const cur = serviceCount.get(it.serviceId) || { name: it.serviceName, price: it.unitPrice, count: 0 };
				cur.count += it.quantity;
				serviceCount.set(it.serviceId, cur);
			}
		}
	}

	const revenue7days: Dashboard.IRevenueData[] = [];
	for (let i = 6; i >= 0; i--) {
		const d = startOfDay(new Date(now.getTime() - i * 86400000));
		revenue7days.push({
			day: DAY_LABELS[d.getDay()],
			revenue: revenueByDay.get(d.toISOString()) || 0,
		});
	}

	const statusBreakdown: Dashboard.IAppointmentStatus[] = [
		{ label: 'Hoàn thành', value: (statusCount.COMPLETED || 0) + (statusCount.INVOICED || 0), color: '#22C55E' },
		{ label: 'Đang thực hiện', value: statusCount.IN_PROGRESS || 0, color: '#2563EB' },
		{ label: 'Nháp', value: statusCount.DRAFT || 0, color: '#F59E0B' },
		{ label: 'Đã huỷ', value: statusCount.CANCELLED || 0, color: '#EF4444' },
	].filter((s) => s.value > 0);

	const recentAppointments: Dashboard.IAppointment[] = orders.slice(0, 6).map((o, idx) => ({
		_id: o.id,
		customerName: o.customer?.fullName ?? '—',
		serviceName: o.items[0]?.serviceName ?? '(chưa thêm dịch vụ)',
		time: new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
		status: statusToView(o.status),
		avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
	}));

	// Dịch vụ phổ biến (sắp theo lượt — khớp nhãn "Theo lượt đặt"):
	// - Ưu tiên topServices CHUẨN từ BE (tính trên TOÀN BỘ dữ liệu) khi BE có trả.
	// - BE rỗng → fallback đếm client-side (đã bỏ phiếu huỷ ở trên) để luôn có dữ liệu.
	const beTop = (overview.topServices ?? []).filter((r) => r.count > 0);
	const baseTop = beTop.length
		? beTop
				.slice()
				.sort((a, b) => b.count - a.count)
				.slice(0, 5)
				.map((row) => ({
					_id: row.serviceId,
					name: row.serviceName,
					bookings: row.count,
					price: row.count > 0 ? Math.round(row.revenue / row.count) : 0,
				}))
		: Array.from(serviceCount.entries())
				.sort((a, b) => b[1].count - a[1].count)
				.slice(0, 5)
				.map(([id, v]) => ({ _id: id, name: v.name, bookings: v.count, price: v.price }));

	const popularServices: Dashboard.IPopularService[] = baseTop.map((s, idx) => ({
		...s,
		icon: SVC_PALETTE[idx % SVC_PALETTE.length].icon,
		color: SVC_PALETTE[idx % SVC_PALETTE.length].color,
		bgColor: SVC_PALETTE[idx % SVC_PALETTE.length].bgColor,
	}));

	const newCustomersToday = 0; // BE chưa expose filter created_at; sẽ wire khi BE bổ sung.

	return {
		revenueToday,
		revenueThisMonth: overview.revenue.thisMonth ?? 0,
		revenueYesterday,
		ordersToday,
		ordersYesterday,
		completedToday,
		newCustomersToday,
		totalCustomers,
		lowStockCount,
		revenue7days,
		statusBreakdown,
		recentAppointments,
		popularServices,
	};
}
