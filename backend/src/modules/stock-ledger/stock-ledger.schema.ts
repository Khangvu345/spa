import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StockLedgerDocument = HydratedDocument<StockLedger>;

export enum StockTransactionType {
  IN = 'IN',
  OUT_INVOICE = 'OUT_INVOICE',
  OUT_MANUAL = 'OUT_MANUAL',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum StockReferenceType {
  INVOICE = 'INVOICE',
  STOCK_IN = 'STOCK_IN',
  STOCK_OUT_MANUAL = 'STOCK_OUT_MANUAL',
  ADJUSTMENT = 'ADJUSTMENT',
}

/**
 * Stock Ledger — sổ kho audit trail (immutable).
 * - KHÔNG có updated_at: ledger entry bất biến, sai → tạo ADJUSTMENT entry mới bù.
 * - Snapshot toàn bộ thông tin material/supplier/staff để báo cáo lịch sử không bị
 *   ảnh hưởng khi entity gốc đổi info.
 */
@Schema({
  timestamps: { createdAt: 'created_at', updatedAt: false },
  collection: 'stock_ledger',
})
export class StockLedger {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Material' })
  materialId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  materialCode: string;

  @Prop({ required: true, trim: true })
  materialName: string;

  @Prop({ required: true, trim: true })
  materialUnit: string;

  @Prop({ required: true, enum: StockTransactionType })
  transactionType: StockTransactionType;

  @Prop({ required: true })
  quantityChange: number;

  @Prop({ required: true })
  stockBefore: number;

  @Prop({ required: true })
  stockAfter: number;

  @Prop({ type: Types.ObjectId, ref: 'Supplier', default: null })
  supplierId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  supplierName: string | null;

  @Prop({ type: Number, default: null, min: 0 })
  unitPrice: number | null;

  @Prop({ type: Number, default: null, min: 0 })
  totalCost: number | null;

  @Prop({ type: String, enum: StockReferenceType, default: null })
  referenceType: StockReferenceType | null;

  @Prop({ type: Types.ObjectId, default: null })
  referenceId: Types.ObjectId | null;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Staff' })
  performedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  performedByName: string;

  @Prop({ default: '', trim: true, maxlength: 500 })
  reason: string;

  created_at?: Date;
}

export const StockLedgerSchema = SchemaFactory.createForClass(StockLedger);

StockLedgerSchema.index({ materialId: 1, created_at: -1 });
StockLedgerSchema.index({ referenceType: 1, referenceId: 1 });
StockLedgerSchema.index({ transactionType: 1 });
StockLedgerSchema.index({ created_at: -1 });
StockLedgerSchema.index({ performedBy: 1 });
