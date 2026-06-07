import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createRequire } from 'module';
import * as path from 'path';
import type {
  Content,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { InvoiceResponseDto } from '../invoice/dto/invoice-response.dto';
import { PayrollResponseDto } from '../payroll/dto/payroll-response.dto';
import { RevenueReportDto } from '../reports/dto/report-response.dto';

const nodeRequire = createRequire(__filename);
const PDFMAKE_ROOT = path.dirname(nodeRequire.resolve('pdfmake/package.json'));
const PDFMAKE_ROOT_NORMALIZED = path.resolve(PDFMAKE_ROOT).toLowerCase();
const pdfMake = nodeRequire('pdfmake') as typeof import('pdfmake');

const INVOICE_STATUS_LABELS: Record<string, string> = {
  CANCELLED: 'Đã hủy',
  DRAFT: 'Nháp',
  PAID: 'Đã thanh toán',
  PENDING_PAYMENT: 'Chờ thanh toán',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Tiền mặt',
  VNPAY: 'VNPay',
};

const PAYROLL_STATUS_LABELS: Record<string, string> = {
  CANCELLED: 'Đã hủy',
  FINALIZED: 'Đã chốt',
  PAID: 'Đã chi trả',
};

const STAFF_ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  OPERATOR: 'Nhân viên vận hành',
  STAFF: 'Chuyên viên',
};

interface PdfBuildOptions {
  exportedBy?: AuthenticatedUser | null;
}

interface PdfSignatureOptions {
  preparedByName?: string | null;
  approvedByName?: string | null;
}

@Injectable()
export class PdfService {
  private static fontsConfigured = false;

  constructor() {
    this.configureFonts();
  }

  async buildRevenuePdf(
    report: RevenueReportDto,
    options?: PdfBuildOptions,
  ): Promise<Buffer> {
    const exportedByName = this.resolveUserDisplayName(options?.exportedBy);
    const body = [
      this.tableHeader(['STT', 'Dịch vụ', 'Số lượt', 'Doanh thu']),
      ...report.breakdown.map((row, index) => [
        String(index + 1),
        row.serviceName,
        this.formatNumber(row.count),
        this.formatMoney(row.revenue),
      ]),
    ];

    if (report.breakdown.length === 0) {
      body.push(this.emptyRow(4, 'Không có dữ liệu doanh thu trong kỳ.'));
    }

    return this.renderPdf(
      this.baseDocument(
        'Báo cáo doanh thu',
        [
          { text: 'BÁO CÁO DOANH THU', style: 'title' },
          this.keyValueTable([
            ['Từ ngày', this.formatDateOnly(report.period.fromDate)],
            ['Đến ngày', this.formatDateOnly(report.period.toDate)],
            ['Dịch vụ lọc', report.serviceId ?? 'Tất cả'],
            ['Số hóa đơn đã thanh toán', this.formatNumber(report.invoiceCount)],
            ['Tổng doanh thu', this.formatMoney(report.totalRevenue)],
          ]),
          { text: 'Chi tiết theo dịch vụ', style: 'sectionTitle' },
          this.dataTable(['auto', '*', 'auto', 'auto'], body),
          {
            text: this.getRevenuePdfNote(report),
            style: 'note',
          },
        ],
        {
          preparedByName: exportedByName,
          approvedByName: exportedByName,
        },
      ),
    );
  }

