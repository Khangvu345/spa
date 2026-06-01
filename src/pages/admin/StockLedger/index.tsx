// Lịch sử kho — ADMIN. List ledger entries với filter material/loại/ngày + summary cards.
import { useEffect, useMemo, useState } from 'react';
import { Table, Select, DatePicker, Tag, Tooltip, Row, Col, Card } from 'antd';
import { useModel } from 'umi';
import moment from 'moment';
import { ArrowDownToLine, ArrowUpFromLine, Wrench, Receipt } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import {
	TRANSACTION_TYPE_OPTIONS,
	REFERENCE_TYPE_LABEL,
} from '@/services/StockLedger/constant';
import '@/pages/admin/Employees/styles.less';

const { RangePicker } = DatePicker;

const fmtVnd = (v?: number | null) => (v != null ? `${v.toLocaleString('vi-VN')}đ` : '0đ');

export default function StockLedgerPage() {
	const { list, total, loading, summary, query, fetch, fetchSummary } = useModel(
		'stockLedger',
	) as any;
	const { list: materials, fetch: fetchMaterials } = useModel('materials') as any;

	useEffect(() => {
		fetch();
		fetchMaterials({ limit: 100 });
		fetchSummary();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);

	const summaryCards = useMemo(() => {
		const s: StockLedger.ISummary | null = summary;
		return [
			{
				key: 'in',
				label: 'Nhập kho',
				icon: <ArrowDownToLine size={20} color='#059669' />,
				bg: '#ECFDF5',
				count: s?.totalIn.count ?? 0,
				quantity: s?.totalIn.quantity ?? 0,
				cost: s?.totalIn.cost ?? 0,
			},
			{
				key: 'out-invoice',
				label: 'Xuất theo HĐ',
				icon: <Receipt size={20} color='#2563EB' />,
				bg: '#EFF6FF',
				count: s?.totalOutInvoice.count ?? 0,
				quantity: s?.totalOutInvoice.quantity ?? 0,
				cost: s?.totalOutInvoice.cost ?? 0,
			},
			{
				key: 'out-manual',
				label: 'Xuất thủ công',
				icon: <ArrowUpFromLine size={20} color='#DC2626' />,
				bg: '#FEF2F2',
				count: s?.totalOutManual.count ?? 0,
				quantity: s?.totalOutManual.quantity ?? 0,
				cost: s?.totalOutManual.cost ?? 0,
			},
			{
				key: 'adjustment',
				label: 'Điều chỉnh',
				icon: <Wrench size={20} color='#D97706' />,
				bg: '#FEF3C7',
				count: s?.totalAdjustment.count ?? 0,
				quantity: s?.totalAdjustment.quantity ?? 0,
				cost: s?.totalAdjustment.cost ?? 0,
			},
		];
	}, [summary]);

	const columns = useMemo(
		() => [
			{
				title: 'Thời gian',
				dataIndex: 'createdAt',
				width: 150,
				render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm'),
			},
			{
				title: 'Mã VL',
				dataIndex: 'materialCode',
				width: 110,
				render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
			},
			{
				title: 'Tên vật liệu',
				dataIndex: 'materialName',
				width: 200,
				ellipsis: true,
				render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
			},
			{
				title: 'Loại',
				dataIndex: 'transactionType',
				width: 130,
				align: 'center' as const,
				render: (v: StockLedger.TTransactionType) => {
					const opt = TRANSACTION_TYPE_OPTIONS.find((t) => t.value === v);
					return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
				},
			},
			{
				title: 'SL thay đổi',
				dataIndex: 'quantityChange',
				width: 110,
				align: 'right' as const,
				render: (v: number, r: StockLedger.ILedgerEntry) => (
					<span style={{ color: v >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>
						{v >= 0 ? '+' : ''}
						{v} {r.materialUnit}
					</span>
				),
			},
			{
				title: 'Tồn trước',
				dataIndex: 'stockBefore',
				width: 90,
				align: 'right' as const,
			},
			{
				title: 'Tồn sau',
				dataIndex: 'stockAfter',
				width: 90,
				align: 'right' as const,
				render: (v: number) => <strong>{v}</strong>,
			},
			{
				title: 'NCC',
				dataIndex: 'supplierName',
				width: 150,
				ellipsis: true,
				render: (v: string | null) => v || '—',
			},
			{
				title: 'Đơn giá',
				dataIndex: 'unitPrice',
				width: 110,
				align: 'right' as const,
				render: (v: number | null) => (v != null ? `${v.toLocaleString('vi-VN')}đ` : '—'),
			},
			{
				title: 'Tổng tiền',
				dataIndex: 'totalCost',
				width: 120,
				align: 'right' as const,
				render: (v: number | null) =>
					v != null ? <strong>{v.toLocaleString('vi-VN')}đ</strong> : '—',
			},
			{
				title: 'Nhân viên',
				dataIndex: 'performedByName',
				width: 140,
				ellipsis: true,
			},
			{
				title: 'Lý do / Tham chiếu',
				dataIndex: 'reason',
				width: 200,
				ellipsis: true,
				render: (v: string, r: StockLedger.ILedgerEntry) => (
					<Tooltip title={v}>
						<span>
							{v || '—'}
							{r.referenceType && (
								<Tag style={{ marginLeft: 6 }} color='#E5E7EB'>
									{REFERENCE_TYPE_LABEL[r.referenceType]}
								</Tag>
							)}
						</span>
					</Tooltip>
				),
			},
		],
		[],
	);

	return (
		<div className='employees-page'>
			<PageHeader title='Lịch sử kho' subtitle='Audit trail mọi giao dịch nhập / xuất vật liệu' />

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				{summaryCards.map((c) => (
					<Col xs={12} md={6} key={c.key}>
						<Card bodyStyle={{ padding: '22px 24px' }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
								<div
									style={{
										width: 36,
										height: 36,
										background: c.bg,
										borderRadius: 8,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									{c.icon}
								</div>
								<div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{c.label}</div>
							</div>
							<div style={{ fontSize: 22, fontWeight: 700 }}>{c.count}</div>
							<div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
								SL: {c.quantity} · {fmtVnd(c.cost)}
							</div>
						</Card>
					</Col>
				))}
			</Row>

			<div className='employees-page__toolbar' style={{ marginBottom: 16 }}>
				<Select
					allowClear
					showSearch
					optionFilterProp='label'
					placeholder='Vật liệu'
					style={{ width: 240 }}
					options={materials.map((m: any) => ({ value: m.id, label: `${m.code} — ${m.name}` }))}
					onChange={(v) => fetch({ materialId: v, page: 1 })}
				/>
				<Select
					allowClear
					placeholder='Loại giao dịch'
					style={{ width: 180 }}
					options={TRANSACTION_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
					onChange={(v) => fetch({ transactionType: v, page: 1 })}
				/>
				<RangePicker
					value={dateRange as any}
					format='DD/MM/YYYY'
					onChange={(range) => {
						setDateRange(range as any);
						const from = range?.[0]?.startOf('day').toISOString();
						const to = range?.[1]?.endOf('day').toISOString();
						fetch({ fromDate: from, toDate: to, page: 1 });
						fetchSummary(from, to);
					}}
				/>
			</div>

			<Table
				rowKey='id'
				loading={loading}
				dataSource={list}
				columns={columns as any}
				scroll={{ x: 1700 }}
				pagination={{
					current: query.page,
					pageSize: query.limit,
					total,
					showSizeChanger: true,
					onChange: (page, limit) => fetch({ page, limit }),
				}}
				className='employees-page__table'
			/>
		</div>
	);
}
