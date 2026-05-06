/**
 * Hằng số nghiệp vụ dùng chung toàn hệ thống.
 * Khi business rule thay đổi → sửa ở đây, không scattered trong service.
 */

// ──────────────────────────────────────
// Booking
// ──────────────────────────────────────

/** Buffer mặc định giữa các booking của 1 nhân viên (phút) */
export const DEFAULT_BOOKING_BUFFER_MINUTES = 15;

/** Số phút sau scheduled_at mà nếu không check-in thì auto NO_SHOW */
export const NO_SHOW_TIMEOUT_MINUTES = 30;

/** Giờ làm việc (BR3) */
export const BUSINESS_HOUR_START = 8;
export const BUSINESS_HOUR_END = 22;

/** Số giờ tối thiểu trước scheduled_at có thể cancel (BR8) */
export const MIN_CANCEL_HOURS_BEFORE = 2;

/** Số booking active tối đa per phone per ngày (BR4) */
export const MAX_BOOKING_PER_PHONE_PER_DAY = 5;

// ──────────────────────────────────────
// OTP
// ──────────────────────────────────────

/** OTP độ dài 6 chữ số */
export const OTP_LENGTH = 6;

/** OTP hết hạn sau 10 phút */
export const OTP_EXPIRY_SECONDS = 600;

/** Số lần verify sai tối đa */
export const OTP_MAX_ATTEMPTS = 3;

/** Khoảng cách tối thiểu giữa 2 lần resend (giây) */
export const OTP_RESEND_COOLDOWN_SECONDS = 120;

// ──────────────────────────────────────
// Pagination
// ──────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ──────────────────────────────────────
// VNPay
// ──────────────────────────────────────

/** VNPay yêu cầu amount nhân 100 vì lưu dạng VND × 100 */
export const VNPAY_AMOUNT_MULTIPLIER = 100;

/** Mã response VNPay khi giao dịch thành công */
export const VNPAY_SUCCESS_CODE = '00';

// ──────────────────────────────────────
// Auth
// ──────────────────────────────────────

/** Bcrypt salt rounds */
export const BCRYPT_SALT_ROUNDS = 10;

/** JWT default expiry */
export const JWT_DEFAULT_EXPIRES_IN = '24h';