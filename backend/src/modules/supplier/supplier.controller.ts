import {
  Body,
  Controller,
  Get,
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
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffRole } from '../employee/employee/staff.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierService } from './supplier.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Tạo nhà cung cấp mới (ADMIN)' })
  @ApiCreatedResponse({ type: SupplierResponseDto })
  create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách NCC (pagination + filter + search + sort) — mọi role JWT',
  })
  findAll(@Query() query: QuerySupplierDto) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết NCC — mọi role JWT' })
  @ApiOkResponse({ type: SupplierResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.supplierService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật NCC / toggle isActive (ADMIN)' })
  @ApiOkResponse({ type: SupplierResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.supplierService.update(id, dto);
  }
}
