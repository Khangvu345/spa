// Hằng số UI cho Quản lý vật liệu.

export const MATERIAL_TYPE_OPTIONS: { value: MaterialMgmt.TType; label: string; color: string }[] = [
	{ value: 'CONSUMABLE', label: 'Tiêu hao', color: '#2563EB' },
	{ value: 'DEPRECIATION', label: 'Hao mòn', color: '#D97706' },
];

export const MATERIAL_STATUS_OPTIONS: { value: boolean; label: string; color: string }[] = [
	{ value: true, label: 'Đang sử dụng', color: '#059669' },
	{ value: false, label: 'Ngưng', color: '#DC2626' },
];

export const COMMON_UNITS = ['ml', 'gram', 'chai', 'hộp', 'miếng', 'lít', 'cái', 'bộ', 'set', 'piece'];

export const DEFAULT_PAGE_SIZE = 10;
