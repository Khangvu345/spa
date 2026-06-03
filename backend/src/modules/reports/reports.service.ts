import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as ExcelJS from 'exceljs';
import { Model, PipelineStage, Types } from 'mongoose';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { Booking, BookingDocument } from '../booking/booking.schema';
import {
  Invoice,
  InvoiceDocument,
  InvoiceStatus,
} from '../invoice/invoice.schema';
import { Material, MaterialDocument } from '../material/material.schema';
import {
  ServiceOrder,
  ServiceOrderDocument,
  ServiceOrderStatus,
} from '../service-order/service-order.schema';
import { RevenueReportQueryDto } from './dto/revenue-report-query.dto';
import { ServiceInvoicesQueryDto } from './dto/service-invoices-query.dto';
import {
  DashboardOverviewDto,
  REVENUE_BREAKDOWN_NOTE,
  RevenueReportDto,
  ServiceInvoiceRowDto,
  ServiceRevenueRowDto,
  StaffStatsDto,
} from './dto/report-response.dto';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ServiceGroupRaw {
  _id: Types.ObjectId;
  serviceName: string;
  count: number;
  revenue: number;
}

const DASHBOARD_TOP_SERVICES_LIMIT = 5;

/** Map kết quả $group theo dịch vụ sang DTO (module-level, không phụ thuộc this). */
function mapServiceRow(raw: ServiceGroupRaw): ServiceRevenueRowDto {
  return {
    serviceId: raw._id.toString(),
    serviceName: raw.serviceName,
    count: raw.count,
    revenue: raw.revenue,
  };
}

