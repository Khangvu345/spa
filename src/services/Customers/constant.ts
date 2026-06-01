// Hằng số UI cho Quản lý khách hàng.

export const CUSTOMER_SOURCE_OPTIONS: { value: CustomerMgmt.TSource; label: string; color: string }[] = [
	{ value: 'WALK_IN', label: 'Walk-in', color: '#2563EB' },
	{ value: 'ONLINE_BOOKING', label: 'Đặt online', color: '#7C3AED' },
	{ value: 'MANUAL', label: 'Nhập tay', color: '#6B7280' },
];

export const CUSTOMER_STATUS_OPTIONS: { value: boolean; label: string; color: string }[] = [
	{ value: true, label: 'Đang hoạt động', color: '#059669' },
	{ value: false, label: 'Ngưng', color: '#DC2626' },
];

export const DEFAULT_PAGE_SIZE = 10;
