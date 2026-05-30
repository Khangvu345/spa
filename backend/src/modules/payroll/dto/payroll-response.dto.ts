import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayrollStatus } from '../payroll.schema';

export class PayrollStaffSnapshotDto {
  @ApiProperty() fullName: string;
  @ApiProperty() role: string;
}

export class PayrollCommissionBreakdownDto {
  @ApiProperty() serviceId: string;
  @ApiProperty() serviceName: string;
  @ApiProperty() serviceCount: number;
  @ApiProperty() totalCommission: number;
}

export class PayrollResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'PAY-202605-0001' }) payrollCode: string;

  @ApiProperty() periodYear: number;
  @ApiProperty() periodMonth: number;

  @ApiProperty() staffId: string;
  @ApiProperty({ type: PayrollStaffSnapshotDto })
  staffSnapshot: PayrollStaffSnapshotDto;

  @ApiProperty() baseSalary: number;
  @ApiProperty() totalCommission: number;
  @ApiProperty() adjustment: number;
  @ApiProperty() totalIncome: number;

  @ApiProperty({ type: PayrollCommissionBreakdownDto, isArray: true })
  commissionBreakdown: PayrollCommissionBreakdownDto[];

  @ApiProperty({ type: String, isArray: true })
  sourceInvoiceIds: string[];

  @ApiProperty() invoiceCount: number;

  @ApiProperty({ enum: PayrollStatus }) status: PayrollStatus;

  @ApiProperty() finalizedBy: string;
  @ApiProperty() finalizedByName: string;
  @ApiProperty({ description: 'ISO 8601' }) finalizedAt: string;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601' })
  paidAt: string | null;
  @ApiPropertyOptional({ nullable: true }) paidBy: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601' })
  cancelledAt: string | null;
  @ApiPropertyOptional({ nullable: true }) cancelledBy: string | null;
  @ApiPropertyOptional({ nullable: true }) cancelReason: string | null;

  @ApiProperty() note: string;

  @ApiProperty({ description: 'ISO 8601' }) createdAt: string;
  @ApiProperty({ description: 'ISO 8601' }) updatedAt: string;
}

/**
 * Kết quả preview — tính live, KHÔNG lưu DB. Không có id/status/audit.
 */
export class PayrollPreviewDto {
  @ApiProperty() staffId: string;
  @ApiProperty({ type: PayrollStaffSnapshotDto })
  staffSnapshot: PayrollStaffSnapshotDto;

  @ApiProperty() periodYear: number;
  @ApiProperty() periodMonth: number;

  @ApiProperty() baseSalary: number;
  @ApiProperty() totalCommission: number;
  @ApiProperty() adjustment: number;
  @ApiProperty() totalIncome: number;

  @ApiProperty({ type: PayrollCommissionBreakdownDto, isArray: true })
  commissionBreakdown: PayrollCommissionBreakdownDto[];

  @ApiProperty({ type: String, isArray: true })
  sourceInvoiceIds: string[];

  @ApiProperty() invoiceCount: number;
}

export class PayrollBatchResultDto {
  @ApiProperty() created: number;
  @ApiProperty() skipped: number;
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        staffId: { type: 'string' },
        status: { type: 'string', example: 'created | skipped | error' },
        payrollCode: { type: 'string', nullable: true },
        reason: { type: 'string', nullable: true },
      },
    },
  })
  details: Array<{
    staffId: string;
    status: 'created' | 'skipped' | 'error';
    payrollCode?: string;
    reason?: string;
  }>;
}
