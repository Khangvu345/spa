import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceCategory } from '../service.schema';

export class ServiceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: ServiceCategory }) category: ServiceCategory;
  @ApiProperty({ description: 'Giá bán (VND)' }) unitPrice: number;
  @ApiProperty({ description: 'Thời gian thực hiện (phút)' }) durationMinutes: number;
  @ApiProperty({ description: 'Thời gian dọn dẹp (phút)' }) bufferMinutes: number;
  @ApiProperty({ description: 'Số slot chiếm dụng' }) slotsRequired: number;
  @ApiProperty() description: string;
  // @ApiPropertyOptional({ nullable: true }) imageUrl: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
  @ApiProperty({ description: 'ISO 8601' }) updatedAt: string;
}
