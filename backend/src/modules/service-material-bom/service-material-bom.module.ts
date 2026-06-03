import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialModule } from '../material/material.module';
import { ServiceModule } from '../service/service.module';
import { ServiceMaterialBomController } from './service-material-bom.controller';
import {
  ServiceMaterialBom,
  ServiceMaterialBomSchema,
} from './service-material-bom.schema';
import { ServiceMaterialBomService } from './service-material-bom.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceMaterialBom.name, schema: ServiceMaterialBomSchema },
    ]),
    ServiceModule,
    MaterialModule,
  ],
  controllers: [ServiceMaterialBomController],
  providers: [ServiceMaterialBomService],
  // ⚠️ Export cho Invoice (#19) inject BomService cho Auto Stock Deduction (#20)
  exports: [ServiceMaterialBomService, MongooseModule],
})
export class ServiceMaterialBomModule {}
