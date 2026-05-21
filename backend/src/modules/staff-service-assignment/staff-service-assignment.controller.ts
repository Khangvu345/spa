import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
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
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { StaffServiceAssignmentService } from './staff-service-assignment.service';

@ApiTags('Staff Service Assignments')
@ApiBearerAuth('access-token')
@Controller('staff-service-assignments')
export class StaffServiceAssignmentController {
  constructor(
    private readonly assignmentService: StaffServiceAssignmentService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Danh sách mapping chuyên viên - dịch vụ (có filter)',
  })
  @ApiOkResponse({ type: AssignmentResponseDto, isArray: true })
  findAll(@Query() query: QueryAssignmentDto) {
    return this.assignmentService.findAll(query);
  }

  @Get('by-service/:serviceId')
  @ApiOperation({ summary: 'Tìm chuyên viên active phụ trách một dịch vụ' })
  @ApiOkResponse({ type: AssignmentResponseDto })
  findByService(@Param('serviceId', ParseObjectIdPipe) serviceId: string) {
    return this.assignmentService.findByService(serviceId);
  }

  @Get('by-staff/:staffId')
  @ApiOperation({ summary: 'Tìm các dịch vụ active của một chuyên viên' })
  @ApiOkResponse({ type: AssignmentResponseDto, isArray: true })
  findByStaff(@Param('staffId', ParseObjectIdPipe) staffId: string) {
    return this.assignmentService.findByStaff(staffId);
  }

  @Post()
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Tạo mapping chuyên viên - dịch vụ mới (ADMIN)' })
  @ApiCreatedResponse({ type: AssignmentResponseDto })
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentService.create(dto);
  }

  @Patch(':id')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Cập nhật commissionRate / assignedSince / note / isActive (ADMIN)',
  })
  @ApiOkResponse({ type: AssignmentResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentService.update(id, dto);
  }
}
