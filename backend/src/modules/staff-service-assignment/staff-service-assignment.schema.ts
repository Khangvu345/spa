import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Staff } from '../employee/employee/staff.schema';
import { Service } from '../service/service.schema';

export type StaffServiceAssignmentDocument =
  HydratedDocument<StaffServiceAssignment>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'staff_service_assignments',
})
export class StaffServiceAssignment {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Staff.name,
    required: true,
  })
  staffId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Service.name,
    required: true,
  })
  serviceId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  commissionRate: number;

  @Prop({ required: true, default: () => new Date() })
  assignedSince: Date;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ default: '' })
  note: string;

  created_at?: Date;
  updated_at?: Date;
}

export const StaffServiceAssignmentSchema = SchemaFactory.createForClass(
  StaffServiceAssignment,
);

StaffServiceAssignmentSchema.index({ staffId: 1 });
StaffServiceAssignmentSchema.index({ serviceId: 1 });
StaffServiceAssignmentSchema.index({ isActive: 1 });
StaffServiceAssignmentSchema.index(
  { serviceId: 1, isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  },
);
