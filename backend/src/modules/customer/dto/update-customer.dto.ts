import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ['phone'] as const),
) {
  @ApiPropertyOptional({
    type: String,
    description: 'Bị bỏ qua nếu gửi lên; phone là định danh không cho sửa.',
  })
  @Allow()
  phone?: unknown;
}
