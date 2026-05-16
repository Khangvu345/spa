import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateSupplierDto } from './create-supplier.dto';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @ApiPropertyOptional({ example: true, description: 'Toggle vô hiệu hoá NCC' })
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;
}
