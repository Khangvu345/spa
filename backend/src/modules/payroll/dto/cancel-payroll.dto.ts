import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CancelPayrollDto {
  @ApiProperty({ example: 'Chốt nhầm tháng, hủy để chốt lại' })
  @IsString()
  @MinLength(1, { message: 'Lý do hủy không được trống' })
  @MaxLength(500, { message: 'Lý do hủy tối đa 500 ký tự' })
  reason: string;
}
