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

// Format số lượng tồn kho: BE trừ kho bằng float (BOM số lẻ) nên có sai số
// kiểu 19.799999999999997 — làm tròn 2 chữ số lẻ, bỏ số 0 thừa khi hiển thị.
export const fmtQty = (v: number | null | undefined): string =>
	v == null ? '—' : (Math.round(v * 100) / 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 });

export const DEFAULT_PAGE_SIZE = 10;
