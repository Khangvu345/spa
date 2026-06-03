import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { Staff, StaffSchema } from './staff.schema';
import { StripEmployeeCredentialsInterceptor } from './strip-employee-credentials.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Staff.name, schema: StaffSchema }]),
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, StripEmployeeCredentialsInterceptor],
  exports: [EmployeeService, MongooseModule],
})
export class EmployeeModule {}
