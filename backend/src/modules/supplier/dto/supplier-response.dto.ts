import { ApiProperty } from '@nestjs/swagger';

export class SupplierResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() contactPerson: string;
  @ApiProperty() phone: string;
  @ApiProperty() email: string;
  @ApiProperty() address: string;
  @ApiProperty() taxCode: string;
  @ApiProperty() note: string;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
  @ApiProperty({ description: 'ISO 8601' }) updatedAt: string;
}
