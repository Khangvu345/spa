import { ApiProperty } from '@nestjs/swagger';
import { CustomerSource } from '../customer.schema';

export class CustomerResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() fullName: string;
  @ApiProperty() phone: string;
  @ApiProperty() email: string;
  @ApiProperty({ enum: CustomerSource }) source: CustomerSource;
  @ApiProperty() note: string;
  @ApiProperty() phoneVerified: boolean;
  @ApiProperty() emailVerified: boolean;
  @ApiProperty({ type: String, nullable: true, description: 'ISO 8601 hoặc null' })
  lastVerifiedAt: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
  @ApiProperty({ description: 'ISO 8601' }) updatedAt: string;
}

export class FindOrCreateResponseDto extends CustomerResponseDto {
  @ApiProperty() wasCreated: boolean;
}
