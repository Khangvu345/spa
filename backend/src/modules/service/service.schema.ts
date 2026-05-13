import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

/**
 * Danh mục dịch vụ massage (theo seed 6 dịch vụ MVP — Issue #05).
 * Sau này khi mở rộng (skincare, nail...) bổ sung enum tương ứng.
 */
export enum ServiceCategory {
  SWEDISH = 'SWEDISH',
  HOT_STONE = 'HOT_STONE',
  THAI = 'THAI',
  FOOT = 'FOOT',
  NECK_SHOULDER = 'NECK_SHOULDER',
  AROMA = 'AROMA',
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'services',
})
export class Service {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ServiceCategory })
  category: ServiceCategory;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 1 })
  durationMinutes: number;

  @Prop({ required: true, min: 0, default: 15 })
  bufferMinutes: number;

  @Prop({ required: true, min: 1, default: 1 })
  slotsRequired: number;

  @Prop({ default: '' })
  description: string;

  // @Prop({ default: null })
  // imageUrl?: string | null;

  @Prop({ required: true, default: true })
  isActive: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

// ServiceSchema.index({ code: 1 }, { unique: true });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ unitPrice: 1 });
ServiceSchema.index({ isActive: 1, category: 1 });
