// Quản lý nhà cung cấp — ADMIN. Khớp design Pencil.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Input, Select, Button, Tag, Dropdown, Menu, Popconfirm, Tooltip } from 'antd';
import { useModel } from 'umi';
import { Plus, Search, MoreHorizontal, Pencil, Power } from 'lucide-react';
import { SUPPLIER_STATUS_OPTIONS } from '@/services/Suppliers/constant';
import SupplierFormModal from './components/SupplierFormModal';
import PageHeader from '@/components/PageHeader';
import '@/pages/admin/Employees/styles.less';

export default function SuppliersPage() {
	const { list, total, loading, query, fetch, create, update, toggleActive } = useModel('suppliers') as any;

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
	const [editing, setEditing] = useState<SupplierMgmt.ISupplier | null>(null);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetch();
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
				title: 'Tên NCC',
				dataIndex: 'name',
				width: 240,
				ellipsis: true,
				render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
			},
			{ title: 'Người liên hệ', dataIndex: 'contactPerson', width: 170, ellipsis: true },
			{ title: 'Số điện thoại', dataIndex: 'phone', width: 140, align: 'center' as const },
			{ title: 'Email', dataIndex: 'email', width: 220, ellipsis: true, render: (v?: string) => v || '—' },
			{ title: 'Mã thuế', dataIndex: 'taxCode', width: 130, align: 'center' as const, render: (v?: string) => v || '—' },
			{
				title: 'Trạng thái',
				dataIndex: 'isActive',
				width: 140,
				align: 'center' as const,
				render: (v: boolean) => {
					const opt = SUPPLIER_STATUS_OPTIONS.find((s) => s.value === v);
					return <Tag color={opt?.color}>{opt?.label}</Tag>;
				},
			},
			{
				title: 'Thao tác',
				key: 'actions',
				width: 90,
				align: 'center' as const,
				render: (_: any, r: SupplierMgmt.ISupplier) => (
					<Dropdown
						overlay={
							<Menu>
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
								<Menu.Item key='toggle' icon={<Power size={14} />}>
									<Popconfirm
										title={r.isActive ? 'Ngưng hợp tác với NCC này?' : 'Kích hoạt lại hợp tác?'}
										onConfirm={() => toggleActive(r)}
										okText='Đồng ý'
										cancelText='Huỷ'
									>
										{r.isActive ? 'Ngưng hợp tác' : 'Kích hoạt'}
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
				title='Quản lý Nhà cung cấp'
				subtitle='Quản lý thông tin nhà cung cấp vật liệu'
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
						Thêm NCC
					</Button>
				}
			/>

			<div className='employees-page__toolbar'>
				<Input
					prefix={<Search size={14} color='#9B9B9B' />}
					placeholder='Tìm theo tên, SĐT...'
					allowClear
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					style={{ width: 260, borderRadius: 10 }}
				/>
				<Select
					allowClear
					placeholder='Trạng thái'
					style={{ width: 180 }}
					options={SUPPLIER_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
					onChange={(v) => fetch({ isActive: v, page: 1 })}
				/>
			</div>

			<Table
				rowKey='id'
				loading={loading}
				dataSource={list}
				columns={columns as any}
				scroll={{ x: 1100 }}
				pagination={{
					current: query.page,
					pageSize: query.limit,
					total,
					showSizeChanger: true,
					onChange: (page, limit) => fetch({ page, limit }),
				}}
				className='employees-page__table'
			/>

			<SupplierFormModal
				open={modalOpen}
				editing={editing}
				loading={submitting}
				onCancel={() => {
					setModalOpen(false);
					setEditing(null);
				}}
				onSubmit={onSubmit}
			/>
		</div>
	);
}
