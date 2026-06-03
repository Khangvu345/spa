import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ServiceOrderStatus } from '../service-order.schema';

export class UpdateServiceOrderDto {
  @ApiPropertyOptional({
    example: 'Khách yêu cầu phòng yên tĩnh',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  note?: string;

  @ApiPropertyOptional({ example: 50000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Chi phí phát sinh phải là số nguyên' })
  @Min(0, { message: 'Chi phí phát sinh không được âm' })
  extraCharge?: number;

  @ApiPropertyOptional({
    enum: ServiceOrderStatus,
    example: ServiceOrderStatus.IN_PROGRESS,
    description: 'PATCH chỉ cho phép DRAFT -> IN_PROGRESS',
  })
  @IsOptional()
  @IsEnum(ServiceOrderStatus, { message: 'Trạng thái phiếu không hợp lệ' })
  status?: ServiceOrderStatus;
}
