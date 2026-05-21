import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { Material, MaterialDocument } from '../material/material.schema';
import { Service, ServiceDocument } from '../service/service.schema';
import { BomResponseDto } from './dto/bom-response.dto';
import { CreateBomDto } from './dto/create-bom.dto';
import { QueryBomDto } from './dto/query-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import {
  ServiceMaterialBom,
  ServiceMaterialBomDocument,
} from './service-material-bom.schema';

@Injectable()
export class ServiceMaterialBomService {
  constructor(
    @InjectModel(ServiceMaterialBom.name)
    private readonly bomModel: Model<ServiceMaterialBomDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
  ) {}

  /**
   * Tạo 1 BOM entry.
   *
   * @param dto - Service + Material + standardQuantity
   * @returns BOM đã tạo (populate service + material)
   * @throws BadRequestException - Service/Material không tồn tại hoặc inactive
   * @throws ConflictException - Cặp (serviceId, materialId) đã có entry
   */
  async create(dto: CreateBomDto): Promise<BomResponseDto> {
    await this.assertServiceValid(dto.serviceId);
    await this.assertMaterialValid(dto.materialId);

    const duplicate = await this.bomModel.findOne({
      serviceId: new Types.ObjectId(dto.serviceId),
      materialId: new Types.ObjectId(dto.materialId),
    });
    if (duplicate) {
      throw new ConflictException({
        code: ERROR_CODES.BOM_ENTRY_EXISTS,
        message:
          'BOM entry cho cặp (service, material) này đã tồn tại — dùng PATCH để sửa quantity',
      });
    }

    const created = await this.bomModel.create({
      serviceId: new Types.ObjectId(dto.serviceId),
      materialId: new Types.ObjectId(dto.materialId),
      standardQuantity: dto.standardQuantity,
      note: dto.note ?? '',
      isActive: true,
    });

    const populated = await this.populateOne(created._id as Types.ObjectId);
    return this.mapToResponse(populated);
  }

  /**
   * Liệt kê toàn bộ BOM entries — KHÔNG pagination (tổng ~15-20 entries).
   */
  async findAll(query: QueryBomDto): Promise<BomResponseDto[]> {
    const filter: Record<string, unknown> = {};
    if (query.serviceId) filter.serviceId = new Types.ObjectId(query.serviceId);
    if (query.materialId)
      filter.materialId = new Types.ObjectId(query.materialId);
    if (query.isActive !== undefined) filter.isActive = query.isActive;

    const docs = await this.bomModel
      .find(filter)
      .sort({ created_at: -1 })
      .populate('serviceId', 'code name')
      .populate('materialId', 'code name unit type stockQuantity');

    return docs.map((doc) => this.mapToResponse(doc));
  }

  /**
   * Lấy toàn bộ BOM của 1 service (isActive=true) — dùng cho Auto Stock Deduction (#20).
   * Trả array rỗng nếu service chưa cấu hình BOM (KHÔNG 404).
   */
  async findByService(serviceId: string): Promise<BomResponseDto[]> {
    const docs = await this.bomModel
      .find({
        serviceId: new Types.ObjectId(serviceId),
        isActive: true,
      })
      .populate('serviceId', 'code name')
      .populate('materialId', 'code name unit type stockQuantity');

    return docs.map((doc) => this.mapToResponse(doc));
  }

  /**
   * Reverse lookup — material X đang được dùng trong service nào.
   * Trả array rỗng nếu chưa có service nào dùng (KHÔNG 404).
   */
  async findByMaterial(materialId: string): Promise<BomResponseDto[]> {
    const docs = await this.bomModel
      .find({ materialId: new Types.ObjectId(materialId) })
      .populate('serviceId', 'code name')
      .populate('materialId', 'code name unit type stockQuantity');

    return docs.map((doc) => this.mapToResponse(doc));
  }

