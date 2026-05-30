import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StaffRole } from '../employee/employee/staff.schema';
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
  constructor(private readonly payrollService: PayrollService) {}

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
