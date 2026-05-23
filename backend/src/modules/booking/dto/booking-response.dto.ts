import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceOrderResponseDto } from '../../service-order/dto/service-order-response.dto';
import { BookingSource, BookingStatus } from '../booking.schema';

export class BookingCustomerSnapshotResponseDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: '0911000001' })
  phone: string;

  @ApiProperty({ example: 'customer@example.com' })
  email: string;
}

export class BookingServiceSnapshotResponseDto {
  @ApiProperty({ example: 'SWEDISH_60' })
  code: string;

  @ApiProperty({ example: 'Massage Swedish 60' })
  name: string;

  @ApiProperty({ example: 350000 })
  price: number;

  @ApiProperty({ example: 60 })
  durationMinutes: number;

  @ApiProperty({ example: 15 })
  cleanupMinutes: number;
}

export class BookingStaffSnapshotResponseDto {
  @ApiProperty({ example: 'Nguyen Loc' })
  fullName: string;
}

export class BookingCustomerLiteResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  id: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: '0911000001' })
  phone: string;

  @ApiProperty({ example: 'customer@example.com' })
  email: string;
}

export class BookingServiceLiteResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcdf' })
  id: string;

  @ApiProperty({ example: 'SWEDISH_60' })
  code: string;

  @ApiProperty({ example: 'Massage Swedish 60' })
  name: string;

  @ApiProperty({ example: 350000 })
  price: number;
}

export class BookingResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcee' })
  id: string;

  @ApiProperty({ example: 'BK-20260520-0001' })
  bookingCode: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  customerId: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcdf' })
  serviceId: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcd0' })
  staffId: string;

  @ApiProperty({ type: BookingCustomerSnapshotResponseDto })
  customerSnapshot: BookingCustomerSnapshotResponseDto;

  @ApiProperty({ type: BookingServiceSnapshotResponseDto })
  serviceSnapshot: BookingServiceSnapshotResponseDto;

  @ApiProperty({ type: BookingStaffSnapshotResponseDto })
  staffSnapshot: BookingStaffSnapshotResponseDto;

  @ApiProperty({ description: 'ISO 8601' })
  scheduledStart: string;

  @ApiProperty({ description: 'ISO 8601' })
  scheduledEnd: string;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ enum: BookingSource })
  source: BookingSource;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601 or null' })
  otpExpiresAt: string | null;

  @ApiProperty({ example: 0 })
  otpAttempts: number;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601 or null' })
  verifiedAt: string | null;

  @ApiProperty({ example: 'Khach yeu cau phong yen tinh' })
  note: string;

  @ApiPropertyOptional({
    example: '665f2b8f2b9f2f00123abcd1',
    nullable: true,
  })
  serviceOrderId: string | null;

  @ApiPropertyOptional({
    example: '665f2b8f2b9f2f00123abcd2',
    nullable: true,
  })
  createdBy: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601 or null' })
  cancelledAt: string | null;

  @ApiPropertyOptional({
    example: '665f2b8f2b9f2f00123abcd2',
    nullable: true,
  })
  cancelledBy: string | null;

  @ApiPropertyOptional({ example: 'Khach bao huy lich', nullable: true })
  cancelReason: string | null;

  @ApiPropertyOptional({ type: BookingCustomerLiteResponseDto })
  customer?: BookingCustomerLiteResponseDto;

  @ApiPropertyOptional({ type: BookingServiceLiteResponseDto })
  service?: BookingServiceLiteResponseDto;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;
}

export class CheckInBookingResponseDto {
  @ApiProperty({ type: BookingResponseDto })
  booking: BookingResponseDto;

  @ApiProperty({ type: ServiceOrderResponseDto })
  serviceOrder: ServiceOrderResponseDto;
}
