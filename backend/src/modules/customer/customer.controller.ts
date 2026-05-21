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
  Res,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffRole } from '../employee/employee/staff.schema';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  CustomerResponseDto,
  FindOrCreateResponseDto,
} from './dto/customer-response.dto';
import { FindOrCreateCustomerDto } from './dto/find-or-create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ParseCustomerPhonePipe } from './parse-customer-phone.pipe';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo khách hàng mới (OPERATOR/ADMIN)' })
  @ApiCreatedResponse({ type: CustomerResponseDto })
  create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Post('find-or-create')
  @Public()
  @ApiOperation({ summary: 'Upsert customer theo phone cho booking flow' })
  @ApiCreatedResponse({ type: FindOrCreateResponseDto })
  @ApiOkResponse({ type: FindOrCreateResponseDto })
  async findOrCreate(
    @Body() dto: FindOrCreateCustomerDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.customerService.findOrCreateByPhone(dto);
    response.status(result.wasCreated ? HttpStatus.CREATED : HttpStatus.OK);
    return result;
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Danh sách khách hàng (pagination + search + filter + sort) — mọi role JWT',
  })
  findAll(@Query() query: QueryCustomerDto) {
    return this.customerService.findAll(query);
  }

  @Get('by-phone/:phone')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tra cứu nhanh khách hàng theo số điện thoại' })
  @ApiOkResponse({ type: CustomerResponseDto })
  findByPhone(@Param('phone', ParseCustomerPhonePipe) phone: string) {
    return this.customerService.findByPhone(phone);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết khách hàng — mọi role JWT' })
  @ApiOkResponse({ type: CustomerResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.customerService.findOne(id);
  }

  @Patch(':id/toggle-active')
  @Roles(StaffRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bật/tắt trạng thái active của khách hàng (ADMIN)' })
  @ApiOkResponse({ type: CustomerResponseDto })
  toggleActive(@Param('id', ParseObjectIdPipe) id: string) {
    return this.customerService.toggleActive(id);
  }

  @Patch(':id')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin khách hàng (OPERATOR/ADMIN)' })
  @ApiOkResponse({ type: CustomerResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, dto);
  }
}
