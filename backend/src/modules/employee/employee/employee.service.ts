import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import {
  ACCOUNT_DELETE_AFTER_LOCK_DAYS,
  BCRYPT_SALT_ROUNDS,
  DEFAULT_RESET_PASSWORD,
} from '../../../shared/constants/business-rules';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import {
  EMPLOYEE_DEFAULT_LIMIT,
  EMPLOYEE_DEFAULT_PAGE,
  EmployeeSortBy,
  QueryEmployeeDto,
  SortOrder,
} from './dto/query-employee.dto';
import { StaffResponseDto } from './dto/staff-response.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  AccountStatus,
  Staff,
  StaffDocument,
  WorkStatus,
} from './staff.schema';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectModel(Staff.name) private readonly staffModel: Model<StaffDocument>,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  /**
   * Tạo nhân viên mới kèm tài khoản đăng nhập ban đầu.
   *
   * @param dto - Dữ liệu tạo nhân viên
   * @returns Nhân viên đã tạo, không bao gồm passwordHash
   * @throws ConflictException - Email đã tồn tại
   */
  async create(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.staffModel.findOne({ email }).exec();

    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.STAFF_EMAIL_EXISTS,
        message: 'Email nhân viên đã tồn tại',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const created = await this.staffModel.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email,
      passwordHash,
      role: dto.role,
      baseSalary: dto.baseSalary,
      startedAt: new Date(dto.startedAt),
      workStatus: WorkStatus.ACTIVE,
      accountStatus: AccountStatus.ACTIVE,
      mustChangePassword: false,
      lockedAt: null,
    });

    return this.mapToEmployeeResponse(created);
  }

  /**
   * Lấy danh sách nhân viên với phân trang, search, filter và sort.
   *
   * @param query - Điều kiện truy vấn từ request
   * @returns Danh sách nhân viên và metadata phân trang
   */
  async findAll(query: QueryEmployeeDto): Promise<{
    data: EmployeeResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const page = query.page ?? EMPLOYEE_DEFAULT_PAGE;
    const limit = query.limit ?? EMPLOYEE_DEFAULT_LIMIT;
    const filter: Record<string, unknown> = {};

    if (query.search?.trim()) {
      const searchRegex = new RegExp(
        this.escapeRegex(query.search.trim()),
        'i',
      );
      filter.$or = [{ fullName: searchRegex }, { email: searchRegex }];
    }

    if (query.role) {
      filter.role = query.role;
    }

    if (query.workStatus) {
      filter.workStatus = query.workStatus;
    }

    const sortBy = query.sortBy ?? EmployeeSortBy.STARTED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;
    const sortField =
      sortBy === EmployeeSortBy.FULL_NAME ? 'fullName' : 'startedAt';
    const sortValue = sortOrder === SortOrder.ASC ? 1 : -1;

    const [items, total] = await Promise.all([
      this.staffModel
        .find(filter)
        .sort({ [sortField]: sortValue })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.staffModel.countDocuments(filter).exec(),
    ]);

    return {
      data: items.map((item) => this.mapToEmployeeResponse(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết nhân viên theo ID.
   *
   * @param id - Mongo ObjectId của nhân viên
   * @returns Thông tin nhân viên
   * @throws NotFoundException - Không tìm thấy staff
   */
  async findOne(id: string): Promise<EmployeeResponseDto> {
    const staff = await this.findByIdOrThrow(id);
    return this.mapToEmployeeResponse(staff);
  }

  /**
   * Cập nhật thông tin nhân viên. Email, password và accountStatus không được apply.
   *
   * @param id - Mongo ObjectId của nhân viên
   * @param dto - Dữ liệu cập nhật được phép
   * @returns Nhân viên sau khi cập nhật
   * @throws NotFoundException - Không tìm thấy staff
   */
  async update(
    id: string,
    dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const updatePayload: Partial<
      Pick<
        Staff,
        | 'fullName'
        | 'phone'
        | 'role'
        | 'baseSalary'
        | 'startedAt'
        | 'workStatus'
      >
    > = {};

    if (dto.fullName !== undefined) {
      updatePayload.fullName = dto.fullName;
    }
    if (dto.phone !== undefined) {
      updatePayload.phone = dto.phone;
    }
    if (dto.role !== undefined) {
      updatePayload.role = dto.role;
    }
    if (dto.baseSalary !== undefined) {
      updatePayload.baseSalary = dto.baseSalary;
    }
    if (dto.startedAt !== undefined) {
      updatePayload.startedAt = new Date(dto.startedAt);
    }
    if (dto.workStatus !== undefined) {
      updatePayload.workStatus = dto.workStatus;
    }

    const updated = await this.staffModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }

    return this.mapToEmployeeResponse(updated);
  }

  async resetPassword(
    staffId: string,
    adminUser: AuthenticatedUser,
  ): Promise<void> {
    const staff = await this.findByIdOrThrow(staffId);
    this.ensureStaffNotDeleted(staff);

    const passwordHash = await bcrypt.hash(
      this.getDefaultResetPassword(),
      this.getBcryptSaltRounds(),
    );
    const updated = await this.staffModel
      .findByIdAndUpdate(staffId, {
        passwordHash,
        mustChangePassword: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }

    console.log(
      `[kiểm toán] Admin ${adminUser.id} reset mật khẩu cho nhân viên ${staffId}`,
    );
  }

  async lockAccount(
    staffId: string,
    adminUser: AuthenticatedUser,
  ): Promise<EmployeeResponseDto> {
    this.ensureNotSelf(staffId, adminUser);

    const staff = await this.findByIdOrThrow(staffId);
    this.ensureStaffNotDeleted(staff);

    if (staff.accountStatus === AccountStatus.LOCKED) {
      throw new BadRequestException({
        code: ERROR_CODES.STAFF_ALREADY_LOCKED,
        message: 'Tài khoản nhân viên đã bị khóa',
      });
    }

    const updated = await this.staffModel
      .findByIdAndUpdate(
        staffId,
        {
          accountStatus: AccountStatus.LOCKED,
          lockedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }

    return this.mapToEmployeeResponse(updated);
  }

  async unlockAccount(staffId: string): Promise<EmployeeResponseDto> {
    const staff = await this.findByIdOrThrow(staffId);
    this.ensureStaffNotDeleted(staff);

    if (staff.accountStatus !== AccountStatus.LOCKED) {
      throw new BadRequestException({
        code: ERROR_CODES.STAFF_NOT_LOCKED,
        message: 'Tài khoản nhân viên chưa bị khóa',
      });
    }

    const updated = await this.staffModel
      .findByIdAndUpdate(
        staffId,
        {
          accountStatus: AccountStatus.ACTIVE,
          lockedAt: null,
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }

    return this.mapToEmployeeResponse(updated);
  }

  async deleteAccount(
    staffId: string,
    adminUser: AuthenticatedUser,
  ): Promise<void> {
    this.ensureNotSelf(staffId, adminUser);

    const staff = await this.findByIdOrThrow(staffId);
    this.ensureStaffNotDeleted(staff);

    if (staff.accountStatus !== AccountStatus.LOCKED) {
      throw new BadRequestException({
        code: ERROR_CODES.STAFF_NOT_LOCKED,
        message: 'Tài khoản nhân viên chưa bị khóa',
      });
    }

    if (!staff.lockedAt) {
      throw new BadRequestException({
        code: ERROR_CODES.LOCK_DURATION_NOT_MET,
        message: 'Tài khoản chưa bị khóa đủ số ngày quy định',
      });
    }

    const now = Date.now();
    const lockedForMs = now - staff.lockedAt.getTime();
    const requiredMs =
      this.getAccountDeleteAfterLockDays() * 24 * 60 * 60 * 1000;

    if (lockedForMs < requiredMs) {
      throw new BadRequestException({
        code: ERROR_CODES.LOCK_DURATION_NOT_MET,
        message: 'Tài khoản chưa bị khóa đủ số ngày quy định',
      });
    }

    const updated = await this.staffModel
      .findByIdAndUpdate(staffId, {
        accountStatus: AccountStatus.DELETED,
        email: `${staff.email}.deleted.${now}`,
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
   * Tìm nhân viên theo email để phục vụ login.
   *
   * @param email - Email đăng nhập của nhân viên
   * @returns Staff document hoặc null nếu không tồn tại
   */
  async findByEmail(email: string): Promise<StaffDocument | null> {
    return this.staffModel
      .findOne({ email: email.toLowerCase().trim() })
      .exec();
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
  async updatePassword(
    id: string,
    passwordHash: string,
  ): Promise<StaffDocument> {
    const updated = await this.staffModel
      .findByIdAndUpdate(
        id,
        {
          passwordHash,
          mustChangePassword: false,
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException({
        code: ERROR_CODES.STAFF_NOT_FOUND,
        message: 'Nhân viên không tồn tại',
      });
    }

    return updated;
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

  private mapToEmployeeResponse(doc: StaffDocument): EmployeeResponseDto {
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
      lockedAt: doc.lockedAt?.toISOString() ?? null,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }

  private ensureNotSelf(staffId: string, adminUser: AuthenticatedUser): void {
    if (staffId !== adminUser.id) {
      return;
    }

    throw new BadRequestException({
      code: ERROR_CODES.CANNOT_OPERATE_SELF,
      message: 'Không thể khóa hoặc xóa tài khoản của chính mình',
    });
  }

  private ensureStaffNotDeleted(staff: StaffDocument): void {
    if (staff.accountStatus !== AccountStatus.DELETED) {
      return;
    }

    throw new BadRequestException({
      code: ERROR_CODES.STAFF_ALREADY_DELETED,
      message: 'Tài khoản nhân viên đã bị xóa',
    });
  }

  private getBcryptSaltRounds(): number {
    const configuredValue = Number(
      this.configService?.get<string>('BCRYPT_SALT_ROUNDS') ??
        BCRYPT_SALT_ROUNDS,
    );

    return Number.isFinite(configuredValue)
      ? configuredValue
      : BCRYPT_SALT_ROUNDS;
  }

  private getDefaultResetPassword(): string {
    return (
      this.configService?.get<string>('DEFAULT_RESET_PASSWORD') ??
      DEFAULT_RESET_PASSWORD
    );
  }

  private getAccountDeleteAfterLockDays(): number {
    const configuredValue = Number(
      this.configService?.get<string>('ACCOUNT_DELETE_AFTER_LOCK_DAYS') ??
        ACCOUNT_DELETE_AFTER_LOCK_DAYS,
    );

    return Number.isFinite(configuredValue) && configuredValue >= 0
      ? configuredValue
      : ACCOUNT_DELETE_AFTER_LOCK_DAYS;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
