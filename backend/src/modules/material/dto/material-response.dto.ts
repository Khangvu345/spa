import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '../material.schema';

export class MaterialSupplierBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
}

export class MaterialResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() unit: string;
  @ApiProperty({ enum: MaterialType }) type: MaterialType;
  @ApiProperty() unitPrice: number;
  @ApiProperty() stockQuantity: number;
  @ApiProperty() reorderLevel: number;
  @ApiProperty() expectedUsesPerUnit: number;
  @ApiProperty() supplierId: string;
  @ApiPropertyOptional({ type: MaterialSupplierBriefDto })
  supplier?: MaterialSupplierBriefDto;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
  @ApiProperty({ description: 'ISO 8601' }) updatedAt: string;
}
