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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffRole } from '../employee/employee/staff.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceService } from './service.service';

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo dịch vụ mới (ADMIN)' })
  @ApiCreatedResponse({ type: ServiceResponseDto })
  create(@Body() dto: CreateServiceDto) {
    return this.serviceService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Danh sách dịch vụ (public — landing page)' })
  findAll(@Query() query: QueryServiceDto) {
    return this.serviceService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Chi tiết dịch vụ (public)' })
  @ApiOkResponse({ type: ServiceResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.serviceService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật dịch vụ / toggle isActive (ADMIN)' })
  @ApiOkResponse({ type: ServiceResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.serviceService.update(id, dto);
  }
}
