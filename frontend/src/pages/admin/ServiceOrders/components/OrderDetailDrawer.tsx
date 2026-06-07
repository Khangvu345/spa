// Drawer chi tiết phiếu: items table, add/edit/remove item, edit note/extraCharge, complete/cancel.
import { useEffect, useMemo, useState } from 'react';
import {
	Descriptions,
	Tag,
	Table,
	Button,
	Form,
	Select,
	InputNumber,
	Input,
	Popconfirm,
	Space,
	Tooltip,
	Spin,
	Modal,
	Divider,
	Dropdown,
	Menu,
	message,
} from 'antd';
import { Plus, Trash2, Check, X, CheckCircle2, Ban, Save, MoreHorizontal, Pencil } from 'lucide-react';
import * as servicesApi from '@/services/Services/api';
import {
	SERVICE_ORDER_STATUS_OPTIONS,
	SERVICE_ORDER_EDITABLE_STATUSES,
} from '@/services/ServiceOrders/constant';
import './OrderDetailDrawer.less';

type Props = {
	order: SvcOrderMgmt.IServiceOrder | null;
	loading: boolean;
	readOnly?: boolean;
	onClose: () => void;
	updateOrder: (id: string, payload: SvcOrderMgmt.IUpdatePayload) => Promise<any>;
	addItem: (id: string, payload: SvcOrderMgmt.IAddItemPayload) => Promise<any>;
	updateItem: (id: string, itemId: string, payload: SvcOrderMgmt.IUpdateItemPayload) => Promise<any>;
	removeItem: (id: string, itemId: string) => Promise<any>;
	complete: (id: string) => Promise<any>;
	cancel: (id: string, reason: string) => Promise<any>;
};

const fmtMoney = (v: number) => v?.toLocaleString('vi-VN');

