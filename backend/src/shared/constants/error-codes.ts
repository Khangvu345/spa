/**
 * Tập hợp tất cả error codes của hệ thống.
 * Mỗi exception throw ra phải dùng code từ đây — KHÔNG hardcode string.
 *
 * Convention: SCREAMING_SNAKE_CASE, dạng động từ + danh từ
 * Format response: { success: false, error: { code, message, details? } }
 */
export const ERROR_CODES = {
  // ──────────────────────────────────────
  // Common — dùng chung
  // ──────────────────────────────────────
  VALIDATION_FAILED:        'VALIDATION_FAILED',
  UNAUTHORIZED:             'UNAUTHORIZED',
  FORBIDDEN:                'FORBIDDEN',
  NOT_FOUND:                'NOT_FOUND',
  INTERNAL_SERVER_ERROR:    'INTERNAL_SERVER_ERROR',
  INVALID_OBJECT_ID:        'INVALID_OBJECT_ID',

  // ──────────────────────────────────────
  // Customer
  // ──────────────────────────────────────
  CUSTOMER_NOT_FOUND:       'CUSTOMER_NOT_FOUND',
  CUSTOMER_PHONE_EXISTS:    'CUSTOMER_PHONE_EXISTS',
  CUSTOMER_INACTIVE:        'CUSTOMER_INACTIVE',
  PHONE_ALREADY_EXISTS:     'PHONE_ALREADY_EXISTS',
  INVALID_PHONE_FORMAT:     'INVALID_PHONE_FORMAT',

  // ──────────────────────────────────────
  // Employee + Auth
  // ──────────────────────────────────────
  STAFF_NOT_FOUND:          'STAFF_NOT_FOUND',
  STAFF_EMAIL_EXISTS:       'STAFF_EMAIL_EXISTS',
  EMPLOYEE_NOT_FOUND:       'EMPLOYEE_NOT_FOUND',
  EMAIL_ALREADY_EXISTS:     'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS:      'INVALID_CREDENTIALS',
  INACTIVE_ACCOUNT:         'INACTIVE_ACCOUNT',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  PASSWORD_INCORRECT:       'PASSWORD_INCORRECT',
  NEW_PASSWORD_SAME_AS_OLD: 'NEW_PASSWORD_SAME_AS_OLD',
  STAFF_ALREADY_LOCKED:     'STAFF_ALREADY_LOCKED',
  STAFF_NOT_LOCKED:         'STAFF_NOT_LOCKED',
  STAFF_ALREADY_DELETED:    'STAFF_ALREADY_DELETED',
  LOCK_DURATION_NOT_MET:    'LOCK_DURATION_NOT_MET',
  CANNOT_OPERATE_SELF:      'CANNOT_OPERATE_SELF',
  MUST_CHANGE_PASSWORD:     'MUST_CHANGE_PASSWORD',

  // ──────────────────────────────────────
  // Spa Service + BOM + Commission Config
  // ──────────────────────────────────────
  SERVICE_NOT_FOUND:        'SERVICE_NOT_FOUND',
  SERVICE_CODE_EXISTS:      'SERVICE_CODE_EXISTS',
  BOM_UNIT_MISMATCH:        'BOM_UNIT_MISMATCH',
  COMMISSION_CONFIG_EXISTS: 'COMMISSION_CONFIG_EXISTS',
  COMMISSION_CONFIG_MISSING:'COMMISSION_CONFIG_MISSING',
  INVALID_SENIORITY_TIERS:  'INVALID_SENIORITY_TIERS',

  // ──────────────────────────────────────
  // Booking
  // ──────────────────────────────────────
  BOOKING_NOT_FOUND:        'BOOKING_NOT_FOUND',
  SLOT_UNAVAILABLE:         'SLOT_UNAVAILABLE',
  STAFF_NOT_QUALIFIED:      'STAFF_NOT_QUALIFIED',
  MAX_BOOKING_EXCEEDED:     'MAX_BOOKING_EXCEEDED',
  INVALID_STATUS_TRANSITION:'INVALID_STATUS_TRANSITION',
  BOOKING_PAST_TIME:        'BOOKING_PAST_TIME',
  BOOKING_OUTSIDE_HOURS:    'BOOKING_OUTSIDE_HOURS',

  // ──────────────────────────────────────
  // Invoice + Payment
  // ──────────────────────────────────────
  INVOICE_NOT_FOUND:        'INVOICE_NOT_FOUND',
  INVOICE_ALREADY_PAID:     'INVOICE_ALREADY_PAID',
  INVOICE_NOT_PAYABLE:      'INVOICE_NOT_PAYABLE',
  PAYMENT_FAILED:           'PAYMENT_FAILED',
  VNPAY_SIGNATURE_INVALID:  'VNPAY_SIGNATURE_INVALID',

  // ──────────────────────────────────────
  // Inventory: Material + Supplier + Stock Receipt
  // ──────────────────────────────────────
  MATERIAL_NOT_FOUND:       'MATERIAL_NOT_FOUND',
  MATERIAL_CODE_EXISTS:     'MATERIAL_CODE_EXISTS',
  MATERIAL_SUPPLIER_INVALID:'MATERIAL_SUPPLIER_INVALID',
  MATERIAL_DEPRECIATION_USES_REQUIRED: 'MATERIAL_DEPRECIATION_USES_REQUIRED',
  INSUFFICIENT_STOCK:       'INSUFFICIENT_STOCK',
  SUPPLIER_NOT_FOUND:       'SUPPLIER_NOT_FOUND',
  SUPPLIER_HAS_RECEIPTS:    'SUPPLIER_HAS_RECEIPTS',
  SUPPLIER_TAX_CODE_EXISTS: 'SUPPLIER_TAX_CODE_EXISTS',
  STOCK_RECEIPT_NOT_FOUND:  'STOCK_RECEIPT_NOT_FOUND',

  // ──────────────────────────────────────
  // Payroll
  // ──────────────────────────────────────
  PAYROLL_ALREADY_EXISTS:   'PAYROLL_ALREADY_EXISTS',
  PAYROLL_NOT_FOUND:        'PAYROLL_NOT_FOUND',
  PAYROLL_ALREADY_PAID:     'PAYROLL_ALREADY_PAID',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
