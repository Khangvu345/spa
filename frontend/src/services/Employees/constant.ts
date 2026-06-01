// Hằng số UI cho module Quản lý nhân viên.
import { EStaffRole } from '@/services/Auth/constant';

export const ROLE_OPTIONS: { value: Auth.TStaffRole; label: string; color: string }[] = [
	{ value: EStaffRole.ADMIN, label: 'ADMIN', color: '#c47070' },
	{ value: EStaffRole.OPERATOR, label: 'OPERATOR', color: '#2563EB' },
	{ value: EStaffRole.STAFF, label: 'STAFF', color: '#059669' },
];

export const WORK_STATUS_OPTIONS: { value: Auth.TWorkStatus; label: string; color: string }[] = [
	{ value: 'ACTIVE', label: 'Đang làm', color: '#059669' },
	{ value: 'ON_LEAVE', label: 'Nghỉ phép', color: '#D97706' },
	{ value: 'RESIGNED', label: 'Đã nghỉ', color: '#6B7280' },
];

export const ACCOUNT_STATUS_OPTIONS: { value: Auth.TAccountStatus; label: string; color: string }[] = [
	{ value: 'ACTIVE', label: 'Hoạt động', color: '#059669' },
	{ value: 'LOCKED', label: 'Đã khoá', color: '#DC2626' },
	{ value: 'DELETED', label: 'Đã xoá', color: '#6B7280' },
];

export const DEFAULT_PAGE_SIZE = 10;
