// Lịch sử kho — ADMIN. 2 chế độ:
//  - "Theo phiếu" (mặc định): gộp các dòng ledger cùng referenceId thành 1 PHIẾU,
//    expandable xem danh sách vật liệu. Xuất theo HĐ map ra mã hoá đơn. Gộp + phân
//    trang ở CLIENT (fetch 1 batch lớn) — KHÔNG sửa backend.
//  - "Sổ kho": bảng phẳng từng dòng (audit chi tiết) như cũ, phân trang server.
import { useEffect, useMemo, useState } from 'react';
import { Table, Select, DatePicker, Tag, Tooltip, Row, Col, Card, Tabs, Button, Modal, Descriptions, Dropdown, Menu } from 'antd';
import { useModel } from 'umi';
import moment from 'moment';
import { ArrowDownToLine, ArrowUpFromLine, Wrench, Receipt, Package, MoreHorizontal, Eye } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import {
	TRANSACTION_TYPE_OPTIONS,
	REFERENCE_TYPE_LABEL,
	DEFAULT_PAGE_SIZE,
} from '@/services/StockLedger/constant';
import { fmtQty } from '@/services/Materials/constant';
import * as invoicesApi from '@/services/Invoices/api';
import '@/pages/admin/Employees/styles.less';

const { RangePicker } = DatePicker;

// Số dòng fetch về để gộp phiếu. BE giới hạn MAX_LIMIT = 100 (cả ledger lẫn invoices)
// → tối đa 100; muốn xem kỳ rộng hơn thì lọc theo khoảng ngày.
const RECEIPT_BATCH = 100;

const fmtVnd = (v?: number | null) => (v != null ? `${v.toLocaleString('vi-VN')}đ` : '0đ');

type ReceiptGroup = {
	key: string;
	createdAt: string;
	transactionType: StockLedger.TTransactionType;
	referenceType: StockLedger.TReferenceType | null;
	referenceId: string | null;
	performedByName: string;
	count: number;
	totalCost: number | null;
	invoiceCode?: string;
	items: StockLedger.ILedgerEntry[];
};

