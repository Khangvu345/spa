import { Controller, Get, Query, Res } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffRole } from '../employee/employee/staff.schema';
import { PdfService } from '../pdf/pdf.service';
import {
  DashboardOverviewDto,
  RevenueReportDto,
  ServiceInvoiceRowDto,
  ServiceRevenueRowDto,
  StaffStatsDto,
} from './dto/report-response.dto';
import { RevenueReportQueryDto } from './dto/revenue-report-query.dto';
import { ServiceInvoicesQueryDto } from './dto/service-invoices-query.dto';
import { ReportsService } from './reports.service';

/**
 * Reports & Dashboard (#22). Mọi endpoint chỉ ADMIN.
 * Một controller dùng path đầy đủ (`dashboard/*` + `reports/*`) — global prefix /api/v1.
 */
@ApiTags('Reports & Dashboard')
@ApiBearerAuth('access-token')
@Controller()
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly pdfService: PdfService,
  ) {}

  @Get('dashboard/overview')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Số liệu tổng quan dashboard (1 call) — RP-01' })
  @ApiOkResponse({ type: DashboardOverviewDto })
  getDashboardOverview() {
    return this.reportsService.getDashboardOverview();
  }

  @Get('reports/revenue')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Báo cáo doanh thu theo kỳ (+ filter serviceId) — RP-02/RP-03',
  })
  @ApiOkResponse({ type: RevenueReportDto })
  getRevenueReport(@Query() query: RevenueReportQueryDto) {
    return this.reportsService.getRevenueReport(query);
  }

  @Get('reports/by-service')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Thống kê theo dịch vụ (số lượt + doanh thu) — RP-04',
  })
  @ApiOkResponse({ type: ServiceRevenueRowDto, isArray: true })
  getByService(@Query() query: RevenueReportQueryDto) {
    return this.reportsService.getByService(query);
  }

  @Get('reports/by-staff')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Thống kê theo nhân viên (số ca + doanh thu + hoa hồng) — RP-05',
  })
  @ApiOkResponse({ type: StaffStatsDto, isArray: true })
  getByStaff(@Query() query: RevenueReportQueryDto) {
    return this.reportsService.getByStaff(query);
  }

  @Get('reports/service-invoices')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Chi tiết hóa đơn của 1 dịch vụ trong kỳ — RP-06' })
  @ApiOkResponse({ type: ServiceInvoiceRowDto, isArray: true })
  getServiceInvoices(@Query() query: ServiceInvoicesQueryDto) {
    return this.reportsService.getServiceInvoices(query);
  }

  @Get('reports/revenue/export')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Export báo cáo doanh thu ra Excel (.xlsx) — RP-07',
  })
  @ApiProduces(
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiOkResponse({
    description: 'File .xlsx (binary, KHÔNG wrap ApiResponse envelope)',
  })
  async exportRevenueExcel(
    @Query() query: RevenueReportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.reportsService.exportRevenueExcel(query);
    const filename = `bao-cao-doanh-thu-${query.fromDate}-${query.toDate}.xlsx`;

    // @Res() raw → KHÔNG đi qua ResponseInterceptor (trả binary thuần).
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  @Get('reports/revenue/export-pdf')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Export báo cáo doanh thu ra PDF — RP-07B',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'File .pdf (binary, KHÔNG wrap ApiResponse envelope)',
  })
  async exportRevenuePdf(
    @Query() query: RevenueReportQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const report = await this.reportsService.getRevenueReport(query);
    const buffer = await this.pdfService.buildRevenuePdf(report);
    const filename = `bao-cao-doanh-thu-${query.fromDate}-${query.toDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }
}
