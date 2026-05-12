import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

export enum StaffRole {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  CASHIER = 'CASHIER',
  STAFF = 'STAFF',
}

export enum WorkStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  RESIGNED = 'RESIGNED',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
}

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'staff',
})
export class Staff {
  @Prop({ required: true, name: 'full_name' })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, name: 'password_hash' })
  passwordHash: string;

  @Prop({ required: true, enum: StaffRole })
  role: StaffRole;

  @Prop({ required: true, name: 'base_salary', min: 0, default: 0 })
  baseSalary: number;

  @Prop({
    required: true,
    enum: WorkStatus,
    name: 'work_status',
    default: WorkStatus.ACTIVE,
  })
  workStatus: WorkStatus;

  @Prop({
    required: true,
    enum: AccountStatus,
    name: 'account_status',
    default: AccountStatus.ACTIVE,
  })
  accountStatus: AccountStatus;

  @Prop({ required: true, name: 'started_at' })
  startedAt: Date;

  @Prop({ type: Date, name: 'locked_at', default: null })
  lockedAt?: Date | null;

  @Prop({ required: true, name: 'must_change_password', default: false })
  mustChangePassword: boolean;

  created_at?: Date;
  updated_at?: Date;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);

StaffSchema.index({ email: 1 }, { unique: true });
StaffSchema.index({ account_status: 1 });
StaffSchema.index({ work_status: 1 });
StaffSchema.index({ account_status: 1, locked_at: 1 });
