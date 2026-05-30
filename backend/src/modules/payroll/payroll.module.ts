import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Staff, StaffSchema } from '../employee/employee/staff.schema';
import { Invoice, InvoiceSchema } from '../invoice/invoice.schema';
import { PayrollController } from './payroll.controller';
import { PayrollRecord, PayrollRecordSchema } from './payroll.schema';
import { PayrollService } from './payroll.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayrollRecord.name, schema: PayrollRecordSchema },
      { name: Invoice.name, schema: InvoiceSchema }, // ⭐ để aggregate hoa hồng
      { name: Staff.name, schema: StaffSchema }, // ⭐ lookup baseSalary
    ]),
  ],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
