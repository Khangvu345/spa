import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceOrderStatus } from '../service-order.schema';

export class ServiceOrderCustomerResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName: string;

  @ApiProperty({ example: '0901234567' })
  phone: string;
}

export class ServiceOrderItemResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcdf' })
  id: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcd0' })
  serviceId: string;

  @ApiProperty({ example: 'SWEDISH_60' })
  serviceCode: string;

  @ApiProperty({ example: 'Massage Thụy Điển' })
  serviceName: string;

  @ApiProperty({ example: 350000 })
  unitPrice: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 350000 })
  subtotal: number;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  staffId: string;

  @ApiProperty({ example: 'Nguyễn Lộc' })
  staffName: string;

  @ApiProperty({ example: 20 })
  commissionRate: number;

  @ApiProperty({ example: 'Khách dị ứng tinh dầu bạc hà' })
  note: string;

  @ApiProperty({ description: 'ISO 8601' })
  addedAt: string;
}

export class ServiceOrderResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcee' })
  id: string;

  @ApiProperty({ example: 'SO-20260521-0001' })
  orderCode: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  customerId: string;

  @ApiPropertyOptional({ type: ServiceOrderCustomerResponseDto })
  customer?: ServiceOrderCustomerResponseDto;

  @ApiProperty({ type: ServiceOrderItemResponseDto, isArray: true })
  items: ServiceOrderItemResponseDto[];

  @ApiProperty({ example: 350000 })
  itemsSubtotal: number;

  @ApiProperty({ example: 50000 })
  extraCharge: number;

  @ApiProperty({ example: 400000 })
  totalAmount: number;

  @ApiProperty({ enum: ServiceOrderStatus, example: ServiceOrderStatus.DRAFT })
  status: ServiceOrderStatus;

  @ApiProperty({ example: 'Khách yêu cầu phòng yên tĩnh' })
  note: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abccc' })
  createdBy: string;

  @ApiProperty({ example: 'Nhân viên vận hành' })
  createdByName: string;

  @ApiPropertyOptional({
    example: '665f2b8f2b9f2f00123abcd0',
    nullable: true,
  })
  bookingId: string | null;

  @ApiPropertyOptional({ description: 'ISO 8601 hoặc null', nullable: true })
  startedAt: string | null;

  @ApiPropertyOptional({ description: 'ISO 8601 hoặc null', nullable: true })
  completedAt: string | null;

  @ApiPropertyOptional({ description: 'ISO 8601 hoặc null', nullable: true })
  invoicedAt: string | null;

  @ApiPropertyOptional({ description: 'ISO 8601 hoặc null', nullable: true })
  cancelledAt: string | null;

  @ApiPropertyOptional({
    example: '665f2b8f2b9f2f00123abccc',
    nullable: true,
  })
  cancelledBy: string | null;

  @ApiPropertyOptional({ example: 'Khach huy sau check-in', nullable: true })
  cancelReason: string | null;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;
}
