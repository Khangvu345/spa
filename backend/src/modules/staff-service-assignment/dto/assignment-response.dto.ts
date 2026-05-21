import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffRole } from '../../employee/employee/staff.schema';

export class AssignmentStaffResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  id: string;

  @ApiProperty({ example: 'Nguyễn Lộc' })
  fullName: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.STAFF })
  role: StaffRole;
}

export class AssignmentServiceResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcd0' })
  id: string;

  @ApiProperty({ example: 'SWEDISH_60' })
  code: string;

  @ApiProperty({ example: 'Massage Thụy Điển' })
  name: string;

  @ApiProperty({ example: 350000, description: 'Giá bán dịch vụ (VND)' })
  price: number;
}

export class AssignmentResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcdd' })
  id: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  staffId: string;

  @ApiProperty({ example: '665f2b8f2b9f2f00123abcd0' })
  serviceId: string;

  @ApiProperty({ example: 20 })
  commissionRate: number;

  @ApiProperty({ description: 'ISO 8601' })
  assignedSince: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 'Chuyên viên chính phụ trách Massage Thụy Điển' })
  note: string;

  @ApiPropertyOptional({ type: AssignmentStaffResponseDto })
  staff?: AssignmentStaffResponseDto;

  @ApiPropertyOptional({ type: AssignmentServiceResponseDto })
  service?: AssignmentServiceResponseDto;

  @ApiProperty({ description: 'ISO 8601' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601' })
  updatedAt: string;
}
