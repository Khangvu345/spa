import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Service } from '../service/service.schema';
import { Staff } from '../employee/employee/staff.schema';
import { Invoice } from '../invoice/invoice.schema';

export type PayrollRecordDocument = HydratedDocument<PayrollRecord>;

export enum PayrollStatus {
  FINALIZED = 'FINALIZED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Schema({ _id: false })
export class PayrollStaffSnapshot {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  role: string;
}

export const PayrollStaffSnapshotSchema =
  SchemaFactory.createForClass(PayrollStaffSnapshot);

@Schema({ _id: false })
export class PayrollCommissionBreakdownItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Service.name,
    required: true,
  })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ required: true, min: 0 })
  serviceCount: number;

  @Prop({ required: true, min: 0 })
  totalCommission: number;
}

export const PayrollCommissionBreakdownItemSchema =
  SchemaFactory.createForClass(PayrollCommissionBreakdownItem);

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'payroll_records',
})
export class PayrollRecord {
  @Prop({ required: true })
  payrollCode: string;

  @Prop({ required: true })
  periodYear: number;

  @Prop({ required: true, min: 1, max: 12 })
  periodMonth: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    required: true,
  })
  staffId: Types.ObjectId;

  @Prop({ type: PayrollStaffSnapshotSchema, required: true })
  staffSnapshot: PayrollStaffSnapshot;

  @Prop({ required: true, min: 0, default: 0 })
  baseSalary: number;

  @Prop({ required: true, min: 0, default: 0 })
  totalCommission: number;

  @Prop({ required: true, default: 0 })
  adjustment: number;

  @Prop({ required: true, default: 0 })
  totalIncome: number;

  @Prop({ type: [PayrollCommissionBreakdownItemSchema], default: [] })
  commissionBreakdown: PayrollCommissionBreakdownItem[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: Invoice.name,
    default: [],
  })
  sourceInvoiceIds: Types.ObjectId[];

  @Prop({ required: true, min: 0, default: 0 })
  invoiceCount: number;

  @Prop({
    required: true,
    enum: PayrollStatus,
    default: PayrollStatus.FINALIZED,
  })
  status: PayrollStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    required: true,
  })
  finalizedBy: Types.ObjectId;

  @Prop({ required: true })
  finalizedByName: string;

  @Prop({ required: true, type: Date })
  finalizedAt: Date;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Staff.name, default: null })
  paidBy: Types.ObjectId | null;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Staff.name, default: null })
  cancelledBy: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  cancelReason: string | null;

  @Prop({ default: '' })
  note: string;

  created_at?: Date;
  updated_at?: Date;
}

export const PayrollRecordSchema = SchemaFactory.createForClass(PayrollRecord);

PayrollRecordSchema.index({ payrollCode: 1 }, { unique: true });

// Mỗi nhân viên chỉ có 1 phiếu ACTIVE cho 1 tháng — phiếu CANCELLED không tính.
// MongoDB partialFilterExpression KHÔNG hỗ trợ $ne → dùng $in các status active.
PayrollRecordSchema.index(
  { staffId: 1, periodYear: 1, periodMonth: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [PayrollStatus.FINALIZED, PayrollStatus.PAID] },
    },
  },
);

PayrollRecordSchema.index({ periodYear: 1, periodMonth: 1 });
PayrollRecordSchema.index({ staffId: 1 });
PayrollRecordSchema.index({ status: 1 });
