import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MAX_LIMIT } from '../../../../shared/constants/business-rules';
import { StaffRole, WorkStatus } from '../staff.schema';

export enum EmployeeSortBy {
  FULL_NAME = 'fullName',
  STARTED_AT = 'startedAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const EMPLOYEE_DEFAULT_PAGE = 1;
export const EMPLOYEE_DEFAULT_LIMIT = 10;

export class QueryEmployeeDto {
  @ApiPropertyOptional({ default: EMPLOYEE_DEFAULT_PAGE, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page phải là số nguyên' })
  @Min(1, { message: 'Page phải lớn hơn hoặc bằng 1' })
  page?: number = EMPLOYEE_DEFAULT_PAGE;

  @ApiPropertyOptional({
    default: EMPLOYEE_DEFAULT_LIMIT,
    minimum: 1,
    maximum: MAX_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit phải lớn hơn hoặc bằng 1' })
  @Max(MAX_LIMIT, { message: `Limit không được vượt quá ${MAX_LIMIT}` })
  limit?: number = EMPLOYEE_DEFAULT_LIMIT;

  @ApiPropertyOptional({ description: 'Tìm theo họ tên hoặc email' })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @ApiPropertyOptional({ enum: StaffRole, example: StaffRole.STAFF })
  @IsOptional()
  @IsEnum(StaffRole, { message: 'Vai trò không hợp lệ' })
  role?: StaffRole;

  @ApiPropertyOptional({ enum: WorkStatus, example: WorkStatus.ACTIVE })
  @IsOptional()
  @IsEnum(WorkStatus, { message: 'Trạng thái làm việc không hợp lệ' })
  workStatus?: WorkStatus;

  @ApiPropertyOptional({
    enum: EmployeeSortBy,
    default: EmployeeSortBy.STARTED_AT,
  })
  @IsOptional()
  @IsIn(Object.values(EmployeeSortBy), { message: 'Cột sắp xếp không hợp lệ' })
  sortBy?: EmployeeSortBy = EmployeeSortBy.STARTED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsIn(Object.values(SortOrder), { message: 'Thứ tự sắp xếp không hợp lệ' })
  sortOrder?: SortOrder = SortOrder.DESC;
}
