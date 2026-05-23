import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsMongoId, Matches } from 'class-validator';

export class GetAvailabilityDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  @IsMongoId({ message: 'serviceId khong hop le' })
  serviceId: string;

  @ApiProperty({ example: '2026-05-20', description: 'YYYY-MM-DD' })
  @IsDateString({}, { message: 'date phai la ngay ISO hop le' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date phai co dinh dang YYYY-MM-DD',
  })
  date: string;
}
