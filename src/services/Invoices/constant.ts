// Hằng số UI cho Hoá đơn.

export const INVOICE_STATUS_OPTIONS: { value: InvoiceMgmt.TStatus; label: string; color: string }[] = [
	{ value: 'DRAFT', label: 'Nháp', color: '#6B7280' },
	{ value: 'PENDING_PAYMENT', label: 'Chờ thanh toán', color: '#D97706' },
	{ value: 'PAID', label: 'Đã thanh toán', color: '#059669' },
	{ value: 'CANCELLED', label: 'Đã huỷ', color: '#DC2626' },
];

export const PAYMENT_METHOD_OPTIONS: { value: InvoiceMgmt.TPaymentMethod; label: string }[] = [
	{ value: 'CASH', label: 'Tiền mặt' },
	{ value: 'VNPAY', label: 'VNPAY' },
];

export const DEFAULT_PAGE_SIZE = 10;
