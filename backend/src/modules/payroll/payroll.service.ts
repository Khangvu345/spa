import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  Staff,
  StaffDocument,
  StaffRole,
  WorkStatus,
} from '../employee/employee/staff.schema';
import {
  Invoice,
  InvoiceDocument,
  InvoiceStatus,
} from '../invoice/invoice.schema';
import { CancelPayrollDto } from './dto/cancel-payroll.dto';
import { FinalizeBatchDto } from './dto/finalize-batch.dto';
import { FinalizePayrollDto } from './dto/finalize-payroll.dto';
import {
  PayrollBatchResultDto,
  PayrollPreviewDto,
  PayrollResponseDto,
} from './dto/payroll-response.dto';
import { PreviewPayrollDto } from './dto/preview-payroll.dto';
import { PayrollSortField, QueryPayrollDto } from './dto/query-payroll.dto';
import {
  PayrollRecord,
  PayrollRecordDocument,
  PayrollStatus,
} from './payroll.schema';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CommissionBreakdownEntry {
  serviceId: Types.ObjectId;
  serviceName: string;
  serviceCount: number;
  totalCommission: number;
}

interface AggregateCommissionResult {
  totalCommission: number;
  breakdown: CommissionBreakdownEntry[];
  invoiceIds: Types.ObjectId[];
  invoiceCount: number;
}

