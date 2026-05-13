import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../shared/constants/business-rules';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './service.schema';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
  ) {}

  /**
   * Tạo dịch vụ mới.
   *
   * @param dto - Dữ liệu dịch vụ
   * @returns Service đã tạo
   * @throws ConflictException - Mã dịch vụ đã tồn tại
   */
  async create(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    const existing = await this.serviceModel.findOne({ code: dto.code });
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.SERVICE_CODE_EXISTS,
        message: `Mã dịch vụ "${dto.code}" đã tồn tại`,
      });
    }

    const created = await this.serviceModel.create({
      ...dto,
      bufferMinutes: dto.bufferMinutes ?? 15,
      slotsRequired: dto.slotsRequired ?? 1,
      description: dto.description ?? '',
      isActive: dto.isActive ?? true,
    });

    return this.mapToResponse(created);
  }

  /**
   * Danh sách dịch vụ — search + filter + sort + pagination.
   * Mặc định chỉ trả service có isActive=true (cho landing page public).
   *
   * @param query - Tham số filter/pagination
   * @returns Mảng service kèm meta phân trang
   */
  async findAll(
    query: QueryServiceDto,
  ): Promise<{ data: ServiceResponseDto[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = {};

    filter.is_active = query.isActive !== undefined ? query.isActive : true;

    if (query.category) {
      filter.category = query.category;
    }

    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceFilter: Record<string, number> = {};
      if (query.minPrice !== undefined) priceFilter.$gte = query.minPrice;
      if (query.maxPrice !== undefined) priceFilter.$lte = query.maxPrice;
      filter.unit_price = priceFilter;
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      name: 'name',
      unitPrice: 'unit_price',
      createdAt: 'created_at',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'createdAt'];
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.serviceModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit),
      this.serviceModel.countDocuments(filter),
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
   * Lấy chi tiết dịch vụ theo ID.
   *
   * @param id - ObjectId của service
   * @returns Service detail
   * @throws NotFoundException - Service không tồn tại
   */
  async findOne(id: string): Promise<ServiceResponseDto> {
    const doc = await this.serviceModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.SERVICE_NOT_FOUND,
        message: 'Dịch vụ không tồn tại',
      });
    }
    return this.mapToResponse(doc);
  }

  /**
   * Cập nhật dịch vụ (bao gồm toggle isActive).
   *
   * @param id - ObjectId của service
   * @param dto - Các field cần cập nhật
   * @returns Service sau khi cập nhật
   * @throws NotFoundException - Service không tồn tại
   * @throws ConflictException - Mã dịch vụ mới đã được service khác sử dụng
   */
  async update(
    id: string,
    dto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const doc = await this.serviceModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.SERVICE_NOT_FOUND,
        message: 'Dịch vụ không tồn tại',
      });
    }

    if (dto.code && dto.code !== doc.code) {
      const conflict = await this.serviceModel.findOne({
        code: dto.code,
        _id: { $ne: doc._id },
      });
      if (conflict) {
        throw new ConflictException({
          code: ERROR_CODES.SERVICE_CODE_EXISTS,
          message: `Mã dịch vụ "${dto.code}" đã tồn tại`,
        });
      }
    }

    Object.assign(doc, dto);
    await doc.save();

    return this.mapToResponse(doc);
  }

  private mapToResponse(doc: ServiceDocument): ServiceResponseDto {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      code: doc.code,
      name: doc.name,
      category: doc.category,
      unitPrice: doc.unitPrice,
      durationMinutes: doc.durationMinutes,
      bufferMinutes: doc.bufferMinutes,
      slotsRequired: doc.slotsRequired,
      description: doc.description ?? '',
      // imageUrl: doc.imageUrl ?? null,
      isActive: doc.isActive,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }
}
