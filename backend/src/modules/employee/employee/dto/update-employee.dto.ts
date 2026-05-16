import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { WorkStatus } from '../staff.schema';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends OmitType(
  PartialType(CreateEmployeeDto),
  ['email', 'password'] as const,
) {
  @ApiPropertyOptional({ enum: WorkStatus, example: WorkStatus.ON_LEAVE })
  @IsOptional()
  @IsEnum(WorkStatus, { message: 'Trạng thái làm việc không hợp lệ' })
  workStatus?: WorkStatus;
}
