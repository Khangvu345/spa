import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupplierModule } from '../supplier/supplier.module';
import { MaterialController } from './material.controller';
import { Material, MaterialSchema } from './material.schema';
import { MaterialService } from './material.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Material.name, schema: MaterialSchema },
    ]),
    SupplierModule,
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService, MongooseModule],
})
export class MaterialModule {}
