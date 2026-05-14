import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupplierController } from './supplier.controller';
import { Supplier, SupplierSchema } from './supplier.schema';
import { SupplierService } from './supplier.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService, MongooseModule],
})
export class SupplierModule {}
