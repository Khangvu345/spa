import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DEFAULT_PAGE } from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { Customer, CustomerDocument, CustomerSource } from './customer.schema';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  CustomerResponseDto,
  FindOrCreateResponseDto,
} from './dto/customer-response.dto';
import { FindOrCreateCustomerDto } from './dto/find-or-create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  /**
   * Tạo khách hàng mới với phone là định danh duy nhất.
   *
   * @param dto - Dữ liệu khách hàng
   * @returns Customer đã tạo
   * @throws ConflictException - Số điện thoại đã tồn tại
   */
  async create(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const phone = dto.phone.trim();
    const existing = await this.customerModel.findOne({ phone });
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.CUSTOMER_PHONE_EXISTS,
        message: `Số điện thoại "${phone}" đã tồn tại`,
      });
    }

    const created = await this.customerModel.create({
      fullName: dto.fullName.trim(),
      phone,
      email: dto.email?.trim() ?? '',
      source: dto.source ?? CustomerSource.MANUAL,
      note: dto.note?.trim() ?? '',
      phoneVerified: false,
      emailVerified: false,
      lastVerifiedAt: null,
      isActive: true,
    });

    return this.mapToResponse(created);
  }

  /**
   * Tìm customer active theo phone hoặc tạo mới cho booking landing page.
   *
   * @param dto - Thông tin customer từ booking flow
   * @returns Customer kèm cờ wasCreated
   * @throws BadRequestException - Customer đã bị vô hiệu hoá
   */
  async findOrCreateByPhone(
    dto: FindOrCreateCustomerDto,
  ): Promise<FindOrCreateResponseDto> {
    const phone = dto.phone.trim();
    const existing = await this.customerModel.findOne({ phone });

    if (existing) {
      if (!existing.isActive) {
        throw new BadRequestException({
          code: ERROR_CODES.CUSTOMER_INACTIVE,
          message: 'Khách hàng đã bị vô hiệu hoá',
        });
      }

      return {
        ...this.mapToResponse(existing),
        wasCreated: false,
      };
    }

    const created = await this.customerModel.create({
      fullName: dto.fullName.trim(),
      phone,
      email: dto.email?.trim() ?? '',
      source: CustomerSource.ONLINE_BOOKING,
      note: '',
      phoneVerified: false,
      emailVerified: false,
      lastVerifiedAt: null,
      isActive: true,
    });

    return {
      ...this.mapToResponse(created),
      wasCreated: true,
    };
  }

  /**
   * Danh sách khách hàng — search + filter source/isActive + sort + pagination.
   *
   * @param query - Tham số filter/pagination
   * @returns Mảng customer kèm meta phân trang
   */
  async findAll(
    query: QueryCustomerDto,
  ): Promise<{ data: CustomerResponseDto[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = {};

    if (query.source) filter.source = query.source;
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { fullName: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
      ];
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      fullName: 'fullName',
      createdAt: 'created_at',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'createdAt'];
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit),
      this.customerModel.countDocuments(filter),
    ]);

    return {
      data: docs.map((doc) => this.mapToResponse(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Chi tiết customer theo ID.
   *
   * @param id - ObjectId của customer
   * @returns Customer detail
   * @throws NotFoundException - Customer không tồn tại
   */
  async findOne(id: string): Promise<CustomerResponseDto> {
    const doc = await this.customerModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.CUSTOMER_NOT_FOUND,
        message: 'Khách hàng không tồn tại',
      });
    }

    return this.mapToResponse(doc);
  }

  /**
   * Tra cứu nhanh customer theo số điện thoại.
   *
   * @param phone - Số điện thoại 10 chữ số
   * @returns Customer detail
   * @throws NotFoundException - Customer không tồn tại
   */
  async findByPhone(phone: string): Promise<CustomerResponseDto> {
    const doc = await this.customerModel.findOne({ phone });
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.CUSTOMER_NOT_FOUND,
        message: 'Khách hàng không tồn tại',
      });
    }

    return this.mapToResponse(doc);
  }

  /**
   * Cập nhật thông tin khách hàng. Field phone nếu gửi lên sẽ bị bỏ qua.
   *
   * @param id - ObjectId của customer
   * @param dto - Các field cần cập nhật
   * @returns Customer sau khi cập nhật
   * @throws NotFoundException - Customer không tồn tại
   */
  async update(
    id: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const doc = await this.customerModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.CUSTOMER_NOT_FOUND,
        message: 'Khách hàng không tồn tại',
      });
    }

    const { phone: _ignoredPhone, ...allowedFields } = dto;
    for (const [key, value] of Object.entries(allowedFields)) {
      if (value !== undefined) {
        doc.set(key, typeof value === 'string' ? value.trim() : value);
      }
    }

    await doc.save();
    return this.mapToResponse(doc);
  }

  /**
   * Bật/tắt trạng thái active của customer.
   *
   * @param id - ObjectId của customer
   * @returns Customer sau khi đổi trạng thái
   * @throws NotFoundException - Customer không tồn tại
   */
  async toggleActive(id: string): Promise<CustomerResponseDto> {
    const doc = await this.customerModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.CUSTOMER_NOT_FOUND,
        message: 'Khách hàng không tồn tại',
      });
    }

    doc.isActive = !doc.isActive;
    await doc.save();

    return this.mapToResponse(doc);
  }

  private mapToResponse(doc: CustomerDocument): CustomerResponseDto {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      fullName: doc.fullName,
      phone: doc.phone,
      email: doc.email ?? '',
      source: doc.source,
      note: doc.note ?? '',
      phoneVerified: doc.phoneVerified,
      emailVerified: doc.emailVerified,
      lastVerifiedAt: doc.lastVerifiedAt?.toISOString() ?? null,
      isActive: doc.isActive,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }
}