  async buildInvoicePdf(
    invoice: InvoiceResponseDto,
    options?: PdfBuildOptions,
  ): Promise<Buffer> {
    const exportedByName = this.resolveUserDisplayName(options?.exportedBy);
    const body = [
      this.tableHeader([
        'STT',
        'Dịch vụ',
        'Nhân viên',
        'SL',
        'Đơn giá',
        'Tạm tính',
      ]),
      ...invoice.items.map((item, index) => [
        String(index + 1),
        item.serviceName,
        item.staffName,
        this.formatNumber(item.quantity),
        this.formatMoney(item.unitPrice),
        this.formatMoney(item.subtotal),
      ]),
    ];

    if (invoice.items.length === 0) {
      body.push(this.emptyRow(6, 'Hóa đơn chưa có dòng dịch vụ.'));
    }

    return this.renderPdf(
      this.baseDocument(
        `Hóa đơn ${invoice.invoiceCode}`,
        [
          { text: 'HÓA ĐƠN DỊCH VỤ', style: 'title' },
          this.keyValueTable([
            ['Mã hóa đơn', invoice.invoiceCode],
            ['Trạng thái', this.translateInvoiceStatus(invoice.status)],
            ['Khách hàng', invoice.customerSnapshot.fullName],
            ['Số điện thoại', invoice.customerSnapshot.phone],
            ['Email', invoice.customerSnapshot.email || '-'],
            ['Ngày tạo', this.formatDateTime(invoice.createdAt)],
            ['Ngày thanh toán', this.formatDateTime(invoice.paidAt)],
            [
              'Phương thức thanh toán',
              this.translatePaymentMethod(invoice.paymentMethod),
            ],
            ['Người tạo', invoice.createdByName],
            ['Người thu tiền', invoice.paidByName ?? '-'],
          ]),
          { text: 'Chi tiết dịch vụ', style: 'sectionTitle' },
          this.dataTable(['auto', '*', '*', 'auto', 'auto', 'auto'], body),
          this.summaryTable([
            ['Tạm tính', this.formatMoney(invoice.itemsSubtotal)],
            ['Phụ thu', this.formatMoney(invoice.extraCharge)],
            ['Giảm giá', this.formatMoney(invoice.discountAmount)],
            ['Tổng thanh toán', this.formatMoney(invoice.totalAmount)],
          ]),
          ...this.optionalNote(invoice.note),
        ],
        {
          preparedByName: invoice.createdByName || exportedByName,
          approvedByName: invoice.paidByName,
        },
      ),
    );
  }

  async buildPayrollPdf(
    payroll: PayrollResponseDto,
    options?: PdfBuildOptions,
  ): Promise<Buffer> {
    const exportedByName = this.resolveUserDisplayName(options?.exportedBy);
    const body = [
      this.tableHeader(['STT', 'Dịch vụ', 'Số lượt', 'Hoa hồng']),
      ...payroll.commissionBreakdown.map((row, index) => [
        String(index + 1),
        row.serviceName,
        this.formatNumber(row.serviceCount),
        this.formatMoney(row.totalCommission),
      ]),
    ];

    if (payroll.commissionBreakdown.length === 0) {
      body.push(this.emptyRow(4, 'Không có hoa hồng trong kỳ lương này.'));
    }

    return this.renderPdf(
      this.baseDocument(
        `Phiếu lương ${payroll.payrollCode}`,
        [
          { text: 'PHIẾU LƯƠNG NHÂN VIÊN', style: 'title' },
          this.keyValueTable([
            ['Mã phiếu', payroll.payrollCode],
            ['Kỳ lương', `${payroll.periodMonth}/${payroll.periodYear}`],
            ['Nhân viên', payroll.staffSnapshot.fullName],
            ['Vai trò', this.translateStaffRole(payroll.staffSnapshot.role)],
            ['Trạng thái', this.translatePayrollStatus(payroll.status)],
            ['Số hóa đơn nguồn', this.formatNumber(payroll.invoiceCount)],
            ['Ngày chốt', this.formatDateTime(payroll.finalizedAt)],
            ['Ngày chi trả', this.formatDateTime(payroll.paidAt)],
            ['Người chốt', payroll.finalizedByName],
          ]),
          { text: 'Chi tiết hoa hồng theo dịch vụ', style: 'sectionTitle' },
          this.dataTable(['auto', '*', 'auto', 'auto'], body),
          this.summaryTable([
            ['Lương cơ bản', this.formatMoney(payroll.baseSalary)],
            ['Tổng hoa hồng', this.formatMoney(payroll.totalCommission)],
            ['Điều chỉnh', this.formatMoney(payroll.adjustment)],
            ['Tổng thu nhập', this.formatMoney(payroll.totalIncome)],
          ]),
          ...this.optionalNote(payroll.note),
        ],
        {
          preparedByName: payroll.finalizedByName || exportedByName,
          approvedByName: payroll.finalizedByName,
        },
      ),
    );
  }