  async findOne(id: string): Promise<BomResponseDto> {
    const doc = await this.bomModel
      .findById(id)
      .populate('serviceId', 'code name')
      .populate('materialId', 'code name unit type stockQuantity');
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.BOM_NOT_FOUND,
        message: 'BOM entry không tồn tại',
      });
    }
    return this.mapToResponse(doc);
  }

  async update(id: string, dto: UpdateBomDto): Promise<BomResponseDto> {
    const doc = await this.bomModel.findById(id);
    if (!doc) {
      throw new NotFoundException({
        code: ERROR_CODES.BOM_NOT_FOUND,
        message: 'BOM entry không tồn tại',
      });
    }

    if (dto.standardQuantity !== undefined)
      doc.standardQuantity = dto.standardQuantity;
    if (dto.note !== undefined) doc.note = dto.note;
    if (dto.isActive !== undefined) doc.isActive = dto.isActive;

    await doc.save();

    const refreshed = await this.populateOne(doc._id as Types.ObjectId);
    return this.mapToResponse(refreshed);
  }

  /**
   * Hard delete — BOM chỉ là config, không lưu lịch sử (snapshot đã ghi vào ledger ở Invoice).
   */
  async remove(id: string): Promise<void> {
    const result = await this.bomModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException({
        code: ERROR_CODES.BOM_NOT_FOUND,
        message: 'BOM entry không tồn tại',
      });
    }
  }

  private async assertServiceValid(serviceId: string): Promise<void> {
    const service = await this.serviceModel.findById(serviceId);
    if (!service || !service.isActive) {
      throw new BadRequestException({
        code: ERROR_CODES.BOM_SERVICE_INVALID,
        message: !service
          ? 'Service không tồn tại'
          : 'Service đã ngừng hoạt động (isActive=false)',
      });
    }
  }

  private async assertMaterialValid(materialId: string): Promise<void> {
    const material = await this.materialModel.findById(materialId);
    if (!material || !material.isActive) {
      throw new BadRequestException({
        code: ERROR_CODES.BOM_MATERIAL_INVALID,
        message: !material
          ? 'Material không tồn tại'
          : 'Material đã ngừng hoạt động (isActive=false)',
      });
    }
  }

  private populateOne(id: Types.ObjectId) {
    return this.bomModel
      .findById(id)
      .populate('serviceId', 'code name')
      .populate('materialId', 'code name unit type stockQuantity')
      .orFail();
  }

  private mapToResponse(
    doc: ServiceMaterialBomDocument,
  ): BomResponseDto {
    const serviceField = doc.serviceId as unknown;
    const materialField = doc.materialId as unknown;

    let serviceId: string;
    let service: BomResponseDto['service'];
    if (
      serviceField &&
      typeof serviceField === 'object' &&
      '_id' in (serviceField as Record<string, unknown>) &&
      'code' in (serviceField as Record<string, unknown>)
    ) {
      const ref = serviceField as ServiceDocument;
      serviceId = (ref._id as Types.ObjectId).toString();
      service = {
        id: serviceId,
        code: ref.code,
        name: ref.name,
      };
    } else {
      serviceId = (serviceField as Types.ObjectId).toString();
    }

    let materialId: string;
    let material: BomResponseDto['material'];
    if (
      materialField &&
      typeof materialField === 'object' &&
      '_id' in (materialField as Record<string, unknown>) &&
      'code' in (materialField as Record<string, unknown>)
    ) {
      const ref = materialField as MaterialDocument;
      materialId = (ref._id as Types.ObjectId).toString();
      material = {
        id: materialId,
        code: ref.code,
        name: ref.name,
        unit: ref.unit,
        type: ref.type,
        stockQuantity: ref.stockQuantity,
      };
    } else {
      materialId = (materialField as Types.ObjectId).toString();
    }

    return {
      id: (doc._id as Types.ObjectId).toString(),
      serviceId,
      materialId,
      standardQuantity: doc.standardQuantity,
      note: doc.note ?? '',
      isActive: doc.isActive,
      service,
      material,
      createdAt: doc.created_at?.toISOString() ?? '',
      updatedAt: doc.updated_at?.toISOString() ?? '',
    };
  }
}
