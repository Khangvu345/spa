import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Customer } from '../customer/customer.schema';
import { Staff } from '../employee/employee/staff.schema';
import { Service } from '../service/service.schema';

export type ServiceOrderDocument = HydratedDocument<ServiceOrder>;

export enum ServiceOrderStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  INVOICED = 'INVOICED',
  CANCELLED = 'CANCELLED',
}

@Schema()
export class ServiceOrderItem {
  _id?: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Service.name,
    required: true,
  })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  serviceCode: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 1, default: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    required: true,
  })
  staffId: Types.ObjectId;

  @Prop({ required: true })
  staffName: string;

  @Prop({ required: true, min: 0, max: 100 })
  commissionRate: number;

  @Prop({ default: '' })
  note: string;

  @Prop({ required: true, default: () => new Date() })
  addedAt: Date;
}

export const ServiceOrderItemSchema =
  SchemaFactory.createForClass(ServiceOrderItem);

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'service_orders',
})
export class ServiceOrder {
  @Prop({ required: true })
  orderCode: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Customer.name,
    required: true,
  })
  customerId: Types.ObjectId;

  @Prop({ type: [ServiceOrderItemSchema], default: [] })
  items: ServiceOrderItem[];

  @Prop({ required: true, min: 0, default: 0 })
  itemsSubtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  extraCharge: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalAmount: number;

  @Prop({
    required: true,
    enum: ServiceOrderStatus,
    default: ServiceOrderStatus.DRAFT,
  })
  status: ServiceOrderStatus;

  @Prop({ default: '' })
  note: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  createdByName: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  bookingId: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  startedAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Date, default: null })
  invoicedAt: Date | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Staff.name, default: null })
  cancelledBy: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  cancelReason: string | null;

  created_at?: Date;
  updated_at?: Date;
}

export const ServiceOrderSchema = SchemaFactory.createForClass(ServiceOrder);

ServiceOrderSchema.index({ orderCode: 1 }, { unique: true });
ServiceOrderSchema.index({ customerId: 1 });
ServiceOrderSchema.index({ status: 1 });
ServiceOrderSchema.index({ created_at: -1 });
ServiceOrderSchema.index({ status: 1, created_at: -1 });
ServiceOrderSchema.index({ bookingId: 1 });
