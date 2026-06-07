// Chi tiết hoá đơn + hành động theo status.
import { useEffect, useState } from 'react';
import {
	Modal,
	Tag,
	Table,
	Button,
	Input,
	Form,
	Popconfirm,
	Divider,
	message,
} from 'antd';
import { CheckCircle2, CreditCard, XCircle, Save, Package, Printer } from 'lucide-react';
import { INVOICE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from '@/services/Invoices/constant';
import { fmtQty } from '@/services/Materials/constant';
import * as ledgerApi from '@/services/StockLedger/api';
import * as invoiceApi from '@/services/Invoices/api';

type Props = {
	open: boolean;
	invoice: InvoiceMgmt.IInvoice | null;
	loading?: boolean;
	onCancel: () => void;
	onUpdate: (id: string, payload: InvoiceMgmt.IUpdatePayload) => Promise<any>;
	onFinalize: (id: string) => Promise<any>;
	onMarkPaid: (id: string) => Promise<any>;
	onCancelInvoice: (id: string, reason: string) => Promise<any>;
	onAfterAction: () => void;
};

const fmtVnd = (v?: number | null) => (v != null ? `${v.toLocaleString('vi-VN')}đ` : '—');
const fmtTime = (v?: string | null) => (v ? new Date(v).toLocaleString('vi-VN') : '—');

export default function InvoiceDetailModal({
	open,
	invoice,
	loading,
	onCancel,
	onUpdate,
	onFinalize,
	onMarkPaid,
	onCancelInvoice,
	onAfterAction,
}: Props) {
	const [form] = Form.useForm();
	const [cancelReason, setCancelReason] = useState('');
	const [cancelOpen, setCancelOpen] = useState(false);
	const [stockEntries, setStockEntries] = useState<StockLedger.ILedgerEntry[]>([]);
	const [loadingStock, setLoadingStock] = useState(false);
	const [exportingPdf, setExportingPdf] = useState(false);

	useEffect(() => {
		if (!open || !invoice || !invoice.stockDeducted) {
			setStockEntries([]);
			return;
		}
		setLoadingStock(true);
		ledgerApi
			.getLedgerByReference('INVOICE', invoice.id)
			.then((r) => setStockEntries(r.data ?? []))
			.catch(() => setStockEntries([]))
			.finally(() => setLoadingStock(false));
	}, [open, invoice]);

	useEffect(() => {
		if (open && invoice) {
			form.setFieldsValue({ note: invoice.note });
			setCancelReason('');
			setCancelOpen(false);
		}
	}, [open, invoice, form]);

	if (!invoice) return null;

	const statusOpt = INVOICE_STATUS_OPTIONS.find((s) => s.value === invoice.status);
	const isDraft = invoice.status === 'DRAFT';
	const isPending = invoice.status === 'PENDING_PAYMENT';
	const isPaid = invoice.status === 'PAID';
	const canCancel = isDraft || isPending;

	// Xuất hoá đơn PDF để in bill — chỉ sau khi đã xác nhận thanh toán.
	const handleExportPdf = async () => {
		setExportingPdf(true);
		try {
			await invoiceApi.exportInvoicePdf(invoice.id, invoice.invoiceCode);
		} catch {
			message.error('Xuất PDF hoá đơn thất bại');
		} finally {
			setExportingPdf(false);
		}
	};

	const handleSave = async () => {
		const values = await form.validateFields();
		const r = await onUpdate(invoice.id, {
			note: values.note ?? '',
		});
		if (r) onAfterAction();
	};

	const handleFinalize = async () => {
		const r = await onFinalize(invoice.id);
		if (r) onAfterAction();
	};

	const handleMarkPaid = async () => {
		const r = await onMarkPaid(invoice.id);
		if (r) onAfterAction();
	};

	const handleCancel = async () => {
		if (!cancelReason.trim()) return;
		const r = await onCancelInvoice(invoice.id, cancelReason.trim());
		if (r) onAfterAction();
	};

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<span style={{ fontWeight: 600 }}>{invoice.invoiceCode}</span>
					<Tag color={statusOpt?.color}>{statusOpt?.label}</Tag>
				</div>
			}
			visible={open}
			centered
			width={920}
			className='invoice-detail-modal'
			onCancel={onCancel}
			footer={
				<div className='inv-footer' style={{ display: 'flex', justifyContent: 'space-between' }}>
					<div>
						{canCancel && (
							<Button danger icon={<XCircle size={14} />} onClick={() => setCancelOpen(true)}>
								Huỷ hoá đơn
							</Button>
						)}
					</div>
					<div style={{ display: 'flex', gap: 8 }}>
						<Button onClick={onCancel}>Đóng</Button>
						{isDraft && (
							<>
								<Button
									icon={<Save size={14} />}
									onClick={handleSave}
									loading={loading}
								>
									Lưu thay đổi
								</Button>
								<Button
									type='primary'
									icon={<CheckCircle2 size={14} />}
									onClick={handleFinalize}
									loading={loading}
									style={{ background: '#D97706', borderColor: '#D97706' }}
								>
									Chốt hoá đơn
								</Button>
							</>
						)}
						{isPending && (
							<Button
								type='primary'
								icon={<CreditCard size={14} />}
								onClick={handleMarkPaid}
								loading={loading}
								style={{ background: '#059669', borderColor: '#059669' }}
							>
								Ghi nhận thanh toán (tiền mặt)
							</Button>
						)}
						{isPaid && (
							<Button
								type='primary'
								icon={<Printer size={14} />}
								onClick={handleExportPdf}
								loading={exportingPdf}
							>
								In hoá đơn (PDF)
							</Button>
						)}
					</div>
				</div>
			}
		>
			<div className='inv-grid-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
				<div>
					<div style={{ color: '#6B7280' }}>Khách hàng</div>
					<div style={{ fontWeight: 500 }}>{invoice.customerSnapshot.fullName}</div>
					<div style={{ color: '#6B7280', fontSize: 12 }}>
						{invoice.customerSnapshot.phone}
						{invoice.customerSnapshot.email ? ` · ${invoice.customerSnapshot.email}` : ''}
					</div>
				</div>
				<div>
					<div style={{ color: '#6B7280' }}>Tạo bởi</div>
					<div>{invoice.createdByName}</div>
					<div style={{ color: '#6B7280', fontSize: 12 }}>{fmtTime(invoice.createdAt)}</div>
				</div>
				{invoice.paidAt && (
					<div>
						<div style={{ color: '#6B7280' }}>Thanh toán</div>
						<div>
							{invoice.paidByName} —{' '}
							{PAYMENT_METHOD_OPTIONS.find((m) => m.value === invoice.paymentMethod)?.label ??
								invoice.paymentMethod}
						</div>
						<div style={{ color: '#6B7280', fontSize: 12 }}>{fmtTime(invoice.paidAt)}</div>
					</div>
				)}
				{invoice.cancelledAt && (
					<div>
						<div style={{ color: '#6B7280' }}>Huỷ</div>
						<div style={{ color: '#DC2626' }}>{invoice.cancelReason}</div>
						<div style={{ color: '#6B7280', fontSize: 12 }}>{fmtTime(invoice.cancelledAt)}</div>
					</div>
				)}
			</div>

			<Divider style={{ margin: '14px 0' }} />

			<Table
				rowKey='id'
				size='small'
				dataSource={invoice.items}
				pagination={false}
				scroll={{ x: 720 }}
				columns={[
					{ title: 'Dịch vụ', dataIndex: 'serviceName', width: 180, ellipsis: true },
					{ title: 'NV', dataIndex: 'staffName', width: 130, ellipsis: true },
					{ title: 'SL', dataIndex: 'quantity', width: 60, align: 'center' as const },
					{
						title: 'Đơn giá',
						dataIndex: 'unitPrice',
						width: 110,
						align: 'right' as const,
						render: fmtVnd,
					},
					{
						title: 'Thành tiền',
						dataIndex: 'subtotal',
						width: 120,
						align: 'right' as const,
						render: (v: number) => <strong>{fmtVnd(v)}</strong>,
					},
					{
						title: 'Hoa hồng',
						dataIndex: 'commissionAmount',
						width: 110,
						align: 'right' as const,
						render: (v: number, r: InvoiceMgmt.IItem) => `${fmtVnd(v)} (${r.commissionRate}%)`,
					},
				]}
			/>

			<Divider style={{ margin: '14px 0' }} />

			<div className='inv-grid-2' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
				<Form form={form} layout='vertical' disabled={!isDraft}>
					<Form.Item name='note' label='Ghi chú'>
						<Input.TextArea rows={3} maxLength={500} />
					</Form.Item>
				</Form>

				<div
					style={{
						background: '#FAFBFD',
						borderRadius: 10,
						padding: 14,
						fontSize: 13,
					}}
				>
					<Row label='Tạm tính dịch vụ' value={fmtVnd(invoice.itemsSubtotal)} />
					<Row label='Phụ thu' value={fmtVnd(invoice.extraCharge)} />
					{invoice.discountAmount > 0 && (
						<Row label='Giảm giá' value={`- ${fmtVnd(invoice.discountAmount)}`} negative />
					)}
					<Divider style={{ margin: '8px 0' }} />
					<Row
						label={<strong>Tổng thanh toán</strong>}
						value={
							<strong style={{ fontSize: 16, color: '#059669' }}>
								{fmtVnd(invoice.totalAmount)}
							</strong>
						}
					/>
					{invoice.stockDeducted && (
						<div style={{ marginTop: 10, color: '#059669', fontSize: 12 }}>
							✓ Đã trừ tồn kho theo BOM
						</div>
					)}
				</div>
			</div>

			{invoice.stockDeducted && (
				<>
					<Divider style={{ margin: '14px 0' }} />
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							marginBottom: 8,
							fontSize: 13,
							fontWeight: 500,
						}}
					>
						<Package size={14} color='#059669' />
						<span>Lịch sử trừ kho theo BOM</span>
						<span style={{ color: '#6B7280', fontWeight: 400 }}>
							({stockEntries.length} dòng)
						</span>
					</div>
					<Table
						rowKey='id'
						size='small'
						loading={loadingStock}
						dataSource={stockEntries}
						pagination={false}
						scroll={{ x: 440 }}
						columns={[
							{ title: 'Vật liệu', dataIndex: 'materialName', width: 160, ellipsis: true },
							{
								title: 'Mã',
								dataIndex: 'materialCode',
								width: 110,
								render: (v: string) => <code style={{ fontSize: 11 }}>{v}</code>,
							},
							{
								title: 'SL',
								dataIndex: 'quantityChange',
								width: 90,
								align: 'center' as const,
								render: (v: number, r: StockLedger.ILedgerEntry) => (
									<span style={{ color: '#DC2626', fontWeight: 600 }}>
										{fmtQty(v)} {r.materialUnit}
									</span>
								),
							},
							{
								title: 'Tồn sau',
								dataIndex: 'stockAfter',
								width: 80,
								align: 'center' as const,
								render: fmtQty,
							},
						]}
					/>
				</>
			)}

			<Modal
				title='Huỷ hoá đơn'
				visible={cancelOpen}
				centered
				onCancel={() => setCancelOpen(false)}
				onOk={handleCancel}
				okButtonProps={{ danger: true, disabled: !cancelReason.trim(), loading }}
				okText='Xác nhận huỷ'
				cancelText='Đóng'
			>
				<div style={{ marginBottom: 8 }}>Lý do huỷ (bắt buộc):</div>
				<Input.TextArea
					rows={3}
					value={cancelReason}
					onChange={(e) => setCancelReason(e.target.value)}
					placeholder='VD: Khách đổi ý không lấy dịch vụ'
					maxLength={500}
				/>
			</Modal>
		</Modal>
	);
}

function Row({
	label,
	value,
	negative,
}: {
	label: React.ReactNode;
	value: React.ReactNode;
	negative?: boolean;
}) {
	return (
		<div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
			<span style={{ color: '#6B7280' }}>{label}</span>
			<span style={{ color: negative ? '#DC2626' : '#1F2937' }}>{value}</span>
		</div>
	);
}
