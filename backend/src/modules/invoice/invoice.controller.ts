import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { CancelInvoiceDto } from './dto/cancel-invoice.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { MarkPaidDto } from './dto/mark-paid.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceService } from './invoice.service';

@ApiTags('Invoices')
@ApiBearerAuth('access-token')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Tạo hóa đơn từ Service Order COMPLETED' })
  @ApiCreatedResponse({ type: InvoiceResponseDto })
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invoiceService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách hóa đơn (filter + pagination + sort)' })
  findAll(@Query() query: QueryInvoiceDto) {
    return this.invoiceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết hóa đơn' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật discount / note (chỉ khi DRAFT)' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(id, dto);
  }

  @Post(':id/finalize')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chốt invoice: DRAFT -> PENDING_PAYMENT' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  finalize(@Param('id', ParseObjectIdPipe) id: string) {
    return this.invoiceService.finalize(id);
  }

  @Post(':id/mark-paid')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Confirm CASH thanh toán: PENDING_PAYMENT -> PAID + Auto Stock Deduction',
  })
  @ApiOkResponse({ type: InvoiceResponseDto })
  markPaid(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: MarkPaidDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invoiceService.markPaid(id, dto, user);
  }

  @Post(':id/cancel')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy hóa đơn (chỉ DRAFT / PENDING_PAYMENT)' })
  @ApiOkResponse({ type: InvoiceResponseDto })
  cancel(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: CancelInvoiceDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invoiceService.cancel(id, dto, user);
  }
}