const PAYROLL_CODE_RETRY_LIMIT = 3;
const ACTIVE_STATUSES = [PayrollStatus.FINALIZED, PayrollStatus.PAID];

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectModel(PayrollRecord.name)
    private readonly payrollModel: Model<PayrollRecordDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
  ) {}

  // ──────────────────────────────────────
  // Core aggregation
  // ──────────────────────────────────────

  /**
   * Gom hoa hồng đã snapshot trong invoice items của 1 nhân viên trong 1 tháng.
   *
   * Lọc theo `invoice.paidAt` (mốc thực thu), KHÔNG phải created_at.
   * Chỉ tính invoice status = PAID. Cộng `items.commissionAmount` (đã snapshot ở #20),
   * KHÔNG tính lại từ rate/subtotal.
   */
  async aggregateCommission(
    staffId: string,
    year: number,
    month: number,
  ): Promise<AggregateCommissionResult> {
    const { start, end } = this.monthRange(year, month);
    const staffObjectId = new Types.ObjectId(staffId);

    const groups = await this.invoiceModel.aggregate<{
      _id: Types.ObjectId;
      serviceName: string;
      serviceCount: number;
      totalCommission: number;
      invoiceIds: Types.ObjectId[];
    }>([
      {
        $match: {
          status: InvoiceStatus.PAID,
          paidAt: { $gte: start, $lt: end },
        },
      },
      { $unwind: '$items' },
      { $match: { 'items.staffId': staffObjectId } },
      {
        $group: {
          _id: '$items.serviceId',
          serviceName: { $first: '$items.serviceName' },
          serviceCount: { $sum: '$items.quantity' },
          totalCommission: { $sum: '$items.commissionAmount' },
          invoiceIds: { $addToSet: '$_id' },
        },
      },
      { $sort: { totalCommission: -1 } },
    ]);

    const breakdown: CommissionBreakdownEntry[] = groups.map((g) => ({
      serviceId: g._id,
      serviceName: g.serviceName,
      serviceCount: g.serviceCount,
      totalCommission: g.totalCommission,
    }));

    const totalCommission = breakdown.reduce(
      (sum, b) => sum + b.totalCommission,
      0,
    );

    const invoiceIdSet = new Map<string, Types.ObjectId>();
    for (const g of groups) {
      for (const id of g.invoiceIds) {
        invoiceIdSet.set(id.toString(), id);
      }
    }
    const invoiceIds = [...invoiceIdSet.values()];

    return {
      totalCommission,
      breakdown,
      invoiceIds,
      invoiceCount: invoiceIds.length,
    };
  }

  // ──────────────────────────────────────
  // Finalize
  // ──────────────────────────────────────

  async finalize(
    dto: FinalizePayrollDto,
    currentUser: AuthenticatedUser,
  ): Promise<PayrollResponseDto> {
    const staff = await this.findStaffOrThrow(dto.staffId);
    const adjustment = dto.adjustment ?? 0;

    await this.ensureNoActivePayroll(
      dto.staffId,
      dto.periodYear,
      dto.periodMonth,
    );

    const doc = await this.createPayroll(
      staff,
      dto.periodYear,
      dto.periodMonth,
      adjustment,
      dto.note?.trim() ?? '',
      currentUser,
    );

    return this.mapToResponse(doc);
  }

  async finalizeBatch(
    dto: FinalizeBatchDto,
    currentUser: AuthenticatedUser,
  ): Promise<PayrollBatchResultDto> {
    const onlyWithCommission = dto.onlyWithCommission ?? true;
    const staffIds = onlyWithCommission
      ? await this.findStaffIdsWithCommission(dto.periodYear, dto.periodMonth)
      : await this.findActiveStaffIds();

    const details: PayrollBatchResultDto['details'] = [];
    let created = 0;
    let skipped = 0;

    for (const staffId of staffIds) {
      const staff = await this.staffModel.findById(staffId).exec();
      if (!staff) {
        skipped += 1;
        details.push({
          staffId,
          status: 'skipped',
          reason: 'STAFF_NOT_FOUND',
        });
        continue;
      }

      const hasActive = await this.payrollModel.exists({
        staffId: new Types.ObjectId(staffId),
        periodYear: dto.periodYear,
        periodMonth: dto.periodMonth,
        status: { $in: ACTIVE_STATUSES },
      });
      if (hasActive) {
        skipped += 1;
        details.push({
          staffId,
          status: 'skipped',
          reason: 'PAYROLL_ALREADY_EXISTS',
        });
        continue;
      }

      try {
        const doc = await this.createPayroll(
          staff,
          dto.periodYear,
          dto.periodMonth,
          0,
          '',
          currentUser,
        );
        created += 1;
        details.push({
          staffId,
          status: 'created',
          payrollCode: doc.payrollCode,
        });
      } catch (error) {
        // Race: phiếu vừa được tạo bởi request khác → đếm vào skipped, không throw.
        if (this.isDuplicateKeyError(error)) {
          skipped += 1;
          details.push({
            staffId,
            status: 'skipped',
            reason: 'PAYROLL_ALREADY_EXISTS',
          });
          continue;
        }
        this.logger.error(
          `Lỗi finalize batch cho staff ${staffId}: ${String(error)}`,
        );
        details.push({
          staffId,
          status: 'error',
          reason: 'INTERNAL_ERROR',
        });
      }
    }

    return { created, skipped, details };
  }

  async preview(dto: PreviewPayrollDto): Promise<PayrollPreviewDto> {
    const staff = await this.findStaffOrThrow(dto.staffId);
    const aggregate = await this.aggregateCommission(
      dto.staffId,
      dto.periodYear,
      dto.periodMonth,
    );

    const baseSalary = staff.baseSalary ?? 0;
    const adjustment = 0;

    return {
      staffId: staff._id.toString(),
      staffSnapshot: { fullName: staff.fullName, role: staff.role },
      periodYear: dto.periodYear,
      periodMonth: dto.periodMonth,
      baseSalary,
      totalCommission: aggregate.totalCommission,
      adjustment,
      totalIncome: baseSalary + aggregate.totalCommission + adjustment,
      commissionBreakdown: aggregate.breakdown.map((b) => ({
        serviceId: b.serviceId.toString(),
        serviceName: b.serviceName,
        serviceCount: b.serviceCount,
        totalCommission: b.totalCommission,
      })),
      sourceInvoiceIds: aggregate.invoiceIds.map((id) => id.toString()),
      invoiceCount: aggregate.invoiceCount,
    };
  }

  // ──────────────────────────────────────
  // Status flow
  // ──────────────────────────────────────

  async markPaid(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<PayrollResponseDto> {
    const doc = await this.findPayrollOrThrow(id);

    if (doc.status === PayrollStatus.PAID) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYROLL_ALREADY_PAID,
        message: 'Phiếu lương đã được chi',
      });
    }
    if (doc.status !== PayrollStatus.FINALIZED) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYROLL_ALREADY_PAID,
        message: 'Chỉ đánh dấu đã chi cho phiếu ở trạng thái FINALIZED',
      });
    }

    doc.status = PayrollStatus.PAID;
    doc.paidAt = new Date();
    doc.paidBy = new Types.ObjectId(currentUser.id);
    await doc.save();

    return this.mapToResponse(doc);
  }

  async cancel(
    id: string,
    dto: CancelPayrollDto,
    currentUser: AuthenticatedUser,
  ): Promise<PayrollResponseDto> {
    const doc = await this.findPayrollOrThrow(id);

    if (doc.status === PayrollStatus.PAID) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYROLL_ALREADY_PAID,
        message: 'Phiếu lương đã chi không thể hủy',
      });
    }
    if (doc.status === PayrollStatus.CANCELLED) {
      throw new BadRequestException({
        code: ERROR_CODES.PAYROLL_ALREADY_PAID,
        message: 'Phiếu lương đã bị hủy trước đó',
      });
    }

    doc.status = PayrollStatus.CANCELLED;
    doc.cancelledAt = new Date();
    doc.cancelledBy = new Types.ObjectId(currentUser.id);
    doc.cancelReason = dto.reason.trim();
    await doc.save();

    return this.mapToResponse(doc);
  }

  // ──────────────────────────────────────
  // Queries
  // ──────────────────────────────────────

  async findAll(
    query: QueryPayrollDto,
  ): Promise<{ data: PayrollResponseDto[]; meta: PaginationMeta }> {
    return this.runQuery(query, {});
  }

  async findMine(
    currentUser: AuthenticatedUser,
    query: QueryPayrollDto,
  ): Promise<{ data: PayrollResponseDto[]; meta: PaginationMeta }> {
    return this.runQuery(query, {
      staffId: new Types.ObjectId(currentUser.id),
    });
  }

  async findOne(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<PayrollResponseDto> {
    const doc = await this.findPayrollOrThrow(id);

    if (
      currentUser.role !== StaffRole.ADMIN &&
      doc.staffId.toString() !== currentUser.id
    ) {
      throw new ForbiddenException({
        code: ERROR_CODES.FORBIDDEN,
        message: 'Bạn không có quyền xem phiếu lương của nhân viên khác',
      });
    }

    return this.mapToResponse(doc);
  }

  // ──────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────

  private async runQuery(
    query: QueryPayrollDto,
    baseFilter: Record<string, unknown>,
  ): Promise<{ data: PayrollResponseDto[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = { ...baseFilter };

    if (query.periodYear !== undefined) filter.periodYear = query.periodYear;
    if (query.periodMonth !== undefined) filter.periodMonth = query.periodMonth;
    if (query.staffId && baseFilter.staffId === undefined) {
      filter.staffId = new Types.ObjectId(query.staffId);
    }
    if (query.status) filter.status = query.status;

    const page = query.page ?? DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<PayrollSortField, string> = {
      finalizedAt: 'finalizedAt',
      totalIncome: 'totalIncome',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'finalizedAt'];
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.payrollModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.payrollModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapToResponse(doc)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Tạo + lưu 1 payroll record (dùng chung bởi finalize và finalizeBatch).
   * Retry khi đụng payrollCode duplicate.
   */
  private async createPayroll(
    staff: StaffDocument,
    year: number,
    month: number,
    adjustment: number,
    note: string,
    currentUser: AuthenticatedUser,
  ): Promise<PayrollRecordDocument> {
    const aggregate = await this.aggregateCommission(
      staff._id.toString(),
      year,
      month,
    );
    const baseSalary = staff.baseSalary ?? 0;
    const totalIncome = baseSalary + aggregate.totalCommission + adjustment;

    const payload = {
      periodYear: year,
      periodMonth: month,
      staffId: staff._id,
      staffSnapshot: { fullName: staff.fullName, role: staff.role },
      baseSalary,
      totalCommission: aggregate.totalCommission,
      adjustment,
      totalIncome,
      commissionBreakdown: aggregate.breakdown,
      sourceInvoiceIds: aggregate.invoiceIds,
      invoiceCount: aggregate.invoiceCount,
      status: PayrollStatus.FINALIZED,
      finalizedBy: new Types.ObjectId(currentUser.id),
      finalizedByName: this.resolveUserDisplayName(currentUser),
      finalizedAt: new Date(),
      note,
    };

    for (let attempt = 1; attempt <= PAYROLL_CODE_RETRY_LIMIT; attempt += 1) {
      try {
        const payrollCode = await this.generatePayrollCode(year, month);
        return await this.payrollModel.create({ ...payload, payrollCode });
      } catch (error) {
        if (
          this.isDuplicateKeyError(error) &&
          this.isPayrollCodeDuplicate(error) &&
          attempt < PAYROLL_CODE_RETRY_LIMIT
        ) {
          continue;
        }
        // Duplicate trên compound (staffId, year, month) → phiếu active đã tồn tại.
        if (
          this.isDuplicateKeyError(error) &&
          !this.isPayrollCodeDuplicate(error)
        ) {
          throw new ConflictException({
            code: ERROR_CODES.PAYROLL_ALREADY_EXISTS,
            message: 'Nhân viên đã có phiếu lương cho tháng này',
          });
        }
        throw error;
      }
    }

    throw new ConflictException({
      code: ERROR_CODES.VALIDATION_FAILED,
      message: 'Không thể sinh mã phiếu lương duy nhất, vui lòng thử lại',
    });
  }

  /**
   * Sinh mã phiếu lương dạng PAY-YYYYMM-NNNN theo số phiếu trong kỳ.
   */
  private async generatePayrollCode(
    year: number,
    month: number,
  ): Promise<string> {
    const count = await this.payrollModel.countDocuments({
      periodYear: year,
      periodMonth: month,
    });

    const periodPart = `${year}${String(month).padStart(2, '0')}`;
    const sequence = String(count + 1).padStart(4, '0');

    return `PAY-${periodPart}-${sequence}`;
  }

  private async ensureNoActivePayroll(
    staffId: string,
    year: number,
    month: number,
  ): Promise<void> {
    const existing = await this.payrollModel.exists({
      staffId: new Types.ObjectId(staffId),
      periodYear: year,
      periodMonth: month,
      status: { $in: ACTIVE_STATUSES },
    });
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.PAYROLL_ALREADY_EXISTS,
        message: 'Nhân viên đã có phiếu lương cho tháng này',
      });
    }
  }

  private async findStaffIdsWithCommission(
    year: number,
    month: number,
  ): Promise<string[]> {
    const { start, end } = this.monthRange(year, month);

    const rows = await this.invoiceModel.aggregate<{ _id: Types.ObjectId }>([
      {
        $match: {
          status: InvoiceStatus.PAID,
          paidAt: { $gte: start, $lt: end },
        },
      },
      { $unwind: '$items' },
      { $group: { _id: '$items.staffId' } },
    ]);

    return rows.map((r) => r._id.toString());
  }

  private async findActiveStaffIds(): Promise<string[]> {
    const staff = await this.staffModel
      .find({ role: StaffRole.STAFF, workStatus: WorkStatus.ACTIVE })
      .select('_id')
      .exec();
    return staff.map((s) => s._id.toString());
  }

  private async findStaffOrThrow(id: string): Promise<StaffDocument> {
    const staff = await this.staffModel.findById(id).exec();
    if (!staff) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }
    return staff;
  }

  private async findPayrollOrThrow(id: string): Promise<PayrollRecordDocument> {
    const doc = await this.payrollModel.findById(id).exec();
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.PAYROLL_NOT_FOUND,
        message: 'Phiếu lương không tồn tại',
      });
    }
    return doc;
  }

  /**
   * Khoảng [đầu tháng, đầu tháng sau) theo giờ server — lọc invoice.paidAt.
   */
  private monthRange(year: number, month: number): { start: Date; end: Date } {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 1, 0, 0, 0, 0);
    return { start, end };
  }

  private mapToResponse(doc: PayrollRecordDocument): PayrollResponseDto {
    return {
      id: doc._id.toString(),
      payrollCode: doc.payrollCode,
      periodYear: doc.periodYear,
      periodMonth: doc.periodMonth,
      staffId: doc.staffId.toString(),
      staffSnapshot: {
        fullName: doc.staffSnapshot.fullName,
        role: doc.staffSnapshot.role,
      },
      baseSalary: doc.baseSalary,
      totalCommission: doc.totalCommission,
      adjustment: doc.adjustment,
      totalIncome: doc.totalIncome,
      commissionBreakdown: doc.commissionBreakdown.map((b) => ({
        serviceId: b.serviceId.toString(),
        serviceName: b.serviceName,
        serviceCount: b.serviceCount,
        totalCommission: b.totalCommission,
      })),
      sourceInvoiceIds: doc.sourceInvoiceIds.map((id) => id.toString()),
      invoiceCount: doc.invoiceCount,
      status: doc.status,
      finalizedBy: doc.finalizedBy.toString(),
      finalizedByName: doc.finalizedByName,
      finalizedAt: doc.finalizedAt.toISOString(),
      paidAt: doc.paidAt?.toISOString() ?? null,
      paidBy: doc.paidBy ? doc.paidBy.toString() : null,
      cancelledAt: doc.cancelledAt?.toISOString() ?? null,
      cancelledBy: doc.cancelledBy ? doc.cancelledBy.toString() : null,
      cancelReason: doc.cancelReason ?? null,
      note: doc.note ?? '',
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private isPayrollCodeDuplicate(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    const keyPattern = (error as { keyPattern?: Record<string, unknown> })
      .keyPattern;
    return Boolean(keyPattern && 'payrollCode' in keyPattern);
  }

  private resolveUserDisplayName(currentUser: AuthenticatedUser): string {
    return currentUser.fullName?.trim() || currentUser.email;
  }
}
