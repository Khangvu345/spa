// Hằng số dùng chung cho module Auth.

export const AUTH_TOKEN_KEY = 'spa_access_token';
export const AUTH_USER_KEY = 'spa_current_user';

export enum EStaffRole {
	ADMIN = 'ADMIN',
	OPERATOR = 'OPERATOR',
	STAFF = 'STAFF',
}

export enum EAccountStatus {
	ACTIVE = 'ACTIVE',
	LOCKED = 'LOCKED',
	DELETED = 'DELETED',
}

// Mã lỗi BE trả về (xem backend/src/shared/constants/error-codes.ts).
export enum EAuthErrorCode {
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	PASSWORD_INCORRECT = 'PASSWORD_INCORRECT',
	NEW_PASSWORD_SAME_AS_OLD = 'NEW_PASSWORD_SAME_AS_OLD',
	MUST_CHANGE_PASSWORD = 'MUST_CHANGE_PASSWORD',
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
	UNAUTHORIZED = 'UNAUTHORIZED',
}

// Trang mặc định sau khi đăng nhập theo role.
// Lưu ý: STAFF không có UI (xem docs/role-decision.md) — không có default home.
export const DEFAULT_HOME_BY_ROLE: Record<EStaffRole, string> = {
	[EStaffRole.ADMIN]: '/admin/dashboard',
	[EStaffRole.OPERATOR]: '/le-tan',
	[EStaffRole.STAFF]: '/login',
};

export const PATH_LOGIN = '/login';
export const PATH_CHANGE_PASSWORD = '/change-password';
