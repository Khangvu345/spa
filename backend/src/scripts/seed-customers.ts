import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import {
  Customer,
  CustomerDocument,
  CustomerSource,
} from '../modules/customer/customer.schema';

const logger = new Logger('SeedCustomers');

interface SeedCustomerInput {
  fullName: string;
  phone: string;
  email: string;
  source: CustomerSource;
  note: string;
}

const SEED_CUSTOMERS: SeedCustomerInput[] = [
  {
    fullName: 'Nguyễn Thị Mai',
    phone: '0911000001',
    email: 'mai.nguyen@example.com',
    source: CustomerSource.ONLINE_BOOKING,
    note: 'Khách quen, thích Massage Thụy Điển',
  },
  {
    fullName: 'Trần Văn Bình',
    phone: '0911000002',
    email: 'binh.tran@example.com',
    source: CustomerSource.WALK_IN,
    note: '',
  },
  {
    fullName: 'Lê Thị Hằng',
    phone: '0911000003',
    email: '',
    source: CustomerSource.WALK_IN,
    note: 'Phản hồi tốt về Foot Massage',
  },
  {
    fullName: 'Phạm Minh Đức',
    phone: '0911000004',
    email: 'duc.pham@example.com',
    source: CustomerSource.ONLINE_BOOKING,
    note: '',
  },
  {
    fullName: 'Hoàng Thị Lan',
    phone: '0911000005',
    email: 'lan.hoang@example.com',
    source: CustomerSource.MANUAL,
    note: 'Khách VIP',
  },
  {
    fullName: 'Đặng Quốc Huy',
    phone: '0911000006',
    email: '',
    source: CustomerSource.WALK_IN,
    note: '',
  },
  {
    fullName: 'Vũ Thị Linh',
    phone: '0911000007',
    email: 'linh.vu@example.com',
    source: CustomerSource.ONLINE_BOOKING,
    note: 'Đặt lịch Aroma định kỳ T7',
  },
  {
    fullName: 'Bùi Văn Sơn',
    phone: '0911000008',
    email: 'son.bui@example.com',
    source: CustomerSource.WALK_IN,
    note: '',
  },
];

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const customerModel = app.get<Model<CustomerDocument>>(
      getModelToken(Customer.name),
    );

    let createdCount = 0;

    for (const seed of SEED_CUSTOMERS) {
      const result = await customerModel.updateOne(
        { phone: seed.phone },
        {
          $setOnInsert: {
            fullName: seed.fullName,
            phone: seed.phone,
            email: seed.email,
            source: seed.source,
            note: seed.note,
            phoneVerified: false,
            emailVerified: false,
            lastVerifiedAt: null,
            isActive: true,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount && result.upsertedCount > 0) {
        createdCount += 1;
      }
    }

    if (createdCount === 0) {
      logger.log('Customers already seeded');
    } else {
      logger.log(`Seeded ${createdCount} customers`);
    }
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
