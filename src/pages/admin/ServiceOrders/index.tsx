// Quản lý phiếu dịch vụ — OPERATOR + ADMIN.
import { useEffect, useState } from 'react';
import { Table, Button, Select, Tag, Tooltip, DatePicker, Dropdown, Menu } from 'antd';
import type { Moment } from 'moment';
import { useModel } from 'umi';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';
import { SERVICE_ORDER_STATUS_OPTIONS } from '@/services/ServiceOrders/constant';
import CreateOrderModal from './components/CreateOrderModal';
import OrderDetailDrawer from './components/OrderDetailDrawer';
import PageHeader from '@/components/PageHeader';
import '@/pages/admin/Employees/styles.less';

const { RangePicker } = DatePicker;

export default function ServiceOrdersPage() {
	const {
		list,
		total,
		loading,
		query,
		fetch,
		detail,
		detailLoading,
		loadDetail,
		closeDetail,
		create,
		updateOrder,
		addItem,
		updateItem,
		removeItem,
		complete,
		cancel,
	} = useModel('serviceOrders') as any;

	const { initialState } = useModel('@@initialState') as any;
	// ADMIN chỉ được xem; OPERATOR mới được thêm/sửa/xoá.
	const canWrite = initialState?.currentUser?.role === 'OPERATOR';

	const [createOpen, setCreateOpen] = useState(false);

	useEffect(() => {
		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fmtMoney = (v: number) => v?.toLocaleString('vi-VN');
	const fmtDate = (v: string) => (v ? new Date(v).toLocaleString('vi-VN') : '—');

	const columns = [
		{
			title: 'Mã phiếu',
			dataIndex: 'orderCode',
			width: 170,
			align: 'center' as const,
			render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
		},
		{
			title: 'Khách hàng',
			width: 220,
			align: 'center' as const,
			render: (_: any, r: SvcOrderMgmt.IServiceOrder) => (
				<div>
					<div style={{ fontWeight: 500 }}>{r.customer?.fullName ?? '—'}</div>
					<div style={{ fontSize: 12, color: '#6B7280' }}>{r.customer?.phone}</div>
				</div>
			),
		},
		{
			title: 'Số DV',
			dataIndex: 'items',
			width: 80,
			align: 'center' as const,
			render: (items: SvcOrderMgmt.IItem[]) => items?.length ?? 0,
		},
		{
			title: 'Tổng tiền',
			dataIndex: 'totalAmount',
			width: 140,
			align: 'right' as const,
			render: (v: number) => <span style={{ fontWeight: 500 }}>{fmtMoney(v)} ₫</span>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			width: 160,
			align: 'center' as const,
			render: (v: SvcOrderMgmt.TStatus) => {
				const opt = SERVICE_ORDER_STATUS_OPTIONS.find((s) => s.value === v);
				return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
			},
		},
		{
			title: 'Người tạo',
			dataIndex: 'createdByName',
			width: 160,
			align: 'center' as const,
			ellipsis: true,
		},
		{
			title: 'Tạo lúc',
			dataIndex: 'createdAt',
			width: 170,
			align: 'center' as const,
			render: (v: string) => <span style={{ fontSize: 12 }}>{fmtDate(v)}</span>,
		},
		{
			title: 'Thao tác',
			key: 'actions',
			width: 90,
			align: 'center' as const,
			render: (_: any, r: SvcOrderMgmt.IServiceOrder) => (
				<Dropdown
					overlay={
						<Menu>
							<Menu.Item key='view' icon={<Eye size={14} />} onClick={() => loadDetail(r.id)}>
								{canWrite ? 'Xem / Sửa phiếu' : 'Xem phiếu dịch vụ'}
							</Menu.Item>
						</Menu>
					}
					trigger={['click']}
				>
					<Tooltip title='Tuỳ chọn'>
						<Button type='text' icon={<MoreHorizontal size={18} />} />
					</Tooltip>
				</Dropdown>
			),
		},
	];

	return (
		<div className='employees-page'>
			<PageHeader
				title='Phiếu dịch vụ'
				subtitle='Tạo và quản lý phiếu dịch vụ tại quầy'
				extras={
					canWrite ? (
						<Button
							type='primary'
							icon={<Plus size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
							className='employees-page__add-btn'
							onClick={() => setCreateOpen(true)}
						>
							Tạo phiếu
						</Button>
					) : undefined
				}
			/>

			<div className='employees-page__toolbar'>
				<Select
					allowClear
					placeholder='Trạng thái'
					style={{ width: 200 }}
					options={SERVICE_ORDER_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
					onChange={(v) => fetch({ status: v, page: 1 })}
				/>
				<RangePicker
					style={{ width: 280 }}
					placeholder={['Từ ngày', 'Đến ngày']}
					onChange={(range) => {
						const [from, to] = (range ?? [null, null]) as [Moment | null, Moment | null];
						fetch({
							fromDate: from ? from.format('YYYY-MM-DD') : undefined,
							toDate: to ? to.format('YYYY-MM-DD') : undefined,
							page: 1,
						});
					}}
				/>
				<Select
					defaultValue='createdAt'
					style={{ width: 160 }}
					options={[
						{ value: 'createdAt', label: 'Mới nhất' },
						{ value: 'totalAmount', label: 'Tổng tiền' },
					]}
					onChange={(v) => fetch({ sortBy: v, page: 1 })}
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

			<CreateOrderModal
				open={createOpen}
				onCancel={() => setCreateOpen(false)}
				onCreated={async (orderId: string) => {
					setCreateOpen(false);
					await loadDetail(orderId);
				}}
				create={create}
			/>

			<OrderDetailDrawer
				order={detail}
				loading={detailLoading}
				readOnly={!canWrite}
				onClose={closeDetail}
				updateOrder={updateOrder}
				addItem={addItem}
				updateItem={updateItem}
				removeItem={removeItem}
				complete={complete}
				cancel={cancel}
			/>
		</div>
	);
}
