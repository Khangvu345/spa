import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../booking/booking.schema';
import { CustomerModule } from '../customer/customer.module';
import { EmployeeModule } from '../employee/employee/employee.module';
import { ServiceModule } from '../service/service.module';
import { StaffServiceAssignmentModule } from '../staff-service-assignment/staff-service-assignment.module';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrder, ServiceOrderSchema } from './service-order.schema';
import { ServiceOrderService } from './service-order.service';

@Module({
  imports: [
    CustomerModule,
    ServiceModule,
    StaffServiceAssignmentModule,
    EmployeeModule,
    MongooseModule.forFeature([
      { name: ServiceOrder.name, schema: ServiceOrderSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService, MongooseModule],
})
export class ServiceOrderModule {}