export default function StockLedgerPage() {
	const { list, total, loading, summary, query, fetch, fetchSummary } = useModel(
		'stockLedger',
	) as any;
	const { list: materials, fetch: fetchMaterials } = useModel('materials') as any;

	const [viewMode, setViewMode] = useState<'receipt' | 'ledger'>('receipt');
	const [materialId, setMaterialId] = useState<string | undefined>();
	const [txType, setTxType] = useState<StockLedger.TTransactionType | undefined>();
	const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
	const [groupPage, setGroupPage] = useState(1);
	const [invoiceCodeMap, setInvoiceCodeMap] = useState<Record<string, string>>({});
	const [detailReceipt, setDetailReceipt] = useState<ReceiptGroup | null>(null);

	// Tham số lọc dùng chung cho cả 2 chế độ.
	const filterQuery = useMemo(() => {
		const q: Partial<StockLedger.IQuery> = {};
		if (materialId) q.materialId = materialId;
		if (txType) q.transactionType = txType;
		if (dateRange?.[0]) q.fromDate = dateRange[0].startOf('day').toISOString();
		if (dateRange?.[1]) q.toDate = dateRange[1].endOf('day').toISOString();
		return q;
	}, [materialId, txType, dateRange]);

	// Nạp ledger theo chế độ: phiếu → batch lớn để gộp; sổ kho → phân trang server.
	useEffect(() => {
		const limit = viewMode === 'receipt' ? RECEIPT_BATCH : DEFAULT_PAGE_SIZE;
		fetch({ ...filterQuery, limit, page: 1 });
		fetchSummary(filterQuery.fromDate, filterQuery.toDate);
		setGroupPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [viewMode, filterQuery]);

	useEffect(() => {
		fetchMaterials({ limit: 100 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Map referenceId(=invoiceId) → mã HĐ, để phiếu "Xuất theo HĐ" hiện đúng mã.
	// FE-only: gọi sẵn danh sách hoá đơn gần đây, không đụng backend.
	useEffect(() => {
		if (viewMode !== 'receipt') return;
		let alive = true;
		invoicesApi
			.getInvoices({ limit: RECEIPT_BATCH })
			.then((r) => {
				if (!alive) return;
				const m: Record<string, string> = {};
				for (const inv of r.items) m[inv.id] = inv.invoiceCode;
				setInvoiceCodeMap(m);
			})
			.catch(() => {});
		return () => {
			alive = false;
		};
	}, [viewMode]);

	// Gộp ledger thành phiếu theo referenceId (fallback id nếu null).
	const receipts = useMemo<ReceiptGroup[]>(() => {
		const map = new Map<string, StockLedger.ILedgerEntry[]>();
		for (const e of list as StockLedger.ILedgerEntry[]) {
			const key = e.referenceId ?? e.id;
			const arr = map.get(key);
			if (arr) arr.push(e);
			else map.set(key, [e]);
		}
		const groups: ReceiptGroup[] = Array.from(map.entries()).map(([key, items]) => {
			const first = items[0];
			const hasCost = items.some((x) => x.totalCost != null);
			const totalCost = items.reduce((s, x) => s + (x.totalCost ?? 0), 0);
			return {
				key,
				createdAt: first.createdAt,
				transactionType: first.transactionType,
				referenceType: first.referenceType,
				referenceId: first.referenceId,
				performedByName: first.performedByName,
				count: items.length,
				totalCost: hasCost ? totalCost : null,
				invoiceCode:
					first.referenceType === 'INVOICE' && first.referenceId
						? invoiceCodeMap[first.referenceId]
						: undefined,
				items,
			};
		});
		groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		return groups;
	}, [list, invoiceCodeMap]);

	const pagedReceipts = useMemo(
		() => receipts.slice((groupPage - 1) * DEFAULT_PAGE_SIZE, groupPage * DEFAULT_PAGE_SIZE),
		[receipts, groupPage],
	);

	const summaryCards = useMemo(() => {
		const s: StockLedger.ISummary | null = summary;
		return [
			{ key: 'in', label: 'Nhập kho', icon: <ArrowDownToLine size={20} color='#059669' />, bg: '#ECFDF5', count: s?.totalIn.count ?? 0, quantity: s?.totalIn.quantity ?? 0, cost: s?.totalIn.cost ?? 0 },
			{ key: 'out-invoice', label: 'Xuất theo HĐ', icon: <Receipt size={20} color='#2563EB' />, bg: '#EFF6FF', count: s?.totalOutInvoice.count ?? 0, quantity: s?.totalOutInvoice.quantity ?? 0, cost: s?.totalOutInvoice.cost ?? 0 },
			{ key: 'out-manual', label: 'Xuất thủ công', icon: <ArrowUpFromLine size={20} color='#DC2626' />, bg: '#FEF2F2', count: s?.totalOutManual.count ?? 0, quantity: s?.totalOutManual.quantity ?? 0, cost: s?.totalOutManual.cost ?? 0 },
			{ key: 'adjustment', label: 'Điều chỉnh', icon: <Wrench size={20} color='#D97706' />, bg: '#FEF3C7', count: s?.totalAdjustment.count ?? 0, quantity: s?.totalAdjustment.quantity ?? 0, cost: s?.totalAdjustment.cost ?? 0 },
		];
	}, [summary]);

	const txTag = (v: StockLedger.TTransactionType) => {
		const opt = TRANSACTION_TYPE_OPTIONS.find((t) => t.value === v);
		return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
	};

	// Nhãn tham chiếu phiếu: ưu tiên mã HĐ, sau đó nhãn loại phiếu.
	const refDisplay = (r: ReceiptGroup) =>
		r.invoiceCode
			? `HĐ ${r.invoiceCode}`
			: r.referenceType
			? REFERENCE_TYPE_LABEL[r.referenceType]
			: '—';

	// Cột cho danh sách vật liệu BÊN TRONG 1 phiếu (expandable).
	const itemColumns = [
		{ title: 'Mã VL', dataIndex: 'materialCode', width: 120, render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
		{ title: 'Tên vật liệu', dataIndex: 'materialName', width: 200, ellipsis: true, render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
		{
			title: 'SL thay đổi', dataIndex: 'quantityChange', width: 120, align: 'right' as const,
			render: (v: number, r: StockLedger.ILedgerEntry) => (
				<span style={{ color: v >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>{v >= 0 ? '+' : ''}{fmtQty(v)} {r.materialUnit}</span>
			),
		},
		{ title: 'Tồn trước', dataIndex: 'stockBefore', width: 90, align: 'right' as const, render: fmtQty },
		{ title: 'Tồn sau', dataIndex: 'stockAfter', width: 90, align: 'right' as const, render: (v: number) => <strong>{fmtQty(v)}</strong> },
		{ title: 'Đơn giá', dataIndex: 'unitPrice', width: 110, align: 'right' as const, render: (v: number | null) => (v != null ? fmtVnd(v) : '—') },
		{ title: 'Thành tiền', dataIndex: 'totalCost', width: 120, align: 'right' as const, render: (v: number | null) => (v != null ? <strong>{fmtVnd(v)}</strong> : '—') },
	];

	// Cột cho dòng PHIẾU (cha).
	const receiptColumns = [
		{ title: 'Thời gian', dataIndex: 'createdAt', width: 150, render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm') },
		{ title: 'Loại', dataIndex: 'transactionType', width: 140, render: (v: StockLedger.TTransactionType) => txTag(v) },
		{
			title: 'Phiếu / Tham chiếu', key: 'ref', width: 200, ellipsis: true,
			render: (_: any, r: ReceiptGroup) =>
				r.invoiceCode ? (
					<Tag color='#2563EB'>HĐ {r.invoiceCode}</Tag>
				) : r.referenceType ? (
					<Tag color='#E5E7EB'>{REFERENCE_TYPE_LABEL[r.referenceType]}</Tag>
				) : (
					'—'
				),
		},
		{
			title: 'Số vật liệu', dataIndex: 'count', width: 110, align: 'center' as const,
			render: (v: number) => (
				<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
					<Package size={14} /> {v}
				</span>
			),
		},
		{ title: 'Tổng giá trị', dataIndex: 'totalCost', width: 140, align: 'right' as const, render: (v: number | null) => (v != null ? <strong>{fmtVnd(v)}</strong> : '—') },
		{ title: 'Người thực hiện', dataIndex: 'performedByName', width: 150, ellipsis: true },
		{
			title: 'Thao tác',
			key: 'action',
			width: 90,
			align: 'center' as const,
			fixed: 'right' as const,
			render: (_: any, r: ReceiptGroup) => (
				<Dropdown
					trigger={['click']}
					overlay={
						<Menu>
							<Menu.Item key='detail' icon={<Eye size={14} />} onClick={() => setDetailReceipt(r)}>
								Xem chi tiết
							</Menu.Item>
						</Menu>
					}
				>
					<Tooltip title='Thao tác'>
						<Button type='text' icon={<MoreHorizontal size={18} />} />
					</Tooltip>
				</Dropdown>
			),
		},
	];

	// Cột cho chế độ SỔ KHO (bảng phẳng) — giữ như cũ.
	const ledgerColumns = [
		{ title: 'Thời gian', dataIndex: 'createdAt', width: 150, render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm') },
		{ title: 'Mã VL', dataIndex: 'materialCode', width: 110, render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code> },
		{ title: 'Tên vật liệu', dataIndex: 'materialName', width: 200, ellipsis: true, render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span> },
		{ title: 'Loại', dataIndex: 'transactionType', width: 130, align: 'center' as const, render: (v: StockLedger.TTransactionType) => txTag(v) },
		{
			title: 'SL thay đổi', dataIndex: 'quantityChange', width: 110, align: 'right' as const,
			render: (v: number, r: StockLedger.ILedgerEntry) => (
				<span style={{ color: v >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>{v >= 0 ? '+' : ''}{fmtQty(v)} {r.materialUnit}</span>
			),
		},
		{ title: 'Tồn trước', dataIndex: 'stockBefore', width: 90, align: 'right' as const, render: fmtQty },
		{ title: 'Tồn sau', dataIndex: 'stockAfter', width: 90, align: 'right' as const, render: (v: number) => <strong>{fmtQty(v)}</strong> },
		{ title: 'NCC', dataIndex: 'supplierName', width: 150, ellipsis: true, render: (v: string | null) => v || '—' },
		{ title: 'Đơn giá', dataIndex: 'unitPrice', width: 110, align: 'right' as const, render: (v: number | null) => (v != null ? fmtVnd(v) : '—') },
		{ title: 'Tổng tiền', dataIndex: 'totalCost', width: 120, align: 'right' as const, render: (v: number | null) => (v != null ? <strong>{fmtVnd(v)}</strong> : '—') },
		{ title: 'Nhân viên', dataIndex: 'performedByName', width: 140, ellipsis: true },
		{
			title: 'Lý do / Tham chiếu', dataIndex: 'reason', width: 200, ellipsis: true,
			render: (v: string, r: StockLedger.ILedgerEntry) => (
				<Tooltip title={v}>
					<span>{v || '—'}{r.referenceType && <Tag style={{ marginLeft: 6 }} color='#E5E7EB'>{REFERENCE_TYPE_LABEL[r.referenceType]}</Tag>}</span>
				</Tooltip>
			),
		},
	];

	return (
		<div className='employees-page'>
			<PageHeader title='Lịch sử kho' subtitle='Audit trail mọi giao dịch nhập / xuất vật liệu' />

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				{summaryCards.map((c) => (
					<Col xs={12} md={6} key={c.key}>
						<Card bodyStyle={{ padding: '22px 24px' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
								<div style={{ width: 36, height: 36, background: c.bg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
								<div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
							</div>
							<div style={{ fontSize: 22, fontWeight: 700 }}>{c.count}</div>
							<div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>SL: {c.quantity} · {fmtVnd(c.cost)}</div>
						</Card>
					</Col>
				))}
			</Row>

			{/* Toggle chế độ — dùng Tabs để đồng bộ style pill capsule với các trang khác.
			    TabPane để rỗng, nội dung thật (bảng) render bên dưới theo viewMode. */}
			<Tabs activeKey={viewMode} onChange={(k) => setViewMode(k as 'receipt' | 'ledger')}>
				<Tabs.TabPane tab='Theo phiếu' key='receipt' />
				<Tabs.TabPane tab='Sổ kho' key='ledger' />
			</Tabs>

			<div className='employees-page__toolbar' style={{ marginBottom: 16 }}>
				<Select
					allowClear
					showSearch
					optionFilterProp='label'
					placeholder='Vật liệu'
					style={{ width: 240 }}
					value={materialId}
					options={materials.map((m: any) => ({ value: m.id, label: `${m.code} — ${m.name}` }))}
					onChange={(v) => setMaterialId(v)}
				/>
				<Select
					allowClear
					placeholder='Loại giao dịch'
					style={{ width: 180 }}
					value={txType}
					options={TRANSACTION_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
					onChange={(v) => setTxType(v)}
				/>
				<RangePicker
					value={dateRange as any}
					format='DD/MM/YYYY'
					onChange={(range) => setDateRange(range as any)}
				/>
			</div>

			{viewMode === 'receipt' ? (
				<Table
					rowKey='key'
					loading={loading}
					dataSource={pagedReceipts}
					columns={receiptColumns as any}
					scroll={{ x: 1000 }}
					pagination={{
						current: groupPage,
						pageSize: DEFAULT_PAGE_SIZE,
						total: receipts.length,
						showSizeChanger: false,
						onChange: (page) => setGroupPage(page),
					}}
					className='employees-page__table'
				/>
			) : (
				<Table
					rowKey='id'
					loading={loading}
					dataSource={list}
					columns={ledgerColumns as any}
					scroll={{ x: 1700 }}
					pagination={{
						current: query.page,
						pageSize: query.limit,
						total,
						showSizeChanger: true,
						onChange: (page, limit) => fetch({ ...filterQuery, page, limit }),
					}}
					className='employees-page__table'
				/>
			)}

			<Modal
				visible={!!detailReceipt}
				onCancel={() => setDetailReceipt(null)}
				footer={null}
				width={760}
				centered
				title={
					detailReceipt
						? `Chi tiết phiếu · ${moment(detailReceipt.createdAt).format('DD/MM/YYYY HH:mm')}`
						: 'Chi tiết phiếu'
				}
			>
				{detailReceipt && (
					<>
						<Descriptions size='small' column={{ xs: 1, sm: 2 }} bordered style={{ marginBottom: 16 }}>
							<Descriptions.Item label='Loại'>{txTag(detailReceipt.transactionType)}</Descriptions.Item>
							<Descriptions.Item label='Tham chiếu'>{refDisplay(detailReceipt)}</Descriptions.Item>
							<Descriptions.Item label='Thời gian'>
								{moment(detailReceipt.createdAt).format('DD/MM/YYYY HH:mm')}
							</Descriptions.Item>
							<Descriptions.Item label='Người thực hiện'>{detailReceipt.performedByName}</Descriptions.Item>
							<Descriptions.Item label='Số vật liệu'>{detailReceipt.count}</Descriptions.Item>
							<Descriptions.Item label='Tổng giá trị'>
								{detailReceipt.totalCost != null ? fmtVnd(detailReceipt.totalCost) : '—'}
							</Descriptions.Item>
						</Descriptions>
						<Table
							rowKey='id'
							size='small'
							dataSource={detailReceipt.items}
							columns={itemColumns as any}
							pagination={false}
							scroll={{ x: 860 }}
						/>
					</>
				)}
			</Modal>
		</div>
	);
}
