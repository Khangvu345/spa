import {
  BadRequestException,
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
import { Supplier, SupplierDocument } from '../supplier/supplier.schema';
import { CreateMaterialDto } from './dto/create-material.dto';
import { MaterialResponseDto } from './dto/material-response.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { Material, MaterialDocument, MaterialType } from './material.schema';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  /**
   * Tạo vật liệu mới.
   * - Check `code` duplicate
   * - Verify supplier tồn tại + isActive=true
   * - Nếu type=DEPRECIATION require expectedUsesPerUnit>0
   */
  async create(dto: CreateMaterialDto): Promise<MaterialResponseDto> {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.materialModel.findOne({ code });
    if (existing) {
      throw new ConflictException({
        code: ERROR_CODES.MATERIAL_CODE_EXISTS,
        message: `Mã vật liệu "${code}" đã tồn tại`,
      });
    }

    await this.assertSupplierValid(dto.supplierId, true);

    if (dto.type === MaterialType.DEPRECIATION) {
      if (!dto.expectedUsesPerUnit || dto.expectedUsesPerUnit <= 0) {
        throw new BadRequestException({
          code: ERROR_CODES.MATERIAL_DEPRECIATION_USES_REQUIRED,
          message:
            'Vật liệu loại DEPRECIATION yêu cầu expectedUsesPerUnit > 0',
        });
      }
    }

    const created = await this.materialModel.create({
      ...dto,
      code,
      description: dto.description ?? '',
      stockQuantity: dto.stockQuantity ?? 0,
      reorderLevel: dto.reorderLevel ?? 0,
      expectedUsesPerUnit: dto.expectedUsesPerUnit ?? 0,
      supplierId: new Types.ObjectId(dto.supplierId),
      isActive: true,
    });

    return this.mapToResponse(created);
  }

  /**
   * Danh sách vật liệu — search + filter (isActive/type/supplierId) + sort + pagination.
   */
  async findAll(
    query: QueryMaterialDto,
  ): Promise<{ data: MaterialResponseDto[]; meta: PaginationMeta }> {
    const filter: Record<string, unknown> = {};

    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.type) filter.type = query.type;
    if (query.supplierId) filter.supplierId = new Types.ObjectId(query.supplierId);

    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escaped, $options: 'i' };
    }

    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    const sortFieldMap: Record<string, string> = {
      name: 'name',
      stockQuantity: 'stockQuantity',
      createdAt: 'created_at',
    };
    const sortField = sortFieldMap[query.sortBy ?? 'createdAt'];
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.materialModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate<{ supplierId: SupplierDocument }>('supplierId', 'name'),
      this.materialModel.countDocuments(filter),
    ]);

    return {
      data: docs.map((doc) =>
        this.mapToResponse(doc as unknown as MaterialDocument, true),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<MaterialResponseDto> {
    const doc = await this.materialModel
      .findById(id)
      .populate<{ supplierId: SupplierDocument }>('supplierId', 'name');
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.MATERIAL_NOT_FOUND,
        message: 'Vật liệu không tồn tại',
      });
    }
    return this.mapToResponse(doc as unknown as MaterialDocument, true);
  }

  async update(
    id: string,
    dto: UpdateMaterialDto,
  ): Promise<MaterialResponseDto> {
    const doc = await this.materialModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.MATERIAL_NOT_FOUND,
        message: 'Vật liệu không tồn tại',
      });
    }

    if (dto.code !== undefined) {
      const newCode = dto.code.trim().toUpperCase();
      if (newCode !== doc.code) {
        const conflict = await this.materialModel.findOne({
          code: newCode,
          _id: { $ne: doc._id },
        });
        if (conflict) {
          throw new ConflictException({
            code: ERROR_CODES.MATERIAL_CODE_EXISTS,
            message: `Mã vật liệu "${newCode}" đã tồn tại`,
          });
        }
        dto.code = newCode;
      }
    }

    if (dto.supplierId !== undefined) {
      await this.assertSupplierValid(dto.supplierId, false);
    }

    const finalType = dto.type ?? doc.type;
    const finalUses =
      dto.expectedUsesPerUnit !== undefined
        ? dto.expectedUsesPerUnit
        : doc.expectedUsesPerUnit;
    if (finalType === MaterialType.DEPRECIATION && (!finalUses || finalUses <= 0)) {
      throw new BadRequestException({
        code: ERROR_CODES.MATERIAL_DEPRECIATION_USES_REQUIRED,
        message: 'Vật liệu loại DEPRECIATION yêu cầu expectedUsesPerUnit > 0',
      });
    }

    Object.assign(doc, {
      ...dto,
      supplierId: dto.supplierId
        ? new Types.ObjectId(dto.supplierId)
        : doc.supplierId,
    });
    await doc.save();

    const refreshed = await this.materialModel
      .findById(doc._id)
      .populate<{ supplierId: SupplierDocument }>('supplierId', 'name');
    return this.mapToResponse(refreshed as unknown as MaterialDocument, true);
  }

  /**
   * Verify supplierId tồn tại. Khi `requireActive` = true bắt buộc isActive.
   */
  private async assertSupplierValid(
    supplierId: string,
    requireActive: boolean,
  ): Promise<void> {
    const supplier = await this.supplierModel.findById(supplierId);
    if (!supplier || (requireActive && !supplier.isActive)) {
      throw new BadRequestException({
        code: ERROR_CODES.MATERIAL_SUPPLIER_INVALID,
        message: !supplier
          ? 'Supplier không tồn tại'
          : 'Supplier đã ngừng hoạt động (isActive=false)',
      });
    }
  }

  private mapToResponse(
    doc: MaterialDocument | (MaterialDocument & Record<string, unknown>),
    populated = false,
  ): MaterialResponseDto {
    const supplierField = doc.supplierId as unknown;
    let supplierId: string;
    let supplier: { id: string; name: string } | undefined;

    if (
      populated &&
      supplierField &&
      typeof supplierField === 'object' &&
      '_id' in (supplierField as Record<string, unknown>) &&
      'name' in (supplierField as Record<string, unknown>)
    ) {
      const ref = supplierField as { _id: Types.ObjectId; name: string };
      supplierId = ref._id.toString();
      supplier = { id: supplierId, name: ref.name };
    } else {
      supplierId = (supplierField as Types.ObjectId).toString();
    }

    return {
      id: (doc._id as Types.ObjectId).toString(),
      code: doc.code,
      name: doc.name,
      description: doc.description ?? '',
      unit: doc.unit,
      type: doc.type,
      unitPrice: doc.unitPrice,
      stockQuantity: doc.stockQuantity,
      reorderLevel: doc.reorderLevel,
      expectedUsesPerUnit: doc.expectedUsesPerUnit ?? 0,
      supplierId,
      supplier,
      isActive: doc.isActive,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }
}
