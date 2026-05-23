import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Customer } from '../customer/customer.schema';
import { Staff } from '../employee/employee/staff.schema';
import { Service } from '../service/service.schema';
import { ServiceOrder } from '../service-order/service-order.schema';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  PENDING_OTP = 'PENDING_OTP',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum BookingSource {
  LANDING_PAGE = 'LANDING_PAGE',
  OPERATOR = 'OPERATOR',
}

@Schema({ _id: false })
export class BookingCustomerSnapshot {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ default: '', trim: true, lowercase: true })
  email: string;
}

export const BookingCustomerSnapshotSchema = SchemaFactory.createForClass(
  BookingCustomerSnapshot,
);

@Schema({ _id: false })
export class BookingServiceSnapshot {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  durationMinutes: number;

  @Prop({ required: true, min: 0 })
  cleanupMinutes: number;
}

export const BookingServiceSnapshotSchema = SchemaFactory.createForClass(
  BookingServiceSnapshot,
);

@Schema({ _id: false })
export class BookingStaffSnapshot {
  @Prop({ required: true })
  fullName: string;
}

export const BookingStaffSnapshotSchema = SchemaFactory.createForClass(
  BookingStaffSnapshot,
);

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'bookings',
})
export class Booking {
  @Prop({ required: true })
  bookingCode: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Customer.name,
    required: true,
  })
  customerId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Service.name,
    required: true,
  })
  serviceId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    required: true,
  })
  staffId: Types.ObjectId;

  @Prop({ type: BookingCustomerSnapshotSchema, required: true })
  customerSnapshot: BookingCustomerSnapshot;

  @Prop({ type: BookingServiceSnapshotSchema, required: true })
  serviceSnapshot: BookingServiceSnapshot;

  @Prop({ type: BookingStaffSnapshotSchema, required: true })
  staffSnapshot: BookingStaffSnapshot;

  @Prop({ required: true })
  scheduledStart: Date;

  @Prop({ required: true })
  scheduledEnd: Date;

  @Prop({
    required: true,
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @Prop({ required: true, enum: BookingSource })
  source: BookingSource;

  @Prop({ type: String, default: null })
  otpCode: string | null;

  @Prop({ type: Date, default: null })
  otpExpiresAt: Date | null;

  @Prop({ required: true, min: 0, default: 0 })
  otpAttempts: number;

  @Prop({ type: Date, default: null })
  verifiedAt: Date | null;

  @Prop({ default: '', trim: true })
  note: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ServiceOrder.name,
    default: null,
  })
  serviceOrderId: Types.ObjectId | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    default: null,
  })
  createdBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    default: null,
  })
  cancelledBy: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  cancelReason: string | null;

  created_at?: Date;
  updated_at?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ bookingCode: 1 }, { unique: true });
BookingSchema.index({ staffId: 1, scheduledStart: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ customerId: 1 });
BookingSchema.index({ scheduledStart: 1 });
BookingSchema.index(
  { otpExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: BookingStatus.PENDING_OTP },
  },
);
