import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppModule } from '../app.module';
import { configureDns } from '../config/dns.config';
import {
  AccountStatus,
  Staff,
  StaffDocument,
  StaffRole,
  WorkStatus,
} from '../modules/employee/employee/staff.schema';
import {
  Service,
  ServiceDocument,
} from '../modules/service/service.schema';
import {
  StaffServiceAssignment,
  StaffServiceAssignmentDocument,
} from '../modules/staff-service-assignment/staff-service-assignment.schema';

const logger = new Logger('SeedStaffServiceAssignments');

interface SeedAssignment {
  serviceCode: string;
  staffName: string;
  commissionRate: number;
  note: string;
}

const SEED_ASSIGNMENTS: SeedAssignment[] = [
  {
    serviceCode: 'SWEDISH_60',
    staffName: 'Nguyễn Lộc',
    commissionRate: 20,
    note: 'Chuyên viên chính phụ trách Massage Thụy Điển',
  },
  {
    serviceCode: 'HOT_STONE_90',
    staffName: 'Trần Khánh',
    commissionRate: 25,
    note: 'Chuyên viên Đá Nóng - yêu cầu kỹ năng đặc thù',
  },
  {
    serviceCode: 'THAI_90',
    staffName: 'Lê Việt',
    commissionRate: 22,
    note: 'Chuyên viên Massage Thái',
  },
  {
    serviceCode: 'FOOT_45',
    staffName: 'Phạm Minh',
    commissionRate: 18,
    note: 'Chuyên viên Foot Massage',
  },
  {
    serviceCode: 'NECK_SHOULDER_30',
    staffName: 'Hoàng Công',
    commissionRate: 15,
    note: 'Chuyên viên Cổ Vai Gáy - ca ngắn',
  },
  {
    serviceCode: 'AROMA_60',
    staffName: 'Đặng Trang',
    commissionRate: 20,
    note: 'Chuyên viên Aroma',
  },
];

function getObjectId(value: unknown): Types.ObjectId {
  if (value instanceof Types.ObjectId) {
    return value;
  }

  return new Types.ObjectId(String(value));
}

async function bootstrap() {
  configureDns();

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const assignmentModel = app.get<Model<StaffServiceAssignmentDocument>>(
      getModelToken(StaffServiceAssignment.name),
    );
    const serviceModel = app.get<Model<ServiceDocument>>(
      getModelToken(Service.name),
    );
    const staffModel = app.get<Model<StaffDocument>>(getModelToken(Staff.name));

    const [services, staff] = await Promise.all([
      serviceModel.find({ isActive: true }).exec(),
      staffModel
        .find({
          role: StaffRole.STAFF,
          workStatus: WorkStatus.ACTIVE,
          accountStatus: AccountStatus.ACTIVE,
        })
        .exec(),
    ]);

    let createdCount = 0;
    let existedCount = 0;

    for (const seed of SEED_ASSIGNMENTS) {
      const service = services.find((item) => item.code === seed.serviceCode);
      if (!service) {
        throw new Error(
          `Không tìm thấy service '${seed.serviceCode}'. Hãy chạy npm run seed:services trước.`,
        );
      }

      const assignedStaff = staff.find(
        (item) => item.fullName === seed.staffName,
      );
      if (!assignedStaff) {
        throw new Error(
          `Không tìm thấy STAFF active '${seed.staffName}'. Hãy chạy npm run seed:staff trước.`,
        );
      }

      const serviceId = getObjectId(service._id);
      const staffId = getObjectId(assignedStaff._id);
      const result = await assignmentModel.updateOne(
        { serviceId, isActive: true },
        {
          $setOnInsert: {
            staffId,
            serviceId,
            commissionRate: seed.commissionRate,
            assignedSince: new Date(),
            isActive: true,
            note: seed.note,
          },
        },
        { upsert: true },
      );

      if (result.upsertedCount > 0) {
        createdCount += 1;
      } else {
        existedCount += 1;
      }
    }

    logger.log(
      `Seeded 6 assignments (tạo mới: ${createdCount}, đã tồn tại: ${existedCount})`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: Error) => {
  logger.error(error.message, error.stack);
  process.exit(1);
});
