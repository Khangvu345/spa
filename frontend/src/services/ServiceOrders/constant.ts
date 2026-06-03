// Hằng số UI cho ServiceOrders.
export const SERVICE_ORDER_STATUS_OPTIONS: {
	value: SvcOrderMgmt.TStatus;
	label: string;
	color: string;
}[] = [
	{ value: 'DRAFT', label: 'Nháp', color: '#6B7280' },
	{ value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#2563EB' },
	{ value: 'COMPLETED', label: 'Hoàn thành', color: '#059669' },
	{ value: 'INVOICED', label: 'Đã xuất hoá đơn', color: '#7C3AED' },
	{ value: 'CANCELLED', label: 'Đã huỷ', color: '#DC2626' },
];

export const SERVICE_ORDER_EDITABLE_STATUSES: SvcOrderMgmt.TStatus[] = ['DRAFT', 'IN_PROGRESS'];

export const SERVICE_ORDER_TERMINAL_STATUSES: SvcOrderMgmt.TStatus[] = [
	'COMPLETED',
	'INVOICED',
	'CANCELLED',
];
