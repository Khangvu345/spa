import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMaterialDto } from './create-material.dto';

export class UpdateMaterialDto extends PartialType(CreateMaterialDto) {
  @ApiPropertyOptional({ example: true, description: 'Toggle vô hiệu hoá vật liệu' })
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;
}
