import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeService } from './employee.service';
import { Staff, StaffSchema } from './staff.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
  ],
  providers: [EmployeeService],
  exports: [EmployeeService, MongooseModule],
})
export class EmployeeModule {}
