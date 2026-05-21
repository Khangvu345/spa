import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 2, minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối thiểu là 1' })
  @Max(10, { message: 'Số lượng tối đa là 10' })
  quantity?: number;

  @ApiPropertyOptional({ example: 'Làm nhẹ vùng cổ', maxLength: 200 })
  @IsOptional()
  @IsString({ message: 'Ghi chú item phải là chuỗi' })
  @MaxLength(200, { message: 'Ghi chú item tối đa 200 ký tự' })
  note?: string;

  @ApiPropertyOptional({
    example: '665f2b8f2b9f2f00123abcd0',
    description: 'Field tương thích request cũ, service sẽ bỏ qua',
  })
  @IsOptional()
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId?: string;
}
