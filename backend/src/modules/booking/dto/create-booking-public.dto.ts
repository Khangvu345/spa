import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBookingPublicDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  @IsMongoId({ message: 'serviceId khong hop le' })
  serviceId: string;

  @ApiProperty({ example: '2026-05-20T09:00:00.000+07:00' })
  @IsDateString({}, { message: 'scheduledStart phai la ISO datetime hop le' })
  scheduledStart: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty({ message: 'Ten khach hang khong duoc de trong' })
  @Length(2, 100, { message: 'Ten khach hang phai co do dai 2-100 ky tu' })
  fullName: string;

  @ApiProperty({ example: '0911000001' })
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'So dien thoai phai du 10 chu so',
  })
  phone: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email khong hop le' })
  email?: string;

  @ApiPropertyOptional({ example: 'Khach yeu cau phong yen tinh' })
  @IsOptional()
  @IsString({ message: 'Ghi chu phai la chuoi' })
  @MaxLength(500, { message: 'Ghi chu toi da 500 ky tu' })
  note?: string;
}
