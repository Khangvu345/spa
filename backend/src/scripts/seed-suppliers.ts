import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import {
  Supplier,
  SupplierDocument,
} from '../modules/supplier/supplier.schema';

const logger = new Logger('SeedSuppliers');

interface SeedSupplier {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  note: string;
  isActive: boolean;
}

const SEED_SUPPLIERS: SeedSupplier[] = [
  {
    name: 'Công ty TNHH Tinh dầu Hương Việt',
    contactPerson: 'Nguyễn Thị Hương',
    phone: '0901234567',
    email: 'huongviet@example.com',
    address: '123 Lê Lợi, Quận 1, TP.HCM',
    taxCode: '0301234567',
    note: 'Chuyên cung cấp tinh dầu nhập khẩu, base oil, aroma cao cấp',
    isActive: true,
  },
  {
    name: 'Công ty CP Vật tư Y tế Minh Anh',
    contactPerson: 'Trần Văn Minh',
    phone: '0902345678',
    email: 'minhanh.medical@example.com',
    address: '45 Trần Hưng Đạo, Hà Nội',
    taxCode: '0102345678',
    note: 'Cồn y tế, khăn giấy, vật tư tiêu hao',
    isActive: true,
  },
  {
    name: 'Cửa hàng Đá quý Thiên Nhiên',
    contactPerson: 'Lê Thị Thanh',
    phone: '0903456789',
    email: '',
    address: '78 Nguyễn Trãi, Đà Nẵng',
    taxCode: '',
    note: 'Đá núi lửa, đá nóng massage chuyên dụng',
    isActive: true,
  },
  {
    name: 'Công ty TNHH Thảo Mộc Việt',
    contactPerson: 'Phạm Văn Đức',
    phone: '0904567890',
    email: 'thaomocviet@example.com',
    address: '89 Hai Bà Trưng, Quận 3, TP.HCM',
    taxCode: '0304567890',
    note: 'Cao xoa bóp, túi chườm thảo mộc, tinh dầu thảo dược',
    isActive: true,
  },
  {
    name: 'Siêu thị Bách Hóa Tổng Hợp ABC',
    contactPerson: 'Hoàng Thị Lan',
    phone: '0905678901',
    email: 'bachhoa.abc@example.com',
    address: '12 Hoàng Diệu, Hải Phòng',
    taxCode: '0205678901',
    note: 'Nến thơm, muối khoáng, vật tư phụ',
    isActive: true,
  },
];

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const supplierModel = app.get<Model<SupplierDocument>>(
      getModelToken(Supplier.name),
    );

    let createdCount = 0;
    let existedCount = 0;

    for (const seed of SEED_SUPPLIERS) {
      // Combo (name, phone) check vì không có unique strict
      const existing = await supplierModel.findOne({
        name: seed.name,
        phone: seed.phone,
      });
      if (existing) {
        existedCount += 1;
        continue;
      }
      await supplierModel.create(seed);
      createdCount += 1;
    }

    if (createdCount === 0) {
      logger.log(
        `Suppliers already seeded, skipping (${existedCount}/${SEED_SUPPLIERS.length} đã tồn tại)`,
      );
    } else {
      logger.log(
        `Seeded ${createdCount} suppliers (${existedCount} đã tồn tại từ trước)`,
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
