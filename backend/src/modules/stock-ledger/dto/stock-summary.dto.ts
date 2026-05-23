import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class StockSummaryQueryDto {
  @ApiPropertyOptional({ description: 'ISO date' })
  @IsOptional()
  @IsDateString({}, { message: 'fromDate phải là ISO date' })
  fromDate?: string;

  @ApiPropertyOptional({ description: 'ISO date' })
  @IsOptional()
  @IsDateString({}, { message: 'toDate phải là ISO date' })
  toDate?: string;
}

export class StockSummaryBucketDto {
  @ApiProperty() count: number;
  @ApiProperty() quantity: number;
  @ApiProperty() cost: number;
}

export class StockSummaryResponseDto {
  @ApiProperty({ type: StockSummaryBucketDto }) totalIn: StockSummaryBucketDto;
  @ApiProperty({ type: StockSummaryBucketDto })
  totalOutInvoice: StockSummaryBucketDto;
  @ApiProperty({ type: StockSummaryBucketDto })
  totalOutManual: StockSummaryBucketDto;
  @ApiProperty({ type: StockSummaryBucketDto })
  totalAdjustment: StockSummaryBucketDto;
}
