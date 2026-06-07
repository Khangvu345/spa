// Drawer quản lý định mức nguyên liệu (BOM) của 1 service.
// - List BOM entries của service (gọi /bom/by-service/:id)
// - Thêm vật liệu (chọn từ /materials active) → POST /bom
// - Sửa standardQuantity / note / isActive → PATCH /bom/:id
// - Xoá → DELETE /bom/:id
import { useEffect, useMemo, useState } from 'react';
import {
	Modal,
	Table,
	Button,
	Form,
	Select,
	InputNumber,
	Input,
	Switch,
	Popconfirm,
	Tag,
	Tooltip,
	Empty,
	Dropdown,
	Menu,
} from 'antd';
import { useModel } from 'umi';
import { Plus, Trash2, Check, X, MoreHorizontal, Pencil } from 'lucide-react';
import * as materialsApi from '@/services/Materials/api';
import { fmtQty } from '@/services/Materials/constant';

type Props = {
	open: boolean;
	service: SvcMgmt.IService | null;
	onClose: () => void;
};

export default function BomDrawer({ open, service, onClose }: Props) {
	const { list, loading, fetchByService, create, update, remove, reset } = useModel('bom') as any;

	const [materials, setMaterials] = useState<MaterialMgmt.IMaterial[]>([]);
	const [matLoading, setMatLoading] = useState(false);
	const [addOpen, setAddOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editQty, setEditQty] = useState<number>(0);
	const [editNote, setEditNote] = useState<string>('');

	const [form] = Form.useForm();

	useEffect(() => {
		if (open && service) {
			fetchByService(service.id);
			(async () => {
				setMatLoading(true);
				try {
					const res = await materialsApi.getMaterials({ isActive: true, page: 1, limit: 100 });
					setMaterials(res.data.data ?? []);
				} finally {
					setMatLoading(false);
				}
			})();
		}
		if (!open) {
			reset();
			setAddOpen(false);
			setEditingId(null);
			form.resetFields();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, service?.id]);

	const usedMaterialIds = useMemo(
		() => new Set((list as BomMgmt.IBom[]).map((b) => b.materialId)),
		[list],
	);

	const availableMaterials = useMemo(
		() => materials.filter((m) => !usedMaterialIds.has(m.id)),
		[materials, usedMaterialIds],
	);

	const onAdd = async () => {
		if (!service) return;
		const values = await form.validateFields();
		setSubmitting(true);
		try {
			await create({
				serviceId: service.id,
				materialId: values.materialId,
				standardQuantity: values.standardQuantity,
				note: values.note?.trim() || undefined,
			});
			form.resetFields();
			setAddOpen(false);
		} finally {
			setSubmitting(false);
		}
	};

	const startEdit = (b: BomMgmt.IBom) => {
		setEditingId(b.id);
		setEditQty(b.standardQuantity);
		setEditNote(b.note ?? '');
	};

	const saveEdit = async (b: BomMgmt.IBom) => {
		await update(b.id, { standardQuantity: editQty, note: editNote.trim() || undefined });
		setEditingId(null);
	};

	const columns = [
		{
			title: 'Mã',
			dataIndex: ['material', 'code'],
			width: 110,
			render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
		},
		{
			title: 'Tên vật liệu',
			dataIndex: ['material', 'name'],
			width: 180,
			ellipsis: true,
			render: (v: string, r: BomMgmt.IBom) => (
				<div>
					<div style={{ fontWeight: 500 }}>{v}</div>
					<div style={{ fontSize: 11, color: '#6B7280' }}>
						{r.material?.type === 'DEPRECIATION' ? 'Khấu hao' : 'Tiêu hao'} • Tồn: {fmtQty(r.material?.stockQuantity)}
					</div>
				</div>
			),
		},
		{
			title: 'Định mức / lần',
			dataIndex: 'standardQuantity',
			width: 140,
			align: 'center' as const,
			render: (v: number, r: BomMgmt.IBom) =>
				editingId === r.id ? (
					<InputNumber
						min={0.0001}
						step={0.1}
						value={editQty}
						onChange={(n) => setEditQty(Number(n ?? 0))}
						style={{ width: 100 }}
					/>
				) : (
					<span>
						{v} <span style={{ color: '#6B7280' }}>{r.material?.unit}</span>
					</span>
				),
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
			width: 180,
			ellipsis: true,
			render: (v: string, r: BomMgmt.IBom) =>
				editingId === r.id ? (
					<Input value={editNote} onChange={(e) => setEditNote(e.target.value)} maxLength={500} />
				) : (
					v || <span style={{ color: '#9CA3AF' }}>—</span>
				),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'isActive',
			width: 160,
			align: 'center' as const,
			render: (v: boolean, r: BomMgmt.IBom) => (
				<div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
					<Switch
						checked={v}
						size='small'
						onChange={(checked) => update(r.id, { isActive: checked })}
					/>
					<Tag color={v ? '#059669' : '#DC2626'} style={{ margin: 0 }}>
						{v ? 'Đang dùng' : 'Ngưng'}
					</Tag>
				</div>
			),
		},
		{
			title: 'Thao tác',
			key: 'actions',
			width: 90,
			align: 'center' as const,
			render: (_: any, r: BomMgmt.IBom) =>
				editingId === r.id ? (
					<div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
						<Tooltip title='Lưu'>
							<Button type='text' icon={<Check size={16} color='#059669' />} onClick={() => saveEdit(r)} />
						</Tooltip>
						<Tooltip title='Huỷ'>
							<Button type='text' icon={<X size={16} color='#6B7280' />} onClick={() => setEditingId(null)} />
						</Tooltip>
					</div>
				) : (
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item key='edit' icon={<Pencil size={14} />} onClick={() => startEdit(r)}>
									Cập nhật
								</Menu.Item>
								<Menu.Item key='delete' icon={<Trash2 size={14} color='#DC2626' />}>
									<Popconfirm
										title='Xoá khỏi định mức?'
										onConfirm={() => remove(r.id)}
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

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 32 }}>
					<div>
						<div style={{ fontSize: 16, fontWeight: 600 }}>Định mức nguyên liệu</div>
						{service && (
							<div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
								{service.code} — {service.name}
							</div>
						)}
					</div>
					<Button
						type='primary'
						icon={<Plus size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
						onClick={() => setAddOpen((v) => !v)}
						disabled={!service}
					>
						Thêm vật liệu
					</Button>
				</div>
			}
			visible={open}
			onCancel={onClose}
			footer={null}
			width={920}
			centered
			destroyOnClose
		>
			{addOpen && (
				<Form
					form={form}
					layout='inline'
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
						name='materialId'
						label='Vật liệu'
						rules={[{ required: true, message: 'Chọn vật liệu' }]}
					>
						<Select
							showSearch
							placeholder='Chọn vật liệu'
							style={{ width: 280 }}
							loading={matLoading}
							optionFilterProp='label'
							options={availableMaterials.map((m) => ({
								value: m.id,
								label: `${m.code} — ${m.name} (${m.unit})`,
							}))}
							notFoundContent={
								availableMaterials.length === 0 ? <Empty description='Hết vật liệu khả dụng' /> : undefined
							}
						/>
					</Form.Item>
					<Form.Item
						name='standardQuantity'
						label='Định mức'
						rules={[{ required: true, message: 'Bắt buộc' }]}
					>
						<InputNumber min={0.0001} step={0.1} style={{ width: 110 }} placeholder='vd 30' />
					</Form.Item>
					<Form.Item name='note' label='Ghi chú'>
						<Input maxLength={500} placeholder='Tuỳ chọn' style={{ width: 220 }} />
					</Form.Item>
					<Form.Item>
						<Button type='primary' loading={submitting} onClick={onAdd}>
							Thêm
						</Button>
					</Form.Item>
				</Form>
			)}

			<div style={{ marginBottom: 8, color: '#6B7280', fontSize: 12 }}>
				<Tag color='#2563EB'>{list.length}</Tag> vật liệu trong định mức
			</div>

			<Table
				rowKey='id'
				loading={loading}
				dataSource={list}
				columns={columns as any}
				size='middle'
				pagination={false}
				scroll={{ x: 860 }}
				locale={{ emptyText: 'Chưa cấu hình định mức nào cho dịch vụ này' }}
			/>
		</Modal>
	);
}
