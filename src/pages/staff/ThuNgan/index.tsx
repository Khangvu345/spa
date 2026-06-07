// Thu ngân — OPERATOR. Quản lý hoá đơn từ Service Order.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Tag, Input, Select, DatePicker, Button, Dropdown, Menu, Tooltip, message } from 'antd';
import { useModel } from 'umi';
import { Plus, Search, MoreHorizontal, Eye, CreditCard, XCircle, CheckCircle2, Printer } from 'lucide-react';
import moment from 'moment';
import PageHeader from '@/components/PageHeader';
import { INVOICE_STATUS_OPTIONS } from '@/services/Invoices/constant';
import * as invoiceApi from '@/services/Invoices/api';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import '@/pages/admin/Employees/styles.less';

const { RangePicker } = DatePicker;

const fmtVnd = (v: number) => `${v.toLocaleString('vi-VN')}đ`;

export default function ThuNganPage() {
	const {
		list,
		total,
		loading,
		submitting,
		detail,
		query,
		fetch,
		loadDetail,
		setDetail,
		create,
		update,
		finalize,
		markPaid,
		cancel,
	} = useModel('invoices') as any;

	const [createOpen, setCreateOpen] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
	const searchTimerRef = useRef<number | undefined>();

	useEffect(() => {
		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
		searchTimerRef.current = window.setTimeout(() => {
			fetch({ invoiceCode: searchInput.trim() || undefined, page: 1 });
		}, 300);
		return () => {
			if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput]);

	const openDetail = async (id: string) => {
		const inv = await loadDetail(id);
		if (inv) setDetailOpen(true);
	};

	const closeDetail = () => {
		setDetailOpen(false);
		setDetail(null);
	};

	const columns = useMemo(
		() => [
			{
				title: 'Mã HĐ',
				dataIndex: 'invoiceCode',
				width: 170,
				render: (v: string) => <code style={{ fontSize: 12, fontWeight: 600 }}>{v}</code>,
			},
			{
				title: 'Khách hàng',
				dataIndex: ['customerSnapshot', 'fullName'],
				width: 200,
				ellipsis: true,
				render: (_: any, r: InvoiceMgmt.IInvoice) => (
					<div>
						<div style={{ fontWeight: 500 }}>{r.customerSnapshot.fullName}</div>
						<div style={{ color: '#6B7280', fontSize: 12 }}>{r.customerSnapshot.phone}</div>
					</div>
				),
			},
			{
				title: 'Số DV',
				dataIndex: 'items',
				width: 70,
				align: 'center' as const,
				render: (items: InvoiceMgmt.IItem[]) => items.length,
			},
			{
				title: 'Tạm tính',
				dataIndex: 'itemsSubtotal',
				width: 110,
				align: 'center' as const,
				render: (v: number) => fmtVnd(v),
			},
			{
				title: 'Tổng',
				dataIndex: 'totalAmount',
				width: 120,
				align: 'center' as const,
				render: (v: number) => <strong>{fmtVnd(v)}</strong>,
			},
			{
				title: 'Trạng thái',
				dataIndex: 'status',
				width: 150,
				align: 'center' as const,
				render: (v: InvoiceMgmt.TStatus) => {
					const opt = INVOICE_STATUS_OPTIONS.find((s) => s.value === v);
					return <Tag color={opt?.color}>{opt?.label}</Tag>;
				},
			},
			{
				title: 'Tạo lúc',
				dataIndex: 'createdAt',
				width: 130,
				render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm'),
			},
			{
				title: 'Thao tác',
				key: 'actions',
				width: 90,
				align: 'center' as const,
				render: (_: any, r: InvoiceMgmt.IInvoice) => {
					const isDraft = r.status === 'DRAFT';
					const isPending = r.status === 'PENDING_PAYMENT';
					const isPaid = r.status === 'PAID';
					return (
						<Dropdown
							overlay={
								<Menu>
									<Menu.Item key='view' icon={<Eye size={14} />} onClick={() => openDetail(r.id)}>
										Xem chi tiết
									</Menu.Item>
									{isDraft && (
										<Menu.Item
											key='finalize'
											icon={<CheckCircle2 size={14} />}
											onClick={async () => {
												const ok = await finalize(r.id);
												if (ok) fetch();
											}}
										>
											Chốt hoá đơn
										</Menu.Item>
									)}
									{isPending && (
										<Menu.Item
											key='pay'
											icon={<CreditCard size={14} />}
											onClick={async () => {
												const ok = await markPaid(r.id);
												if (ok) fetch();
											}}
										>
											Ghi nhận thanh toán
										</Menu.Item>
									)}
									{isPaid && (
										<Menu.Item
											key='print'
											icon={<Printer size={14} />}
											onClick={() =>
												invoiceApi
													.exportInvoicePdf(r.id, r.invoiceCode)
													.catch(() => message.error('Xuất PDF hoá đơn thất bại'))
											}
										>
											In hoá đơn (PDF)
										</Menu.Item>
									)}
									{(isDraft || isPending) && (
										<Menu.Item
											key='cancel'
											icon={<XCircle size={14} />}
											onClick={() => openDetail(r.id)}
										>
											Huỷ hoá đơn…
										</Menu.Item>
									)}
								</Menu>
							}
							trigger={['click']}
						>
							<Tooltip title='Tuỳ chọn'>
								<Button type='text' icon={<MoreHorizontal size={18} />} />
							</Tooltip>
						</Dropdown>
					);
				},
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return (
		<div className='employees-page'>
			<PageHeader
				title='Thu ngân'
				subtitle='Quản lý hoá đơn dịch vụ — chốt, thanh toán, huỷ'
				extras={
					<Button
						type='primary'
						icon={<Plus size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
						className='employees-page__add-btn'
						onClick={() => setCreateOpen(true)}
					>
						Tạo hoá đơn
					</Button>
				}
			/>

			<div className='employees-page__toolbar'>
				<Input
					prefix={<Search size={14} color='#9B9B9B' />}
					placeholder='Tìm theo mã HĐ...'
					allowClear
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					style={{ width: 240, borderRadius: 10 }}
				/>
				<Select
					allowClear
					placeholder='Trạng thái'
					style={{ width: 180 }}
					options={INVOICE_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
					onChange={(v) => fetch({ status: v, page: 1 })}
				/>
				<RangePicker
					value={dateRange as any}
					format='DD/MM/YYYY'
					onChange={(range) => {
						setDateRange(range as any);
						fetch({
							fromDate: range?.[0]?.startOf('day').toISOString(),
							toDate: range?.[1]?.endOf('day').toISOString(),
							page: 1,
						});
					}}
				/>
			</div>

			<Table
				rowKey='id'
				loading={loading}
				dataSource={list}
				columns={columns as any}
				scroll={{ x: 1200 }}
				pagination={{
					current: query.page,
					pageSize: query.limit,
					total,
					showSizeChanger: true,
					onChange: (page, limit) => fetch({ page, limit }),
				}}
				className='employees-page__table'
			/>

			<CreateInvoiceModal
				open={createOpen}
				loading={submitting}
				onCancel={() => setCreateOpen(false)}
				onSubmit={async (payload) => {
					const r = await create(payload);
					if (r) {
						setCreateOpen(false);
						fetch({ page: 1 });
						if (r.id) openDetail(r.id);
					}
					return r;
				}}
			/>

			<InvoiceDetailModal
				open={detailOpen}
				invoice={detail}
				loading={submitting}
				onCancel={closeDetail}
				onUpdate={update}
				onFinalize={finalize}
				onMarkPaid={markPaid}
				onCancelInvoice={cancel}
				onAfterAction={async () => {
					if (detail?.id) await loadDetail(detail.id);
					fetch();
				}}
			/>
		</div>
	);
}
