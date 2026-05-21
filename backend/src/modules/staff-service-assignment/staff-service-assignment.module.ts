import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeModule } from '../employee/employee/employee.module';
import { ServiceModule } from '../service/service.module';
import { StaffServiceAssignmentController } from './staff-service-assignment.controller';
import {
  StaffServiceAssignment,
  StaffServiceAssignmentSchema,
} from './staff-service-assignment.schema';
import { StaffServiceAssignmentService } from './staff-service-assignment.service';

@Module({
  imports: [
    EmployeeModule,
    ServiceModule,
    MongooseModule.forFeature([
      {
        name: StaffServiceAssignment.name,
        schema: StaffServiceAssignmentSchema,
      },
    ]),
  ],
  controllers: [StaffServiceAssignmentController],
  providers: [StaffServiceAssignmentService],
  exports: [StaffServiceAssignmentService, MongooseModule],
})
export class StaffServiceAssignmentModule {}
