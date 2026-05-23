import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  @IsMongoId({ message: 'customerId không hợp lệ' })
  customerId: string;

  @ApiPropertyOptional({
    example: 'Khách yêu cầu phòng yên tĩnh',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  note?: string;

  @ApiPropertyOptional({
    example: '665f2b8f2b9f2f00123abcd0',
    nullable: true,
  })
  @IsOptional()
  @IsMongoId({ message: 'bookingId không hợp lệ' })
  bookingId?: string | null;
}