/**
 * Reports & Dashboard (#22) — module THUẦN ĐỌC + AGGREGATE.
 *
 * Không tạo collection mới, không tính toán nghiệp vụ mới: chỉ gom + nhóm + đếm
 * dữ liệu đã có ở `invoices` / `bookings` / `service_orders` / `materials`.
 *
 * Quy ước cố định (khớp Payroll #21):
 * - Doanh thu lọc theo `invoice.paidAt` (mốc thực thu), CHỈ status = PAID.
 * - Doanh thu TỔNG = `totalAmount` (đã trừ giảm giá toàn đơn).
 * - Doanh thu theo DỊCH VỤ / hoa hồng = `items.subtotal` / `items.commissionAmount` (sau $unwind).
 * - Chuyên viên phục vụ = `items.staffId`, KHÔNG phải `createdBy`/`paidBy` (thu ngân).
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(ServiceOrder.name)
    private readonly serviceOrderModel: Model<ServiceOrderDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
  ) {}

  // ──────────────────────────────────────
  // Dashboard (RP-01)
  // ──────────────────────────────────────

  /**
   * Tổng hợp số liệu dashboard trong 1 call. Các sub-aggregate chạy song song
   * bằng Promise.all để giảm round-trip.
   */
  async getDashboardOverview(): Promise<DashboardOverviewDto> {
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const tomorrowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    const [
      revenueThisMonth,
      revenueToday,
      bookings,
      servicesCompleted,
      lowStockCount,
      topServices,
    ] = await Promise.all([
      this.sumRevenue(monthStart, nextMonthStart),
      this.sumRevenue(todayStart, tomorrowStart),
      this.countBookingsByStatus(monthStart, nextMonthStart),
      this.countServicesCompleted(monthStart, nextMonthStart),
      this.countLowStock(),
      this.aggregateServiceRevenue(monthStart, nextMonthStart, {
        limit: DASHBOARD_TOP_SERVICES_LIMIT,
      }),
    ]);

    return {
      revenue: { thisMonth: revenueThisMonth, today: revenueToday },
      bookings,
      servicesCompleted,
      lowStockCount,
      topServices,
    };
  }

  // ──────────────────────────────────────
  // Revenue report (RP-02 / RP-03)
  // ──────────────────────────────────────

  async getRevenueReport(
    query: RevenueReportQueryDto,
  ): Promise<RevenueReportDto> {
    const { start, end } = this.resolveDateRange(query.fromDate, query.toDate);

    // RP-03 — lọc riêng 1 dịch vụ: totalRevenue = doanh thu của dịch vụ đó (items.subtotal),
    // breakdown chỉ gồm chính dịch vụ đó.
    if (query.serviceId) {
      const serviceObjectId = new Types.ObjectId(query.serviceId);
      const rows = await this.invoiceModel.aggregate<{
        _id: Types.ObjectId;
        serviceName: string;
        count: number;
        revenue: number;
        invoiceIds: Types.ObjectId[];
      }>([
        { $match: this.paidMatch(start, end) },
        { $unwind: '$items' },
        { $match: { 'items.serviceId': serviceObjectId } },
        {
          $group: {
            _id: '$items.serviceId',
            serviceName: { $first: '$items.serviceName' },
            count: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.subtotal' },
            invoiceIds: { $addToSet: '$_id' },
          },
        },
      ]);

      const row = rows[0];
      const breakdown: ServiceRevenueRowDto[] = row
        ? [
            {
              serviceId: row._id.toString(),
              serviceName: row.serviceName,
              count: row.count,
              revenue: row.revenue,
            },
          ]
        : [];

      return {
        period: { fromDate: query.fromDate, toDate: query.toDate },
        serviceId: query.serviceId,
        totalRevenue: row?.revenue ?? 0,
        invoiceCount: row?.invoiceIds.length ?? 0,
        breakdown,
        note: REVENUE_BREAKDOWN_NOTE,
      };
    }

    // RP-02 — toàn kỳ: 1 pipeline với $facet (tổng + breakdown theo dịch vụ).
    const [facet] = await this.invoiceModel.aggregate<{
      totals: Array<{ totalRevenue: number; invoiceCount: number }>;
      breakdown: ServiceGroupRaw[];
    }>([
      { $match: this.paidMatch(start, end) },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalAmount' },
                invoiceCount: { $sum: 1 },
              },
            },
          ],
          breakdown: [
            { $unwind: '$items' },
            {
              $group: {
                _id: '$items.serviceId',
                serviceName: { $first: '$items.serviceName' },
                count: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.subtotal' },
              },
            },
            { $sort: { revenue: -1 } },
          ],
        },
      },
    ]);

    return {
      period: { fromDate: query.fromDate, toDate: query.toDate },
      serviceId: null,
      totalRevenue: facet?.totals[0]?.totalRevenue ?? 0,
      invoiceCount: facet?.totals[0]?.invoiceCount ?? 0,
      breakdown: (facet?.breakdown ?? []).map(mapServiceRow),
      note: REVENUE_BREAKDOWN_NOTE,
    };
  }

  // ──────────────────────────────────────
  // By service (RP-04)
  // ──────────────────────────────────────

  async getByService(
    query: RevenueReportQueryDto,
  ): Promise<ServiceRevenueRowDto[]> {
    const { start, end } = this.resolveDateRange(query.fromDate, query.toDate);
    return this.aggregateServiceRevenue(start, end);
  }

  // ──────────────────────────────────────
  // By staff (RP-05) — khớp Payroll #21 (cùng nguồn items.commissionAmount)
  // ──────────────────────────────────────

  async getByStaff(query: RevenueReportQueryDto): Promise<StaffStatsDto[]> {
    const { start, end } = this.resolveDateRange(query.fromDate, query.toDate);

    const rows = await this.invoiceModel.aggregate<{
      _id: Types.ObjectId;
      staffName: string;
      serviceCount: number;
      revenueGenerated: number;
      totalCommission: number;
    }>([
      { $match: this.paidMatch(start, end) },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.staffId',
          staffName: { $first: '$items.staffName' },
          serviceCount: { $sum: '$items.quantity' },
          revenueGenerated: { $sum: '$items.subtotal' },
          totalCommission: { $sum: '$items.commissionAmount' },
        },
      },
      { $sort: { revenueGenerated: -1 } },
    ]);

    return rows.map((r) => ({
      staffId: r._id.toString(),
      staffName: r.staffName,
      serviceCount: r.serviceCount,
      revenueGenerated: r.revenueGenerated,
      totalCommission: r.totalCommission,
    }));
  }

  // ──────────────────────────────────────
  // Service invoices (RP-06)
  // ──────────────────────────────────────

  async getServiceInvoices(
    query: ServiceInvoicesQueryDto,
  ): Promise<{ data: ServiceInvoiceRowDto[]; meta: PaginationMeta }> {
    const { start, end } = this.resolveDateRange(query.fromDate, query.toDate);
    const serviceObjectId = new Types.ObjectId(query.serviceId);

    const page = query.page ?? DEFAULT_PAGE;
    const limit = Math.min(query.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [facet] = await this.invoiceModel.aggregate<{
      data: Array<{
        _id: Types.ObjectId;
        invoiceCode: string;
        customerName: string;
        paidAt: Date;
        serviceName: string;
        quantity: number;
        subtotal: number;
      }>;
      total: Array<{ count: number }>;
    }>([
      { $match: this.paidMatch(start, end) },
      { $unwind: '$items' },
      { $match: { 'items.serviceId': serviceObjectId } },
      {
        $facet: {
          data: [
            { $sort: { paidAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                invoiceCode: 1,
                customerName: '$customerSnapshot.fullName',
                paidAt: 1,
                serviceName: '$items.serviceName',
                quantity: '$items.quantity',
                subtotal: '$items.subtotal',
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const total = facet?.total[0]?.count ?? 0;
    const data: ServiceInvoiceRowDto[] = (facet?.data ?? []).map((row) => ({
      invoiceId: row._id.toString(),
      invoiceCode: row.invoiceCode,
      customerName: row.customerName,
      paidAt: row.paidAt?.toISOString() ?? '',
      serviceName: row.serviceName,
      quantity: row.quantity,
      subtotal: row.subtotal,
    }));

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ──────────────────────────────────────
  // Export Excel (RP-07)
  // ──────────────────────────────────────

  async exportRevenueExcel(query: RevenueReportQueryDto): Promise<Buffer> {
    const report = await this.getRevenueReport(query);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Spa Management';
    workbook.created = new Date();

    const MONEY_FORMAT = '#,##0';

    // Sheet 1 — Tổng quan
    const overview = workbook.addWorksheet('Tổng quan');
    overview.columns = [
      { header: 'Chỉ tiêu', key: 'label', width: 28 },
      { header: 'Giá trị', key: 'value', width: 24 },
    ];
    overview.getRow(1).font = { bold: true };
    overview.addRow({ label: 'Từ ngày', value: report.period.fromDate });
    overview.addRow({ label: 'Đến ngày', value: report.period.toDate });
    overview.addRow({
      label: 'Lọc dịch vụ',
      value: report.serviceId ?? '(toàn bộ)',
    });
    const totalRow = overview.addRow({
      label: 'Tổng doanh thu',
      value: report.totalRevenue,
    });
    totalRow.getCell('value').numFmt = MONEY_FORMAT;
    overview.addRow({ label: 'Số hóa đơn', value: report.invoiceCount });
    overview.addRow({});
    overview.addRow({ label: 'Ghi chú', value: report.note });

    // Sheet 2 — Theo dịch vụ
    const byService = workbook.addWorksheet('Theo dịch vụ');
    byService.columns = [
      { header: 'Dịch vụ', key: 'serviceName', width: 32 },
      { header: 'Số lượt', key: 'count', width: 14 },
      { header: 'Doanh thu', key: 'revenue', width: 20 },
    ];
    byService.getRow(1).font = { bold: true };
    for (const row of report.breakdown) {
      const added = byService.addRow({
        serviceName: row.serviceName,
        count: row.count,
        revenue: row.revenue,
      });
      added.getCell('revenue').numFmt = MONEY_FORMAT;
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }

  // ──────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────

  /** $match dùng chung: invoice đã thực thu trong kỳ (PAID + paidAt in range). */
  private paidMatch(start: Date, end: Date): Record<string, unknown> {
    return {
      status: InvoiceStatus.PAID,
      paidAt: { $gte: start, $lt: end },
    };
  }

  /** Tổng doanh thu (Σ totalAmount) của invoice PAID trong [start, end). */
  private async sumRevenue(start: Date, end: Date): Promise<number> {
    const rows = await this.invoiceModel.aggregate<{ total: number }>([
      { $match: this.paidMatch(start, end) },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return rows[0]?.total ?? 0;
  }

  /**
   * Breakdown doanh thu theo dịch vụ trong kỳ (dùng cho by-service + topServices).
   * $unwind items → group theo serviceId → sort revenue DESC.
   */
  private async aggregateServiceRevenue(
    start: Date,
    end: Date,
    options?: { limit?: number },
  ): Promise<ServiceRevenueRowDto[]> {
    const pipeline: PipelineStage[] = [
      { $match: this.paidMatch(start, end) },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.serviceId',
          serviceName: { $first: '$items.serviceName' },
          count: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { revenue: -1 } },
    ];
    if (options?.limit) {
      pipeline.push({ $limit: options.limit });
    }

    const rows = await this.invoiceModel.aggregate<ServiceGroupRaw>(pipeline);
    return rows.map(mapServiceRow);
  }

  /** Đếm booking trong kỳ (theo scheduledStart) — tổng + theo status. */
  private async countBookingsByStatus(
    start: Date,
    end: Date,
  ): Promise<{ total: number; byStatus: Record<string, number> }> {
    const rows = await this.bookingModel.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { scheduledStart: { $gte: start, $lt: end } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      byStatus[row._id] = row.count;
      total += row.count;
    }
    return { total, byStatus };
  }

  /** Số service_order hoàn thành trong kỳ (COMPLETED + INVOICED, theo completedAt). */
  private async countServicesCompleted(
    start: Date,
    end: Date,
  ): Promise<number> {
    return this.serviceOrderModel.countDocuments({
      status: {
        $in: [ServiceOrderStatus.COMPLETED, ServiceOrderStatus.INVOICED],
      },
      completedAt: { $gte: start, $lt: end },
    });
  }

  /** Số vật liệu (đang active) tồn kho <= reorderLevel. */
  private async countLowStock(): Promise<number> {
    return this.materialModel.countDocuments({
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
    });
  }

  /**
   * Convert fromDate/toDate (chuỗi ngày) sang khoảng `[start 00:00, end 00:00)`
   * theo giờ server. `end` = toDate + 1 ngày để lọc TRỌN ngày cuối.
   * Throw 400 VALIDATION_FAILED nếu fromDate > toDate.
   */
  private resolveDateRange(
    fromDate: string,
    toDate: string,
  ): { start: Date; end: Date } {
    const start = this.startOfDay(fromDate);
    const end = this.startOfDay(toDate);
    end.setDate(end.getDate() + 1);

    if (start.getTime() >= end.getTime()) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'fromDate phải nhỏ hơn hoặc bằng toDate',
      });
    }
    return { start, end };
  }

  /** Dựng mốc 00:00 theo giờ server từ chuỗi ngày (nhất quán monthRange Payroll). */
  private startOfDay(dateStr: string): Date {
    const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
}
