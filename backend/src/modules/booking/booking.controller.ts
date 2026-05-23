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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { StaffRole } from '../employee/employee/staff.schema';
import { BookingService } from './booking.service';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import {
  AvailabilityGridResponseDto,
  AvailabilityResponseDto,
} from './dto/availability-response.dto';
import {
  BookingResponseDto,
  CheckInBookingResponseDto,
} from './dto/booking-response.dto';
import { CreateBookingOperatorDto } from './dto/create-booking-operator.dto';
import { CreateBookingPublicDto } from './dto/create-booking-public.dto';
import { GetAvailabilityDto } from './dto/get-availability.dto';
import { QueryBookingDto } from './dto/query-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SlotAvailabilityService } from './slot-availability.service';

@ApiTags('Bookings')
@ApiBearerAuth('access-token')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly slotAvailabilityService: SlotAvailabilityService,
  ) {}

  @Get('availability')
  @Public()
  @ApiOperation({ summary: 'Top 8 khung gio goi y cho landing page' })
  @ApiOkResponse({ type: AvailabilityResponseDto })
  async getAvailability(@Query() query: GetAvailabilityDto) {
    const [metadata, suggestedSlots] = await Promise.all([
      this.slotAvailabilityService.getAvailabilityMetadata(
        query.serviceId,
        query.date,
      ),
      this.slotAvailabilityService.getSuggestedSlots(
        query.serviceId,
        query.date,
        8,
      ),
    ]);

    return {
      ...metadata,
      suggestedSlots,
    };
  }

  @Get('availability/grid')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Full grid slot availability cho operator' })
  @ApiOkResponse({ type: AvailabilityGridResponseDto })
  async getAvailabilityGrid(@Query() query: GetAvailabilityDto) {
    return {
      date: query.date,
      serviceId: query.serviceId,
      slots: await this.slotAvailabilityService.getFullGrid(
        query.serviceId,
        query.date,
      ),
    };
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Khach tao booking tu landing page' })
  @ApiCreatedResponse({ type: BookingResponseDto })
  createPublic(@Body() dto: CreateBookingPublicDto) {
    return this.bookingService.createPublic(dto);
  }

  @Post('operator')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @ApiOperation({ summary: 'Operator tao booking thay khach' })
  @ApiCreatedResponse({ type: BookingResponseDto })
  createOperator(
    @Body() dto: CreateBookingOperatorDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.bookingService.createOperator(dto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sach booking voi filter/search/sort' })
  findAll(@Query() query: QueryBookingDto) {
    return this.bookingService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiet booking' })
  @ApiOkResponse({ type: BookingResponseDto })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cap nhat ghi chu hoac status booking' })
  @ApiOkResponse({ type: BookingResponseDto })
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingService.update(id, dto);
  }

  @Post(':id/check-in')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check-in booking va tao Service Order DRAFT' })
  @ApiOkResponse({ type: CheckInBookingResponseDto })
  checkIn(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.bookingService.checkIn(id, currentUser);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Huy booking' })
  @ApiOkResponse({ type: BookingResponseDto })
  cancel(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: CancelBookingDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.bookingService.cancel(id, dto, currentUser);
  }

  @Post(':id/no-show')
  @Roles(StaffRole.OPERATOR, StaffRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh dau khach khong den' })
  @ApiOkResponse({ type: BookingResponseDto })
  markNoShow(@Param('id', ParseObjectIdPipe) id: string) {
    return this.bookingService.markNoShow(id);
  }
}
