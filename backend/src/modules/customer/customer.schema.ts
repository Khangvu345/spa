import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;

export enum CustomerSource {
  WALK_IN = 'WALK_IN',
  ONLINE_BOOKING = 'ONLINE_BOOKING',
  MANUAL = 'MANUAL',
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'customers',
})
export class Customer {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ default: '', trim: true, lowercase: true })
  email: string;

  @Prop({
    required: true,
    enum: CustomerSource,
    default: CustomerSource.MANUAL,
  })
  source: CustomerSource;

  @Prop({ default: '', trim: true })
  note: string;

  @Prop({ required: true, default: false })
  phoneVerified: boolean;

  @Prop({ required: true, default: false })
  emailVerified: boolean;

  @Prop({ type: Date, default: null })
  lastVerifiedAt: Date | null;

  @Prop({ required: true, default: true })
  isActive: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ phone: 1 }, { unique: true });
CustomerSchema.index({ fullName: 1 });
CustomerSchema.index({ isActive: 1 });
CustomerSchema.index({ source: 1 });
CustomerSchema.index({ isActive: 1, created_at: -1 });
