import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import {
  Material,
  MaterialDocument,
  MaterialType,
} from '../modules/material/material.schema';
import {
  Supplier,
  SupplierDocument,
} from '../modules/supplier/supplier.schema';

const logger = new Logger('SeedMaterials');

interface SeedMaterialInput {
  code: string;
  name: string;
  description: string;
  unit: string;
  type: MaterialType;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  expectedUsesPerUnit: number;
  supplierKeyword: string;
  isActive: boolean;
}

const SEED_MATERIALS: SeedMaterialInput[] = [
  // CONSUMABLE — Tinh dầu / Dầu
  {
    code: 'OIL_SUNFLOWER',
    name: 'Tinh dầu hướng dương (Base Oil)',
    description: 'Dầu nền dùng cho massage Thụy Điển',
    unit: 'ml',
    type: MaterialType.CONSUMABLE,
    unitPrice: 500,
    stockQuantity: 5000,
    reorderLevel: 1000,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Hương Việt',
    isActive: true,
  },
  {
    code: 'OIL_OLIVE',
    name: 'Tinh dầu Olive',
    description: 'Dầu olive dùng cho massage đá nóng',
    unit: 'ml',
    type: MaterialType.CONSUMABLE,
    unitPrice: 800,
    stockQuantity: 3000,
    reorderLevel: 500,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Hương Việt',
    isActive: true,
  },
  {
    code: 'OIL_AROMA',
    name: 'Tinh dầu Aroma cao cấp',
    description: 'Tinh dầu thơm cao cấp cho liệu trình Aroma',
    unit: 'ml',
    type: MaterialType.CONSUMABLE,
    unitPrice: 2000,
    stockQuantity: 2000,
    reorderLevel: 500,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Hương Việt',
    isActive: true,
  },
  {
    code: 'OIL_HERBAL',
    name: 'Tinh dầu thảo dược đặc trị',
    description: 'Dành cho massage cổ vai gáy',
    unit: 'ml',
    type: MaterialType.CONSUMABLE,
    unitPrice: 1500,
    stockQuantity: 2000,
    reorderLevel: 500,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Hương Việt',
    isActive: true,
  },

  // CONSUMABLE — Vật tư
  {
    code: 'PAPER_BED',
    name: 'Khăn giấy trải giường',
    description: 'Khăn giấy dùng 1 lần trải giường massage',
    unit: 'piece',
    type: MaterialType.CONSUMABLE,
    unitPrice: 5000,
    stockQuantity: 500,
    reorderLevel: 100,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Minh Anh',
    isActive: true,
  },
  {
    code: 'ALCOHOL_MEDICAL',
    name: 'Cồn y tế',
    description: 'Cồn 70 độ sát khuẩn',
    unit: 'ml',
    type: MaterialType.CONSUMABLE,
    unitPrice: 100,
    stockQuantity: 5000,
    reorderLevel: 1000,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Minh Anh',
    isActive: true,
  },

  // CONSUMABLE — Kem / Cao / Muối
  {
    code: 'BALM_PAIN_RELIEF',
    name: 'Cao xoa bóp (Dầu cù là)',
    description: 'Dùng cho massage Thái',
    unit: 'gram',
    type: MaterialType.CONSUMABLE,
    unitPrice: 300,
    stockQuantity: 1000,
    reorderLevel: 200,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Thảo Mộc Việt',
    isActive: true,
  },
  {
    code: 'CREAM_FOOT',
    name: 'Kem massage chân chuyên dụng',
    description: 'Dùng cho dịch vụ Foot Massage',
    unit: 'ml',
    type: MaterialType.CONSUMABLE,
    unitPrice: 600,
    stockQuantity: 2000,
    reorderLevel: 500,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Bách Hóa',
    isActive: true,
  },
  {
    code: 'SALT_MINERAL',
    name: 'Muối khoáng',
    description: 'Pha nước ngâm chân',
    unit: 'gram',
    type: MaterialType.CONSUMABLE,
    unitPrice: 50,
    stockQuantity: 10000,
    reorderLevel: 2000,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Bách Hóa',
    isActive: true,
  },

  // DEPRECIATION — Khấu hao
  {
    code: 'STONE_VOLCANIC',
    name: 'Đá núi lửa (bộ massage)',
    description: '1 bộ dùng được khoảng 100 lần',
    unit: 'set',
    type: MaterialType.DEPRECIATION,
    unitPrice: 1500000,
    stockQuantity: 3,
    reorderLevel: 1,
    expectedUsesPerUnit: 100,
    supplierKeyword: 'Đá quý Thiên Nhiên',
    isActive: true,
  },
  {
    code: 'BAG_HERBAL_COMPRESS',
    name: 'Túi chườm thảo mộc',
    description: '1 túi dùng được khoảng 20 lần',
    unit: 'piece',
    type: MaterialType.DEPRECIATION,
    unitPrice: 80000,
    stockQuantity: 10,
    reorderLevel: 3,
    expectedUsesPerUnit: 20,
    supplierKeyword: 'Thảo Mộc Việt',
    isActive: true,
  },
  {
    code: 'CANDLE_AROMA',
    name: 'Nến thơm thư giãn',
    description: '1 cây nến đốt được khoảng 10 ca',
    unit: 'piece',
    type: MaterialType.DEPRECIATION,
    unitPrice: 150000,
    stockQuantity: 20,
    reorderLevel: 5,
    expectedUsesPerUnit: 10,
    supplierKeyword: 'Bách Hóa',
    isActive: true,
  },

  // CONSUMABLE — Đồng phục (chi phí giặt)
  {
    code: 'UNIFORM_THAI',
    name: 'Đồng phục massage Thái (chi phí giặt/ca)',
    description: 'Tính theo chi phí giặt mỗi lần khách dùng',
    unit: 'set',
    type: MaterialType.CONSUMABLE,
    unitPrice: 15000,
    stockQuantity: 50,
    reorderLevel: 10,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Minh Anh',
    isActive: true,
  },

  // Bonus 2 items để đạt 15 (theo issue: "15 vật liệu")
  {
    code: 'TOWEL_BATH',
    name: 'Khăn tắm cotton',
    description: 'Khăn tắm dùng trong các liệu trình massage',
    unit: 'piece',
    type: MaterialType.DEPRECIATION,
    unitPrice: 120000,
    stockQuantity: 30,
    reorderLevel: 10,
    expectedUsesPerUnit: 50,
    supplierKeyword: 'Minh Anh',
    isActive: true,
  },
  {
    code: 'INCENSE_STICK',
    name: 'Hương trầm thư giãn',
    description: 'Hương trầm tạo không gian thư giãn cho phòng massage',
    unit: 'piece',
    type: MaterialType.CONSUMABLE,
    unitPrice: 2000,
    stockQuantity: 500,
    reorderLevel: 100,
    expectedUsesPerUnit: 0,
    supplierKeyword: 'Bách Hóa',
    isActive: true,
  },
];

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const materialModel = app.get<Model<MaterialDocument>>(
      getModelToken(Material.name),
    );
    const supplierModel = app.get<Model<SupplierDocument>>(
      getModelToken(Supplier.name),
    );

    const suppliers = await supplierModel.find({});
    if (suppliers.length === 0) {
      throw new Error(
        'Chưa có supplier nào trong DB. Hãy chạy "npm run seed:suppliers" trước.',
      );
    }

    const findSupplierId = (keyword: string): Types.ObjectId | undefined => {
      const found = suppliers.find((s) => s.name.includes(keyword));
      return found?._id as Types.ObjectId | undefined;
    };

    let createdCount = 0;
    let updatedCount = 0;

    for (const seed of SEED_MATERIALS) {
      const supplierId = findSupplierId(seed.supplierKeyword);
      if (!supplierId) {
        throw new Error(
          `Không tìm thấy supplier khớp keyword "${seed.supplierKeyword}" cho material ${seed.code}. ` +
            `Hãy chạy "npm run seed:suppliers" trước hoặc cập nhật keyword trong seed.`,
        );
      }

      const result = await materialModel.updateOne(
        { code: seed.code },
        {
          $setOnInsert: {
            code: seed.code,
            name: seed.name,
            description: seed.description,
            unit: seed.unit,
            type: seed.type,
            unitPrice: seed.unitPrice,
            stockQuantity: seed.stockQuantity,
            reorderLevel: seed.reorderLevel,
            expectedUsesPerUnit: seed.expectedUsesPerUnit,
            supplierId,
            isActive: seed.isActive,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount && result.upsertedCount > 0) {
        createdCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    logger.log(
      `Seed materials done — created: ${createdCount}, đã tồn tại: ${updatedCount}, tổng: ${SEED_MATERIALS.length}`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
