// Types module Sổ kho — khớp BE /stock.
declare namespace StockLedger {
	export type TTransactionType = 'IN' | 'OUT_INVOICE' | 'OUT_MANUAL' | 'ADJUSTMENT';
	export type TReferenceType = 'INVOICE' | 'STOCK_IN' | 'STOCK_OUT_MANUAL' | 'ADJUSTMENT';

	export interface ILedgerEntry {
		id: string;
		materialId: string;
		materialCode: string;
		materialName: string;
		materialUnit: string;
		transactionType: TTransactionType;
		quantityChange: number;
		stockBefore: number;
		stockAfter: number;
		supplierId: string | null;
		supplierName: string | null;
		unitPrice: number | null;
		totalCost: number | null;
		referenceType: TReferenceType | null;
		referenceId: string | null;
		performedBy: string;
		performedByName: string;
		reason: string;
		createdAt: string;
	}

	export interface IStockInPayload {
		materialId: string;
		quantity: number;
		supplierId: string;
		unitPrice: number;
		reason?: string;
	}

	export interface IStockOutManualPayload {
		materialId: string;
		quantity: number;
		reason: string;
	}

	export interface IQuery {
		page?: number;
		limit?: number;
		materialId?: string;
		transactionType?: TTransactionType;
		referenceType?: TReferenceType;
		fromDate?: string;
		toDate?: string;
		sortBy?: 'createdAt';
		sortOrder?: 'asc' | 'desc';
	}

	export interface IPagedResponse {
		data: ILedgerEntry[];
		meta: { total: number; page: number; limit: number; totalPages: number };
	}

	export interface ILowStockSupplier {
		id: string;
		name: string;
		phone: string;
	}

	export interface ILowStockItem {
		materialId: string;
		materialCode: string;
		materialName: string;
		stockQuantity: number;
		reorderLevel: number;
		unit: string;
		supplier: ILowStockSupplier | null;
	}

	export interface ISummaryBucket {
		count: number;
		quantity: number;
		cost: number;
	}

	export interface ISummary {
		totalIn: ISummaryBucket;
		totalOutInvoice: ISummaryBucket;
		totalOutManual: ISummaryBucket;
		totalAdjustment: ISummaryBucket;
	}
}
