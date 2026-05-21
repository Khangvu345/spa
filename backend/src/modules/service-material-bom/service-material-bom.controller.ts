import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { BomResponseDto } from './dto/bom-response.dto';
import { CreateBomDto } from './dto/create-bom.dto';
import { QueryBomDto } from './dto/query-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { ServiceMaterialBomService } from './service-material-bom.service';

@ApiTags('BOM (Service-Material)')
@ApiBearerAuth()
@Controller('bom')
export class ServiceMaterialBomController {
  constructor(private readonly bomService: ServiceMaterialBomService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Tạo BOM entry — cấu hình định mức (ADMIN)' })
  @ApiCreatedResponse({ type: BomResponseDto })
  create(@Body() dto: CreateBomDto) {
    return this.bomService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Danh sách BOM entries (filter serviceId / materialId / isActive) — mọi role JWT',
  })
  @ApiOkResponse({ type: BomResponseDto, isArray: true })
  findAll(@Query() query: QueryBomDto) {
    return this.bomService.findAll(query);
  }

  @Get('by-service/:serviceId')
  @ApiOperation({
    summary:
      'BOM của 1 service (chỉ active) — dùng cho Auto Stock Deduction. Trả [] nếu chưa cấu hình',
  })
  @ApiOkResponse({ type: BomResponseDto, isArray: true })
  findByService(
    @Param('serviceId', ParseObjectIdPipe) serviceId: string,
  ) {
    return this.bomService.findByService(serviceId);
  }

  @Get('by-material/:materialId')
  @ApiOperation({
    summary: 'Reverse lookup — material X đang dùng ở service nào',
  })
  @ApiOkResponse({ type: BomResponseDto, isArray: true })
  findByMaterial(
    @Param('materialId', ParseObjectIdPipe) materialId: string,
  ) {
    return this.bomService.findByMaterial(materialId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết BOM entry — mọi role JWT' })
  @ApiOkResponse({ type: BomResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.bomService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary:
      'Sửa BOM entry (standardQuantity / note / isActive). KHÔNG sửa được serviceId/materialId (ADMIN)',
  })
  @ApiOkResponse({ type: BomResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateBomDto,
  ) {
    return this.bomService.update(id, dto);
  }

  @Delete(':id')
  @Roles(StaffRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Xóa BOM entry (hard delete) (ADMIN)' })
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.bomService.remove(id);
  }
}
