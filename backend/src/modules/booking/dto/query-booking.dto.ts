import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  DEFAULT_PAGE,
  MAX_LIMIT,
} from '../../../shared/constants/business-rules';
import { BookingStatus } from '../booking.schema';

export type BookingSortField = 'scheduledStart' | 'createdAt';
export type BookingSortOrder = 'asc' | 'desc';

export class QueryBookingDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: MAX_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = 10;

  @ApiPropertyOptional({ example: '665f2b8f2b9f2f00123abcde' })
  @IsOptional()
  @IsMongoId({ message: 'customerId khong hop le' })
  customerId?: string;

  @ApiPropertyOptional({ example: '665f2b8f2b9f2f00123abcdf' })
  @IsOptional()
  @IsMongoId({ message: 'staffId khong hop le' })
  staffId?: string;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus, { message: 'Trang thai booking khong hop le' })
  status?: BookingStatus;

  @ApiPropertyOptional({ example: '0911000001' })
  @IsOptional()
  @IsString({ message: 'search phai la chuoi' })
  search?: string;

  @ApiPropertyOptional({ example: '2026-05-20' })
  @IsOptional()
  @IsDateString({}, { message: 'fromDate phai la ngay ISO hop le' })
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-05-21' })
  @IsOptional()
  @IsDateString({}, { message: 'toDate phai la ngay ISO hop le' })
  toDate?: string;

  @ApiPropertyOptional({
    enum: ['scheduledStart', 'createdAt'],
    default: 'scheduledStart',
  })
  @IsOptional()
  @IsIn(['scheduledStart', 'createdAt'])
  sortBy?: BookingSortField = 'scheduledStart';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: BookingSortOrder = 'asc';
}
