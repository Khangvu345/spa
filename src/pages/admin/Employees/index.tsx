// Quản lý nhân viên — ADMIN only. Khớp design Pencil:
//  - Header: title + search + filter role/trạng thái + button "Thêm nhân viên" (pink gradient)
//  - Table: tên, email, SĐT, role chip, trạng thái chip, ngày bắt đầu, actions
//  - Modal Tạo/Sửa + actions Lock/Unlock/Reset/Delete (Popconfirm)
import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Input, Select, Button, Tag, Dropdown, Menu, Popconfirm, Tooltip } from 'antd';
import { useModel } from 'umi';
import moment from 'moment';
import { Plus, Search, MoreHorizontal, Lock, Unlock, KeyRound, Trash2, Pencil, Eye } from 'lucide-react';
import {
	ACCOUNT_STATUS_OPTIONS,
	ROLE_OPTIONS,
	WORK_STATUS_OPTIONS,
} from '@/services/Employees/constant';
import EmployeeFormModal from './components/EmployeeFormModal';
import StaffProfileModal from './components/StaffProfileModal';
import PageHeader from '@/components/PageHeader';
import './styles.less';

export default function EmployeesPage() {
	const { list, total, loading, query, fetch, create, update, lock, unlock, reset, remove } = useModel(
		'employees',
	) as any;

	const [searchInput, setSearchInput] = useState('');
	const searchTimerRef = useRef<number | undefined>();

	// Debounce 300ms: gõ là gọi luôn, không cần Enter.
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
	const [editing, setEditing] = useState<Employees.IEmployee | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [profileStaff, setProfileStaff] = useState<Employees.IEmployee | null>(null);

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
				title: 'Họ tên',
				dataIndex: 'fullName',
				width: 220,
				ellipsis: true,
				render: (v: string, r: Employees.IEmployee) => (
					<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
						<div
							style={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								background: 'linear-gradient(135deg, #c47070, #e8a0a0)',
								color: '#fff',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontWeight: 600,
								fontSize: 13,
							}}
						>
							{v?.[0]?.toUpperCase()}
						</div>
						<span style={{ fontWeight: 500 }}>{v}</span>
					</div>
				),
			},
			{ title: 'Email', dataIndex: 'email', width: 220, ellipsis: true },
			{ title: 'SĐT', dataIndex: 'phone', width: 130, align: 'center' as const },
			{
				title: 'Vai trò',
				dataIndex: 'role',
				width: 110,
				align: 'center' as const,
				render: (v: Auth.TStaffRole) => {
					const opt = ROLE_OPTIONS.find((r) => r.value === v);
					return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
				},
				filters: ROLE_OPTIONS.map((r) => ({ text: r.label, value: r.value })),
				onFilter: (val: any, r: any) => r.role === val,
			},
			{
				title: 'Trạng thái TK',
				dataIndex: 'accountStatus',
				width: 140,
				align: 'center' as const,
				render: (v: Auth.TAccountStatus) => {
					const opt = ACCOUNT_STATUS_OPTIONS.find((s) => s.value === v);
					return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
				},
			},
			{
				title: 'Công việc',
				dataIndex: 'workStatus',
				width: 120,
				align: 'center' as const,
				render: (v: Auth.TWorkStatus) => {
					const opt = WORK_STATUS_OPTIONS.find((s) => s.value === v);
					return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
				},
			},
			{
				title: 'Ngày bắt đầu',
				dataIndex: 'startedAt',
				width: 130,
				align: 'center' as const,
				render: (v: string) => (v ? moment(v).format('DD/MM/YYYY') : '—'),
			},
			{
				title: 'Thao tác',
				key: 'actions',
				width: 90,
				align: 'center' as const,
				render: (_: any, r: Employees.IEmployee) => (
					<Dropdown
						overlay={
							<Menu>
								<Menu.Item
									key='view'
									icon={<Eye size={14} />}
									onClick={() => setProfileStaff(r)}
								>
									Xem hồ sơ
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
								<Menu.Item key='reset' icon={<KeyRound size={14} />}>
									<Popconfirm
										title='Reset mật khẩu về mặc định?'
										onConfirm={() => reset(r.id)}
										okText='Reset'
										cancelText='Huỷ'
									>
										Reset mật khẩu
									</Popconfirm>
								</Menu.Item>
								{r.accountStatus === 'LOCKED' ? (
									<Menu.Item key='unlock' icon={<Unlock size={14} />} onClick={() => unlock(r.id)}>
										Mở khoá
									</Menu.Item>
								) : (
									<Menu.Item key='lock' icon={<Lock size={14} />}>
										<Popconfirm
											title='Khoá tài khoản này?'
											onConfirm={() => lock(r.id)}
											okText='Khoá'
											cancelText='Huỷ'
											okButtonProps={{ danger: true }}
										>
											Khoá tài khoản
										</Popconfirm>
									</Menu.Item>
								)}
								<Menu.Divider />
								<Menu.Item
									key='delete'
									danger
									disabled={r.accountStatus !== 'LOCKED'}
									icon={<Trash2 size={14} />}
								>
									<Popconfirm
										title={
											<span>
												Xoá vĩnh viễn nhân viên này?<br />
												<small style={{ color: '#666' }}>
													Yêu cầu: đã khoá tài khoản &gt; 30 ngày.
												</small>
											</span>
										}
										onConfirm={() => remove(r.id)}
										okText='Xoá'
										cancelText='Huỷ'
										okButtonProps={{ danger: true }}
										disabled={r.accountStatus !== 'LOCKED'}
									>
										{r.accountStatus === 'LOCKED' ? 'Xoá' : 'Xoá (cần khoá trước)'}
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
		[reset, lock, unlock, remove],
	);

	return (
		<div className='employees-page'>
			<PageHeader
				title='Quản lý Nhân viên'
				subtitle='Danh sách nhân viên hệ thống'
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
						Thêm nhân viên
					</Button>
				}
			/>

			<div className='employees-page__toolbar'>
				<Input
					prefix={<Search size={14} color='#9B9B9B' />}
					placeholder='Tìm theo tên, email...'
					allowClear
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					style={{ width: 260, borderRadius: 10 }}
				/>
				<Select
					allowClear
					placeholder='Tất cả vai trò'
					style={{ width: 160 }}
					options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
					onChange={(v) => fetch({ role: v, page: 1 })}
				/>
				<Select
					allowClear
					placeholder='Trạng thái'
					style={{ width: 160 }}
					options={WORK_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
					onChange={(v) => fetch({ workStatus: v, page: 1 })}
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

			<EmployeeFormModal
				open={modalOpen}
				editing={editing}
				loading={submitting}
				onCancel={() => {
					setModalOpen(false);
					setEditing(null);
				}}
				onSubmit={onSubmit}
			/>

			<StaffProfileModal
				open={!!profileStaff}
				staff={profileStaff}
				onCancel={() => setProfileStaff(null)}
			/>
		</div>
	);
}
