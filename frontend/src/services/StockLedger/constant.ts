// Hằng số UI cho Sổ kho.

export const TRANSACTION_TYPE_OPTIONS: { value: StockLedger.TTransactionType; label: string; color: string }[] = [
	{ value: 'IN', label: 'Nhập kho', color: '#059669' },
	{ value: 'OUT_INVOICE', label: 'Xuất theo HĐ', color: '#2563EB' },
	{ value: 'OUT_MANUAL', label: 'Xuất thủ công', color: '#DC2626' },
	{ value: 'ADJUSTMENT', label: 'Điều chỉnh', color: '#D97706' },
];

export const REFERENCE_TYPE_LABEL: Record<StockLedger.TReferenceType, string> = {
	INVOICE: 'Hoá đơn',
	STOCK_IN: 'Phiếu nhập',
	STOCK_OUT_MANUAL: 'Xuất thủ công',
	ADJUSTMENT: 'Điều chỉnh',
};

export const COMMON_OUT_REASONS = [
	'Hỏng do rơi vỡ',
	'Hết hạn sử dụng',
	'Mất / thất lạc',
	'Kiểm kê thiếu',
	'Khác',
];

export const COMMON_IN_REASON_DEFAULT = 'Nhập kho từ NCC';

export const DEFAULT_PAGE_SIZE = 10;
