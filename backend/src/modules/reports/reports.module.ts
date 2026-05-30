import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../booking/booking.schema';
import { Invoice, InvoiceSchema } from '../invoice/invoice.schema';
import { Material, MaterialSchema } from '../material/material.schema';
import {
  ServiceOrder,
  ServiceOrderSchema,
} from '../service-order/service-order.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

/**
 * Reports & Dashboard (#22) — module thuần đọc + aggregate.
 * Inject Model trực tiếp (KHÔNG inject service module khác → tránh coupling).
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema }, // doanh thu, theo dịch vụ, theo nhân viên
      { name: Booking.name, schema: BookingSchema }, // đếm booking
      { name: ServiceOrder.name, schema: ServiceOrderSchema }, // dịch vụ hoàn thành
      { name: Material.name, schema: MaterialSchema }, // low stock count
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
