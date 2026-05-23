import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from '../customer/customer.module';
import { ServiceModule } from '../service/service.module';
import { ServiceOrderModule } from '../service-order/service-order.module';
import { StaffServiceAssignmentModule } from '../staff-service-assignment/staff-service-assignment.module';
import { BookingController } from './booking.controller';
import { Booking, BookingSchema } from './booking.schema';
import { BookingService } from './booking.service';
import { SlotAvailabilityService } from './slot-availability.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    CustomerModule,
    ServiceModule,
    StaffServiceAssignmentModule,
    ServiceOrderModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, SlotAvailabilityService],
  exports: [BookingService, SlotAvailabilityService, MongooseModule],
})
export class BookingModule {}
