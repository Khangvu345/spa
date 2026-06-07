// Hằng số UI cho module Bảng lương.
export const DEFAULT_PAGE_SIZE = 20;

export const PAYROLL_STATUS_OPTIONS: { value: PayrollMgmt.TStatus; label: string; color: string }[] = [
	{ value: 'FINALIZED', label: 'Đã chốt', color: '#D97706' },
	{ value: 'PAID', label: 'Đã chi', color: '#059669' },
	{ value: 'CANCELLED', label: 'Đã huỷ', color: '#6B7280' },
];

export const PAYROLL_STATUS_MAP: Record<PayrollMgmt.TStatus, { label: string; color: string }> = {
	FINALIZED: { label: 'Đã chốt', color: '#D97706' },
	PAID: { label: 'Đã chi', color: '#059669' },
	CANCELLED: { label: 'Đã huỷ', color: '#6B7280' },
};

// 12 tháng cho Select kỳ lương.
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
	value: i + 1,
	label: `Tháng ${i + 1}`,
}));

// Danh sách năm: từ 2024 đến năm hiện tại + 1.
export function buildYearOptions(): { value: number; label: string }[] {
	const current = new Date().getFullYear();
	const years: { value: number; label: string }[] = [];
	for (let y = current + 1; y >= 2024; y -= 1) {
		years.push({ value: y, label: `${y}` });
	}
	return years;
}
