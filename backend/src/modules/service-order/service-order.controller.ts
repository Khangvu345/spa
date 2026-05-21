import {
  Body,
  Controller,
  Delete,
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
import { AddItemDto } from './dto/add-item.dto';
import { CancelServiceOrderDto } from './dto/cancel-service-order.dto';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { QueryServiceOrderDto } from './dto/query-service-order.dto';
import { ServiceOrderResponseDto } from './dto/service-order-response.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateServiceOrderDto } from './dto/update-service-order.dto';
import { ServiceOrderService } from './service-order.service';

@ApiTags('Service Orders')
@ApiBearerAuth('access-token')
@Controller('service-orders')
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Tạo phiếu dịch vụ rỗng (OPERATOR/ADMIN)' })
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  create(
    @Body() dto: CreateServiceOrderDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.serviceOrderService.create(dto, currentUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách phiếu dịch vụ (pagination + filter + sort)',
  })
  findAll(@Query() query: QueryServiceOrderDto) {
    return this.serviceOrderService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết phiếu dịch vụ' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.serviceOrderService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cập nhật note/extraCharge hoặc chuyển DRAFT -> IN_PROGRESS',
  })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateServiceOrderDto,
  ) {
    return this.serviceOrderService.updateOrder(id, dto);
  }

  @Post(':id/items')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Thêm dịch vụ vào phiếu' })
  @ApiCreatedResponse({ type: ServiceOrderResponseDto })
  addItem(@Param('id', ParseObjectIdPipe) id: string, @Body() dto: AddItemDto) {
    return this.serviceOrderService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật số lượng/ghi chú của item' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  updateItem(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('itemId', ParseObjectIdPipe) itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.serviceOrderService.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Xóa item khỏi phiếu' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  removeItem(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('itemId', ParseObjectIdPipe) itemId: string,
  ) {
    return this.serviceOrderService.removeItem(id, itemId);
  }

  @Post(':id/complete')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu phiếu đã hoàn thành' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  complete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.serviceOrderService.complete(id);
  }

  @Post(':id/cancel')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hủy phiếu dịch vụ' })
  @ApiOkResponse({ type: ServiceOrderResponseDto })
  cancel(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: CancelServiceOrderDto,
  ) {
    return this.serviceOrderService.cancel(id, dto.reason);
  }
}
