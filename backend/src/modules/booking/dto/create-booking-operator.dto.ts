import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBookingOperatorDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  @IsMongoId({ message: 'customerId khong hop le' })
  customerId: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcdf' })
  @IsMongoId({ message: 'serviceId khong hop le' })
  serviceId: string;

  @ApiProperty({ example: '2026-05-20T09:00:00.000+07:00' })
  @IsDateString({}, { message: 'scheduledStart phai la ISO datetime hop le' })
  scheduledStart: string;

  @ApiPropertyOptional({ example: 'Khach dat qua dien thoai' })
  @IsOptional()
  @IsString({ message: 'Ghi chu phai la chuoi' })
  @MaxLength(500, { message: 'Ghi chu toi da 500 ky tu' })
  note?: string;
}
