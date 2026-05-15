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
import { CreateMaterialDto } from './dto/create-material.dto';
import { MaterialResponseDto } from './dto/material-response.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialService } from './material.service';

@ApiTags('Materials')
@ApiBearerAuth()
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Tạo vật liệu mới (ADMIN)' })
  @ApiCreatedResponse({ type: MaterialResponseDto })
  create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Danh sách vật liệu (pagination + filter + search + sort) — mọi role JWT',
  })
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết vật liệu (populate supplier) — mọi role JWT' })
  @ApiOkResponse({ type: MaterialResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật vật liệu / toggle isActive (ADMIN)' })
  @ApiOkResponse({ type: MaterialResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateMaterialDto,
  ) {
    return this.materialService.update(id, dto);
  }
}
