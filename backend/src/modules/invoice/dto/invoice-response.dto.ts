import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, PaymentMethod } from '../invoice.schema';

export class InvoiceCustomerBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() phone: string;
}

export class InvoiceCustomerSnapshotDto {
  @ApiProperty() fullName: string;
  @ApiProperty() phone: string;
  @ApiProperty() email: string;
}

export class InvoiceItemResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() serviceOrderItemId: string;
  @ApiProperty() serviceId: string;
  @ApiProperty() serviceCode: string;
  @ApiProperty() serviceName: string;
  @ApiProperty() unitPrice: number;
  @ApiProperty() quantity: number;
  @ApiProperty() subtotal: number;
  @ApiProperty() staffId: string;
  @ApiProperty() staffName: string;
  @ApiProperty() commissionRate: number;
  @ApiProperty() commissionAmount: number;
}

export class InvoiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'INV-20260523-0001' }) invoiceCode: string;
  @ApiProperty() serviceOrderId: string;
  @ApiProperty() customerId: string;

  @ApiPropertyOptional({ type: InvoiceCustomerBriefDto })
  customer?: InvoiceCustomerBriefDto;

  @ApiProperty({ type: InvoiceCustomerSnapshotDto })
  customerSnapshot: InvoiceCustomerSnapshotDto;

  @ApiProperty({ type: InvoiceItemResponseDto, isArray: true })
  items: InvoiceItemResponseDto[];

  @ApiProperty() itemsSubtotal: number;
  @ApiProperty() extraCharge: number;
  @ApiProperty() discountAmount: number;
  @ApiProperty() totalAmount: number;

  @ApiProperty({ enum: InvoiceStatus }) status: InvoiceStatus;

  @ApiPropertyOptional({ enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod | null;

  @ApiProperty() createdBy: string;
  @ApiProperty() createdByName: string;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601' })
  paidAt: string | null;

  @ApiPropertyOptional({ nullable: true }) paidBy: string | null;
  @ApiPropertyOptional({ nullable: true }) paidByName: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601' })
  cancelledAt: string | null;

  @ApiPropertyOptional({ nullable: true }) cancelledBy: string | null;
  @ApiPropertyOptional({ nullable: true }) cancelReason: string | null;

  @ApiProperty() note: string;
  @ApiProperty() stockDeducted: boolean;

  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
  @ApiProperty({ description: 'ISO 8601' }) updatedAt: string;
}
