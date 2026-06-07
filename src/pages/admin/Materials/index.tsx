// Quản lý vật liệu — ADMIN. Khớp design Pencil.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Input, Select, Button, Tag, Dropdown, Menu, Popconfirm, Tooltip } from 'antd';
import { useModel } from 'umi';
import { Plus, Search, MoreHorizontal, Pencil, Power, PackagePlus, Eye } from 'lucide-react';
import {
	MATERIAL_TYPE_OPTIONS,
	MATERIAL_STATUS_OPTIONS,
	fmtQty,
} from '@/services/Materials/constant';
import MaterialFormModal from './components/MaterialFormModal';
import StockAdjustModal from './components/StockAdjustModal';
import MaterialDetailDrawer from './components/MaterialDetailDrawer';
import PageHeader from '@/components/PageHeader';
import '@/pages/admin/Employees/styles.less';

export default function MaterialsPage() {
	const { list, total, loading, suppliers, query, fetch, fetchSuppliers, create, update, toggleActive } =
		useModel('materials') as any;

	const [searchInput, setSearchInput] = useState('');
	const searchTimerRef = useRef<number | undefined>();

	useEffect(() => {
		if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
		searchTimerRef.current = window.setTimeout(() => {
			fetch({ search: searchInput.trim() || undefined, page: 1 });
		}, 300);
		return () => {
			if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput]);

	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<MaterialMgmt.IMaterial | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [stockModalOpen, setStockModalOpen] = useState(false);
	const [adjustingStock, setAdjustingStock] = useState<MaterialMgmt.IMaterial | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [viewingMaterial, setViewingMaterial] = useState<MaterialMgmt.IMaterial | null>(null);

	useEffect(() => {
		fetch();
		fetchSuppliers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async (payload: any) => {
		setSubmitting(true);
		try {
			if (editing) await update(editing.id, payload);
			else await create(payload);
			setModalOpen(false);
			setEditing(null);
		} finally {
			setSubmitting(false);
		}
	};

	const columns = useMemo(
		() => [
			{
				title: 'Mã',
				dataIndex: 'code',
				width: 130,
				render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
			},
			{
				title: 'Tên vật liệu',
				dataIndex: 'name',
				width: 220,
				ellipsis: true,
				render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
			},
			{
				title: 'NCC',
				dataIndex: ['supplier', 'name'],
				width: 180,
				ellipsis: true,
				render: (_: any, r: MaterialMgmt.IMaterial) => r.supplier?.name || '—',
			},
			{
				title: 'Đơn vị',
				dataIndex: 'unit',
				width: 90,
				align: 'center' as const,
			},
			{
				title: 'Tồn kho',
				dataIndex: 'stockQuantity',
				width: 110,
				align: 'center' as const,
				render: (v: number, r: MaterialMgmt.IMaterial) => {
					const low = v <= r.reorderLevel;
					return (
						<span style={{ color: low ? '#DC2626' : '#1F2937', fontWeight: low ? 600 : 400 }}>
							{fmtQty(v)}
						</span>
					);
				},
			},
			{
				title: 'Tối thiểu',
				dataIndex: 'reorderLevel',
				width: 100,
				align: 'center' as const,
			},
			{
				title: 'Giá nhập',
				dataIndex: 'unitPrice',
				width: 130,
				align: 'center' as const,
				render: (v: number) => `${v?.toLocaleString('vi-VN')}đ`,
			},
			{
				title: 'Loại',
				dataIndex: 'type',
				width: 110,
				align: 'center' as const,
				render: (v: MaterialMgmt.TType) => {
					const opt = MATERIAL_TYPE_OPTIONS.find((t) => t.value === v);
					return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
				},
			},
			{
				title: 'Trạng thái',
				dataIndex: 'isActive',
				width: 130,
				align: 'center' as const,
				render: (v: boolean) => {
					const opt = MATERIAL_STATUS_OPTIONS.find((s) => s.value === v);
					return <Tag color={opt?.color}>{opt?.label}</Tag>;
				},
			},
			{
				title: 'Thao tác',
				key: 'actions',
				width: 90,
				align: 'center' as const,
				render: (_: any, r: MaterialMgmt.IMaterial) => (
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item
									key='view'
									icon={<Eye size={14} />}
									onClick={() => {
										setViewingMaterial(r);
										setDetailOpen(true);
									}}
								>
									Xem chi tiết
								</Menu.Item>
								<Menu.Item
									key='edit'
									icon={<Pencil size={14} />}
									onClick={() => {
										setEditing(r);
										setModalOpen(true);
									}}
								>
									Cập nhật
								</Menu.Item>
								<Menu.Item
									key='stock'
									icon={<PackagePlus size={14} />}
									onClick={() => {
										setAdjustingStock(r);
										setStockModalOpen(true);
									}}
								>
									Điều chỉnh tồn kho
								</Menu.Item>
								<Menu.Item key='toggle' icon={<Power size={14} />}>
									<Popconfirm
										title={r.isActive ? 'Ngưng sử dụng vật liệu này?' : 'Kích hoạt lại?'}
										onConfirm={() => toggleActive(r)}
										okText='Đồng ý'
										cancelText='Huỷ'
									>
										{r.isActive ? 'Ngưng' : 'Kích hoạt'}
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
		],
		[toggleActive],
	);

	return (
		<div className='employees-page'>
			<PageHeader
				title='Quản lý Vật liệu'
				subtitle='Quản lý kho vật liệu và nguyên liệu spa'
				extras={
					<Button
						type='primary'
						icon={<Plus size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
						className='employees-page__add-btn'
						onClick={() => {
							setEditing(null);
							setModalOpen(true);
						}}
					>
						Thêm vật liệu
					</Button>
				}
			/>

			<div className='employees-page__toolbar'>
				<Input
					prefix={<Search size={14} color='#9B9B9B' />}
					placeholder='Tìm theo tên vật liệu...'
					allowClear
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					style={{ width: 260, borderRadius: 10 }}
				/>
				<Select
					allowClear
					placeholder='Loại'
					style={{ width: 160 }}
					options={MATERIAL_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
					onChange={(v) => fetch({ type: v, page: 1 })}
				/>
				<Select
					allowClear
					showSearch
					optionFilterProp='label'
					placeholder='Nhà cung cấp'
					style={{ width: 220 }}
					options={suppliers.map((s: any) => ({ value: s.id, label: s.name }))}
					onChange={(v) => fetch({ supplierId: v, page: 1 })}
				/>
				<Select
					allowClear
					placeholder='Trạng thái'
					style={{ width: 160 }}
					options={MATERIAL_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
					onChange={(v) => fetch({ isActive: v, page: 1 })}
				/>
			</div>

			<Table
				rowKey='id'
				loading={loading}
				dataSource={list}
				columns={columns as any}
				scroll={{ x: 1400 }}
				pagination={{
					current: query.page,
					pageSize: query.limit,
					total,
					showSizeChanger: true,
					onChange: (page, limit) => fetch({ page, limit }),
				}}
				className='employees-page__table'
			/>

			<MaterialFormModal
				open={modalOpen}
				editing={editing}
				suppliers={suppliers}
				loading={submitting}
				onCancel={() => {
					setModalOpen(false);
					setEditing(null);
				}}
				onSubmit={onSubmit}
			/>

			<StockAdjustModal
				open={stockModalOpen}
				material={adjustingStock}
				suppliers={suppliers}
				onCancel={() => {
					setStockModalOpen(false);
					setAdjustingStock(null);
				}}
				onSuccess={() => {
					setStockModalOpen(false);
					setAdjustingStock(null);
					fetch();
				}}
			/>

			<MaterialDetailDrawer
				open={detailOpen}
				material={viewingMaterial}
				onClose={() => {
					setDetailOpen(false);
					setViewingMaterial(null);
				}}
			/>
		</div>
	);
}
