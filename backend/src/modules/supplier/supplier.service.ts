import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier, SupplierDocument } from './supplier.schema';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class SupplierService {
  constructor(
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  /**
   * Tạo nhà cung cấp mới.
   *
   * @param dto - Dữ liệu NCC
   * @returns Supplier đã tạo
   * @throws ConflictException - taxCode đã tồn tại (nếu có)
   */
  async create(dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    if (dto.taxCode && dto.taxCode.trim().length > 0) {
      const existing = await this.supplierModel.findOne({
        taxCode: dto.taxCode.trim(),
      });
      if (existing) {
        throw new ConflictException({
          code: ERROR_CODES.SUPPLIER_TAX_CODE_EXISTS,
          message: `Mã số thuế "${dto.taxCode}" đã tồn tại`,
        });
      }
    }

    const created = await this.supplierModel.create({
      ...dto,
      email: dto.email ?? '',
      taxCode: dto.taxCode ?? '',
      note: dto.note ?? '',
      isActive: true,
    });

    return this.mapToResponse(created);
  }

  /**
   * Danh sách NCC — search + filter + sort + pagination (mặc định 10 items/page).
   *
   * @param query - Tham số filter/pagination
   * @returns Mảng supplier kèm meta phân trang
   */
  async findAll(
    query: QuerySupplierDto,
  ): Promise<{ data: SupplierResponseDto[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = {};

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { phone: { $regex: escaped, $options: 'i' } },
      ];
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      name: 'name',
      createdAt: 'created_at',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'createdAt'];
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.supplierModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit),
      this.supplierModel.countDocuments(filter),
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
   * Chi tiết NCC theo ID.
   *
   * @param id - ObjectId của supplier
   * @returns Supplier detail
   * @throws NotFoundException - Supplier không tồn tại
   */
  async findOne(id: string): Promise<SupplierResponseDto> {
    const doc = await this.supplierModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.SUPPLIER_NOT_FOUND,
        message: 'Nhà cung cấp không tồn tại',
      });
    }
    return this.mapToResponse(doc);
  }

  /**
   * Cập nhật NCC (bao gồm toggle isActive).
   *
   * @param id - ObjectId của supplier
   * @param dto - Các field cần cập nhật
   * @returns Supplier sau khi cập nhật
   * @throws NotFoundException - Supplier không tồn tại
   * @throws ConflictException - taxCode mới đã được supplier khác sử dụng
   */
  async update(
    id: string,
    dto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    const doc = await this.supplierModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.SUPPLIER_NOT_FOUND,
        message: 'Nhà cung cấp không tồn tại',
      });
    }

    if (
      dto.taxCode !== undefined &&
      dto.taxCode.trim().length > 0 &&
      dto.taxCode !== doc.taxCode
    ) {
      const conflict = await this.supplierModel.findOne({
        taxCode: dto.taxCode.trim(),
        _id: { $ne: doc._id },
      });
      if (conflict) {
        throw new ConflictException({
          code: ERROR_CODES.SUPPLIER_TAX_CODE_EXISTS,
          message: `Mã số thuế "${dto.taxCode}" đã tồn tại`,
        });
      }
    }

    Object.assign(doc, dto);
    await doc.save();

    return this.mapToResponse(doc);
  }

  private mapToResponse(doc: SupplierDocument): SupplierResponseDto {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      name: doc.name,
      contactPerson: doc.contactPerson,
      phone: doc.phone,
      email: doc.email ?? '',
      address: doc.address,
      taxCode: doc.taxCode ?? '',
      note: doc.note ?? '',
      isActive: doc.isActive,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }
}
