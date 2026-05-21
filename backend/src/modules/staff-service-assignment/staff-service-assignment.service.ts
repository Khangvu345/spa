import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import {
  AccountStatus,
  Staff,
  StaffDocument,
  StaffRole,
  WorkStatus,
} from '../employee/employee/staff.schema';
import { Service, ServiceDocument } from '../service/service.schema';
import {
  AssignmentResponseDto,
  AssignmentServiceResponseDto,
  AssignmentStaffResponseDto,
} from './dto/assignment-response.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { QueryAssignmentDto } from './dto/query-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import {
  StaffServiceAssignment,
  StaffServiceAssignmentDocument,
} from './staff-service-assignment.schema';

type PopulatedStaff = Staff & { _id: Types.ObjectId };
type PopulatedService = Service & { _id: Types.ObjectId };

@Injectable()
export class StaffServiceAssignmentService {
  constructor(
    @InjectModel(StaffServiceAssignment.name)
    private readonly assignmentModel: Model<StaffServiceAssignmentDocument>,
    @InjectModel(Staff.name)
    private readonly staffModel: Model<StaffDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  /**
   * Tạo mapping chuyên viên phụ trách dịch vụ kèm tỉ lệ hoa hồng.
   *
   * @param dto - Dữ liệu mapping staff-service
   * @returns Assignment đã tạo, populate staff và service
   * @throws BadRequestException - Staff/service không hợp lệ
   * @throws ConflictException - Service đã có assignment active
   */
  async create(dto: CreateAssignmentDto): Promise<AssignmentResponseDto> {
    await this.assertValidStaff(dto.staffId);
    await this.assertValidService(dto.serviceId);
    await this.assertServiceNotActivelyAssigned(dto.serviceId);

    try {
      const created = await this.assignmentModel.create({
        staffId: new Types.ObjectId(dto.staffId),
        serviceId: new Types.ObjectId(dto.serviceId),
        commissionRate: dto.commissionRate,
        assignedSince: dto.assignedSince
          ? new Date(dto.assignedSince)
          : new Date(),
        isActive: true,
        note: dto.note?.trim() ?? '',
      });

      return this.findOne(this.getObjectIdString(created._id));
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw this.serviceAlreadyAssignedException();
      }
      throw error;
    }
  }

  /**
   * Lấy toàn bộ assignment với filter đơn giản, không phân trang theo issue #15.
   *
   * @param query - Filter staffId, serviceId, isActive
   * @returns Danh sách assignment đã populate staff và service
   */
  async findAll(query: QueryAssignmentDto): Promise<AssignmentResponseDto[]> {
    const filter: Record<string, unknown> = {};

    if (query.staffId) {
      filter.staffId = new Types.ObjectId(query.staffId);
    }

    if (query.serviceId) {
      filter.serviceId = new Types.ObjectId(query.serviceId);
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    const docs = await this.assignmentModel
      .find(filter)
      .populate('staffId', 'fullName role')
      .populate('serviceId', 'code name unitPrice')
      .sort({ created_at: -1 })
      .exec();

    return docs.map((doc) => this.mapToResponse(doc));
  }

  /**
   * Tìm assignment active theo service.
   *
   * @param serviceId - ObjectId của service
   * @returns Assignment active của service
   * @throws NotFoundException - Service chưa có chuyên viên active
   */
  async findByService(serviceId: string): Promise<AssignmentResponseDto> {
    const doc = await this.assignmentModel
      .findOne({
        serviceId: new Types.ObjectId(serviceId),
        isActive: true,
      })
      .populate('staffId', 'fullName role')
      .populate('serviceId', 'code name unitPrice')
      .exec();

    if (!doc) {
      throw this.assignmentNotFoundException();
    }

    return this.mapToResponse(doc);
  }

  /**
   * Tìm tất cả assignment active của một staff.
   *
   * @param staffId - ObjectId của staff
   * @returns Danh sách assignment active, rỗng nếu staff chưa phụ trách service
   */
  async findByStaff(staffId: string): Promise<AssignmentResponseDto[]> {
    const docs = await this.assignmentModel
      .find({
        staffId: new Types.ObjectId(staffId),
        isActive: true,
      })
      .populate('staffId', 'fullName role')
      .populate('serviceId', 'code name unitPrice')
      .sort({ assignedSince: -1 })
      .exec();

    return docs.map((doc) => this.mapToResponse(doc));
  }

  /**
   * Lấy assignment theo id.
   *
   * @param id - ObjectId của assignment
   * @returns Assignment đã populate staff và service
   * @throws NotFoundException - Assignment không tồn tại
   */
  async findOne(id: string): Promise<AssignmentResponseDto> {
    const doc = await this.assignmentModel
      .findById(id)
      .populate('staffId', 'fullName role')
      .populate('serviceId', 'code name unitPrice')
      .exec();

    if (!doc) {
      throw this.assignmentNotFoundException();
    }

    return this.mapToResponse(doc);
  }

  /**
   * Cập nhật hoa hồng, ngày bắt đầu, ghi chú hoặc trạng thái active.
   *
   * @param id - ObjectId của assignment
   * @param dto - Các field cần cập nhật
   * @returns Assignment sau khi cập nhật
   * @throws NotFoundException - Assignment không tồn tại
   * @throws ConflictException - Service đã có assignment active khác
   */
  async update(
    id: string,
    dto: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    const doc = await this.assignmentModel.findById(id).exec();
    if (!doc) {
      throw this.assignmentNotFoundException();
    }

    if (dto.isActive === true && !doc.isActive) {
      await this.assertServiceNotActivelyAssigned(
        this.getObjectIdString(doc.serviceId),
        id,
      );
    }

    if (dto.commissionRate !== undefined) {
      doc.commissionRate = dto.commissionRate;
    }

    if (dto.assignedSince !== undefined) {
      doc.assignedSince = new Date(dto.assignedSince);
    }

    if (dto.isActive !== undefined) {
      doc.isActive = dto.isActive;
    }

    if (dto.note !== undefined) {
      doc.note = dto.note.trim();
    }

    try {
      await doc.save();
      return this.findOne(id);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw this.serviceAlreadyAssignedException();
      }
      throw error;
    }
  }

