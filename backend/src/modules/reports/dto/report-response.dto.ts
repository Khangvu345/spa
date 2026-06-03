import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Ghi chú dùng chung: doanh thu theo dịch vụ tính theo `items.subtotal`
 * (CHƯA phân bổ giảm giá toàn đơn), nên tổng breakdown có thể > totalRevenue.
 */
export const REVENUE_BREAKDOWN_NOTE =
  'Doanh thu theo dịch vụ tính theo items.subtotal (chưa phân bổ giảm giá toàn đơn); ' +
  'tổng breakdown có thể lệch totalRevenue (totalAmount đã trừ giảm giá).';

export class ServiceRevenueRowDto {
  @ApiProperty() serviceId: string;
  @ApiProperty() serviceName: string;
  @ApiProperty({ description: 'Số lượt phục vụ (Σ items.quantity)' })
  count: number;
  @ApiProperty({ description: 'Doanh thu (Σ items.subtotal)' })
  revenue: number;
}

export class ReportPeriodDto {
  @ApiProperty({ example: '2026-05-01' }) fromDate: string;
  @ApiProperty({ example: '2026-05-31' }) toDate: string;
}

export class RevenueReportDto {
  @ApiProperty({ type: ReportPeriodDto }) period: ReportPeriodDto;

  @ApiPropertyOptional({
    nullable: true,
    description: 'serviceId được lọc (RP-03), null nếu xem toàn kỳ',
  })
  serviceId: string | null;

  @ApiProperty({
    description:
      'Tổng doanh thu kỳ — Σ totalAmount (đã trừ giảm giá). Khi lọc serviceId: Σ items.subtotal của dịch vụ đó.',
  })
  totalRevenue: number;

  @ApiProperty({ description: 'Số hóa đơn PAID trong kỳ' })
  invoiceCount: number;

  @ApiProperty({ type: ServiceRevenueRowDto, isArray: true })
  breakdown: ServiceRevenueRowDto[];

  @ApiProperty() note: string;
}

export class StaffStatsDto {
  @ApiProperty() staffId: string;
  @ApiProperty() staffName: string;
  @ApiProperty({ description: 'Số lượt phục vụ (Σ items.quantity)' })
  serviceCount: number;
  @ApiProperty({ description: 'Doanh thu mang lại (Σ items.subtotal)' })
  revenueGenerated: number;
  @ApiProperty({ description: 'Tổng hoa hồng (Σ items.commissionAmount)' })
  totalCommission: number;
}

export class ServiceInvoiceRowDto {
  @ApiProperty() invoiceId: string;
  @ApiProperty() invoiceCode: string;
  @ApiProperty() customerName: string;
  @ApiProperty({ description: 'ISO 8601' }) paidAt: string;
  @ApiProperty({ description: 'Tên dịch vụ trong dòng item' })
  serviceName: string;
  @ApiProperty() quantity: number;
  @ApiProperty({ description: 'items.subtotal của dòng dịch vụ' })
  subtotal: number;
}

export class DashboardRevenueDto {
  @ApiProperty({ description: 'Doanh thu tháng hiện tại' }) thisMonth: number;
  @ApiProperty({ description: 'Doanh thu hôm nay' }) today: number;
}

export class DashboardBookingsDto {
  @ApiProperty({ description: 'Tổng booking trong tháng' }) total: number;
  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    description: 'Đếm theo status, vd { CONFIRMED: 3, COMPLETED: 5 }',
  })
  byStatus: Record<string, number>;
}

export class DashboardOverviewDto {
  @ApiProperty({ type: DashboardRevenueDto }) revenue: DashboardRevenueDto;
  @ApiProperty({ type: DashboardBookingsDto }) bookings: DashboardBookingsDto;
  @ApiProperty({ description: 'Số service_order COMPLETED+INVOICED tháng này' })
  servicesCompleted: number;
  @ApiProperty({ description: 'Số vật liệu tồn kho <= reorderLevel' })
  lowStockCount: number;
  @ApiProperty({ type: ServiceRevenueRowDto, isArray: true })
  topServices: ServiceRevenueRowDto[];
}
