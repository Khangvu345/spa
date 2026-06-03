import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '../invoice.schema';

export class MarkPaidDto {
  @ApiProperty({
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
    description: 'Phase 1 chỉ accept CASH; VNPAY là phase 4',
  })
  @IsOptional()
  @IsEnum(PaymentMethod, { message: 'paymentMethod không hợp lệ' })
  paymentMethod?: PaymentMethod = PaymentMethod.CASH;
}
