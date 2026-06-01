export const KPI_CARDS: Dashboard.IKpiCard[] = [
  {
    key: 'revenue',
    label: 'Doanh thu',
    value: '12.500.000đ',
    trend: '+12.5%',
    trendUp: true,
    icon: 'RiseOutlined',
    color: '#c47070',
    bgColor: '#FFF0F0',
  },
  {
    key: 'appointments',
    label: 'Lịch hẹn hôm nay',
    value: '8',
    trend: '+3 hôm qua',
    trendUp: true,
    icon: 'CalendarOutlined',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
  {
    key: 'customers',
    label: 'Khách hàng mới',
    value: '24',
    trend: '+18%',
    trendUp: true,
    icon: 'UserAddOutlined',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  {
    key: 'services',
    label: 'Dịch vụ đang hoạt động',
    value: '5',
    trend: 'Ổn định',
    trendUp: true,
    icon: 'AppstoreOutlined',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
];

export const MOCK_APPOINTMENTS: Dashboard.IAppointment[] = [
  {
    _id: 'apt-001',
    customerName: 'Nguyễn Thị Mai',
    serviceName: 'Massage Trị Liệu',
    time: '09:00 – 10:30',
    status: 'completed',
    avatarColor: '#FDA4AF',
  },
  {
    _id: 'apt-002',
    customerName: 'Trần Văn Hùng',
    serviceName: 'Đá Nóng Trị Liệu',
    time: '10:00 – 11:30',
    status: 'pending',
    avatarColor: '#93C5FD',
  },
  {
    _id: 'apt-003',
    customerName: 'Lê Hoàng Anh',
    serviceName: 'Chăm Sóc Da Mặt',
    time: '14:00 – 15:00',
    status: 'confirmed',
    avatarColor: '#A78BFA',
  },
  {
    _id: 'apt-004',
    customerName: 'Phạm Minh Tú',
    serviceName: 'Liệu Pháp Tinh Dầu',
    time: '15:30 – 16:45',
    status: 'cancelled',
    avatarColor: '#FCD34D',
  },
  {
    _id: 'apt-005',
    customerName: 'Võ Thanh Hà',
    serviceName: 'Tẩy Tế Bào Chết',
    time: '16:00 – 16:45',
    status: 'completed',
    avatarColor: '#86EFAC',
  },
];

export const POPULAR_SERVICES: Dashboard.IPopularService[] = [
  { _id: 'svc-001', name: 'Massage Trị Liệu', bookings: 32, price: 500000, icon: '💆', color: '#c47070', bgColor: '#FFF0F0' },
  { _id: 'svc-002', name: 'Chăm Sóc Da Mặt', bookings: 28, price: 400000, icon: '✨', color: '#2563EB', bgColor: '#DBEAFE' },
  { _id: 'svc-003', name: 'Đá Nóng Trị Liệu', bookings: 21, price: 550000, icon: '🔥', color: '#7C3AED', bgColor: '#EDE9FE' },
  { _id: 'svc-004', name: 'Liệu Pháp Tinh Dầu', bookings: 18, price: 380000, icon: '💧', color: '#059669', bgColor: '#D1FAE5' },
  { _id: 'svc-005', name: 'Tẩy Tế Bào Chết', bookings: 15, price: 350000, icon: '🧴', color: '#D97706', bgColor: '#FEF3C7' },
];

export const REVENUE_DATA: Dashboard.IRevenueData[] = [
  { day: 'T2', revenue: 8500000 },
  { day: 'T3', revenue: 12000000 },
  { day: 'T4', revenue: 6800000 },
  { day: 'T5', revenue: 15200000 },
  { day: 'T6', revenue: 11000000 },
  { day: 'T7', revenue: 9200000 },
  { day: 'CN', revenue: 7500000 },
];

export const APPOINTMENT_STATUS: Dashboard.IAppointmentStatus[] = [
  { label: 'Hoàn thành', value: 45, color: '#22C55E' },
  { label: 'Đang chờ', value: 30, color: '#F59E0B' },
  { label: 'Đã hủy', value: 25, color: '#EF4444' },
];

export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  completed: { label: 'Hoàn thành', color: '#059669', bgColor: '#ECFDF5' },
  pending: { label: 'Đang chờ', color: '#D97706', bgColor: '#FFF7ED' },
  confirmed: { label: 'Xác nhận', color: '#2563EB', bgColor: '#EFF6FF' },
  cancelled: { label: 'Đã hủy', color: '#DC2626', bgColor: '#FEF2F2' },
};

export const formatPrice = (price: number): string => {
  return price.toLocaleString('vi-VN') + 'đ';
};
