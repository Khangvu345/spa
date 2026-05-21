import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AddItemDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcd0' })
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId: string;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(10, { message: 'Số lượng tối đa là 10' })
  quantity?: number = 1;

  @ApiPropertyOptional({
    example: 'Khách dị ứng tinh dầu bạc hà',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú item phải là chuỗi' })
  @MaxLength(200, { message: 'Ghi chú item tối đa 200 ký tự' })
  note?: string;
}
