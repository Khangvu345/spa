import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SupplierDocument = HydratedDocument<Supplier>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'suppliers',
})
export class Supplier {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  contactPerson: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ default: '', trim: true, lowercase: true })
  email: string;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ default: '', trim: true })
  taxCode: string;

  @Prop({ default: '' })
  note: string;

  @Prop({ required: true, default: true })
  isActive: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.index({ name: 1 });
SupplierSchema.index({ phone: 1 });
SupplierSchema.index({ isActive: 1 });
SupplierSchema.index({ taxCode: 1 });
