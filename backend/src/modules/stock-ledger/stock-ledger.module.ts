import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialModule } from '../material/material.module';
import { SupplierModule } from '../supplier/supplier.module';
import { StockLedger, StockLedgerSchema } from './stock-ledger.schema';
import { StockLedgerService } from './stock-ledger.service';
import { StockController } from './stock.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StockLedger.name, schema: StockLedgerSchema },
    ]),
    MaterialModule,
    SupplierModule,
  ],
  controllers: [StockController],
  providers: [StockLedgerService],
  exports: [StockLedgerService, MongooseModule],
})
export class StockLedgerModule {}
