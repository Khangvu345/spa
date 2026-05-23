import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from '../customer/customer.module';
import { ServiceMaterialBomModule } from '../service-material-bom/service-material-bom.module';
import { ServiceOrderModule } from '../service-order/service-order.module';
import { StockLedgerModule } from '../stock-ledger/stock-ledger.module';
import { InvoiceController } from './invoice.controller';
import { Invoice, InvoiceSchema } from './invoice.schema';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ServiceOrderModule,
    ServiceMaterialBomModule,
    StockLedgerModule,
    CustomerModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService, MongooseModule],
})
export class InvoiceModule {}
