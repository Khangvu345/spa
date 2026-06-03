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

export class RequestBookingOtpDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  @IsMongoId({ message: 'serviceId không hợp lệ' })
  serviceId: string;

  @ApiProperty({ example: '2026-05-20T09:00:00.000+07:00' })
  @IsDateString({}, { message: 'scheduledStart phải là ISO datetime hợp lệ' })
  scheduledStart: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty({ message: 'Tên khách hàng không được để trống' })
  @Length(2, 100, { message: 'Tên khách hàng phải có độ dài 2-100 ký tự' })
  fullName: string;

  @ApiProperty({ example: '0911000001' })
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Số điện thoại phải đủ 10 chữ số',
  })
  phone: string;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiPropertyOptional({ example: 'Khách yêu cầu phòng yên tĩnh' })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  note?: string;
}
