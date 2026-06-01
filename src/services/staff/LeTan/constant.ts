export const KPI_CARDS: LeTan.IKpiCard[] = [
	{
		key: 'appointments',
		label: 'Lịch hẹn hôm nay',
		value: '8',
		trend: '+3 hôm qua',
		trendUp: true,
		icon: 'CalendarOutlined',
		color: '#c47070',
		bgColor: '#FFF0F0',
	},
	{
		key: 'waiting',
		label: 'Đang chờ xử lý',
		value: '3',
		trend: 'Đang chờ',
		trendUp: false,
		icon: 'ClockCircleOutlined',
		color: '#F59E0B',
		bgColor: '#FEF3C7',
	},
	{
		key: 'checkin',
		label: 'Khách check-in',
		value: '5',
		trend: 'Hôm nay',
		trendUp: true,
		icon: 'LoginOutlined',
		color: '#3B82F6',
		bgColor: '#EFF6FF',
	},
	{
		key: 'walkin',
		label: 'Khách vãng lai',
		value: '2',
		trend: 'Walk-in',
		trendUp: false,
		icon: 'UserAddOutlined',
		color: '#D97706',
		bgColor: '#FFF7ED',
	},
];

export const MOCK_APPOINTMENTS: LeTan.IAppointment[] = [
	{ key: '1', time: '09:00', customer: 'Trần Thị Hoa', phone: '0901234567', service: 'Facial cơ bản', specialist: 'Lan Anh', status: 'hoan_thanh', price: 350000, avatarColor: '#FDA4AF' },
	{ key: '2', time: '09:30', customer: 'Nguyễn Văn An', phone: '0912345678', service: 'Massage body', specialist: 'Minh Tâm', status: 'da_xac_nhan', price: 650000, avatarColor: '#93C5FD' },
	{ key: '3', time: '10:00', customer: 'Lê Minh Châu', phone: '0923456789', service: 'Chăm sóc da', specialist: 'Lan Anh', status: 'dang_thuc_hien', price: 500000, avatarColor: '#A78BFA' },
	{ key: '4', time: '10:30', customer: 'Phạm Thu Hương', phone: '0934567890', service: 'Tẩy da chết', specialist: 'Minh Tâm', status: 'da_xac_nhan', price: 280000, avatarColor: '#FCD34D' },
	{ key: '5', time: '11:00', customer: 'Đỗ Thanh Tâm', phone: '0945678901', service: 'Massage mặt', specialist: 'Lan Anh', status: 'cho_xac_nhan', price: 420000, avatarColor: '#86EFAC' },
	{ key: '6', time: '13:00', customer: 'Hoàng Thị Nga', phone: '0956789012', service: 'Facial nâng cao', specialist: 'Minh Tâm', status: 'cho_xac_nhan', price: 550000, avatarColor: '#F9A8D4' },
	{ key: '7', time: '14:00', customer: 'Vũ Đức Minh', phone: '0967890123', service: 'Massage đá nóng', specialist: 'Lan Anh', status: 'da_xac_nhan', price: 700000, avatarColor: '#67E8F9' },
	{ key: '8', time: '15:00', customer: 'Bùi Thị Hạnh', phone: '0978901234', service: 'Chăm sóc body', specialist: 'Minh Tâm', status: 'cho_xac_nhan', price: 480000, avatarColor: '#FCA5A5' },
];

export const MOCK_WAITING: LeTan.IWaitingCustomer[] = [
	{ key: '1', name: 'Nguyễn Thị Lan', detail: 'Đặt lịch 10:30 · Facial cơ bản', type: 'booking', time: '10:15' },
	{ key: '2', name: 'Trần Minh Đức', detail: 'Khách vãng lai · Massage body', type: 'walkin', time: '10:20' },
	{ key: '3', name: 'Lê Thị Hồng', detail: 'Đặt lịch 11:00 · Chăm sóc da', type: 'booking', time: '10:45' },
];

export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
	hoan_thanh: { label: 'Hoàn thành', color: '#059669', bgColor: '#ECFDF5' },
	da_xac_nhan: { label: 'Đã xác nhận', color: '#2563EB', bgColor: '#EFF6FF' },
	dang_thuc_hien: { label: 'Đang thực hiện', color: '#0891B2', bgColor: '#ECFEFF' },
	cho_xac_nhan: { label: 'Chờ xác nhận', color: '#D97706', bgColor: '#FEF3C7' },
};

export const SERVICE_OPTIONS = [
	'Facial cơ bản', 'Facial nâng cao', 'Massage body', 'Massage mặt',
	'Massage đá nóng', 'Chăm sóc da', 'Tẩy da chết', 'Chăm sóc body',
	'Liệu pháp tinh dầu', 'Trị liệu da',
];

export const SPECIALIST_OPTIONS = ['Lan Anh', 'Minh Tâm', 'Hồng Nhung', 'Thanh Trúc'];

export const formatPrice = (price: number): string => {
	return price.toLocaleString('vi-VN') + 'đ';
};
