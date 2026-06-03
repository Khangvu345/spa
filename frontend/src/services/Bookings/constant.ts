// Hằng số UI cho Booking. Palette tone warm-earth khớp claymorphism.

export const BOOKING_STATUS_OPTIONS: { value: BookingMgmt.TStatus; label: string; color: string }[] = [
	{ value: 'PENDING_OTP', label: 'Chờ OTP', color: '#a89888' },     // warm taupe
	{ value: 'CONFIRMED', label: 'Đã xác nhận', color: '#c47070' },   // clay rose (brand)
	{ value: 'CHECKED_IN', label: 'Đã check-in', color: '#6b8e6f' },  // sage green
	{ value: 'IN_PROGRESS', label: 'Đang phục vụ', color: '#d4805b' },// terracotta
	{ value: 'COMPLETED', label: 'Hoàn thành', color: '#4a7c5e' },    // deep sage
	{ value: 'CANCELLED', label: 'Đã huỷ', color: '#b85c5c' },        // warm red
	{ value: 'NO_SHOW', label: 'Không đến', color: '#948683' },       // warm gray
];

export const BOOKING_SOURCE_LABEL: Record<BookingMgmt.TSource, string> = {
	LANDING_PAGE: 'Khách tự đặt',
	OPERATOR: 'Lễ tân đặt',
};

export const DEFAULT_PAGE_SIZE = 10;
