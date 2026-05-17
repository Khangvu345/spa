import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import {
  Staff,
  StaffDocument,
  StaffRole,
} from '../modules/employee/employee/staff.schema';

const logger = new Logger('MigrateStaffRoleOperator');
const LEGACY_OPERATOR_ROLES = ['RECEPTIONIST', 'CASHIER'] as const;

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const staffModel = app.get<Model<StaffDocument>>(getModelToken(Staff.name));
    const result = await staffModel
      .updateMany(
        { role: { $in: [...LEGACY_OPERATOR_ROLES] } },
        { $set: { role: StaffRole.OPERATOR } },
      )
      .exec();

    logger.log(
      `Đã chuyển ${result.modifiedCount} tài khoản từ RECEPTIONIST/CASHIER sang OPERATOR`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
