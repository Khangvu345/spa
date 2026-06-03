import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountStatus, StaffRole, WorkStatus } from '../staff.schema';

export class EmployeeResponseDto {
  @ApiProperty({ example: '665f2b8f2b9f2f00123abcde' })
  id: string;

  @ApiProperty({ example: 'staff@spa.local' })
  email: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: '0901234567' })
  phone: string;

  @ApiProperty({ enum: StaffRole, example: StaffRole.STAFF })
  role: StaffRole;

  @ApiProperty({ example: 8000000, description: 'Lương cứng tháng - VND' })
  baseSalary: number;

  @ApiProperty({ enum: WorkStatus, example: WorkStatus.ACTIVE })
  workStatus: WorkStatus;

  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  accountStatus: AccountStatus;

  @ApiProperty({ description: 'ISO 8601', example: '2026-05-12T00:00:00.000Z' })
  startedAt: string;

  @ApiProperty({ example: false })
  mustChangePassword: boolean;

  @ApiPropertyOptional({
    nullable: true,
    description: 'ISO 8601 hoặc null',
    example: null,
  })
  lockedAt: string | null;

  @ApiProperty({ description: 'ISO 8601', example: '2026-05-12T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'ISO 8601', example: '2026-05-12T00:00:00.000Z' })
  updatedAt: string;
}
