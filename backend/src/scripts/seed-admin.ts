import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import { BCRYPT_SALT_ROUNDS } from '../shared/constants/business-rules';
import {
  AccountStatus,
  Staff,
  StaffDocument,
  StaffRole,
  WorkStatus,
} from '../modules/employee/employee/staff.schema';

const logger = new Logger('SeedAdmin');

function getRequiredEnv(configService: ConfigService, key: string): string {
  const value = configService.get<string>(key);
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}`);
  }
  return value;
}

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const configService = app.get(ConfigService);
    const staffModel = app.get<Model<StaffDocument>>(getModelToken(Staff.name));

    const email = getRequiredEnv(configService, 'SEED_ADMIN_EMAIL')
      .toLowerCase()
      .trim();
    const password = getRequiredEnv(configService, 'SEED_ADMIN_PASSWORD');
    const fullName = getRequiredEnv(configService, 'SEED_ADMIN_FULL_NAME');
    const phone = getRequiredEnv(configService, 'SEED_ADMIN_PHONE');

    const existing = await staffModel.findOne({ email }).exec();
    if (existing) {
      logger.log(`Bỏ qua: admin '${email}' đã tồn tại`);
      return;
    }

    const saltRounds = Number(
      configService.get<string>('BCRYPT_SALT_ROUNDS') ?? BCRYPT_SALT_ROUNDS,
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await staffModel.create({
      fullName,
      phone,
      email,
      passwordHash,
      role: StaffRole.ADMIN,
      baseSalary: 0,
      workStatus: WorkStatus.ACTIVE,
      accountStatus: AccountStatus.ACTIVE,
      startedAt: new Date(),
      lockedAt: null,
      mustChangePassword: false,
    });

    logger.log(`Đã tạo admin '${email}'`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
