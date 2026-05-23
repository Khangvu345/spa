import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../common/pipes/parse-objectid.pipe';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StaffRole } from '../employee/employee/staff.schema';
import { LedgerResponseDto } from './dto/ledger-response.dto';
import { LowStockResponseDto } from './dto/low-stock-response.dto';
import { QueryLedgerDto } from './dto/query-ledger.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutManualDto } from './dto/stock-out-manual.dto';
import {
  StockSummaryQueryDto,
  StockSummaryResponseDto,
} from './dto/stock-summary.dto';
import { StockLedgerService } from './stock-ledger.service';
import { StockReferenceType } from './stock-ledger.schema';

@ApiTags('Stock')
@ApiBearerAuth()
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockLedgerService) {}

  @Post('in')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({ summary: 'Nhập kho 1 material (ADMIN)' })
  @ApiCreatedResponse({ type: LedgerResponseDto })
  stockIn(@Body() dto: StockInDto, @CurrentUser() user: AuthenticatedUser) {
    return this.stockService.stockIn(dto, user);
  }

  @Post('out/manual')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Xuất kho thủ công — vỡ, mất, kiểm kê (ADMIN). reason bắt buộc',
  })
  @ApiCreatedResponse({ type: LedgerResponseDto })
  stockOutManual(
    @Body() dto: StockOutManualDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.stockService.stockOutManual(dto, user);
  }

  @Get('ledger')
  @ApiOperation({
    summary: 'Lịch sử ledger (filter + pagination) — mọi role JWT',
  })
  findAll(@Query() query: QueryLedgerDto) {
    return this.stockService.findAll(query);
  }

  @Get('ledger/by-material/:materialId')
  @ApiOperation({ summary: 'Lịch sử ledger của 1 material — mọi role JWT' })
  findByMaterial(
    @Param('materialId', ParseObjectIdPipe) materialId: string,
    @Query() query: QueryLedgerDto,
  ) {
    return this.stockService.findByMaterial(materialId, query);
  }

  @Get('ledger/by-reference/:type/:id')
  @ApiOperation({
    summary:
      'Tìm ledger theo reference (Invoice ID / Stock In / Manual / Adjustment)',
  })
  @ApiParam({ name: 'type', enum: StockReferenceType })
  @ApiOkResponse({ type: [LedgerResponseDto] })
  findByReference(
    @Param('type') type: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    if (
      !Object.values(StockReferenceType).includes(type as StockReferenceType)
    ) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: `referenceType '${type}' không hợp lệ`,
      });
    }
    return this.stockService.findByReference(type as StockReferenceType, id);
  }

  @Get('summary')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Tổng nhập/xuất theo khoảng thời gian (ADMIN)',
  })
  @ApiOkResponse({ type: StockSummaryResponseDto })
  getSummary(@Query() query: StockSummaryQueryDto) {
    return this.stockService.getSummary(query.fromDate, query.toDate);
  }

  @Get('low-stock')
  @Roles(StaffRole.ADMIN)
  @ApiOperation({
    summary: 'Materials có stockQuantity <= reorderLevel (ADMIN)',
  })
  @ApiOkResponse({ type: [LowStockResponseDto] })
  getLowStock() {
    return this.stockService.getLowStockMaterials();
  }
}