  private configureFonts(): void {
    if (PdfService.fontsConfigured) {
      return;
    }

    pdfMake.setFonts({
      Roboto: {
        normal: path.join(PDFMAKE_ROOT, 'fonts/Roboto/Roboto-Regular.ttf'),
        bold: path.join(PDFMAKE_ROOT, 'fonts/Roboto/Roboto-Medium.ttf'),
        italics: path.join(PDFMAKE_ROOT, 'fonts/Roboto/Roboto-Italic.ttf'),
        bolditalics: path.join(
          PDFMAKE_ROOT,
          'fonts/Roboto/Roboto-MediumItalic.ttf',
        ),
      },
    });
    pdfMake.setLocalAccessPolicy((requestedPath) =>
      path
        .resolve(requestedPath)
        .toLowerCase()
        .startsWith(PDFMAKE_ROOT_NORMALIZED),
    );
    pdfMake.setUrlAccessPolicy(() => false);

    PdfService.fontsConfigured = true;
  }

  private async renderPdf(
    documentDefinition: TDocumentDefinitions,
  ): Promise<Buffer> {
    try {
      const buffer = await pdfMake.createPdf(documentDefinition).getBuffer();

      if (!buffer || buffer.length === 0) {
        throw new Error('Empty PDF buffer');
      }

      return buffer;
    } catch (error) {
      throw this.createPdfFailedException(error);
    }
  }

