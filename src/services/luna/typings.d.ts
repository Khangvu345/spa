declare namespace API {
  type AddItemDto = {
    serviceId: string;
    quantity?: number;
    note?: string;
  };

  type AssignmentResponseDto = {
    id: string;
    staffId: string;
    serviceId: string;
    commissionRate: number;
    /** ISO 8601 */
    assignedSince: string;
    isActive: boolean;
    note: string;
    staff?: AssignmentStaffResponseDto;
    service?: AssignmentServiceResponseDto;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type AssignmentServiceResponseDto = {
    id: string;
    code: string;
    name: string;
    /** Giá bán dịch vụ (VND) */
    price: number;
  };

  type AssignmentStaffResponseDto = {
    id: string;
    fullName: string;
    role: 'ADMIN' | 'OPERATOR' | 'STAFF';
  };

  type AuthResponseDto = {
    user: StaffResponseDto;
    accessToken: string;
  };

  type AvailabilityGridResponseDto = {
    date: string;
    serviceId: string;
    slots: SlotInfoDto[];
  };

  type AvailabilityResponseDto = {
    date: string;
    serviceId: string;
    serviceName: string;
    staffName: string;
    suggestedSlots: any[][];
  };

  type BomMaterialBriefDto = {
    id: string;
    code: string;
    name: string;
    unit: string;
    type: 'CONSUMABLE' | 'DEPRECIATION';
    stockQuantity: number;
  };

  type BomResponseDto = {
    id: string;
    serviceId: string;
    materialId: string;
    standardQuantity: number;
    note: string;
    isActive: boolean;
    service?: BomServiceBriefDto;
    material?: BomMaterialBriefDto;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type BomServiceBriefDto = {
    id: string;
    code: string;
    name: string;
  };

  type BookingControllerCancelParams = {
    id: string;
  };

  type BookingControllerCheckInParams = {
    id: string;
  };

  type BookingControllerFindAllParams = {
    page?: number;
    limit?: number;
    customerId?: string;
    staffId?: string;
    status?:
      | 'PENDING_OTP'
      | 'CONFIRMED'
      | 'CHECKED_IN'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED'
      | 'NO_SHOW';
    search?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: 'scheduledStart' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  };

  type BookingControllerFindOneParams = {
    id: string;
  };

  type BookingControllerGetAvailabilityGridParams = {
    serviceId: string;
    /** YYYY-MM-DD */
    date: string;
  };

  type BookingControllerGetAvailabilityParams = {
    serviceId: string;
    /** YYYY-MM-DD */
    date: string;
  };

  type BookingControllerMarkNoShowParams = {
    id: string;
  };

  type BookingControllerUpdateParams = {
    id: string;
  };

  type BookingCustomerLiteResponseDto = {
    id: string;
    fullName: string;
    phone: string;
    email: string;
  };

  type BookingCustomerSnapshotResponseDto = {
    fullName: string;
    phone: string;
    email: string;
  };

  type BookingResponseDto = {
    id: string;
    bookingCode: string;
    customerId: string;
    serviceId: string;
    staffId: string;
    customerSnapshot: BookingCustomerSnapshotResponseDto;
    serviceSnapshot: BookingServiceSnapshotResponseDto;
    staffSnapshot: BookingStaffSnapshotResponseDto;
    /** ISO 8601 */
    scheduledStart: string;
    /** ISO 8601 */
    scheduledEnd: string;
    status:
      | 'PENDING_OTP'
      | 'CONFIRMED'
      | 'CHECKED_IN'
      | 'IN_PROGRESS'
      | 'COMPLETED'
      | 'CANCELLED'
      | 'NO_SHOW';
    source: 'LANDING_PAGE' | 'OPERATOR';
    /** ISO 8601 or null */
    otpExpiresAt?: Record<string, any>;
    otpAttempts: number;
    /** ISO 8601 or null */
    verifiedAt?: Record<string, any>;
    note: string;
    serviceOrderId?: Record<string, any>;
    createdBy?: Record<string, any>;
    /** ISO 8601 or null */
    cancelledAt?: Record<string, any>;
    cancelledBy?: Record<string, any>;
    cancelReason?: Record<string, any>;
    customer?: BookingCustomerLiteResponseDto;
    service?: BookingServiceLiteResponseDto;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type BookingServiceLiteResponseDto = {
    id: string;
    code: string;
    name: string;
    price: number;
  };

  type BookingServiceSnapshotResponseDto = {
    code: string;
    name: string;
    price: number;
    durationMinutes: number;
    cleanupMinutes: number;
  };

  type BookingStaffSnapshotResponseDto = {
    fullName: string;
  };

  type CancelBookingDto = {
    reason: string;
  };

  type CancelInvoiceDto = {
    reason: string;
  };

  type CancelPayrollDto = {
    reason: string;
  };

  type CancelServiceOrderDto = {
    reason: string;
  };

  type ChangePasswordDto = {
    currentPassword: string;
    newPassword: string;
  };

  type CheckInBookingResponseDto = {
    booking: BookingResponseDto;
    serviceOrder: ServiceOrderResponseDto;
  };

  type CreateAssignmentDto = {
    /** ObjectId của chuyên viên STAFF */
    staffId: string;
    /** ObjectId của dịch vụ */
    serviceId: string;
    /** Phần trăm hoa hồng. Ví dụ 20 = 20% */
    commissionRate: number;
    /** ISO 8601, mặc định là thời điểm tạo mapping */
    assignedSince?: string;
    note?: string;
  };

  type CreateBomDto = {
    serviceId: string;
    materialId: string;
    /** Số lượng tiêu hao chuẩn cho 1 lần dịch vụ. Cho phép decimal (vd: 0.01) cho DEPRECIATION */
    standardQuantity: number;
    note?: string;
  };

  type CreateBookingOperatorDto = {
    customerId: string;
    serviceId: string;
    scheduledStart: string;
    note?: string;
  };

  type CreateBookingPublicDto = {
    serviceId: string;
    scheduledStart: string;
    fullName: string;
    phone: string;
    email?: string;
    note?: string;
  };

  type CreateCustomerDto = {
    fullName: string;
    /** Số điện thoại VN 10 chữ số */
    phone: string;
    email?: string;
    source?: 'WALK_IN' | 'ONLINE_BOOKING' | 'MANUAL';
    note?: string;
  };

  type CreateEmployeeDto = {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'OPERATOR' | 'STAFF';
    /** Lương cứng tháng - VND */
    baseSalary: number;
    startedAt: string;
  };

  type CreateInvoiceDto = {
    serviceOrderId: string;
    /** Giảm giá tổng (VND) */
    discountAmount?: number;
    note?: string;
  };

  type CreateMaterialDto = {
    code: string;
    name: string;
    description?: string;
    /** ml | gram | piece | set */
    unit: string;
    type: 'CONSUMABLE' | 'DEPRECIATION';
    /** Giá nhập đơn vị (VND, integer) */
    unitPrice: number;
    stockQuantity?: number;
    reorderLevel?: number;
    /** Số lần dùng được/unit — required khi type=DEPRECIATION */
    expectedUsesPerUnit?: number;
    supplierId: string;
  };

  type CreateServiceDto = {
    /** Mã dịch vụ duy nhất (A-Z, 0-9, _), 3-30 ký tự */
    code: string;
    name: string;
    category: 'SWEDISH' | 'HOT_STONE' | 'THAI' | 'FOOT' | 'NECK_SHOULDER' | 'AROMA';
    /** Giá bán (VND) */
    unitPrice: number;
    /** Thời gian thực hiện (phút) */
    durationMinutes: number;
    /** Thời gian dọn dẹp (phút) */
    bufferMinutes?: number;
    /** Số slot chiếm dụng */
    slotsRequired?: number;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  };

  type CreateServiceOrderDto = {
    customerId: string;
    note?: string;
    bookingId?: Record<string, any>;
  };

  type CreateSupplierDto = {
    name: string;
    contactPerson: string;
    /** Số điện thoại VN 10 chữ số */
    phone: string;
    email?: string;
    address: string;
    /** Mã số thuế (tuỳ chọn) */
    taxCode?: string;
    note?: string;
  };

  type CustomerControllerFindAllParams = {
    /** Tìm theo fullName hoặc phone (regex, case-insensitive) */
    search?: string;
    source?: 'WALK_IN' | 'ONLINE_BOOKING' | 'MANUAL';
    /** Lọc theo trạng thái active */
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'fullName' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  };

  type CustomerControllerFindByPhoneParams = {
    phone: string;
  };

  type CustomerControllerFindOneParams = {
    id: string;
  };

  type CustomerControllerToggleActiveParams = {
    id: string;
  };

  type CustomerControllerUpdateParams = {
    id: string;
  };

  type CustomerResponseDto = {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    source: 'WALK_IN' | 'ONLINE_BOOKING' | 'MANUAL';
    note: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    /** ISO 8601 hoặc null */
    lastVerifiedAt: string;
    isActive: boolean;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type DashboardBookingsDto = {
    /** Tổng booking trong tháng */
    total: number;
    /** Đếm theo status, vd { CONFIRMED: 3, COMPLETED: 5 } */
    byStatus: Record<string, any>;
  };

  type DashboardOverviewDto = {
    revenue: DashboardRevenueDto;
    bookings: DashboardBookingsDto;
    /** Số service_order COMPLETED+INVOICED tháng này */
    servicesCompleted: number;
    /** Số vật liệu tồn kho <= reorderLevel */
    lowStockCount: number;
    topServices: ServiceRevenueRowDto[];
  };

  type DashboardRevenueDto = {
    /** Doanh thu tháng hiện tại */
    thisMonth: number;
    /** Doanh thu hôm nay */
    today: number;
  };

  type EmployeeControllerDeleteAccountParams = {
    id: string;
  };

  type EmployeeControllerFindAllParams = {
    page?: number;
    limit?: number;
    /** Tìm theo họ tên hoặc email */
    search?: string;
    role?: 'ADMIN' | 'OPERATOR' | 'STAFF';
    workStatus?: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
    sortBy?: 'fullName' | 'startedAt';
    sortOrder?: 'asc' | 'desc';
  };

  type EmployeeControllerFindOneParams = {
    id: string;
  };

  type EmployeeControllerLockAccountParams = {
    id: string;
  };

  type EmployeeControllerResetPasswordParams = {
    id: string;
  };

  type EmployeeControllerUnlockAccountParams = {
    id: string;
  };

  type EmployeeControllerUpdateParams = {
    id: string;
  };

  type FinalizeBatchDto = {
    periodYear: number;
    periodMonth: number;
    /** true: chỉ chốt staff có phát sinh hoa hồng trong tháng; false: chốt mọi STAFF active (kể cả hoa hồng = 0). */
    onlyWithCommission?: boolean;
  };

  type FinalizePayrollDto = {
    staffId: string;
    periodYear: number;
    periodMonth: number;
    /** Phụ cấp/phạt thủ công, cho phép âm lẫn dương. Default 0. */
    adjustment?: number;
    note?: string;
  };

  type FindOrCreateCustomerDto = {
    fullName: string;
    /** Số điện thoại VN 10 chữ số */
    phone: string;
    email?: string;
  };

  type FindOrCreateResponseDto = {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    source: 'WALK_IN' | 'ONLINE_BOOKING' | 'MANUAL';
    note: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    /** ISO 8601 hoặc null */
    lastVerifiedAt: string;
    isActive: boolean;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
    wasCreated: boolean;
  };

  type InvoiceControllerCancelParams = {
    id: string;
  };

  type InvoiceControllerExportPdfParams = {
    id: string;
  };

  type InvoiceControllerFinalizeParams = {
    id: string;
  };

  type InvoiceControllerFindAllParams = {
    page?: number;
    limit?: number;
    customerId?: string;
    status?: 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';
    paymentMethod?: 'CASH' | 'VNPAY';
    invoiceCode?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: 'createdAt' | 'paidAt' | 'totalAmount';
    sortOrder?: 'asc' | 'desc';
  };

  type InvoiceControllerFindOneParams = {
    id: string;
  };

  type InvoiceControllerMarkPaidParams = {
    id: string;
  };

  type InvoiceControllerUpdateParams = {
    id: string;
  };

  type InvoiceCustomerBriefDto = {
    id: string;
    fullName: string;
    phone: string;
  };

  type InvoiceCustomerSnapshotDto = {
    fullName: string;
    phone: string;
    email: string;
  };

  type InvoiceItemResponseDto = {
    id: string;
    serviceOrderItemId: string;
    serviceId: string;
    serviceCode: string;
    serviceName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    staffId: string;
    staffName: string;
    commissionRate: number;
    commissionAmount: number;
  };

  type InvoiceResponseDto = {
    id: string;
    invoiceCode: string;
    serviceOrderId: string;
    customerId: string;
    customer?: InvoiceCustomerBriefDto;
    customerSnapshot: InvoiceCustomerSnapshotDto;
    items: InvoiceItemResponseDto[];
    itemsSubtotal: number;
    extraCharge: number;
    discountAmount: number;
    totalAmount: number;
    status: 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';
    paymentMethod?: 'CASH' | 'VNPAY';
    createdBy: string;
    createdByName: string;
    /** ISO 8601 */
    paidAt?: Record<string, any>;
    paidBy?: Record<string, any>;
    paidByName?: Record<string, any>;
    /** ISO 8601 */
    cancelledAt?: Record<string, any>;
    cancelledBy?: Record<string, any>;
    cancelReason?: Record<string, any>;
    note: string;
    stockDeducted: boolean;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type LedgerResponseDto = {
    id: string;
    materialId: string;
    materialCode: string;
    materialName: string;
    materialUnit: string;
    transactionType: 'IN' | 'OUT_INVOICE' | 'OUT_MANUAL' | 'ADJUSTMENT';
    quantityChange: number;
    stockBefore: number;
    stockAfter: number;
    supplierId?: Record<string, any>;
    supplierName?: Record<string, any>;
    unitPrice?: Record<string, any>;
    totalCost?: Record<string, any>;
    referenceType?: 'INVOICE' | 'STOCK_IN' | 'STOCK_OUT_MANUAL' | 'ADJUSTMENT';
    referenceId?: Record<string, any>;
    performedBy: string;
    performedByName: string;
    reason: string;
    /** ISO 8601 */
    createdAt: string;
  };

  type LoginDto = {
    email: string;
    password: string;
  };

  type LowStockResponseDto = {
    materialId: string;
    materialCode: string;
    materialName: string;
    stockQuantity: number;
    reorderLevel: number;
    unit: string;
    supplier?: LowStockSupplierBriefDto;
  };

  type LowStockSupplierBriefDto = {
    id: string;
    name: string;
    phone: string;
  };

  type MarkPaidDto = {
    /** Phase 1 chỉ accept CASH; VNPAY là phase 4 */
    paymentMethod: 'CASH' | 'VNPAY';
  };

  type MaterialControllerFindAllParams = {
    /** Tìm theo name (regex, case-insensitive) */
    search?: string;
    /** Lọc theo trạng thái active */
    isActive?: boolean;
    type?: 'CONSUMABLE' | 'DEPRECIATION';
    /** Lọc theo supplierId (MongoId) */
    supplierId?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'stockQuantity' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  };

  type MaterialControllerFindOneParams = {
    id: string;
  };

  type MaterialControllerUpdateParams = {
    id: string;
  };

  type MaterialResponseDto = {
    id: string;
    code: string;
    name: string;
    description: string;
    unit: string;
    type: 'CONSUMABLE' | 'DEPRECIATION';
    unitPrice: number;
    stockQuantity: number;
    reorderLevel: number;
    expectedUsesPerUnit: number;
    supplierId: string;
    supplier?: MaterialSupplierBriefDto;
    isActive: boolean;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type MaterialSupplierBriefDto = {
    id: string;
    name: string;
  };

  type PayrollBatchResultDto = {
    created: number;
    skipped: number;
    details: { staffId?: string; status?: string; payrollCode?: string; reason?: string }[];
  };

  type PayrollCommissionBreakdownDto = {
    serviceId: string;
    serviceName: string;
    serviceCount: number;
    totalCommission: number;
  };

  type PayrollControllerCancelParams = {
    id: string;
  };

  type PayrollControllerExportPdfParams = {
    id: string;
  };

  type PayrollControllerFindAllParams = {
    page?: number;
    limit?: number;
    periodYear?: number;
    periodMonth?: number;
    staffId?: string;
    status?: 'FINALIZED' | 'PAID' | 'CANCELLED';
    sortBy?: 'finalizedAt' | 'totalIncome';
    sortOrder?: 'asc' | 'desc';
  };

  type PayrollControllerFindMineParams = {
    page?: number;
    limit?: number;
    periodYear?: number;
    periodMonth?: number;
    staffId?: string;
    status?: 'FINALIZED' | 'PAID' | 'CANCELLED';
    sortBy?: 'finalizedAt' | 'totalIncome';
    sortOrder?: 'asc' | 'desc';
  };

  type PayrollControllerFindOneParams = {
    id: string;
  };

  type PayrollControllerMarkPaidParams = {
    id: string;
  };

  type PayrollControllerPreviewParams = {
    staffId: string;
    periodYear: number;
    periodMonth: number;
  };

  type PayrollPreviewDto = {
    staffId: string;
    staffSnapshot: PayrollStaffSnapshotDto;
    periodYear: number;
    periodMonth: number;
    baseSalary: number;
    totalCommission: number;
    adjustment: number;
    totalIncome: number;
    commissionBreakdown: PayrollCommissionBreakdownDto[];
    sourceInvoiceIds: string[];
    invoiceCount: number;
  };

  type PayrollResponseDto = {
    id: string;
    payrollCode: string;
    periodYear: number;
    periodMonth: number;
    staffId: string;
    staffSnapshot: PayrollStaffSnapshotDto;
    baseSalary: number;
    totalCommission: number;
    adjustment: number;
    totalIncome: number;
    commissionBreakdown: PayrollCommissionBreakdownDto[];
    sourceInvoiceIds: string[];
    invoiceCount: number;
    status: 'FINALIZED' | 'PAID' | 'CANCELLED';
    finalizedBy: string;
    finalizedByName: string;
    /** ISO 8601 */
    finalizedAt: string;
    /** ISO 8601 */
    paidAt?: Record<string, any>;
    paidBy?: Record<string, any>;
    /** ISO 8601 */
    cancelledAt?: Record<string, any>;
    cancelledBy?: Record<string, any>;
    cancelReason?: Record<string, any>;
    note: string;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type PayrollStaffSnapshotDto = {
    fullName: string;
    role: string;
  };

  type ReportPeriodDto = {
    fromDate: string;
    toDate: string;
  };

  type ReportsControllerExportRevenueExcelParams = {
    /** Đầu kỳ (YYYY-MM-DD) */
    fromDate: string;
    /** Cuối kỳ (YYYY-MM-DD) */
    toDate: string;
    /** Lọc doanh thu riêng 1 dịch vụ (RP-03) */
    serviceId?: string;
  };

  type ReportsControllerExportRevenuePdfParams = {
    /** Đầu kỳ (YYYY-MM-DD) */
    fromDate: string;
    /** Cuối kỳ (YYYY-MM-DD) */
    toDate: string;
    /** Lọc doanh thu riêng 1 dịch vụ (RP-03) */
    serviceId?: string;
  };

  type ReportsControllerGetByServiceParams = {
    /** Đầu kỳ (YYYY-MM-DD) */
    fromDate: string;
    /** Cuối kỳ (YYYY-MM-DD) */
    toDate: string;
    /** Lọc doanh thu riêng 1 dịch vụ (RP-03) */
    serviceId?: string;
  };

  type ReportsControllerGetByStaffParams = {
    /** Đầu kỳ (YYYY-MM-DD) */
    fromDate: string;
    /** Cuối kỳ (YYYY-MM-DD) */
    toDate: string;
    /** Lọc doanh thu riêng 1 dịch vụ (RP-03) */
    serviceId?: string;
  };

  type ReportsControllerGetRevenueReportParams = {
    /** Đầu kỳ (YYYY-MM-DD) */
    fromDate: string;
    /** Cuối kỳ (YYYY-MM-DD) */
    toDate: string;
    /** Lọc doanh thu riêng 1 dịch vụ (RP-03) */
    serviceId?: string;
  };

  type ReportsControllerGetServiceInvoicesParams = {
    /** Đầu kỳ (YYYY-MM-DD) */
    fromDate: string;
    /** Cuối kỳ (YYYY-MM-DD) */
    toDate: string;
    /** Dịch vụ cần xem chi tiết hóa đơn */
    serviceId: string;
    page?: number;
    limit?: number;
  };

  type RequestBookingOtpDto = {
    serviceId: string;
    scheduledStart: string;
    fullName: string;
    phone: string;
    email: string;
    note?: string;
  };

  type ResendBookingOtpDto = {
    bookingId: string;
  };

  type ResendOtpResponseDto = {
    resent: boolean;
  };

  type RevenueReportDto = {
    period: ReportPeriodDto;
    /** serviceId được lọc (RP-03), null nếu xem toàn kỳ */
    serviceId?: Record<string, any>;
    /** Tổng doanh thu kỳ — Σ totalAmount (đã trừ giảm giá). Khi lọc serviceId: Σ items.subtotal của dịch vụ đó. */
    totalRevenue: number;
    /** Số hóa đơn PAID trong kỳ */
    invoiceCount: number;
    breakdown: ServiceRevenueRowDto[];
    note: string;
  };

  type ServiceControllerFindAllParams = {
    /** Tìm kiếm theo tên dịch vụ (partial, case-insensitive) */
    search?: string;
    category?: 'SWEDISH' | 'HOT_STONE' | 'THAI' | 'FOOT' | 'NECK_SHOULDER' | 'AROMA';
    /** Lọc theo trạng thái active */
    isActive?: boolean;
    /** Giá tối thiểu (VND) */
    minPrice?: number;
    /** Giá tối đa (VND) */
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'unitPrice' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  };

  type ServiceControllerFindOneParams = {
    id: string;
  };

  type ServiceControllerUpdateParams = {
    id: string;
  };

  type ServiceInvoiceRowDto = {
    invoiceId: string;
    invoiceCode: string;
    customerName: string;
    /** ISO 8601 */
    paidAt: string;
    /** Tên dịch vụ trong dòng item */
    serviceName: string;
    quantity: number;
    /** items.subtotal của dòng dịch vụ */
    subtotal: number;
  };

  type ServiceMaterialBomControllerFindAllParams = {
    /** Filter theo serviceId */
    serviceId?: string;
    /** Filter theo materialId */
    materialId?: string;
    /** Filter theo trạng thái active */
    isActive?: boolean;
  };

  type ServiceMaterialBomControllerFindByMaterialParams = {
    materialId: string;
  };

  type ServiceMaterialBomControllerFindByServiceParams = {
    serviceId: string;
  };

  type ServiceMaterialBomControllerFindOneParams = {
    id: string;
  };

  type ServiceMaterialBomControllerRemoveParams = {
    id: string;
  };

  type ServiceMaterialBomControllerUpdateParams = {
    id: string;
  };

  type ServiceOrderControllerAddItemParams = {
    id: string;
  };

  type ServiceOrderControllerCancelParams = {
    id: string;
  };

  type ServiceOrderControllerCompleteParams = {
    id: string;
  };

  type ServiceOrderControllerFindAllParams = {
    page?: number;
    limit?: number;
    customerId?: string;
    status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CANCELLED';
    fromDate?: string;
    toDate?: string;
    sortBy?: 'createdAt' | 'totalAmount';
    sortOrder?: 'asc' | 'desc';
  };

  type ServiceOrderControllerFindOneParams = {
    id: string;
  };

  type ServiceOrderControllerRemoveItemParams = {
    id: string;
    itemId: string;
  };

  type ServiceOrderControllerUpdateItemParams = {
    id: string;
    itemId: string;
  };

  type ServiceOrderControllerUpdateParams = {
    id: string;
  };

  type ServiceOrderCustomerResponseDto = {
    id: string;
    fullName: string;
    phone: string;
  };

  type ServiceOrderItemResponseDto = {
    id: string;
    serviceId: string;
    serviceCode: string;
    serviceName: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    staffId: string;
    staffName: string;
    commissionRate: number;
    note: string;
    /** ISO 8601 */
    addedAt: string;
  };

  type ServiceOrderResponseDto = {
    id: string;
    orderCode: string;
    customerId: string;
    customer?: ServiceOrderCustomerResponseDto;
    items: ServiceOrderItemResponseDto[];
    itemsSubtotal: number;
    extraCharge: number;
    totalAmount: number;
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CANCELLED';
    note: string;
    createdBy: string;
    createdByName: string;
    bookingId?: Record<string, any>;
    /** ISO 8601 hoặc null */
    startedAt?: Record<string, any>;
    /** ISO 8601 hoặc null */
    completedAt?: Record<string, any>;
    /** ISO 8601 hoặc null */
    invoicedAt?: Record<string, any>;
    /** ISO 8601 hoặc null */
    cancelledAt?: Record<string, any>;
    cancelledBy?: Record<string, any>;
    cancelReason?: Record<string, any>;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type ServiceResponseDto = {
    id: string;
    code: string;
    name: string;
    category: 'SWEDISH' | 'HOT_STONE' | 'THAI' | 'FOOT' | 'NECK_SHOULDER' | 'AROMA';
    /** Giá bán (VND) */
    unitPrice: number;
    /** Thời gian thực hiện (phút) */
    durationMinutes: number;
    /** Thời gian dọn dẹp (phút) */
    bufferMinutes: number;
    /** Số slot chiếm dụng */
    slotsRequired: number;
    description: string;
    imageUrl?: string;
    isActive: boolean;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type ServiceRevenueRowDto = {
    serviceId: string;
    serviceName: string;
    /** Số lượt phục vụ (Σ items.quantity) */
    count: number;
    /** Doanh thu (Σ items.subtotal) */
    revenue: number;
  };

  type SlotInfoDto = {
    time: string;
    status: 'FREE' | 'BUSY';
    bookingId?: string;
  };

  type StaffResponseDto = {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: 'ADMIN' | 'OPERATOR' | 'STAFF';
    /** Lương cứng tháng - VND */
    baseSalary: number;
    workStatus: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
    accountStatus: 'ACTIVE' | 'LOCKED' | 'DELETED';
    /** ISO 8601 */
    startedAt: string;
    mustChangePassword: boolean;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type StaffServiceAssignmentControllerFindAllParams = {
    staffId?: string;
    serviceId?: string;
    isActive?: boolean;
  };

  type StaffServiceAssignmentControllerFindByServiceParams = {
    serviceId: string;
  };

  type StaffServiceAssignmentControllerFindByStaffParams = {
    staffId: string;
  };

  type StaffServiceAssignmentControllerUpdateParams = {
    id: string;
  };

  type StaffStatsDto = {
    staffId: string;
    staffName: string;
    /** Số lượt phục vụ (Σ items.quantity) */
    serviceCount: number;
    /** Doanh thu mang lại (Σ items.subtotal) */
    revenueGenerated: number;
    /** Tổng hoa hồng (Σ items.commissionAmount) */
    totalCommission: number;
  };

  type StockControllerFindAllParams = {
    page?: number;
    limit?: number;
    materialId?: string;
    transactionType?: 'IN' | 'OUT_INVOICE' | 'OUT_MANUAL' | 'ADJUSTMENT';
    referenceType?: 'INVOICE' | 'STOCK_IN' | 'STOCK_OUT_MANUAL' | 'ADJUSTMENT';
    /** ISO date (YYYY-MM-DD hoặc full ISO) */
    fromDate?: string;
    /** ISO date (YYYY-MM-DD hoặc full ISO) */
    toDate?: string;
    sortBy?: 'createdAt';
    sortOrder?: 'asc' | 'desc';
  };

  type StockControllerFindByMaterialParams = {
    materialId: string;
    page?: number;
    limit?: number;
    materialId?: string;
    transactionType?: 'IN' | 'OUT_INVOICE' | 'OUT_MANUAL' | 'ADJUSTMENT';
    referenceType?: 'INVOICE' | 'STOCK_IN' | 'STOCK_OUT_MANUAL' | 'ADJUSTMENT';
    /** ISO date (YYYY-MM-DD hoặc full ISO) */
    fromDate?: string;
    /** ISO date (YYYY-MM-DD hoặc full ISO) */
    toDate?: string;
    sortBy?: 'createdAt';
    sortOrder?: 'asc' | 'desc';
  };

  type StockControllerFindByReferenceParams = {
    type: 'INVOICE' | 'STOCK_IN' | 'STOCK_OUT_MANUAL' | 'ADJUSTMENT';
    id: string;
  };

  type StockControllerGetSummaryParams = {
    /** ISO date */
    fromDate?: string;
    /** ISO date */
    toDate?: string;
  };

  type StockInDto = {
    materialId: string;
    /** Số lượng nhập (>0) */
    quantity: number;
    supplierId: string;
    /** Giá nhập (VND, integer) */
    unitPrice: number;
    reason?: string;
  };

  type StockOutManualDto = {
    materialId: string;
    /** Số lượng xuất (>0, sẽ lưu âm trong ledger) */
    quantity: number;
    /** Lý do xuất kho (bắt buộc) */
    reason: string;
  };

  type StockSummaryBucketDto = {
    count: number;
    quantity: number;
    cost: number;
  };

  type StockSummaryResponseDto = {
    totalIn: StockSummaryBucketDto;
    totalOutInvoice: StockSummaryBucketDto;
    totalOutManual: StockSummaryBucketDto;
    totalAdjustment: StockSummaryBucketDto;
  };

  type SupplierControllerFindAllParams = {
    /** Tìm theo name hoặc phone (regex, case-insensitive) */
    search?: string;
    /** Lọc theo trạng thái active */
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  };

  type SupplierControllerFindOneParams = {
    id: string;
  };

  type SupplierControllerUpdateParams = {
    id: string;
  };

  type SupplierResponseDto = {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    taxCode: string;
    note: string;
    isActive: boolean;
    /** ISO 8601 */
    createdAt: string;
    /** ISO 8601 */
    updatedAt: string;
  };

  type UpdateAssignmentDto = {
    commissionRate?: number;
    /** ISO 8601 */
    assignedSince?: string;
    isActive?: boolean;
    note?: string;
  };

  type UpdateBomDto = {
    standardQuantity?: number;
    note?: string;
    isActive?: boolean;
  };

  type UpdateBookingDto = {
    note?: string;
    /** Chi ho tro CHECKED_IN -> IN_PROGRESS -> COMPLETED */
    status?: 'IN_PROGRESS' | 'COMPLETED';
  };

  type UpdateCustomerDto = {
    fullName?: string;
    email?: string;
    source?: 'WALK_IN' | 'ONLINE_BOOKING' | 'MANUAL';
    note?: string;
    /** Bị bỏ qua nếu gửi lên; phone là định danh không cho sửa. */
    phone?: string;
  };

  type UpdateEmployeeDto = {
    fullName?: string;
    phone?: string;
    role?: 'ADMIN' | 'OPERATOR' | 'STAFF';
    /** Lương cứng tháng - VND */
    baseSalary?: number;
    startedAt?: string;
    workStatus?: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
  };

  type UpdateInvoiceDto = {
    discountAmount?: number;
    note?: string;
  };

  type UpdateItemDto = {
    quantity?: number;
    note?: string;
    /** Field tương thích request cũ, service sẽ bỏ qua */
    serviceId?: string;
  };

  type UpdateMaterialDto = {
    code?: string;
    name?: string;
    description?: string;
    /** ml | gram | piece | set */
    unit?: string;
    type?: 'CONSUMABLE' | 'DEPRECIATION';
    /** Giá nhập đơn vị (VND, integer) */
    unitPrice?: number;
    stockQuantity?: number;
    reorderLevel?: number;
    /** Số lần dùng được/unit — required khi type=DEPRECIATION */
    expectedUsesPerUnit?: number;
    supplierId?: string;
    /** Toggle vô hiệu hoá vật liệu */
    isActive?: boolean;
  };

  type UpdateServiceDto = {
    /** Mã dịch vụ duy nhất (A-Z, 0-9, _), 3-30 ký tự */
    code?: string;
    name?: string;
    category?: 'SWEDISH' | 'HOT_STONE' | 'THAI' | 'FOOT' | 'NECK_SHOULDER' | 'AROMA';
    /** Giá bán (VND) */
    unitPrice?: number;
    /** Thời gian thực hiện (phút) */
    durationMinutes?: number;
    /** Thời gian dọn dẹp (phút) */
    bufferMinutes?: number;
    /** Số slot chiếm dụng */
    slotsRequired?: number;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
  };

  type UpdateServiceOrderDto = {
    note?: string;
    extraCharge?: number;
    /** PATCH chỉ cho phép DRAFT -> IN_PROGRESS */
    status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED' | 'CANCELLED';
  };

  type UpdateSupplierDto = {
    name?: string;
    contactPerson?: string;
    /** Số điện thoại VN 10 chữ số */
    phone?: string;
    email?: string;
    address?: string;
    /** Mã số thuế (tuỳ chọn) */
    taxCode?: string;
    note?: string;
    /** Toggle vô hiệu hoá NCC */
    isActive?: boolean;
  };

  type UploadImageResponseDto = {
    url: string;
    publicId: string;
  };

  type VerifyBookingOtpDto = {
    bookingId: string;
    code: string;
  };

  type VerifyOtpResponseDto = {
    confirmed: boolean;
  };
}
