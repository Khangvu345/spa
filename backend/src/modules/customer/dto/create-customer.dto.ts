import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { CustomerSource } from '../customer.schema';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty({ message: 'Tên khách hàng không được để trống' })
  @Length(2, 100, { message: 'Tên khách hàng phải có độ dài 2-100 ký tự' })
  fullName: string;

  @ApiProperty({ example: '0911000001', description: 'Số điện thoại VN 10 chữ số' })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải đủ 10 chữ số' })
  phone: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({
    enum: CustomerSource,
    default: CustomerSource.MANUAL,
  })
  @IsOptional()
  @IsEnum(CustomerSource, { message: 'Nguồn khách hàng không hợp lệ' })
  source?: CustomerSource;

  @ApiPropertyOptional({ example: 'Khách VIP', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  note?: string;
}
