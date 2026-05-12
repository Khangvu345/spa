import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { StaffResponseDto } from './dto/staff-response.dto';
import { Staff, StaffDocument } from './staff.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Staff.name) private readonly staffModel: Model<StaffDocument>,
  ) {}

  /**
   * Tìm nhân viên theo email để phục vụ login.
   *
   * @param email - Email đăng nhập của nhân viên
   * @returns Staff document hoặc null nếu không tồn tại
   */
  async findByEmail(email: string): Promise<StaffDocument | null> {
    return this.staffModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  /**
   * Tìm nhân viên theo ID, trả null nếu không tồn tại.
   *
   * @param id - Mongo ObjectId của nhân viên
   * @returns Staff document hoặc null
   */
  async findById(id: string): Promise<StaffDocument | null> {
    return this.staffModel.findById(id).exec();
  }

  /**
   * Tìm nhân viên theo ID, throw 404 nếu không tồn tại.
   *
   * @param id - Mongo ObjectId của nhân viên
   * @returns Staff document
   * @throws NotFoundException - Không tìm thấy staff
   */
  async findByIdOrThrow(id: string): Promise<StaffDocument> {
    const staff = await this.findById(id);
    if (!staff) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }
    return staff;
  }

  /**
   * Cập nhật password hash và tắt cờ mustChangePassword.
   *
   * @param id - Mongo ObjectId của nhân viên
   * @param passwordHash - Bcrypt hash mới
   * @returns void
   * @throws NotFoundException - Không tìm thấy staff
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const updated = await this.staffModel
      .findByIdAndUpdate(id, {
        passwordHash,
        mustChangePassword: false,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }
  }

  /**
   * Map Staff document sang DTO trả về cho FE.
   *
   * @param doc - Staff document từ MongoDB
   * @returns DTO không chứa passwordHash/lockedAt
   */
  mapToResponse(doc: StaffDocument): StaffResponseDto {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      email: doc.email,
      fullName: doc.fullName,
      phone: doc.phone,
      role: doc.role,
      baseSalary: doc.baseSalary,
      workStatus: doc.workStatus,
      accountStatus: doc.accountStatus,
      startedAt: doc.startedAt?.toISOString() ?? '',
      mustChangePassword: doc.mustChangePassword,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }
}
