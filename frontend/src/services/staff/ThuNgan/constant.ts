export const KPI_CARDS: ThuNgan.IKpiCard[] = [
	{
		key: 'revenue',
		label: 'Doanh thu hôm nay',
		value: '5.800.000đ',
		trend: '+8.2%',
		trendUp: true,
		icon: 'DollarOutlined',
		color: '#c47070',
		bgColor: '#FFF0F0',
	},
	{
		key: 'paid',
		label: 'Đã thanh toán',
		value: '12',
		trend: '+5',
		trendUp: true,
		icon: 'CheckCircleOutlined',
		color: '#10B981',
		bgColor: '#ECFDF5',
	},
	{
		key: 'pending',
		label: 'Chờ thanh toán',
		value: '3',
		trend: 'Đang chờ',
		trendUp: false,
		icon: 'ClockCircleOutlined',
		color: '#F59E0B',
		bgColor: '#FEF3C7',
	},
	{
		key: 'voucher',
		label: 'Voucher đã dùng',
		value: '4',
		trend: 'Hôm nay',
		trendUp: false,
		icon: 'TagOutlined',
		color: '#7C3AED',
		bgColor: '#EDE9FE',
	},
];

export const MOCK_TICKETS: ThuNgan.ITicket[] = [
	{ key: '1', code: 'PH001', customer: 'Trần Thị Hoa', service: 'Facial cơ bản', total: 350000, status: 'cho_thanh_toan', avatarColor: '#FDA4AF' },
	{ key: '2', code: 'PH002', customer: 'Nguyễn Văn An', service: 'Massage body', total: 650000, status: 'cho_thanh_toan', avatarColor: '#93C5FD' },
	{ key: '3', code: 'PH003', customer: 'Lê Minh Châu', service: 'Chăm sóc da', total: 500000, status: 'da_thanh_toan', avatarColor: '#A78BFA' },
	{ key: '4', code: 'PH004', customer: 'Phạm Thu Hương', service: 'Tẩy da chết', total: 280000, status: 'cho_thanh_toan', avatarColor: '#FCD34D' },
	{ key: '5', code: 'PH005', customer: 'Đỗ Thanh Tâm', service: 'Massage mặt', total: 420000, status: 'da_thanh_toan', avatarColor: '#86EFAC' },
];

export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
	cho_thanh_toan: { label: 'Chờ TT', color: '#D97706', bgColor: '#FEF3C7' },
	da_thanh_toan: { label: 'Đã TT', color: '#059669', bgColor: '#ECFDF5' },
};

export const RECENT_PAYMENTS: ThuNgan.IRecentPayment[] = [
	{ key: '1', name: 'Trần Thị Hoa', detail: 'Facial cơ bản · Tiền mặt', amount: 350000 },
	{ key: '2', name: 'Lê Minh Châu', detail: 'Chăm sóc da · Chuyển khoản', amount: 500000 },
	{ key: '3', name: 'Nguyễn Văn An', detail: 'Massage body · VNPay', amount: 650000 },
];

export const QUICK_ACTIONS: ThuNgan.IQuickAction[][] = [
	[
		{ icon: 'DollarOutlined', text: 'Thanh toán', color: '#c47070', bg: '#FFF0F0' },
		{ icon: 'TagOutlined', text: 'Áp dụng voucher', color: '#7C3AED', bg: '#EDE9FE' },
	],
	[
		{ icon: 'PrinterOutlined', text: 'In hóa đơn', color: '#3B82F6', bg: '#EFF6FF' },
		{ icon: 'UndoOutlined', text: 'Hoàn tiền', color: '#D97706', bg: '#FEF3C7' },
	],
];

export const formatPrice = (price: number): string => {
	return price.toLocaleString('vi-VN') + 'đ';
};
