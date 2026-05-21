import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { DEFAULT_PAGE, MAX_LIMIT } from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CustomerService } from '../customer/customer.service';
import { EmployeeService } from '../employee/employee/employee.service';
import { ServiceService } from '../service/service.service';
import { StaffServiceAssignmentService } from '../staff-service-assignment/staff-service-assignment.service';
import { AddItemDto } from './dto/add-item.dto';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import {
  QueryServiceOrderDto,
  ServiceOrderSortField,
} from './dto/query-service-order.dto';
import {
  ServiceOrderCustomerResponseDto,
  ServiceOrderResponseDto,
} from './dto/service-order-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import {
  ServiceOrder,
  ServiceOrderDocument,
  ServiceOrderItem,
  ServiceOrderStatus,
} from './service-order.schema';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ORDER_CODE_RETRY_LIMIT = 3;
const SERVICE_ORDER_EDITABLE_STATUSES = [
  ServiceOrderStatus.DRAFT,
  ServiceOrderStatus.IN_PROGRESS,
];

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectModel(ServiceOrder.name)
    private readonly serviceOrderModel: Model<ServiceOrderDocument>,
    private readonly customerService: CustomerService,
    private readonly serviceService: ServiceService,
    private readonly assignmentService: StaffServiceAssignmentService,
    private readonly employeeService: EmployeeService,
  ) {}

  /**
   * Sinh mã phiếu dịch vụ dạng SO-YYYYMMDD-NNNN theo số phiếu trong ngày.
   *
   * @returns Mã phiếu dịch vụ mới
   */
  async generateOrderCode(): Promise<string> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const count = await this.serviceOrderModel.countDocuments({
      created_at: { $gte: startOfDay, $lt: endOfDay },
    });

    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const sequence = String(count + 1).padStart(4, '0');

    return `SO-${datePart}-${sequence}`;
  }

  /**
   * Tạo phiếu dịch vụ rỗng cho khách hàng.
   *
   * @param dto - Dữ liệu tạo phiếu
   * @param currentUser - Nhân viên vận hành/admin đang đăng nhập
   * @returns Phiếu dịch vụ vừa tạo
   * @throws BadRequestException - Customer không tồn tại hoặc inactive
   * @throws ConflictException - Không sinh được orderCode duy nhất sau retry
   */
  async create(
    dto: CreateServiceOrderDto,
    currentUser: AuthenticatedUser,
  ): Promise<ServiceOrderResponseDto> {
    await this.assertCustomerActive(dto.customerId);

    const createdByName = await this.resolveCreatedByName(currentUser);
    const payload = {
      customerId: new Types.ObjectId(dto.customerId),
      items: [],
      itemsSubtotal: 0,
      extraCharge: 0,
      totalAmount: 0,
      status: ServiceOrderStatus.DRAFT,
      note: dto.note?.trim() ?? '',
      createdBy: new Types.ObjectId(currentUser.id),
      createdByName,
      bookingId: dto.bookingId ? new Types.ObjectId(dto.bookingId) : null,
      startedAt: null,
      completedAt: null,
      invoicedAt: null,
      cancelledAt: null,
    };

    for (let attempt = 1; attempt <= ORDER_CODE_RETRY_LIMIT; attempt += 1) {
      try {
        const orderCode = await this.generateOrderCode();
        const created = await this.serviceOrderModel.create({
          ...payload,
          orderCode,
        });
        return this.findOne(this.getObjectIdString(created._id));
      } catch (error) {
        if (
          this.isDuplicateKeyError(error) &&
          attempt < ORDER_CODE_RETRY_LIMIT
        ) {
          continue;
        }

        if (this.isDuplicateKeyError(error)) {
          throw new ConflictException({
            code: ERROR_CODES.VALIDATION_FAILED,
            message:
              'Không thể sinh mã phiếu dịch vụ duy nhất, vui lòng thử lại',
          });
        }

        throw error;
      }
    }

    throw new ConflictException({
      code: ERROR_CODES.VALIDATION_FAILED,
      message: 'Không thể sinh mã phiếu dịch vụ duy nhất, vui lòng thử lại',
    });
  }

  /**
   * Thêm một service item vào phiếu, snapshot service/staff/commission tại thời điểm thêm.
   *
   * @param orderId - ObjectId của phiếu
   * @param dto - Dữ liệu item cần thêm
   * @returns Phiếu sau khi thêm item
   * @throws BadRequestException - Phiếu/service/assignment không hợp lệ
   * @throws NotFoundException - Phiếu không tồn tại
   */
  async addItem(
    orderId: string,
    dto: AddItemDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.findEditableOrderOrThrow(orderId);
    const service = await this.assertServiceActive(dto.serviceId);
    const assignment = await this.resolveActiveAssignment(dto.serviceId);

    const quantity = dto.quantity ?? 1;
    order.items.push({
      serviceId: new Types.ObjectId(dto.serviceId),
      serviceCode: service.code,
      serviceName: service.name,
      unitPrice: service.unitPrice,
      quantity,
      subtotal: service.unitPrice * quantity,
      staffId: new Types.ObjectId(assignment.staffId),
      staffName: assignment.staff.fullName,
      commissionRate: assignment.commissionRate,
      note: dto.note?.trim() ?? '',
      addedAt: new Date(),
    });

    this.recalculateTotals(order);
    await order.save();

    return this.findOne(orderId);
  }

  /**
   * Cập nhật số lượng hoặc ghi chú của item trong phiếu.
   *
   * @param orderId - ObjectId của phiếu
   * @param itemId - ObjectId sub-document item
   * @param dto - Dữ liệu cập nhật item
   * @returns Phiếu sau khi cập nhật item
   * @throws BadRequestException - Phiếu không còn editable
   * @throws NotFoundException - Phiếu hoặc item không tồn tại
   */
  async updateItem(
    orderId: string,
    itemId: string,
    dto: UpdateItemDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.findEditableOrderOrThrow(orderId);
    const item = this.findItemOrThrow(order, itemId);

    if (dto.quantity !== undefined) {
      item.quantity = dto.quantity;
      item.subtotal = item.unitPrice * item.quantity;
    }

    if (dto.note !== undefined) {
      item.note = dto.note.trim();
    }

    this.recalculateTotals(order);
    await order.save();

    return this.findOne(orderId);
  }

  /**
   * Xóa một item khỏi phiếu dịch vụ.
   *
   * @param orderId - ObjectId của phiếu
   * @param itemId - ObjectId sub-document item
   * @returns Phiếu sau khi xóa item
   * @throws BadRequestException - Phiếu không còn editable
   * @throws NotFoundException - Phiếu hoặc item không tồn tại
   */
  async removeItem(
    orderId: string,
    itemId: string,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.findEditableOrderOrThrow(orderId);
    this.findItemOrThrow(order, itemId);

    order.items = order.items.filter(
      (item) => this.getObjectIdString(item._id) !== itemId,
    );

    this.recalculateTotals(order);
    await order.save();

    return this.findOne(orderId);
  }

  /**
   * Cập nhật thông tin chung của phiếu và hỗ trợ transition DRAFT -> IN_PROGRESS.
   *
   * @param orderId - ObjectId của phiếu
   * @param dto - Dữ liệu cập nhật phiếu
   * @returns Phiếu sau khi cập nhật
   * @throws BadRequestException - Transition không hợp lệ hoặc phiếu chưa có item
   * @throws NotFoundException - Phiếu không tồn tại
   */
  async updateOrder(
    orderId: string,
    dto: UpdateServiceOrderDto,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.findOrderDocumentOrThrow(orderId);

    if (dto.note !== undefined) {
      order.note = dto.note.trim();
    }

    if (dto.extraCharge !== undefined) {
      order.extraCharge = dto.extraCharge;
    }

    if (dto.status !== undefined) {
      this.applyPatchStatusTransition(order, dto.status);
    }

    this.recalculateTotals(order);
    await order.save();

    return this.findOne(orderId);
  }

  /**
   * Đánh dấu phiếu IN_PROGRESS là COMPLETED.
   *
   * @param orderId - ObjectId của phiếu
   * @returns Phiếu đã hoàn thành
   * @throws BadRequestException - Trạng thái hiện tại không phải IN_PROGRESS
   * @throws NotFoundException - Phiếu không tồn tại
   */
  async complete(orderId: string): Promise<ServiceOrderResponseDto> {
    const order = await this.findOrderDocumentOrThrow(orderId);

    if (order.status !== ServiceOrderStatus.IN_PROGRESS) {
      throw this.invalidStatusException();
    }

    order.status = ServiceOrderStatus.COMPLETED;
    order.completedAt = new Date();
    await order.save();

    return this.findOne(orderId);
  }

  /**
   * Hủy phiếu dịch vụ nếu phiếu chưa được invoiced.
   *
   * @param orderId - ObjectId của phiếu
   * @param reason - Lý do hủy
   * @returns Phiếu đã hủy
   * @throws BadRequestException - Phiếu đã invoiced hoặc đã cancelled
   * @throws NotFoundException - Phiếu không tồn tại
   */
  async cancel(
    orderId: string,
    reason: string,
  ): Promise<ServiceOrderResponseDto> {
    const order = await this.findOrderDocumentOrThrow(orderId);

    if (order.status === ServiceOrderStatus.INVOICED) {
      throw new BadRequestException({
        code: ERROR_CODES.SERVICE_ORDER_CANNOT_CANCEL_INVOICED,
        message: 'Phiếu đã thanh toán không thể hủy',
      });
    }

    if (order.status === ServiceOrderStatus.CANCELLED) {
      throw this.invalidStatusException();
    }

    const trimmedReason = reason.trim();
    order.status = ServiceOrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    order.note = order.note
      ? `${order.note}\nHủy phiếu: ${trimmedReason}`
      : `Hủy phiếu: ${trimmedReason}`;

    await order.save();

    return this.findOne(orderId);
  }

  /**
   * Internal method cho Invoice module chuyển phiếu COMPLETED sang INVOICED trong transaction.
   *
   * @param orderId - ObjectId của phiếu dịch vụ
   * @param invoiceId - ObjectId invoice vừa tạo, dùng để validate contract nội bộ
   * @param session - Mongoose session của transaction invoice
   * @returns Phiếu đã chuyển INVOICED
   * @throws BadRequestException - Phiếu chưa COMPLETED hoặc invoiceId không hợp lệ
   * @throws NotFoundException - Phiếu không tồn tại
   */
  async markAsInvoiced(
    orderId: string,
    invoiceId: string,
    session?: ClientSession,
  ): Promise<ServiceOrderResponseDto> {
    if (!Types.ObjectId.isValid(invoiceId)) {
      throw new BadRequestException({
        code: ERROR_CODES.INVALID_OBJECT_ID,
        message: `ID '${invoiceId}' không hợp lệ`,
      });
    }

    const order = await this.findOrderDocumentOrThrow(orderId, session);

    if (order.status !== ServiceOrderStatus.COMPLETED) {
      throw this.invalidStatusException();
    }

    order.status = ServiceOrderStatus.INVOICED;
    order.invoicedAt = new Date();
    await order.save({ session });

    return this.findOne(orderId, session);
  }

  /**
   * Danh sách phiếu dịch vụ với filter customer/status/date và pagination.
   *
   * @param query - Tham số filter/pagination/sort
   * @returns Danh sách phiếu kèm meta phân trang
   */
  async findAll(query: QueryServiceOrderDto): Promise<{
    data: ServiceOrderResponseDto[];
    meta: PaginationMeta;
  }> {
    const filter: Record<string, unknown> = {};

    if (query.customerId) {
      filter.customerId = new Types.ObjectId(query.customerId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    const createdAtFilter = this.buildCreatedAtFilter(
      query.fromDate,
      query.toDate,
    );
    if (createdAtFilter) {
      filter.created_at = createdAtFilter;
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? 10, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const sortFieldMap: Record<ServiceOrderSortField, string> = {
      createdAt: 'created_at',
      totalAmount: 'totalAmount',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'createdAt'];
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.serviceOrderModel
        .find(filter)
        .populate('customerId', 'fullName phone')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.serviceOrderModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapToResponse(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết phiếu dịch vụ theo ID.
   *
   * @param id - ObjectId của phiếu
   * @param session - Mongoose session optional cho internal transaction
   * @returns Phiếu dịch vụ đã populate customer
   * @throws NotFoundException - Phiếu không tồn tại
   */
  async findOne(
    id: string,
    session?: ClientSession,
  ): Promise<ServiceOrderResponseDto> {
    const query = this.serviceOrderModel
      .findById(id)
      .populate('customerId', 'fullName phone');

    if (session) {
      query.session(session);
    }

    const doc = await query.exec();
    if (!doc) {
      throw this.notFoundException();
    }

    return this.mapToResponse(doc);
  }

  private async assertCustomerActive(customerId: string): Promise<void> {
    try {
      const customer = await this.customerService.findOne(customerId);
      if (!customer.isActive) {
        throw this.customerInvalidException();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw this.customerInvalidException();
      }
      throw error;
    }
  }

  private async assertServiceActive(serviceId: string) {
    try {
      const service = await this.serviceService.findOne(serviceId);
      if (!service.isActive) {
        throw this.serviceInvalidException();
      }
      return service;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw this.serviceInvalidException();
      }
      throw error;
    }
  }

  private async resolveActiveAssignment(serviceId: string) {
    try {
      const assignment = await this.assignmentService.findByService(serviceId);
      if (!assignment.staff) {
        throw this.noStaffAssignedException();
      }
      return {
        ...assignment,
        staff: assignment.staff,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw this.noStaffAssignedException();
      }
      throw error;
    }
  }

  private async resolveCreatedByName(
    currentUser: AuthenticatedUser,
  ): Promise<string> {
    const staff = await this.employeeService.findById(currentUser.id);
    return staff?.fullName ?? currentUser.email;
  }

  private async findOrderDocumentOrThrow(
    orderId: string,
    session?: ClientSession,
  ): Promise<ServiceOrderDocument> {
    const query = this.serviceOrderModel.findById(orderId);
    if (session) {
      query.session(session);
    }

    const order = await query.exec();
    if (!order) {
      throw this.notFoundException();
    }

    return order;
  }

  private async findEditableOrderOrThrow(
    orderId: string,
  ): Promise<ServiceOrderDocument> {
    const order = await this.findOrderDocumentOrThrow(orderId);
    if (!SERVICE_ORDER_EDITABLE_STATUSES.includes(order.status)) {
      throw this.invalidStatusException();
    }

    return order;
  }

  private findItemOrThrow(
    order: ServiceOrderDocument,
    itemId: string,
  ): ServiceOrderItem {
    const item = order.items.find(
      (currentItem) => this.getObjectIdString(currentItem._id) === itemId,
    );

    if (!item) {
      throw new NotFoundException({
        code: ERROR_CODES.SERVICE_ORDER_ITEM_NOT_FOUND,
        message: 'Dịch vụ trong phiếu không tồn tại',
      });
    }

    return item;
  }

  private applyPatchStatusTransition(
    order: ServiceOrderDocument,
    targetStatus: ServiceOrderStatus,
  ): void {
    if (
      order.status !== ServiceOrderStatus.DRAFT ||
      targetStatus !== ServiceOrderStatus.IN_PROGRESS
    ) {
      throw this.invalidStatusException();
    }

    if (order.items.length === 0) {
      throw new BadRequestException({
        code: ERROR_CODES.SERVICE_ORDER_NO_ITEMS,
        message: 'Phiếu dịch vụ phải có ít nhất một dịch vụ',
      });
    }

    order.status = ServiceOrderStatus.IN_PROGRESS;
    order.startedAt = new Date();
  }

  private recalculateTotals(order: ServiceOrderDocument): void {
    order.itemsSubtotal = order.items.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    order.totalAmount = order.itemsSubtotal + order.extraCharge;
  }

  private buildCreatedAtFilter(fromDate?: string, toDate?: string) {
    if (!fromDate && !toDate) {
      return undefined;
    }

    const filter: { $gte?: Date; $lte?: Date } = {};
    if (fromDate) {
      filter.$gte = new Date(fromDate);
    }
    if (toDate) {
      const endDate = new Date(toDate);
      if (/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        endDate.setHours(23, 59, 59, 999);
      }
      filter.$lte = endDate;
    }

    return filter;
  }

  private mapToResponse(doc: ServiceOrderDocument): ServiceOrderResponseDto {
    const customer = this.mapCustomer(doc.customerId);

    return {
      id: this.getObjectIdString(doc._id),
      orderCode: doc.orderCode,
      customerId: this.getObjectIdString(doc.customerId),
      ...(customer ? { customer } : {}),
      items: doc.items.map((item) => ({
        id: this.getObjectIdString(item._id),
        serviceId: this.getObjectIdString(item.serviceId),
        serviceCode: item.serviceCode,
        serviceName: item.serviceName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        staffId: this.getObjectIdString(item.staffId),
        staffName: item.staffName,
        commissionRate: item.commissionRate,
        note: item.note ?? '',
        addedAt: item.addedAt?.toISOString() ?? '',
      })),
      itemsSubtotal: doc.itemsSubtotal,
      extraCharge: doc.extraCharge,
      totalAmount: doc.totalAmount,
      status: doc.status,
      note: doc.note ?? '',
      createdBy: this.getObjectIdString(doc.createdBy),
      createdByName: doc.createdByName,
      bookingId: doc.bookingId ? this.getObjectIdString(doc.bookingId) : null,
      startedAt: doc.startedAt?.toISOString() ?? null,
      completedAt: doc.completedAt?.toISOString() ?? null,
      invoicedAt: doc.invoicedAt?.toISOString() ?? null,
      cancelledAt: doc.cancelledAt?.toISOString() ?? null,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }

  private mapCustomer(
    value: unknown,
  ): ServiceOrderCustomerResponseDto | undefined {
    if (!value || value instanceof Types.ObjectId) {
      return undefined;
    }

    const customer = value as {
      _id?: unknown;
      fullName?: unknown;
      phone?: unknown;
    };

    if (
      !customer._id ||
      typeof customer.fullName !== 'string' ||
      typeof customer.phone !== 'string'
    ) {
      return undefined;
    }

    return {
      id: this.getObjectIdString(customer._id),
      fullName: customer.fullName,
      phone: customer.phone,
    };
  }

  private getObjectIdString(value: unknown): string {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (typeof value === 'object' && value !== null && '_id' in value) {
      const maybeDoc = value as { _id?: unknown };
      return this.getObjectIdString(maybeDoc._id);
    }

    return String(value);
  }

  private notFoundException(): NotFoundException {
    return new NotFoundException({
      code: ERROR_CODES.SERVICE_ORDER_NOT_FOUND,
      message: 'Phiếu dịch vụ không tồn tại',
    });
  }

  private customerInvalidException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.SERVICE_ORDER_CUSTOMER_INVALID,
      message: 'Khách hàng không tồn tại hoặc đang inactive',
    });
  }

  private serviceInvalidException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.SERVICE_ORDER_SERVICE_INVALID,
      message: 'Dịch vụ không tồn tại hoặc đang inactive',
    });
  }

  private invalidStatusException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.SERVICE_ORDER_INVALID_STATUS,
      message: 'Trạng thái phiếu dịch vụ không hợp lệ cho thao tác này',
    });
  }

  private noStaffAssignedException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.SERVICE_ORDER_NO_STAFF_ASSIGNED,
      message: 'Dịch vụ chưa có chuyên viên active phụ trách',
    });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
