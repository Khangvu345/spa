import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type SlotStatus = 'FREE' | 'BUSY';

export class SlotInfoDto {
  @ApiProperty({ example: '09:00' })
  time: string;

  @ApiProperty({ enum: ['FREE', 'BUSY'] })
  status: SlotStatus;

  @ApiPropertyOptional({ example: '665f2b8f2b9f2f00123abcde' })
  bookingId?: string;
}

export class AvailabilityResponseDto {
  @ApiProperty({ example: '2026-05-20' })
  date: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  serviceId: string;

  @ApiProperty({ example: 'Massage Swedish 60' })
  serviceName: string;

  @ApiProperty({ example: 'Nguyen Loc' })
  staffName: string;

  @ApiProperty({ example: ['09:00', '10:30'], isArray: true })
  suggestedSlots: string[];
}

export class AvailabilityGridResponseDto {
  @ApiProperty({ example: '2026-05-20' })
  date: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  serviceId: string;

  @ApiProperty({ type: SlotInfoDto, isArray: true })
  slots: SlotInfoDto[];
}
