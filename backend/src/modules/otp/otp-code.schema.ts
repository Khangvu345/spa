import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Booking } from '../booking/booking.schema';

export type OtpCodeDocument = HydratedDocument<OtpCode>;

@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'otp_codes',
})
export class OtpCode {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Booking.name,
    required: true,
  })
  bookingId: Types.ObjectId;

  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  codeHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, min: 0, default: 0 })
  attemptCount: number;

  @Prop({ required: true, default: false })
  isUsed: boolean;

  @Prop({ required: true })
  lastSentAt: Date;

  created_at?: Date;
  updated_at?: Date;
}

export const OtpCodeSchema = SchemaFactory.createForClass(OtpCode);

OtpCodeSchema.index({ bookingId: 1 });
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpCodeSchema.index({ bookingId: 1, isUsed: 1 });
