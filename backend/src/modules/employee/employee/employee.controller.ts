import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-objectid.pipe';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeService } from './employee.service';
import { StaffRole } from './staff.schema';
import { StripEmployeeCredentialsInterceptor } from './strip-employee-credentials.interceptor';

@ApiTags('Employees')
@ApiBearerAuth('access-token')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Tạo nhân viên mới kèm tài khoản đăng nhập' })
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách nhân viên có phân trang, filter, search, sort',
  })
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeeService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết nhân viên' })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.ADMIN)
  @UseInterceptors(StripEmployeeCredentialsInterceptor)
  @ApiOperation({
    summary: 'Cập nhật thông tin nhân viên, không đổi email/password',
  })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, dto);
  }
}