  private baseDocument(
    title: string,
    content: Content[],
    signature?: PdfSignatureOptions,
  ): TDocumentDefinitions {
    const exportedAt = new Date().toISOString();

    return {
      pageSize: 'A4',
      pageMargins: [40, 48, 40, 48],
      info: {
        title,
        author: 'Lunar Spa',
        creator: 'Lunar Spa Management',
      },
      footer: (currentPage, pageCount) => ({
        columns: [
          { text: `Trang ${currentPage}/${pageCount}`, alignment: 'left' },
          {
            text: `Xuất lúc ${this.formatDateTime(exportedAt)}`,
            alignment: 'right',
          },
        ],
        margin: [40, 0, 40, 0],
        fontSize: 8,
        color: '#6b7280',
      }),
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        lineHeight: 1.2,
      },
      styles: {
        brand: {
          alignment: 'center',
          bold: true,
          color: '#8b5cf6',
          fontSize: 11,
          margin: [0, 0, 0, 4],
        },
        title: {
          alignment: 'center',
          bold: true,
          fontSize: 18,
          margin: [0, 0, 0, 16],
        },
        sectionTitle: {
          bold: true,
          fontSize: 12,
          margin: [0, 14, 0, 6],
        },
        tableHeader: {
          bold: true,
          color: '#111827',
          fillColor: '#f3f4f6',
        },
        totalLabel: {
          bold: true,
        },
        totalValue: {
          alignment: 'right',
          bold: true,
        },
        note: {
          color: '#6b7280',
          italics: true,
          margin: [0, 10, 0, 0],
        },
      },
      content: [
        { text: 'LUNAR SPA', style: 'brand' },
        ...content,
        this.signatureBlock(signature),
      ],
    };
  }

  private signatureBlock(signature?: PdfSignatureOptions): Content {
    return {
      columns: [
        this.signatureColumn('Người lập phiếu', signature?.preparedByName),
        this.signatureColumn('Người duyệt', signature?.approvedByName),
      ],
      margin: [0, 30, 0, 0],
    };
  }

  private signatureColumn(label: string, name?: string | null): Content {
    return {
      stack: [
        { text: label, alignment: 'center' },
        {
          text: this.formatOptionalText(name),
          alignment: 'center',
          bold: Boolean(name?.trim()),
          margin: [0, 32, 0, 0],
        },
      ],
    };
  }

  private keyValueTable(rows: Array<[string, string]>): Content {
    return {
      table: {
        widths: ['auto', '*'],
        body: rows.map(([label, value]) => [
          { text: label, bold: true, fillColor: '#f9fafb' },
          value,
        ]),
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };
  }

  private dataTable(widths: string[], body: TableCell[][]): Content {
    return {
      table: {
        headerRows: 1,
        widths,
        body,
      },
      layout: 'lightHorizontalLines',
    };
  }

  private summaryTable(rows: Array<[string, string]>): Content {
    return {
      table: {
        widths: ['*', 'auto'],
        body: rows.map(([label, value], index) => [
          {
            text: label,
            style: index === rows.length - 1 ? 'totalLabel' : undefined,
          },
          {
            text: value,
            style: index === rows.length - 1 ? 'totalValue' : undefined,
            alignment: 'right',
          },
        ]),
      },
      layout: 'lightHorizontalLines',
      margin: [0, 12, 0, 0],
    };
  }

  private optionalNote(note?: string | null): Content[] {
    const cleanedNote = note?.trim();
    if (!cleanedNote) {
      return [];
    }

    return [{ text: `Ghi chú: ${cleanedNote}`, style: 'note' }];
  }

  private getRevenuePdfNote(report: RevenueReportDto): string {
    if (!report.note?.trim()) {
      return '';
    }

    return 'Lưu ý: Doanh thu từng dịch vụ chưa phân bổ giảm giá toàn hóa đơn, nên tổng chi tiết có thể khác tổng doanh thu đã thanh toán.';
  }

  private resolveUserDisplayName(
    user?: Pick<AuthenticatedUser, 'email' | 'fullName'> | null,
  ): string | null {
    return user?.fullName?.trim() || user?.email?.trim() || null;
  }

  private formatOptionalText(value?: string | null): string {
    return value?.trim() || '-';
  }

  private tableHeader(headers: string[]): TableCell[] {
    return headers.map((header) => ({ text: header, style: 'tableHeader' }));
  }

  private emptyRow(colSpan: number, message: string): TableCell[] {
    return [
      {
        text: message,
        colSpan,
        alignment: 'center',
        color: '#6b7280',
        italics: true,
      },
      ...Array.from({ length: colSpan - 1 }, () => ''),
    ];
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      currency: 'VND',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(value);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  private formatDateOnly(value?: string | null): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
    }).format(date);
  }

  private formatDateTime(value?: string | null): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
    }).format(date);
  }

  private translateInvoiceStatus(value?: string | null): string {
    return this.translateLabel(value, INVOICE_STATUS_LABELS);
  }

  private translatePaymentMethod(value?: string | null): string {
    return this.translateLabel(value, PAYMENT_METHOD_LABELS);
  }

  private translatePayrollStatus(value?: string | null): string {
    return this.translateLabel(value, PAYROLL_STATUS_LABELS);
  }

  private translateStaffRole(value?: string | null): string {
    return this.translateLabel(value, STAFF_ROLE_LABELS);
  }

  private translateLabel(
    value: string | null | undefined,
    labels: Record<string, string>,
  ): string {
    if (!value) {
      return '-';
    }

    const normalizedValue = value
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return labels[normalizedValue] ?? value;
  }

  private createPdfFailedException(
    error: unknown,
  ): InternalServerErrorException {
    const details = this.getErrorDetails(error);

    return new InternalServerErrorException({
      code: ERROR_CODES.PDF_GENERATION_FAILED,
      message: 'Tạo file PDF thất bại',
      ...(details && { details }),
    });
  }

  private getErrorDetails(error: unknown): { message: string } | undefined {
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return { message: (error as { message: string }).message };
    }

    return undefined;
  }
}
