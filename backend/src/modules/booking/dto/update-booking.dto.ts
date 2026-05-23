import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { BookingStatus } from '../booking.schema';

export class UpdateBookingDto {
  @ApiPropertyOptional({ example: 'Cap nhat ghi chu cho lich hen' })
  @IsOptional()
  @IsString({ message: 'Ghi chu phai la chuoi' })
  @MaxLength(500, { message: 'Ghi chu toi da 500 ky tu' })
  note?: string;

  @ApiPropertyOptional({
    enum: [BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED],
    description: 'Chi ho tro CHECKED_IN -> IN_PROGRESS -> COMPLETED',
  })
  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Trang thai booking khong hop le' })
  status?: BookingStatus;
}
