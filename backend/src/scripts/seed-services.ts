import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import {
  Service,
  ServiceCategory,
  ServiceDocument,
} from '../modules/service/service.schema';

const logger = new Logger('SeedServices');

interface SeedService {
  code: string;
  name: string;
  category: ServiceCategory;
  description: string;
  unitPrice: number;
  durationMinutes: number;
  bufferMinutes: number;
  slotsRequired: number;
  isActive: boolean;
}

const SEED_SERVICES: SeedService[] = [
  {
    code: 'SWEDISH_60',
    name: 'Massage Thụy Điển',
    category: ServiceCategory.SWEDISH,
    description: 'Massage truyền thống với kỹ thuật vuốt dài, thư giãn cơ.',
    unitPrice: 350000,
    durationMinutes: 60,
    bufferMinutes: 15,
    slotsRequired: 1,
    isActive: true,
  },
  {
    code: 'HOT_STONE_90',
    name: 'Massage Đá Nóng',
    category: ServiceCategory.HOT_STONE,
    description: 'Massage với đá núi lửa làm nóng, giảm đau cơ sâu.',
    unitPrice: 550000,
    durationMinutes: 90,
    bufferMinutes: 20,
    slotsRequired: 1,
    isActive: true,
  },
  {
    code: 'THAI_90',
    name: 'Massage Thái',
    category: ServiceCategory.THAI,
    description: 'Massage kéo giãn cơ truyền thống, khách mặc đồng phục.',
    unitPrice: 480000,
    durationMinutes: 90,
    bufferMinutes: 15,
    slotsRequired: 1,
    isActive: true,
  },
  {
    code: 'FOOT_45',
    name: 'Foot Massage',
    category: ServiceCategory.FOOT,
    description: 'Massage chân với muối khoáng và kem chuyên dụng.',
    unitPrice: 250000,
    durationMinutes: 45,
    bufferMinutes: 10,
    slotsRequired: 1,
    isActive: true,
  },
  {
    code: 'NECK_SHOULDER_30',
    name: 'Massage Cổ Vai Gáy',
    category: ServiceCategory.NECK_SHOULDER,
    description: 'Trị liệu nhanh cho dân văn phòng, dùng tinh dầu thảo dược.',
    unitPrice: 200000,
    durationMinutes: 30,
    bufferMinutes: 10,
    slotsRequired: 1,
    isActive: true,
  },
  {
    code: 'AROMA_60',
    name: 'Massage Tinh dầu Aroma',
    category: ServiceCategory.AROMA,
    description: 'Massage thư giãn với tinh dầu cao cấp và nến thơm.',
    unitPrice: 400000,
    durationMinutes: 60,
    bufferMinutes: 15,
    slotsRequired: 1,
    isActive: true,
  },
];

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const serviceModel = app.get<Model<ServiceDocument>>(
      getModelToken(Service.name),
    );

    let createdCount = 0;
    let existedCount = 0;

    for (const seed of SEED_SERVICES) {
      const result = await serviceModel.findOneAndUpdate(
        { code: seed.code },
        { $setOnInsert: seed },
        { upsert: true, new: false },
      );
      if (result) {
        existedCount += 1;
      } else {
        createdCount += 1;
      }
    }

    if (createdCount === 0) {
      logger.log(
        `Services already seeded, skipping (${existedCount}/${SEED_SERVICES.length} đã tồn tại)`,
      );
    } else {
      logger.log(
        `Seeded ${createdCount} services (${existedCount} đã tồn tại từ trước)`,
      );
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
