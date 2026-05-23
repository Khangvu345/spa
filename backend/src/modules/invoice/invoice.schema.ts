import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Customer } from '../customer/customer.schema';
import { Service } from '../service/service.schema';
import { ServiceOrder } from '../service-order/service-order.schema';
import { Staff } from '../employee/employee/staff.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  VNPAY = 'VNPAY',
}

@Schema({ _id: false })
export class InvoiceCustomerSnapshot {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  email: string;
}

export const InvoiceCustomerSnapshotSchema = SchemaFactory.createForClass(
  InvoiceCustomerSnapshot,
);

@Schema()
export class InvoiceItem {
  _id?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  serviceOrderItemId: Types.ObjectId;

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

  @Prop({ required: true, min: 1 })
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

  @Prop({ required: true, min: 0 })
  commissionAmount: number;
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'invoices',
})
export class Invoice {
  @Prop({ required: true })
  invoiceCode: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ServiceOrder.name,
    required: true,
  })
  serviceOrderId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Customer.name,
    required: true,
  })
  customerId: Types.ObjectId;

  @Prop({ type: InvoiceCustomerSnapshotSchema, required: true })
  customerSnapshot: InvoiceCustomerSnapshot;

  @Prop({ type: [InvoiceItemSchema], default: [] })
  items: InvoiceItem[];

  @Prop({ required: true, min: 0, default: 0 })
  itemsSubtotal: number;

  @Prop({ required: true, min: 0, default: 0 })
  extraCharge: number;

  @Prop({ required: true, min: 0, default: 0 })
  discountAmount: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalAmount: number;

  @Prop({
    required: true,
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Prop({ type: String, enum: PaymentMethod, default: null })
  paymentMethod: PaymentMethod | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    required: true,
  })
  createdBy: Types.ObjectId;

  @Prop({ required: true })
  createdByName: string;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Staff.name, default: null })
  paidBy: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  paidByName: string | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Staff.name, default: null })
  cancelledBy: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  cancelReason: string | null;

  @Prop({ default: '' })
  note: string;

  @Prop({ required: true, default: false })
  stockDeducted: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ invoiceCode: 1 }, { unique: true });
InvoiceSchema.index({ serviceOrderId: 1 }, { unique: true });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ paidAt: -1 });
InvoiceSchema.index({ created_at: -1 });
InvoiceSchema.index({ status: 1, created_at: -1 });
