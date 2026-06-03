import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CustomerService } from '../customer/customer.service';
import { ServiceMaterialBomService } from '../service-material-bom/service-material-bom.service';
import {
  ServiceOrder,
  ServiceOrderDocument,
  ServiceOrderStatus,
} from '../service-order/service-order.schema';
import { ServiceOrderService } from '../service-order/service-order.service';
import { StockLedgerService } from '../stock-ledger/stock-ledger.service';
import { CancelInvoiceDto } from './dto/cancel-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import {
  InvoiceCustomerBriefDto,
  InvoiceResponseDto,
} from './dto/invoice-response.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { InvoiceSortField, QueryInvoiceDto } from './dto/query-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import {
  Invoice,
  InvoiceDocument,
  InvoiceStatus,
  PaymentMethod,
} from './invoice.schema';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const INVOICE_CODE_RETRY_LIMIT = 3;

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(ServiceOrder.name)
    private readonly serviceOrderModel: Model<ServiceOrderDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly serviceOrderService: ServiceOrderService,
    private readonly bomService: ServiceMaterialBomService,
    private readonly stockLedgerService: StockLedgerService,
    private readonly customerService: CustomerService,
  ) {}

  /**
   * Sinh mã hóa đơn dạng INV-YYYYMMDD-NNNN theo số hóa đơn trong ngày.
   */
  async generateInvoiceCode(): Promise<string> {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const count = await this.invoiceModel.countDocuments({
      created_at: { $gte: startOfDay, $lt: endOfDay },
    });

    const datePart = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('');
    const sequence = String(count + 1).padStart(4, '0');

    return `INV-${datePart}-${sequence}`;
  }

  /**
   * Tạo invoice từ Service Order đã COMPLETED — snapshot toàn bộ items + customer.
   *
   * @throws BadRequestException - SO chưa COMPLETED hoặc discount vượt tổng
   * @throws ConflictException - SO đã có invoice
   */
  async create(
    dto: CreateInvoiceDto,
    currentUser: AuthenticatedUser,
  ): Promise<InvoiceResponseDto> {
    const serviceOrder = await this.serviceOrderModel
      .findById(dto.serviceOrderId)
      .exec();
    if (!serviceOrder) {
      throw new BadRequestException({
        code: ERROR_CODES.INVOICE_SO_NOT_COMPLETED,
        message: 'Phiếu dịch vụ không tồn tại',
      });
    }

    if (serviceOrder.status !== ServiceOrderStatus.COMPLETED) {
      throw new BadRequestException({
        code: ERROR_CODES.INVOICE_SO_NOT_COMPLETED,
        message:
          'Phiếu dịch vụ phải ở trạng thái COMPLETED mới có thể tạo hóa đơn',
      });
    }

    const existing = await this.invoiceModel.findOne({
      serviceOrderId: serviceOrder._id,
    });
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.INVOICE_SO_ALREADY_INVOICED,
        message: 'Phiếu dịch vụ này đã có hóa đơn',
      });
    }

    const customer = await this.customerService.findOne(
      serviceOrder.customerId.toString(),
    );

    const items = serviceOrder.items.map((item) => ({
      serviceOrderItemId: item._id ?? new Types.ObjectId(),
      serviceId: item.serviceId,
      serviceCode: item.serviceCode,
      serviceName: item.serviceName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
      staffId: item.staffId,
      staffName: item.staffName,
      commissionRate: item.commissionRate,
      commissionAmount: Math.round((item.subtotal * item.commissionRate) / 100),
    }));

    const itemsSubtotal = serviceOrder.itemsSubtotal;
    const extraCharge = serviceOrder.extraCharge;
    const discountAmount = dto.discountAmount ?? 0;

    if (discountAmount > itemsSubtotal + extraCharge) {
      throw new BadRequestException({
        code: ERROR_CODES.INVOICE_DISCOUNT_EXCEEDS_TOTAL,
        message: 'Số tiền giảm giá vượt quá tổng đơn',
      });
    }

    const totalAmount = itemsSubtotal + extraCharge - discountAmount;

    const payload = {
      serviceOrderId: serviceOrder._id,
      customerId: serviceOrder.customerId,
      customerSnapshot: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email ?? '',
      },
      items,
      itemsSubtotal,
      extraCharge,
      discountAmount,
      totalAmount,
      status: InvoiceStatus.DRAFT,
      paymentMethod: null,
      createdBy: new Types.ObjectId(currentUser.id),
      createdByName: this.resolveUserDisplayName(currentUser),
      note: dto.note?.trim() ?? '',
      stockDeducted: false,
    };

    for (let attempt = 1; attempt <= INVOICE_CODE_RETRY_LIMIT; attempt += 1) {
      try {
        const invoiceCode = await this.generateInvoiceCode();
        const created = await this.invoiceModel.create({
          ...payload,
          invoiceCode,
        });
        return this.findOne(created._id.toString());
      } catch (error) {
        if (
          this.isDuplicateKeyError(error) &&
          this.isInvoiceCodeDuplicate(error) &&
          attempt < INVOICE_CODE_RETRY_LIMIT
        ) {
          continue;
        }

        if (
          this.isDuplicateKeyError(error) &&
          !this.isInvoiceCodeDuplicate(error)
        ) {
          throw new ConflictException({
            code: ERROR_CODES.INVOICE_SO_ALREADY_INVOICED,
            message: 'Phiếu dịch vụ này đã có hóa đơn',
          });
        }

        throw error;
      }
    }

    throw new ConflictException({
      code: ERROR_CODES.VALIDATION_FAILED,
      message: 'Không thể sinh mã hóa đơn duy nhất, vui lòng thử lại',
    });
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoice = await this.findInvoiceOrThrow(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw this.invalidStatusException();
    }

    if (dto.discountAmount !== undefined) {
      if (dto.discountAmount > invoice.itemsSubtotal + invoice.extraCharge) {
        throw new BadRequestException({
          code: ERROR_CODES.INVOICE_DISCOUNT_EXCEEDS_TOTAL,
          message: 'Số tiền giảm giá vượt quá tổng đơn',
        });
      }
      invoice.discountAmount = dto.discountAmount;
      invoice.totalAmount =
        invoice.itemsSubtotal + invoice.extraCharge - invoice.discountAmount;
    }

    if (dto.note !== undefined) {
      invoice.note = dto.note.trim();
    }

    await invoice.save();
    return this.findOne(id);
  }

  /**
   * Chốt invoice: DRAFT -> PENDING_PAYMENT. Sau bước này không sửa được nữa.
   */
  async finalize(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.findInvoiceOrThrow(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw this.invalidStatusException();
    }

    invoice.status = InvoiceStatus.PENDING_PAYMENT;
    await invoice.save();
    return this.findOne(id);
  }

  /**
   * Confirm CASH paid: PENDING_PAYMENT -> PAID + Auto Stock Deduction trong cùng transaction.
   *
   * Workflow trong transaction:
   *  1) Verify invoice status + paymentMethod
   *  2) Aggregate (materialId -> totalDeductQty) từ BOM của các service trong items
   *  3) Loop deduct stock cho mỗi material — cho phép stock âm
   *  4) Service Order -> INVOICED
   *  5) Invoice -> PAID, stockDeducted=true
   *
   * @throws BadRequestException - status không phải PENDING_PAYMENT hoặc paymentMethod != CASH
   */
  async markPaid(
    id: string,
    dto: MarkPaidDto,
    currentUser: AuthenticatedUser,
  ): Promise<InvoiceResponseDto> {
    const paymentMethod = dto.paymentMethod ?? PaymentMethod.CASH;
    if (paymentMethod !== PaymentMethod.CASH) {
      throw new BadRequestException({
        code: ERROR_CODES.INVOICE_PAYMENT_METHOD_NOT_SUPPORTED,
        message: 'Phase 1 chỉ hỗ trợ thanh toán CASH',
      });
    }

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const invoice = await this.invoiceModel.findById(id).session(session);
        if (!invoice) {
          throw this.notFoundException();
        }

        if (invoice.status !== InvoiceStatus.PENDING_PAYMENT) {
          throw this.invalidStatusException();
        }

        const deductMap = await this.buildMaterialDeductMap(invoice);

        await this.serviceOrderService.markAsInvoiced(
          invoice.serviceOrderId.toString(),
          invoice._id.toString(),
          session,
        );

        for (const [materialId, quantity] of deductMap.entries()) {
          if (quantity <= 0) continue;
          await this.stockLedgerService.deductForInvoice(
            new Types.ObjectId(materialId),
            quantity,
            `Trừ kho từ hóa đơn ${invoice.invoiceCode}`,
            invoice._id,
            currentUser,
            session,
          );
        }

        invoice.status = InvoiceStatus.PAID;
        invoice.paymentMethod = paymentMethod;
        invoice.paidAt = new Date();
        invoice.paidBy = new Types.ObjectId(currentUser.id);
        invoice.paidByName = this.resolveUserDisplayName(currentUser);
        invoice.stockDeducted = true;
        await invoice.save({ session });
      });
    } finally {
      await session.endSession();
    }

    return this.findOne(id);
  }

  async cancel(
    id: string,
    dto: CancelInvoiceDto,
    currentUser: AuthenticatedUser,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.findInvoiceOrThrow(id);

    if (
      invoice.status !== InvoiceStatus.DRAFT &&
      invoice.status !== InvoiceStatus.PENDING_PAYMENT
    ) {
      throw new BadRequestException({
        code: ERROR_CODES.INVOICE_CANNOT_CANCEL_PAID,
        message: 'Chỉ được hủy invoice ở trạng thái DRAFT hoặc PENDING_PAYMENT',
      });
    }

    invoice.status = InvoiceStatus.CANCELLED;
    invoice.cancelledAt = new Date();
    invoice.cancelledBy = new Types.ObjectId(currentUser.id);
    invoice.cancelReason = dto.reason.trim();
    await invoice.save();

    return this.findOne(id);
  }

  async findAll(
    query: QueryInvoiceDto,
  ): Promise<{ data: InvoiceResponseDto[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = {};

    if (query.customerId) {
      filter.customerId = new Types.ObjectId(query.customerId);
    }
    if (query.status) filter.status = query.status;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.invoiceCode) filter.invoiceCode = query.invoiceCode;

    if (query.fromDate || query.toDate) {
      const range: Record<string, Date> = {};
      if (query.fromDate) range.$gte = new Date(query.fromDate);
      if (query.toDate) {
        const endDate = new Date(query.toDate);
        if (/^\d{4}-\d{2}-\d{2}$/.test(query.toDate)) {
          endDate.setHours(23, 59, 59, 999);
        }
        range.$lte = endDate;
      }
      filter.created_at = range;
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<InvoiceSortField, string> = {
      createdAt: 'created_at',
      paidAt: 'paidAt',
      totalAmount: 'totalAmount',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'createdAt'];
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .populate('customerId', 'fullName phone')
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.invoiceModel.countDocuments(filter).exec(),
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

  async findOne(id: string): Promise<InvoiceResponseDto> {
    const doc = await this.invoiceModel
      .findById(id)
      .populate('customerId', 'fullName phone')
      .exec();
    if (!doc) {
      throw this.notFoundException();
    }
    return this.mapToResponse(doc);
  }

  private async findInvoiceOrThrow(id: string): Promise<InvoiceDocument> {
    const doc = await this.invoiceModel.findById(id);
    if (!doc) {
      throw this.notFoundException();
    }
    return doc;
  }

  private async buildMaterialDeductMap(
    invoice: InvoiceDocument,
  ): Promise<Map<string, number>> {
    const deductMap = new Map<string, number>();

    const bomCache = new Map<
      string,
      Array<{ materialId: string; standardQuantity: number }>
    >();

    for (const item of invoice.items) {
      const serviceIdStr = item.serviceId.toString();
      let bomEntries = bomCache.get(serviceIdStr);
      if (!bomEntries) {
        const entries = await this.bomService.findByService(serviceIdStr);
        bomEntries = entries.map((e) => ({
          materialId: e.materialId,
          standardQuantity: e.standardQuantity,
        }));
        bomCache.set(serviceIdStr, bomEntries);
      }

      for (const entry of bomEntries) {
        const deductQty = entry.standardQuantity * item.quantity;
        const current = deductMap.get(entry.materialId) ?? 0;
        deductMap.set(entry.materialId, current + deductQty);
      }
    }

    return deductMap;
  }

  private mapToResponse(doc: InvoiceDocument): InvoiceResponseDto {
    const customer = this.mapCustomer(doc.customerId);

    return {
      id: doc._id.toString(),
      invoiceCode: doc.invoiceCode,
      serviceOrderId: doc.serviceOrderId.toString(),
      customerId: this.getObjectIdString(doc.customerId),
      ...(customer ? { customer } : {}),
      customerSnapshot: {
        fullName: doc.customerSnapshot.fullName,
        phone: doc.customerSnapshot.phone,
        email: doc.customerSnapshot.email ?? '',
      },
      items: doc.items.map((item) => ({
        id: (item._id as Types.ObjectId).toString(),
        serviceOrderItemId: item.serviceOrderItemId.toString(),
        serviceId: item.serviceId.toString(),
        serviceCode: item.serviceCode,
        serviceName: item.serviceName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        staffId: item.staffId.toString(),
        staffName: item.staffName,
        commissionRate: item.commissionRate,
        commissionAmount: item.commissionAmount,
      })),
      itemsSubtotal: doc.itemsSubtotal,
      extraCharge: doc.extraCharge,
      discountAmount: doc.discountAmount,
      totalAmount: doc.totalAmount,
      status: doc.status,
      paymentMethod: doc.paymentMethod,
      createdBy: doc.createdBy.toString(),
      createdByName: doc.createdByName,
      paidAt: doc.paidAt?.toISOString() ?? null,
      paidBy: doc.paidBy ? doc.paidBy.toString() : null,
      paidByName: doc.paidByName ?? null,
      cancelledAt: doc.cancelledAt?.toISOString() ?? null,
      cancelledBy: doc.cancelledBy ? doc.cancelledBy.toString() : null,
      cancelReason: doc.cancelReason ?? null,
      note: doc.note ?? '',
      stockDeducted: doc.stockDeducted,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }

  private mapCustomer(value: unknown): InvoiceCustomerBriefDto | undefined {
    if (!value || value instanceof Types.ObjectId) return undefined;
    const c = value as {
      _id?: unknown;
      fullName?: unknown;
      phone?: unknown;
    };
    if (
      !c._id ||
      typeof c.fullName !== 'string' ||
      typeof c.phone !== 'string'
    ) {
      return undefined;
    }
    return {
      id: this.getObjectIdString(c._id),
      fullName: c.fullName,
      phone: c.phone,
    };
  }

  private getObjectIdString(value: unknown): string {
    if (value instanceof Types.ObjectId) return value.toString();
    if (typeof value === 'object' && value !== null && '_id' in value) {
      return this.getObjectIdString((value as { _id?: unknown })._id);
    }
    return String(value);
  }

  private notFoundException(): NotFoundException {
    return new NotFoundException({
      code: ERROR_CODES.INVOICE_NOT_FOUND,
      message: 'Hóa đơn không tồn tại',
    });
  }

  private invalidStatusException(): BadRequestException {
    return new BadRequestException({
      code: ERROR_CODES.INVOICE_INVALID_STATUS,
      message: 'Trạng thái hóa đơn không hợp lệ cho thao tác này',
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

  private isInvoiceCodeDuplicate(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const keyPattern = (error as { keyPattern?: Record<string, unknown> })
      .keyPattern;
    return Boolean(keyPattern && 'invoiceCode' in keyPattern);
  }

  private resolveUserDisplayName(currentUser: AuthenticatedUser): string {
    return currentUser.fullName?.trim() || currentUser.email;
  }
}
