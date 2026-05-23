import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LowStockSupplierBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() phone: string;
}

export class LowStockResponseDto {
  @ApiProperty() materialId: string;
  @ApiProperty() materialCode: string;
  @ApiProperty() materialName: string;
  @ApiProperty() stockQuantity: number;
  @ApiProperty() reorderLevel: number;
  @ApiProperty() unit: string;
  @ApiPropertyOptional({ type: LowStockSupplierBriefDto, nullable: true })
  supplier: LowStockSupplierBriefDto | null;
}
