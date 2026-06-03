import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaterialType } from '../../material/material.schema';

export class BomServiceBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
}

export class BomMaterialBriefDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty() unit: string;
  @ApiProperty({ enum: MaterialType }) type: MaterialType;
  @ApiProperty() stockQuantity: number;
}

export class BomResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() serviceId: string;
  @ApiProperty() materialId: string;
  @ApiProperty() standardQuantity: number;
  @ApiProperty() note: string;
  @ApiProperty() isActive: boolean;

  @ApiPropertyOptional({ type: BomServiceBriefDto })
  service?: BomServiceBriefDto;

  @ApiPropertyOptional({ type: BomMaterialBriefDto })
  material?: BomMaterialBriefDto;

  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
  @ApiProperty({ description: 'ISO 8601' }) updatedAt: string;
}
