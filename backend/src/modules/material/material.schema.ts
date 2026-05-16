import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MaterialDocument = HydratedDocument<Material>;

export enum MaterialType {
  CONSUMABLE = 'CONSUMABLE',
  DEPRECIATION = 'DEPRECIATION',
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'materials',
})
export class Material {
  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ required: true, trim: true })
  unit: string;

  @Prop({ required: true, enum: MaterialType })
  type: MaterialType;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0, default: 0 })
  stockQuantity: number;

  @Prop({ required: true, min: 0, default: 0 })
  reorderLevel: number;

  @Prop({ default: 0, min: 0 })
  expectedUsesPerUnit: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Supplier' })
  supplierId: Types.ObjectId;

  @Prop({ required: true, default: true })
  isActive: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

MaterialSchema.index({ name: 1 });
MaterialSchema.index({ supplierId: 1 });
MaterialSchema.index({ type: 1 });
MaterialSchema.index({ isActive: 1 });
MaterialSchema.index({ isActive: 1, type: 1 });
