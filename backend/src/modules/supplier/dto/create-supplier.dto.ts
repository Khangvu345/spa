import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Công ty TNHH Tinh dầu Hương Việt' })
  @IsString()
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  @Length(2, 200, { message: 'Tên nhà cung cấp phải có độ dài 2-200 ký tự' })
  name: string;

  @ApiProperty({ example: 'Nguyễn Thị Hương' })
  @IsString()
  @IsNotEmpty({ message: 'Tên người liên hệ không được để trống' })
  @Length(2, 100, { message: 'Tên người liên hệ phải có độ dài 2-100 ký tự' })
  contactPerson: string;

  @ApiProperty({ example: '0901234567', description: 'Số điện thoại VN 10 chữ số' })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải đủ 10 chữ số' })
  phone: string;

  @ApiPropertyOptional({ example: 'huongviet@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({ example: '123 Lê Lợi, Quận 1, TP.HCM' })
  @IsString()
  @Length(5, 500, { message: 'Địa chỉ phải có độ dài 5-500 ký tự' })
  address: string;

  @ApiPropertyOptional({ example: '0301234567', description: 'Mã số thuế (tuỳ chọn)' })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Mã số thuế tối đa 20 ký tự' })
  taxCode?: string;

  @ApiPropertyOptional({ example: 'Chuyên cung cấp tinh dầu nhập khẩu' })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Ghi chú tối đa 1000 ký tự' })
  note?: string;
}
