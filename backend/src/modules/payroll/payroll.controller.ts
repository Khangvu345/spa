import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StaffRole } from '../employee/employee/staff.schema';
import { PdfService } from '../pdf/pdf.service';
import { CancelPayrollDto } from './dto/cancel-payroll.dto';
import { FinalizeBatchDto } from './dto/finalize-batch.dto';
import { FinalizePayrollDto } from './dto/finalize-payroll.dto';
import {
  PayrollBatchResultDto,
  PayrollPreviewDto,
  PayrollResponseDto,
} from './dto/payroll-response.dto';
import { PreviewPayrollDto } from './dto/preview-payroll.dto';
import { QueryPayrollDto } from './dto/query-payroll.dto';
import { PayrollService } from './payroll.service';

@ApiTags('Payrolls')
@ApiBearerAuth('access-token')
@Controller('payrolls')
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    private readonly pdfService: PdfService,
  ) {}

  @Post('finalize')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Chốt lương 1 nhân viên cho 1 tháng' })
  @ApiCreatedResponse({ type: PayrollResponseDto })
  finalize(
    @Body() dto: FinalizePayrollDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.payrollService.finalize(dto, user);
  }

  @Post('finalize-batch')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Chốt lương hàng loạt cho 1 tháng' })
  @ApiCreatedResponse({ type: PayrollBatchResultDto })
  finalizeBatch(
    @Body() dto: FinalizeBatchDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.payrollService.finalizeBatch(dto, user);
  }

  @Get()
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Danh sách phiếu lương (filter tháng/staff/status)',
  })
  findAll(@Query() query: QueryPayrollDto) {
    return this.payrollService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Phiếu lương của chính mình' })
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryPayrollDto,
  ) {
    return this.payrollService.findMine(user, query);
  }

  @Get('preview')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Xem trước (tính live, KHÔNG lưu) cho 1 staff + tháng',
  })
  @ApiOkResponse({ type: PayrollPreviewDto })
  preview(@Query() query: PreviewPayrollDto) {
    return this.payrollService.preview(query);
  }

  @Get(':id/export-pdf')
  @ApiOperation({
    summary:
      'Xuất phiếu lương ra PDF — ADMIN xem mọi phiếu, STAFF chỉ phiếu của mình',
  })
  @ApiProduces('application/pdf')
  @ApiOkResponse({
    description: 'File .pdf (binary, KHÔNG wrap ApiResponse envelope)',
  })
  async exportPdf(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ): Promise<void> {
    const payroll = await this.payrollService.findOne(id, user);
    const buffer = await this.pdfService.buildPayrollPdf(payroll);
    const filename = `payroll-${payroll.payrollCode}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết 1 phiếu — ADMIN xem mọi phiếu, STAFF chỉ phiếu của mình',
  })
  @ApiOkResponse({ type: PayrollResponseDto })
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.payrollService.findOne(id, user);
  }

  @Post(':id/mark-paid')
  @Roles(StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu đã chi lương: FINALIZED → PAID' })
  @ApiOkResponse({ type: PayrollResponseDto })
  markPaid(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.payrollService.markPaid(id, user);
  }

  @Post(':id/cancel')
  @Roles(StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy phiếu (chỉ khi chưa PAID)' })
  @ApiOkResponse({ type: PayrollResponseDto })
  cancel(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: CancelPayrollDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.payrollService.cancel(id, dto, user);
  }
}
