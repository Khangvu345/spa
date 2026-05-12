import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus, StaffRole, WorkStatus } from '../staff.schema';

export class StaffResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  id: string;

  @ApiProperty({ example: 'admin@spa.local' })
  email: string;

  @ApiProperty({ example: 'Nguyễn Văn Admin' })
  fullName: string;

  @ApiProperty({ example: '0901234567' })
  phone: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.ADMIN })
  role: StaffRole;

  @ApiProperty({ example: 12000000, description: 'Lương cứng tháng - VND' })
  baseSalary: number;

  @ApiProperty({ enum: WorkStatus, example: WorkStatus.ACTIVE })
  workStatus: WorkStatus;

  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  accountStatus: AccountStatus;

  @ApiProperty({ description: 'ISO 8601', example: '2026-05-12T00:00:00.000Z' })
  startedAt: string;

  @ApiProperty({ example: false })
  mustChangePassword: boolean;

  @ApiProperty({ description: 'ISO 8601', example: '2026-05-12T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601', example: '2026-05-12T00:00:00.000Z' })
  updatedAt: string;
}
