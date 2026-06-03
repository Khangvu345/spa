import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  StockReferenceType,
  StockTransactionType,
} from '../stock-ledger.schema';

export class LedgerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() materialId: string;
  @ApiProperty() materialCode: string;
  @ApiProperty() materialName: string;
  @ApiProperty() materialUnit: string;

  @ApiProperty({ enum: StockTransactionType })
  transactionType: StockTransactionType;

  @ApiProperty() quantityChange: number;
  @ApiProperty() stockBefore: number;
  @ApiProperty() stockAfter: number;

  @ApiPropertyOptional({ nullable: true }) supplierId: string | null;
  @ApiPropertyOptional({ nullable: true }) supplierName: string | null;
  @ApiPropertyOptional({ nullable: true }) unitPrice: number | null;
  @ApiPropertyOptional({ nullable: true }) totalCost: number | null;

  @ApiPropertyOptional({ enum: StockReferenceType, nullable: true })
  referenceType: StockReferenceType | null;

  @ApiPropertyOptional({ nullable: true }) referenceId: string | null;

  @ApiProperty() performedBy: string;
  @ApiProperty() performedByName: string;
  @ApiProperty() reason: string;

  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
}
