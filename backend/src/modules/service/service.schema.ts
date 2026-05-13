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

  @Prop({ required: true, min: 0, name: 'unit_price' })
  unitPrice: number;

  @Prop({ required: true, min: 1, name: 'duration_minutes' })
  durationMinutes: number;

  @Prop({ required: true, min: 0, default: 15, name: 'buffer_minutes' })
  bufferMinutes: number;

  @Prop({ required: true, min: 1, default: 1, name: 'slots_required' })
  slotsRequired: number;

  @Prop({ default: '' })
  description: string;

  // @Prop({ name: 'image_url', default: null })
  // imageUrl?: string | null;

  @Prop({ required: true, default: true, name: 'is_active' })
  isActive: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);

ServiceSchema.index({ code: 1 }, { unique: true });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ is_active: 1 });
ServiceSchema.index({ unit_price: 1 });
ServiceSchema.index({ is_active: 1, category: 1 });