export default function OrderDetailDrawer({
	order,
	loading,
	readOnly = false,
	onClose,
	updateOrder,
	addItem,
	updateItem,
	removeItem,
	complete,
	cancel,
}: Props) {
	const [services, setServices] = useState<SvcMgmt.IService[]>([]);
	const [svcLoading, setSvcLoading] = useState(false);
	const [addOpen, setAddOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingItemId, setEditingItemId] = useState<string | null>(null);
	const [editQty, setEditQty] = useState<number>(1);
	const [editNote, setEditNote] = useState<string>('');
	const [extraCharge, setExtraCharge] = useState<number>(0);
	const [note, setNote] = useState<string>('');

	const [form] = Form.useForm();

	const open = !!order;
	const editable = !readOnly && order ? SERVICE_ORDER_EDITABLE_STATUSES.includes(order.status) : false;

	useEffect(() => {
		if (open) {
			setExtraCharge(order!.extraCharge);
			setNote(order!.note);
			setAddOpen(false);
			setEditingItemId(null);
			(async () => {
				setSvcLoading(true);
				try {
					const res = await servicesApi.getServices({ isActive: true, page: 1, limit: 100 });
					setServices((res.data as any).data ?? []);
				} finally {
					setSvcLoading(false);
				}
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [order?.id]);

	const usedServiceIds = useMemo(
		() => new Set(order?.items?.map((i) => i.serviceId) ?? []),
		[order?.items],
	);

	const onAddItem = async () => {
		if (!order) return;
		const values = await form.validateFields();
		setSubmitting(true);
		try {
			await addItem(order.id, {
				serviceId: values.serviceId,
				quantity: values.quantity ?? 1,
				note: values.note?.trim() || undefined,
			});
			form.resetFields();
			setAddOpen(false);
		} catch {
			// model đã message.error
		} finally {
			setSubmitting(false);
		}
	};

	const saveItem = async (item: SvcOrderMgmt.IItem) => {
		if (!order) return;
		await updateItem(order.id, item.id, { quantity: editQty, note: editNote.trim() || undefined });
		setEditingItemId(null);
	};

	const saveHeader = async () => {
		if (!order) return;
		const payload: SvcOrderMgmt.IUpdatePayload = {};
		if (extraCharge !== order.extraCharge) payload.extraCharge = extraCharge;
		if (note !== order.note) payload.note = note;
		if (!Object.keys(payload).length) {
			message.info('Không có thay đổi để lưu');
			return;
		}
		await updateOrder(order.id, payload);
	};

	const moveInProgress = async () => {
		if (!order) return;
		await updateOrder(order.id, { status: 'IN_PROGRESS' });
	};

	const doComplete = async () => {
		if (!order) return;
		Modal.confirm({
			title: 'Hoàn thành phiếu này?',
			content: 'Sau khi hoàn thành, phiếu sẽ chuyển sang trạng thái "Hoàn thành" và không thể chỉnh sửa danh sách dịch vụ nữa.',
			okText: 'Hoàn thành',
			cancelText: 'Huỷ',
			onOk: () => complete(order.id),
		});
	};

	const doCancel = async () => {
		if (!order) return;
		let reason = '';
		Modal.confirm({
			title: 'Huỷ phiếu này?',
			content: (
				<Input.TextArea
					placeholder='Lý do huỷ (bắt buộc)'
					maxLength={500}
					rows={3}
					onChange={(e) => (reason = e.target.value)}
				/>
			),
			okText: 'Huỷ phiếu',
			okType: 'danger',
			cancelText: 'Thoát',
			onOk: async () => {
				if (!reason.trim()) return Promise.reject();
				await cancel(order.id, reason.trim());
				return undefined;
			},
		});
	};

	const itemColumns = [
		{
			title: 'Mã DV',
			dataIndex: 'serviceCode',
			width: 130,
			align: 'center' as const,
			render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'serviceName',
			width: 200,
			ellipsis: true,
		},
		{
			title: 'NV thực hiện',
			dataIndex: 'staffName',
			width: 140,
			align: 'center' as const,
			render: (v: string, r: SvcOrderMgmt.IItem) => (
				<div>
					<div>{v}</div>
					<div style={{ fontSize: 11, color: '#6B7280' }}>HH: {r.commissionRate}%</div>
				</div>
			),
		},
		{
			title: 'Đơn giá',
			dataIndex: 'unitPrice',
			width: 110,
			align: 'right' as const,
			render: (v: number) => fmtMoney(v),
		},
		{
			title: 'SL',
			dataIndex: 'quantity',
			width: 80,
			align: 'center' as const,
			render: (v: number, r: SvcOrderMgmt.IItem) =>
				editingItemId === r.id ? (
					<InputNumber min={1} max={10} value={editQty} onChange={(n) => setEditQty(Number(n ?? 1))} style={{ width: 60 }} />
				) : (
					v
				),
		},
		{
			title: 'Thành tiền',
			dataIndex: 'subtotal',
			width: 120,
			align: 'right' as const,
			render: (v: number) => <span style={{ fontWeight: 500 }}>{fmtMoney(v)} ₫</span>,
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
			width: 180,
			ellipsis: true,
			render: (v: string, r: SvcOrderMgmt.IItem) =>
				editingItemId === r.id ? (
					<Input value={editNote} onChange={(e) => setEditNote(e.target.value)} maxLength={200} />
				) : (
					v || <span style={{ color: '#9CA3AF' }}>—</span>
				),
		},
		{
			title: 'Thao tác',
			key: 'actions',
			width: 90,
			align: 'center' as const,
			fixed: 'right' as const,
			render: (_: any, r: SvcOrderMgmt.IItem) =>
				!editable ? (
					<span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>
				) : editingItemId === r.id ? (
					<Space size={4}>
						<Tooltip title='Lưu'>
							<Button type='text' icon={<Check size={16} color='#059669' />} onClick={() => saveItem(r)} />
						</Tooltip>
						<Tooltip title='Huỷ'>
							<Button type='text' icon={<X size={16} color='#6B7280' />} onClick={() => setEditingItemId(null)} />
						</Tooltip>
					</Space>
				) : (
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item
									key='edit'
									icon={<Pencil size={14} />}
									onClick={() => {
										setEditingItemId(r.id);
										setEditQty(r.quantity);
										setEditNote(r.note ?? '');
									}}
								>
									Cập nhật
								</Menu.Item>
								<Menu.Item key='delete' icon={<Trash2 size={14} color='#DC2626' />}>
									<Popconfirm
										title='Xoá item khỏi phiếu?'
										onConfirm={() => order && removeItem(order.id, r.id)}
										okText='Xoá'
										cancelText='Huỷ'
									>
										<span style={{ color: '#DC2626' }}>Xoá</span>
									</Popconfirm>
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

	const statusOpt = order ? SERVICE_ORDER_STATUS_OPTIONS.find((s) => s.value === order.status) : null;
	const availableServices = services.filter((s) => !usedServiceIds.has(s.id));

	return (
		<Modal
			visible={open}
			onCancel={onClose}
			footer={null}
			width={1040}
			centered
			destroyOnClose
			className='so-detail-modal'
			title={
				order ? (
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 32, gap: 16, flexWrap: 'wrap' }}>
						<div>
							<div style={{ fontSize: 16, fontWeight: 600 }}>
								{order.orderCode}{' '}
								<Tag color={statusOpt?.color} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
									{statusOpt?.label}
								</Tag>
							</div>
							<div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
								{order.customer?.fullName} — {order.customer?.phone}
							</div>
						</div>
						<Space>
							{!readOnly && order.status === 'DRAFT' && (
								<Button type='primary' onClick={moveInProgress}>
									Bắt đầu
								</Button>
							)}
							{!readOnly && order.status === 'IN_PROGRESS' && order.items.length > 0 && (
								<Button
									type='primary'
									icon={<CheckCircle2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
									onClick={doComplete}
								>
									Hoàn thành
								</Button>
							)}
							{editable && (
								<Button
									danger
									icon={<Ban size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
									onClick={doCancel}
								>
									Huỷ phiếu
								</Button>
							)}
						</Space>
					</div>
				) : (
					'Chi tiết phiếu'
				)
			}
		>
			{loading || !order ? (
				<div style={{ textAlign: 'center', padding: 60 }}>
					<Spin />
				</div>
			) : (
				<>
					<Descriptions size='small' column={{ xs: 1, sm: 2 }} bordered>
						<Descriptions.Item label='Trạng thái'>
							<Tag color={statusOpt?.color}>{statusOpt?.label}</Tag>
						</Descriptions.Item>
						<Descriptions.Item label='Người tạo'>{order.createdByName}</Descriptions.Item>
						<Descriptions.Item label='Tạo lúc'>
							{new Date(order.createdAt).toLocaleString('vi-VN')}
						</Descriptions.Item>
						<Descriptions.Item label='Bắt đầu'>
							{order.startedAt ? new Date(order.startedAt).toLocaleString('vi-VN') : '—'}
						</Descriptions.Item>
						<Descriptions.Item label='Hoàn thành'>
							{order.completedAt ? new Date(order.completedAt).toLocaleString('vi-VN') : '—'}
						</Descriptions.Item>
						<Descriptions.Item label='Đã huỷ'>
							{order.cancelledAt ? new Date(order.cancelledAt).toLocaleString('vi-VN') : '—'}
						</Descriptions.Item>
					</Descriptions>

					<Divider style={{ margin: '16px 0 12px' }}>Dịch vụ trong phiếu</Divider>

					{editable && (
						<div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
							<Button
								type='primary'
								icon={<Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
								onClick={() => setAddOpen((v) => !v)}
							>
								Thêm dịch vụ
							</Button>
						</div>
					)}

					{addOpen && editable && (
						<Form
							form={form}
							layout='inline'
							className='so-add-form'
							style={{
								marginBottom: 16,
								padding: 12,
								background: '#F9FAFB',
								borderRadius: 8,
								gap: 8,
								flexWrap: 'wrap',
							}}
						>
							<Form.Item
								name='serviceId'
								label='Dịch vụ'
								rules={[{ required: true, message: 'Chọn dịch vụ' }]}
							>
								<Select
									showSearch
									loading={svcLoading}
									optionFilterProp='label'
									placeholder='Chọn dịch vụ'
									style={{ width: 320 }}
									options={availableServices.map((s) => ({
										value: s.id,
										label: `${s.code} — ${s.name} (${fmtMoney(s.unitPrice)}₫)`,
									}))}
								/>
							</Form.Item>
							<Form.Item name='quantity' label='SL' initialValue={1}>
								<InputNumber min={1} max={10} style={{ width: 80 }} />
							</Form.Item>
							<Form.Item name='note' label='Ghi chú'>
								<Input maxLength={200} placeholder='Tuỳ chọn' style={{ width: 200 }} />
							</Form.Item>
							<Form.Item>
								<Button type='primary' loading={submitting} onClick={onAddItem}>
									Thêm
								</Button>
							</Form.Item>
						</Form>
					)}

					<Table
						className='so-items-table'
						rowKey='id'
						dataSource={order.items}
						columns={itemColumns as any}
						size='middle'
						pagination={false}
						scroll={{ x: 1000 }}
						locale={{ emptyText: 'Phiếu chưa có dịch vụ nào' }}
					/>

					<Divider style={{ margin: '16px 0 12px' }}>Tổng kết & ghi chú</Divider>

					<div className='so-summary' style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
						<div style={{ flex: 1, minWidth: 320 }}>
							<Form layout='vertical' size='small'>
								<Form.Item label='Phụ thu (VND)'>
									<InputNumber
										min={0}
										step={10000}
										value={extraCharge}
										disabled={!editable}
										onChange={(v) => setExtraCharge(Number(v ?? 0))}
										style={{ width: 200 }}
										formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
										parser={(v) => Number(`${v}`.replace(/[^0-9]/g, ''))}
									/>
								</Form.Item>
								<Form.Item label='Ghi chú phiếu'>
									<Input.TextArea
										rows={3}
										maxLength={500}
										value={note}
										disabled={!editable}
										onChange={(e) => setNote(e.target.value)}
										showCount
									/>
								</Form.Item>
								{editable && (
									<Button
										type='primary'
										onClick={saveHeader}
										icon={<Save size={15} />}
									>
										Lưu thay đổi
									</Button>
								)}
							</Form>
						</div>
						<div style={{ flex: 1, minWidth: 240, background: '#F9FAFB', padding: 16, borderRadius: 8 }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
								<span style={{ color: '#6B7280' }}>Tổng dịch vụ</span>
								<span style={{ fontWeight: 500 }}>{fmtMoney(order.itemsSubtotal)} ₫</span>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
								<span style={{ color: '#6B7280' }}>Phụ thu</span>
								<span style={{ fontWeight: 500 }}>{fmtMoney(order.extraCharge)} ₫</span>
							</div>
							<Divider style={{ margin: '8px 0' }} />
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<span style={{ fontWeight: 600 }}>Tổng cộng</span>
								<span style={{ fontWeight: 700, fontSize: 18, color: '#DC2626' }}>
									{fmtMoney(order.totalAmount)} ₫
								</span>
							</div>
						</div>
					</div>
				</>
			)}
		</Modal>
	);
}
