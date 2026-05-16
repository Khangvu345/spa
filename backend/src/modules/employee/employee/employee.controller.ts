import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../../../common/pipes/parse-objectid.pipe';
import { Roles } from '../../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
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

  @Post(':id/reset-password')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Admin reset mật khẩu nhân viên về giá trị mặc định',
  })
  resetPassword(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() adminUser: AuthenticatedUser,
  ) {
    return this.employeeService.resetPassword(id, adminUser);
  }

  @Post(':id/lock')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Khóa tài khoản nhân viên' })
  lockAccount(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() adminUser: AuthenticatedUser,
  ) {
    return this.employeeService.lockAccount(id, adminUser);
  }

  @Post(':id/unlock')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Mở khóa tài khoản nhân viên' })
  unlockAccount(@Param('id', ParseObjectIdPipe) id: string) {
    return this.employeeService.unlockAccount(id);
  }

  @Delete(':id')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Xóa mềm tài khoản nhân viên sau 30 ngày khóa' })
  deleteAccount(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() adminUser: AuthenticatedUser,
  ) {
    return this.employeeService.deleteAccount(id, adminUser);
  }
}
