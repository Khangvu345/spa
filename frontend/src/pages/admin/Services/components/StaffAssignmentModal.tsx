// Modal quản lý phân công NV-DV của 1 service.
// - List assignment entries của service
// - Phân công NV (chọn từ /employees role=STAFF active) → POST
// - Sửa commissionRate / note → PATCH
// - Bật/tắt isActive → PATCH
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
	Tag,
	Tooltip,
	Dropdown,
	Menu,
} from 'antd';
import { useModel } from 'umi';
import { Plus, Check, X, MoreHorizontal, Pencil } from 'lucide-react';
import * as employeesApi from '@/services/Employees/api';

type Props = {
	open: boolean;
	service: SvcMgmt.IService | null;
	onClose: () => void;
};

export default function StaffAssignmentModal({ open, service, onClose }: Props) {
	const { list, loading, fetchByService, create, update, reset } = useModel(
		'staffServiceAssignments',
	) as any;

	const [staffs, setStaffs] = useState<Employees.IEmployee[]>([]);
	const [staffLoading, setStaffLoading] = useState(false);
	const [addOpen, setAddOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editRate, setEditRate] = useState<number>(0);
	const [editNote, setEditNote] = useState<string>('');

	const [form] = Form.useForm();

	useEffect(() => {
		if (open && service) {
			fetchByService(service.id);
			(async () => {
				setStaffLoading(true);
				try {
					const res = await employeesApi.getEmployees({ page: 1, limit: 100 } as any);
					const items: Employees.IEmployee[] = (res.data as any).data ?? [];
					setStaffs(
						items.filter((s) => s.role === 'STAFF' && s.workStatus === 'ACTIVE' && s.accountStatus === 'ACTIVE'),
					);
				} finally {
					setStaffLoading(false);
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

	const usedStaffIds = useMemo(
		() => new Set((list as AssignMgmt.IAssignment[]).map((a) => a.staffId)),
		[list],
	);
	const availableStaffs = useMemo(
		() => staffs.filter((s) => !usedStaffIds.has(s.id)),
		[staffs, usedStaffIds],
	);

	const onAdd = async () => {
		if (!service) return;
		const values = await form.validateFields();
		setSubmitting(true);
		try {
			await create({
				staffId: values.staffId,
				serviceId: service.id,
				commissionRate: values.commissionRate,
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

	const startEdit = (a: AssignMgmt.IAssignment) => {
		setEditingId(a.id);
		setEditRate(a.commissionRate);
		setEditNote(a.note ?? '');
	};

	const saveEdit = async (a: AssignMgmt.IAssignment) => {
		await update(a.id, { commissionRate: editRate, note: editNote.trim() || undefined });
		setEditingId(null);
	};

	const columns = [
		{
			title: 'Chuyên viên',
			dataIndex: ['staff', 'fullName'],
			width: 200,
			render: (v: string, r: AssignMgmt.IAssignment) => (
				<div>
					<div style={{ fontWeight: 500 }}>{v}</div>
					<div style={{ fontSize: 11, color: '#6B7280' }}>{r.staff?.role}</div>
				</div>
			),
		},
		{
			title: 'Hoa hồng (%)',
			dataIndex: 'commissionRate',
			width: 140,
			align: 'center' as const,
			render: (v: number, r: AssignMgmt.IAssignment) =>
				editingId === r.id ? (
					<InputNumber
						min={0}
						max={100}
						value={editRate}
						onChange={(n) => setEditRate(Number(n ?? 0))}
						style={{ width: 100 }}
					/>
				) : (
					<span style={{ fontWeight: 500 }}>{v}%</span>
				),
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
			width: 220,
			ellipsis: true,
			render: (v: string, r: AssignMgmt.IAssignment) =>
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
			render: (v: boolean, r: AssignMgmt.IAssignment) => (
				<div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
					<Switch
						checked={v}
						size='small'
						onChange={(checked) => update(r.id, { isActive: checked })}
					/>
					<Tag color={v ? '#059669' : '#DC2626'} style={{ margin: 0 }}>
						{v ? 'Đang phụ trách' : 'Tạm ngưng'}
					</Tag>
				</div>
			),
		},
		{
			title: 'Thao tác',
			key: 'actions',
			width: 90,
			align: 'center' as const,
			render: (_: any, r: AssignMgmt.IAssignment) =>
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
			visible={open}
			onCancel={onClose}
			footer={null}
			width={920}
			centered
			destroyOnClose
			title={
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 32 }}>
					<div>
						<div style={{ fontSize: 16, fontWeight: 600 }}>Phân công chuyên viên</div>
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
						Thêm chuyên viên
					</Button>
				</div>
			}
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
						name='staffId'
						label='Chuyên viên'
						rules={[{ required: true, message: 'Chọn chuyên viên' }]}
					>
						<Select
							showSearch
							loading={staffLoading}
							optionFilterProp='label'
							placeholder='Chọn chuyên viên'
							style={{ width: 280 }}
							options={availableStaffs.map((s) => ({
								value: s.id,
								label: `${s.fullName} (${s.phone})`,
							}))}
							notFoundContent={availableStaffs.length === 0 ? 'Hết chuyên viên khả dụng' : undefined}
						/>
					</Form.Item>
					<Form.Item
						name='commissionRate'
						label='Hoa hồng (%)'
						rules={[{ required: true, message: 'Bắt buộc' }]}
						initialValue={20}
					>
						<InputNumber min={0} max={100} style={{ width: 100 }} />
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
				<Tag color='#2563EB'>{list.length}</Tag> chuyên viên đang được gán
			</div>

			<Table
				rowKey='id'
				loading={loading}
				dataSource={list}
				columns={columns as any}
				size='middle'
				pagination={false}
				scroll={{ x: 820 }}
				locale={{ emptyText: 'Chưa phân công chuyên viên nào cho dịch vụ này' }}
			/>
		</Modal>
	);
}
