import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import { Material, MaterialDocument } from '../modules/material/material.schema';
import { Service, ServiceDocument } from '../modules/service/service.schema';
import {
  ServiceMaterialBom,
  ServiceMaterialBomDocument,
} from '../modules/service-material-bom/service-material-bom.schema';

const logger = new Logger('SeedBom');

interface SeedBomInput {
  serviceCode: string;
  materialCode: string;
  standardQuantity: number;
  note: string;
}

/**
 * Định mức 6 dịch vụ MVP theo DICH_VU_VA_HOA_HONG.md — 15 entries.
 */
const SEED_BOM: SeedBomInput[] = [
  // SWEDISH_60 — Massage Thụy Điển (60')
  { serviceCode: 'SWEDISH_60',       materialCode: 'OIL_SUNFLOWER',       standardQuantity: 30,   note: 'Tinh dầu nền, 30ml/ca' },
  { serviceCode: 'SWEDISH_60',       materialCode: 'PAPER_BED',           standardQuantity: 1,    note: '1 khăn giấy trải giường' },

  // HOT_STONE_90 — Massage đá nóng (90') — có DEPRECIATION
  { serviceCode: 'HOT_STONE_90',     materialCode: 'OIL_OLIVE',           standardQuantity: 30,   note: '30ml tinh dầu olive' },
  { serviceCode: 'HOT_STONE_90',     materialCode: 'PAPER_BED',           standardQuantity: 1,    note: '1 khăn giấy' },
  { serviceCode: 'HOT_STONE_90',     materialCode: 'STONE_VOLCANIC',      standardQuantity: 0.01, note: 'Khấu hao 1/100 bộ đá (100 lần dùng)' },

  // THAI_90 — Massage Thái (90')
  { serviceCode: 'THAI_90',          materialCode: 'BALM_PAIN_RELIEF',    standardQuantity: 5,    note: '5g cao xoa bóp' },
  { serviceCode: 'THAI_90',          materialCode: 'UNIFORM_THAI',        standardQuantity: 1,    note: '1 lần giặt đồng phục' },

  // FOOT_45 — Foot Massage (45')
  { serviceCode: 'FOOT_45',          materialCode: 'CREAM_FOOT',          standardQuantity: 15,   note: '15ml kem chân' },
  { serviceCode: 'FOOT_45',          materialCode: 'SALT_MINERAL',        standardQuantity: 20,   note: '20g muối khoáng' },
  { serviceCode: 'FOOT_45',          materialCode: 'ALCOHOL_MEDICAL',     standardQuantity: 10,   note: '10ml cồn sát khuẩn' },

  // NECK_SHOULDER_30 — Massage cổ vai gáy (30') — có DEPRECIATION
  { serviceCode: 'NECK_SHOULDER_30', materialCode: 'OIL_HERBAL',          standardQuantity: 20,   note: '20ml tinh dầu thảo dược' },
  { serviceCode: 'NECK_SHOULDER_30', materialCode: 'BAG_HERBAL_COMPRESS', standardQuantity: 0.05, note: 'Khấu hao 1/20 túi chườm' },

  // AROMA_60 — Massage Aroma (60') — có DEPRECIATION
  { serviceCode: 'AROMA_60',         materialCode: 'OIL_AROMA',           standardQuantity: 20,   note: '20ml tinh dầu aroma cao cấp' },
  { serviceCode: 'AROMA_60',         materialCode: 'CANDLE_AROMA',        standardQuantity: 0.1,  note: 'Khấu hao 1/10 cây nến (10 ca/cây)' },
  { serviceCode: 'AROMA_60',         materialCode: 'PAPER_BED',           standardQuantity: 1,    note: '1 khăn giấy' },
];

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const serviceModel = app.get<Model<ServiceDocument>>(
      getModelToken(Service.name),
    );
    const materialModel = app.get<Model<MaterialDocument>>(
      getModelToken(Material.name),
    );
    const bomModel = app.get<Model<ServiceMaterialBomDocument>>(
      getModelToken(ServiceMaterialBom.name),
    );

    const services = await serviceModel.find({});
    if (services.length === 0) {
      throw new Error(
        'Chưa có service nào trong DB. Hãy chạy "npm run seed:services" trước.',
      );
    }
    const materials = await materialModel.find({});
    if (materials.length === 0) {
      throw new Error(
        'Chưa có material nào trong DB. Hãy chạy "npm run seed:materials" trước.',
      );
    }

    const findServiceId = (code: string): Types.ObjectId | undefined =>
      services.find((s) => s.code === code)?._id as Types.ObjectId | undefined;
    const findMaterialId = (code: string): Types.ObjectId | undefined =>
      materials.find((m) => m.code === code)?._id as Types.ObjectId | undefined;

    let createdCount = 0;
    let existedCount = 0;

    for (const seed of SEED_BOM) {
      const serviceId = findServiceId(seed.serviceCode);
      if (!serviceId) {
        throw new Error(
          `Không tìm thấy service code "${seed.serviceCode}". Hãy chạy "npm run seed:services" trước.`,
        );
      }
      const materialId = findMaterialId(seed.materialCode);
      if (!materialId) {
        throw new Error(
          `Không tìm thấy material code "${seed.materialCode}". Hãy chạy "npm run seed:materials" trước.`,
        );
      }

      const result = await bomModel.updateOne(
        { serviceId, materialId },
        {
          $setOnInsert: {
            serviceId,
            materialId,
            standardQuantity: seed.standardQuantity,
            note: seed.note,
            isActive: true,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount && result.upsertedCount > 0) {
        createdCount += 1;
      } else {
        existedCount += 1;
      }
    }

    logger.log(
      `Seeded ${SEED_BOM.length} BOM entries — created: ${createdCount}, đã tồn tại: ${existedCount}`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
