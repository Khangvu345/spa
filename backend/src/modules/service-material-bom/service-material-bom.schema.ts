import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServiceMaterialBomDocument = HydratedDocument<ServiceMaterialBom>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'service_material_bom',
})
export class ServiceMaterialBom {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Material' })
  materialId: Types.ObjectId;

  // Định mức tiêu hao chuẩn cho 1 lần dịch vụ.
  // Cho phép decimal nhỏ để hỗ trợ material DEPRECIATION (vd: 0.01 = 1/100 bộ đá).
  @Prop({ required: true, min: 0.0001 })
  standardQuantity: number;

  @Prop({ default: '', trim: true, maxlength: 500 })
  note: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const ServiceMaterialBomSchema =
  SchemaFactory.createForClass(ServiceMaterialBom);

// 1 cặp (service, material) chỉ có duy nhất 1 entry — sửa quantity = PATCH, không tạo trùng
ServiceMaterialBomSchema.index(
  { serviceId: 1, materialId: 1 },
  { unique: true },
);
ServiceMaterialBomSchema.index({ serviceId: 1 });
ServiceMaterialBomSchema.index({ materialId: 1 });
ServiceMaterialBomSchema.index({ isActive: 1 });
