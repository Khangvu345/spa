import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import {
  AccountStatus,
  Staff,
  StaffDocument,
  StaffRole,
  WorkStatus,
} from '../modules/employee/employee/staff.schema';
import { BCRYPT_SALT_ROUNDS } from '../shared/constants/business-rules';

const logger = new Logger('SeedStaff');
const DEFAULT_SEED_STAFF_PASSWORD = 'Staff@123456';

interface SeedStaff {
  fullName: string;
  phone: string;
  email: string;
  role: StaffRole;
  baseSalary: number;
  startedAt: Date;
}

const SEED_STAFF: SeedStaff[] = [
  {
    fullName: 'Quản trị Demo',
    phone: '0901111100',
    email: 'admin.demo@spa.local',
    role: StaffRole.ADMIN,
    baseSalary: 0,
    startedAt: new Date('2025-01-01'),
  },
  {
    fullName: 'Nguyễn Thị Vận Hành',
    phone: '0901111101',
    email: 'operator@spa.local',
    role: StaffRole.OPERATOR,
    baseSalary: 7000000,
    startedAt: new Date('2025-01-10'),
  },
  {
    fullName: 'Nguyễn Lộc',
    phone: '0901111111',
    email: 'staff.nguyenloc@spa.local',
    role: StaffRole.STAFF,
    baseSalary: 6000000,
    startedAt: new Date('2025-03-01'),
  },
  {
    fullName: 'Trần Khánh',
    phone: '0901111112',
    email: 'staff.trankhanh@spa.local',
    role: StaffRole.STAFF,
    baseSalary: 6200000,
    startedAt: new Date('2025-03-10'),
  },
  {
    fullName: 'Lê Việt',
    phone: '0901111113',
    email: 'staff.leviet@spa.local',
    role: StaffRole.STAFF,
    baseSalary: 6100000,
    startedAt: new Date('2025-04-01'),
  },
  {
    fullName: 'Phạm Minh',
    phone: '0901111114',
    email: 'staff.phamminh@spa.local',
    role: StaffRole.STAFF,
    baseSalary: 5800000,
    startedAt: new Date('2025-04-20'),
  },
  {
    fullName: 'Hoàng Công',
    phone: '0901111115',
    email: 'staff.hoangcong@spa.local',
    role: StaffRole.STAFF,
    baseSalary: 5800000,
    startedAt: new Date('2025-05-01'),
  },
  {
    fullName: 'Đặng Trang',
    phone: '0901111116',
    email: 'staff.dangtrang@spa.local',
    role: StaffRole.STAFF,
    baseSalary: 6000000,
    startedAt: new Date('2025-05-15'),
  },
];

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const staffModel = app.get<Model<StaffDocument>>(getModelToken(Staff.name));
    const saltRounds = Number(
      configService.get<string>('BCRYPT_SALT_ROUNDS') ?? BCRYPT_SALT_ROUNDS,
    );
    const password = configService.get<string>(
      'SEED_STAFF_PASSWORD',
      DEFAULT_SEED_STAFF_PASSWORD,
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let createdCount = 0;
    let existedCount = 0;

    for (const seed of SEED_STAFF) {
      const email = seed.email.toLowerCase().trim();
      const existing = await staffModel.findOne({ email }).exec();

      if (existing) {
        existedCount += 1;
        continue;
      }

      await staffModel.create({
        ...seed,
        email,
        passwordHash,
        workStatus: WorkStatus.ACTIVE,
        accountStatus: AccountStatus.ACTIVE,
        lockedAt: null,
        mustChangePassword: false,
      });
      createdCount += 1;
    }

    logger.log(
      `Seed staff hoàn tất - tạo mới: ${createdCount}, đã tồn tại: ${existedCount}, tổng: ${SEED_STAFF.length}`,
    );
    logger.log('Mật khẩu demo lấy từ SEED_STAFF_PASSWORD hoặc mặc định dev');
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