  private async assertValidStaff(staffId: string): Promise<void> {
    const staff = await this.staffModel
      .findOne({
        _id: new Types.ObjectId(staffId),
        role: StaffRole.STAFF,
        workStatus: WorkStatus.ACTIVE,
        accountStatus: AccountStatus.ACTIVE,
      })
      .exec();

    if (!staff) {
      throw new BadRequestException({
        code: ERROR_CODES.ASSIGNMENT_STAFF_INVALID,
        message:
          'Chuyên viên không tồn tại hoặc không ở trạng thái STAFF/ACTIVE',
      });
    }
  }

  private async assertValidService(serviceId: string): Promise<void> {
    const service = await this.serviceModel
      .findOne({
        _id: new Types.ObjectId(serviceId),
        isActive: true,
      })
      .exec();

    if (!service) {
      throw new BadRequestException({
        code: ERROR_CODES.ASSIGNMENT_SERVICE_INVALID,
        message: 'Dịch vụ không tồn tại hoặc đang inactive',
      });
    }
  }

  private async assertServiceNotActivelyAssigned(
    serviceId: string,
    excludeAssignmentId?: string,
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      serviceId: new Types.ObjectId(serviceId),
      isActive: true,
    };

    if (excludeAssignmentId) {
      filter._id = { $ne: new Types.ObjectId(excludeAssignmentId) };
    }

    const existing = await this.assignmentModel.findOne(filter).exec();
    if (existing) {
      throw this.serviceAlreadyAssignedException();
    }
  }

  private assignmentNotFoundException(): NotFoundException {
    return new NotFoundException({
      code: ERROR_CODES.ASSIGNMENT_NOT_FOUND,
      message: 'Mapping chuyên viên - dịch vụ không tồn tại',
    });
  }

  private serviceAlreadyAssignedException(): ConflictException {
    return new ConflictException({
      code: ERROR_CODES.ASSIGNMENT_SERVICE_ALREADY_ASSIGNED,
      message: 'Dịch vụ đã có chuyên viên active phụ trách',
    });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private getObjectIdString(value: unknown): string {
    if (value instanceof Types.ObjectId) {
      return value.toString();
    }

    if (typeof value === 'object' && value !== null && '_id' in value) {
      const maybeDoc = value as { _id?: unknown };
      return this.getObjectIdString(maybeDoc._id);
    }

    return String(value);
  }

  private mapToResponse(
    doc: StaffServiceAssignmentDocument,
  ): AssignmentResponseDto {
    const staffId = this.getObjectIdString(doc.staffId);
    const serviceId = this.getObjectIdString(doc.serviceId);
    const staff = this.mapStaff(doc.staffId);
    const service = this.mapService(doc.serviceId);

    return {
      id: this.getObjectIdString(doc._id),
      staffId,
      serviceId,
      commissionRate: doc.commissionRate,
      assignedSince: doc.assignedSince?.toISOString() ?? '',
      isActive: doc.isActive,
      note: doc.note ?? '',
      ...(staff ? { staff } : {}),
      ...(service ? { service } : {}),
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }

  private mapStaff(value: unknown): AssignmentStaffResponseDto | undefined {
    if (!value || value instanceof Types.ObjectId) {
      return undefined;
    }

    const staff = value as PopulatedStaff;
    if (!staff._id || !staff.fullName || !staff.role) {
      return undefined;
    }

    return {
      id: staff._id.toString(),
      fullName: staff.fullName,
      role: staff.role,
    };
  }

  private mapService(
    value: unknown,
  ): AssignmentServiceResponseDto | undefined {
    if (!value || value instanceof Types.ObjectId) {
      return undefined;
    }

    const service = value as PopulatedService;
    if (!service._id || !service.code || !service.name) {
      return undefined;
    }

    return {
      id: service._id.toString(),
      code: service.code,
      name: service.name,
      price: service.unitPrice,
    };
  }
}
