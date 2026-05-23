import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ClientSession, Connection, Model, Types } from 'mongoose';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Material, MaterialDocument } from '../material/material.schema';
import { Supplier, SupplierDocument } from '../supplier/supplier.schema';
import { LedgerResponseDto } from './dto/ledger-response.dto';
import { LowStockResponseDto } from './dto/low-stock-response.dto';
import { QueryLedgerDto } from './dto/query-ledger.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutManualDto } from './dto/stock-out-manual.dto';
import {
  StockSummaryBucketDto,
  StockSummaryResponseDto,
} from './dto/stock-summary.dto';
import {
  StockLedger,
  StockLedgerDocument,
  StockReferenceType,
  StockTransactionType,
} from './stock-ledger.schema';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class StockLedgerService {
  private readonly logger = new Logger(StockLedgerService.name);

  constructor(
    @InjectModel(StockLedger.name)
    private readonly stockLedgerModel: Model<StockLedgerDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  /**
   * Nhập kho 1 material — wrap trong MongoDB transaction.
   * Snapshot supplier info, unitPrice, totalCost vào ledger.
   *
   * @throws BadRequestException — material/supplier không hợp lệ
   */
  async stockIn(
    dto: StockInDto,
    currentUser: AuthenticatedUser,
  ): Promise<LedgerResponseDto> {
    const session = await this.connection.startSession();
    try {
      let ledgerId: Types.ObjectId | null = null;
      await session.withTransaction(async () => {
        const material = await this.materialModel
          .findById(dto.materialId)
          .session(session);
        if (!material || !material.isActive) {
          throw new BadRequestException({
            code: ERROR_CODES.STOCK_MATERIAL_INVALID,
            message: !material
              ? 'Material không tồn tại'
              : 'Material đã ngừng hoạt động (isActive=false)',
          });
        }

        const supplier = await this.supplierModel
          .findById(dto.supplierId)
          .session(session);
        if (!supplier || !supplier.isActive) {
          throw new BadRequestException({
            code: ERROR_CODES.STOCK_SUPPLIER_INVALID,
            message: !supplier
              ? 'Supplier không tồn tại'
              : 'Supplier đã ngừng hoạt động (isActive=false)',
          });
        }

        const stockBefore = material.stockQuantity;
        const stockAfter = stockBefore + dto.quantity;
        const totalCost = dto.quantity * dto.unitPrice;

        await this.materialModel.updateOne(
          { _id: material._id },
          { $inc: { stockQuantity: dto.quantity } },
          { session },
        );

        const ledgerObjectId = new Types.ObjectId();
        const [ledger] = await this.stockLedgerModel.create(
          [
            {
              _id: ledgerObjectId,
              materialId: material._id,
              materialCode: material.code,
              materialName: material.name,
              materialUnit: material.unit,
              transactionType: StockTransactionType.IN,
              quantityChange: dto.quantity,
              stockBefore,
              stockAfter,
              supplierId: supplier._id,
              supplierName: supplier.name,
              unitPrice: dto.unitPrice,
              totalCost,
              referenceType: StockReferenceType.STOCK_IN,
              referenceId: ledgerObjectId,
              performedBy: new Types.ObjectId(currentUser.id),
              performedByName: currentUser.email,
              reason: dto.reason ?? 'Nhập kho từ NCC',
            },
          ],
          { session },
        );
        ledgerId = ledger._id as Types.ObjectId;
      });

      const doc = await this.stockLedgerModel.findById(ledgerId);
      return this.mapToResponse(doc as StockLedgerDocument);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Xuất kho thủ công (vỡ, mất, kiểm kê) — wrap trong transaction.
   * Cho phép stock âm: admin chịu trách nhiệm. reason bắt buộc.
   */
  async stockOutManual(
    dto: StockOutManualDto,
    currentUser: AuthenticatedUser,
  ): Promise<LedgerResponseDto> {
    const session = await this.connection.startSession();
    try {
      let ledgerId: Types.ObjectId | null = null;
      await session.withTransaction(async () => {
        const material = await this.materialModel
          .findById(dto.materialId)
          .session(session);
        if (!material) {
          throw new BadRequestException({
            code: ERROR_CODES.STOCK_MATERIAL_INVALID,
            message: 'Material không tồn tại',
          });
        }

        const stockBefore = material.stockQuantity;
        const stockAfter = stockBefore - dto.quantity;

        await this.materialModel.updateOne(
          { _id: material._id },
          { $inc: { stockQuantity: -dto.quantity } },
          { session },
        );

        const ledgerObjectId = new Types.ObjectId();
        const [ledger] = await this.stockLedgerModel.create(
          [
            {
              _id: ledgerObjectId,
              materialId: material._id,
              materialCode: material.code,
              materialName: material.name,
              materialUnit: material.unit,
              transactionType: StockTransactionType.OUT_MANUAL,
              quantityChange: -dto.quantity,
              stockBefore,
              stockAfter,
              referenceType: StockReferenceType.STOCK_OUT_MANUAL,
              referenceId: ledgerObjectId,
              performedBy: new Types.ObjectId(currentUser.id),
              performedByName: currentUser.email,
              reason: dto.reason,
            },
          ],
          { session },
        );
        ledgerId = ledger._id as Types.ObjectId;
      });

      const doc = await this.stockLedgerModel.findById(ledgerId);
      return this.mapToResponse(doc as StockLedgerDocument);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Liệt kê ledger entries — pagination + filter + sort.
   */
  async findAll(
    query: QueryLedgerDto,
  ): Promise<{ data: LedgerResponseDto[]; meta: PaginationMeta }> {
    const filter = this.buildFilter(query);
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.stockLedgerModel
        .find(filter)
        .sort({ created_at: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit),
      this.stockLedgerModel.countDocuments(filter),
    ]);

    return {
      data: docs.map((d) => this.mapToResponse(d)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lịch sử ledger của 1 material — auto set materialId filter.
   */
  async findByMaterial(
    materialId: string,
    query: QueryLedgerDto,
  ): Promise<{ data: LedgerResponseDto[]; meta: PaginationMeta }> {
    return this.findAll({ ...query, materialId });
  }

  /**
   * Tìm toàn bộ ledger entries của 1 reference (1 invoice / 1 manual transaction).
   * Trả array rỗng nếu không có (KHÔNG 404).
   */
  async findByReference(
    referenceType: StockReferenceType,
    referenceId: string,
  ): Promise<LedgerResponseDto[]> {
    const docs = await this.stockLedgerModel
      .find({
        referenceType,
        referenceId: new Types.ObjectId(referenceId),
      })
      .sort({ created_at: 1 });

    return docs.map((d) => this.mapToResponse(d));
  }

  /**
   * Tổng nhập/xuất theo khoảng thời gian — aggregate group by transactionType.
   */
  async getSummary(
    fromDate?: string,
    toDate?: string,
  ): Promise<StockSummaryResponseDto> {
    const match: Record<string, unknown> = {};
    if (fromDate || toDate) {
      const range: Record<string, Date> = {};
      if (fromDate) range.$gte = new Date(fromDate);
      if (toDate) range.$lte = new Date(toDate);
      match.created_at = range;
    }

    const groups = await this.stockLedgerModel.aggregate<{
      _id: StockTransactionType;
      count: number;
      quantity: number;
      cost: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          quantity: { $sum: { $abs: '$quantityChange' } },
          cost: { $sum: { $ifNull: ['$totalCost', 0] } },
        },
      },
    ]);

    const emptyBucket = (): StockSummaryBucketDto => ({
      count: 0,
      quantity: 0,
      cost: 0,
    });
    const result: StockSummaryResponseDto = {
      totalIn: emptyBucket(),
      totalOutInvoice: emptyBucket(),
      totalOutManual: emptyBucket(),
      totalAdjustment: emptyBucket(),
    };

    for (const g of groups) {
      const bucket: StockSummaryBucketDto = {
        count: g.count,
        quantity: g.quantity,
        cost: g.cost,
      };
      switch (g._id) {
        case StockTransactionType.IN:
          result.totalIn = bucket;
          break;
        case StockTransactionType.OUT_INVOICE:
          result.totalOutInvoice = bucket;
          break;
        case StockTransactionType.OUT_MANUAL:
          result.totalOutManual = bucket;
          break;
        case StockTransactionType.ADJUSTMENT:
          result.totalAdjustment = bucket;
          break;
      }
    }

    return result;
  }

  /**
   * Danh sách material đang cảnh báo tồn kho thấp (stockQuantity <= reorderLevel).
   * Chỉ trả material isActive=true. Populate supplier { id, name, phone } để admin liên hệ NCC.
   */
  async getLowStockMaterials(): Promise<LowStockResponseDto[]> {
    const docs = await this.materialModel
      .find({
        isActive: true,
        $expr: { $lte: ['$stockQuantity', '$reorderLevel'] },
      })
      .populate<{ supplierId: SupplierDocument | null }>(
        'supplierId',
        'name phone',
      )
      .sort({ stockQuantity: 1 });

    return docs.map((doc) => {
      const supplierField = doc.supplierId as unknown;
      let supplier: LowStockResponseDto['supplier'] = null;
      if (
        supplierField &&
        typeof supplierField === 'object' &&
        '_id' in (supplierField as Record<string, unknown>)
      ) {
        const ref = supplierField as SupplierDocument;
        supplier = {
          id: (ref._id as Types.ObjectId).toString(),
          name: ref.name,
          phone: ref.phone,
        };
      }
      return {
        materialId: (doc._id as Types.ObjectId).toString(),
        materialCode: doc.code,
        materialName: doc.name,
        stockQuantity: doc.stockQuantity,
        reorderLevel: doc.reorderLevel,
        unit: doc.unit,
        supplier,
      };
    });
  }

  /**
   * Internal helper — Invoice service (#20) inject để trừ kho trong cùng transaction của Invoice PAID.
   *
   * KHÔNG validate material exists (Invoice đã pre-validate qua BOM).
   * KHÔNG throw nếu stock không đủ — quyết định đã chốt: cho phép âm, admin kiểm kê sau.
   *
   * @param session — ClientSession của Invoice transaction
   */
  async deductForInvoice(
    materialId: Types.ObjectId,
    quantity: number,
    reason: string,
    invoiceId: Types.ObjectId,
    currentUser: AuthenticatedUser,
    session: ClientSession,
  ): Promise<void> {
    const material = await this.materialModel
      .findById(materialId)
      .session(session);
    if (!material) {
      throw new BadRequestException({
        code: ERROR_CODES.STOCK_MATERIAL_INVALID,
        message: 'Material không tồn tại khi trừ kho invoice',
      });
    }

    const stockBefore = material.stockQuantity;
    const stockAfter = stockBefore - quantity;

    await this.materialModel.updateOne(
      { _id: material._id },
      { $inc: { stockQuantity: -quantity } },
      { session },
    );

    await this.stockLedgerModel.create(
      [
        {
          materialId,
          materialCode: material.code,
          materialName: material.name,
          materialUnit: material.unit,
          transactionType: StockTransactionType.OUT_INVOICE,
          quantityChange: -quantity,
          stockBefore,
          stockAfter,
          referenceType: StockReferenceType.INVOICE,
          referenceId: invoiceId,
          performedBy: new Types.ObjectId(currentUser.id),
          performedByName: currentUser.email,
          reason,
        },
      ],
      { session },
    );
  }

  private buildFilter(query: QueryLedgerDto): Record<string, unknown> {
    const filter: Record<string, unknown> = {};
    if (query.materialId)
      filter.materialId = new Types.ObjectId(query.materialId);
    if (query.transactionType) filter.transactionType = query.transactionType;
    if (query.referenceType) filter.referenceType = query.referenceType;
    if (query.fromDate || query.toDate) {
      const range: Record<string, Date> = {};
      if (query.fromDate) range.$gte = new Date(query.fromDate);
      if (query.toDate) range.$lte = new Date(query.toDate);
      filter.created_at = range;
    }
    return filter;
  }

  private mapToResponse(doc: StockLedgerDocument): LedgerResponseDto {
    return {
      id: (doc._id as Types.ObjectId).toString(),
      materialId: (doc.materialId as Types.ObjectId).toString(),
      materialCode: doc.materialCode,
      materialName: doc.materialName,
      materialUnit: doc.materialUnit,
      transactionType: doc.transactionType,
      quantityChange: doc.quantityChange,
      stockBefore: doc.stockBefore,
      stockAfter: doc.stockAfter,
      supplierId: doc.supplierId
        ? (doc.supplierId as Types.ObjectId).toString()
        : null,
      supplierName: doc.supplierName ?? null,
      unitPrice: doc.unitPrice ?? null,
      totalCost: doc.totalCost ?? null,
      referenceType: doc.referenceType ?? null,
      referenceId: doc.referenceId
        ? (doc.referenceId as Types.ObjectId).toString()
        : null,
      performedBy: (doc.performedBy as Types.ObjectId).toString(),
      performedByName: doc.performedByName,
      reason: doc.reason ?? '',
      createdAt: doc.created_at?.toISOString() ?? '',
    };
  }
}
