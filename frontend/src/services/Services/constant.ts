// Hằng số UI cho Quản lý dịch vụ.

export const SERVICE_CATEGORY_OPTIONS: { value: SvcMgmt.TCategory; label: string; color: string }[] = [
	{ value: 'SWEDISH', label: 'Massage Thụy Điển', color: '#c47070' },
	{ value: 'HOT_STONE', label: 'Đá Nóng', color: '#D97706' },
	{ value: 'THAI', label: 'Thái', color: '#7C3AED' },
	{ value: 'FOOT', label: 'Foot', color: '#059669' },
	{ value: 'NECK_SHOULDER', label: 'Cổ Vai Gáy', color: '#2563EB' },
	{ value: 'AROMA', label: 'Aroma', color: '#DB2777' },
];

export const SERVICE_STATUS_OPTIONS: { value: boolean; label: string; color: string }[] = [
	{ value: true, label: 'Hoạt động', color: '#059669' },
	{ value: false, label: 'Tạm ngưng', color: '#DC2626' },
];

export const DEFAULT_PAGE_SIZE = 10;
