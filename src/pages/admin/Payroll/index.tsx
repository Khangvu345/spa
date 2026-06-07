// Quản lý Bảng lương — ADMIN. Chốt lương hàng tháng theo NV:
//  - Filter kỳ (năm/tháng) + nhân viên + trạng thái
//  - Bảng phiếu lương (mã, NV, kỳ, lương cứng, hoa hồng, điều chỉnh, tổng nhận, trạng thái)
//  - Chốt lương 1 NV (preview) + Chốt hàng loạt + chi tiết/mark-paid/cancel/PDF
import { useEffect, useMemo, useState } from 'react';
import { Table, Select, Button, Tag, Tooltip } from 'antd';
import { useModel } from 'umi';
import { Plus, Users, Eye } from 'lucide-react';
import * as employeeApi from '@/services/Employees/api';
import {
	PAYROLL_STATUS_OPTIONS,
	PAYROLL_STATUS_MAP,
	MONTH_OPTIONS,
	buildYearOptions,
} from '@/services/Payroll/constant';
import PageHeader from '@/components/PageHeader';
import PreviewFinalizeModal from './components/PreviewFinalizeModal';
import BatchFinalizeModal from './components/BatchFinalizeModal';
import PayrollDetailModal from './components/PayrollDetailModal';
import '@/pages/admin/Employees/styles.less';

const yearOptions = buildYearOptions();
const fmt = (n?: number) => (n ?? 0).toLocaleString('vi-VN');

export default function PayrollPage() {
	const { list, total, loading, query, fetch, loadDetail } = useModel('payroll') as any;

	const [staffOptions, setStaffOptions] = useState<{ value: string; label: string }[]>([]);
	const [staffNameMap, setStaffNameMap] = useState<Record<string, string>>({});

	const [previewOpen, setPreviewOpen] = useState(false);
	const [batchOpen, setBatchOpen] = useState(false);
	const [detail, setDetail] = useState<PayrollMgmt.IPayroll | null>(null);

	useEffect(() => {
		fetch();
		loadStaff();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadStaff = async () => {
		try {
			const res = await employeeApi.getEmployees({ limit: 100, sortBy: 'fullName', sortOrder: 'asc' });
			const employees = res.data.data ?? [];
			setStaffOptions(
				employees.map((e) => ({ value: e.id, label: `${e.fullName} · ${e.role}` })),
			);
			const map: Record<string, string> = {};
			employees.forEach((e) => {
				map[e.id] = e.fullName;
			});
			setStaffNameMap(map);
		} catch {
			// im lặng — filter NV vẫn dùng được khi có dữ liệu phiếu
		}
	};

	const openDetail = async (id: string) => {
		const res = await loadDetail(id);
		if (res) setDetail(res);
	};

	const columns = useMemo(
		() => [
			{
				title: 'Mã phiếu',
				dataIndex: 'payrollCode',
				width: 150,
				render: (v: string) => <code style={{ fontSize: 12 }}>{v}</code>,
			},
			{
				title: 'Nhân viên',
				dataIndex: ['staffSnapshot', 'fullName'],
				width: 200,
				ellipsis: true,
				render: (v: string, r: PayrollMgmt.IPayroll) => (
					<div>
						<div style={{ fontWeight: 500 }}>{v}</div>
						<div style={{ color: '#6B7280', fontSize: 11 }}>{r.staffSnapshot.role}</div>
					</div>
				),
			},
			{
				title: 'Kỳ',
				key: 'period',
				width: 90,
				align: 'center' as const,
				render: (_: any, r: PayrollMgmt.IPayroll) => `${r.periodMonth}/${r.periodYear}`,
			},
			{
				title: 'Lương cứng',
				dataIndex: 'baseSalary',
				width: 120,
				align: 'right' as const,
				render: (v: number) => fmt(v),
			},
			{
				title: 'Hoa hồng',
				dataIndex: 'totalCommission',
				width: 120,
				align: 'right' as const,
				render: (v: number) => fmt(v),
			},
			{
				title: 'Điều chỉnh',
				dataIndex: 'adjustment',
				width: 110,
				align: 'right' as const,
				render: (v: number) => (
					<span style={{ color: v < 0 ? '#DC2626' : v > 0 ? '#059669' : undefined }}>
						{v > 0 ? '+' : ''}
						{fmt(v)}
					</span>
				),
			},
			{
				title: 'Tổng nhận',
				dataIndex: 'totalIncome',
				width: 130,
				align: 'right' as const,
				render: (v: number) => <span style={{ fontWeight: 700, color: '#c47070' }}>{fmt(v)}</span>,
			},
			{
				title: 'Trạng thái',
				dataIndex: 'status',
				width: 110,
				align: 'center' as const,
				render: (v: PayrollMgmt.TStatus) => {
					const opt = PAYROLL_STATUS_MAP[v];
					return <Tag color={opt?.color}>{opt?.label ?? v}</Tag>;
				},
			},
			{
				title: 'Thao tác',
				key: 'actions',
				width: 80,
				align: 'center' as const,
				render: (_: any, r: PayrollMgmt.IPayroll) => (
					<Tooltip title='Xem chi tiết'>
						<Button type='text' icon={<Eye size={18} />} onClick={() => openDetail(r.id)} />
					</Tooltip>
				),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	return (
		<div className='employees-page'>
			<PageHeader
				title='Bảng lương'
				subtitle='Chốt lương hàng tháng — lương cứng + hoa hồng + điều chỉnh'
				extras={
					<div style={{ display: 'flex', gap: 12 }}>
						<Button
							icon={<Users size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
							onClick={() => setBatchOpen(true)}
							style={{ height: 40, borderRadius: 20, fontWeight: 700 }}
						>
							Chốt hàng loạt
						</Button>
						<Button
							type='primary'
							icon={<Plus size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
							className='employees-page__add-btn'
							onClick={() => setPreviewOpen(true)}
						>
							Chốt lương
						</Button>
					</div>
				}
			/>

			<div className='employees-page__toolbar'>
				<Select
					value={query.periodYear}
					style={{ width: 110 }}
					options={yearOptions}
					onChange={(v) => fetch({ periodYear: v, page: 1 })}
					placeholder='Năm'
				/>
				<Select
					value={query.periodMonth}
					style={{ width: 120 }}
					options={MONTH_OPTIONS}
					listHeight={384}
					virtual={false}
					onChange={(v) => fetch({ periodMonth: v, page: 1 })}
					placeholder='Tháng'
				/>
				<Select
					allowClear
					showSearch
					optionFilterProp='label'
					placeholder='Tất cả nhân viên'
					style={{ width: 240 }}
					options={staffOptions}
					value={query.staffId}
					onChange={(v) => fetch({ staffId: v, page: 1 })}
				/>
				<Select
					allowClear
					placeholder='Tất cả trạng thái'
					style={{ width: 170 }}
					options={PAYROLL_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
					value={query.status}
					onChange={(v) => fetch({ status: v, page: 1 })}
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
					showTotal: (t) => `Tổng ${t} phiếu`,
					onChange: (page, limit) => fetch({ page, limit }),
				}}
				className='employees-page__table'
			/>

			<PreviewFinalizeModal
				open={previewOpen}
				staffOptions={staffOptions}
				onCancel={() => setPreviewOpen(false)}
				onFinalized={() => {
					setPreviewOpen(false);
					fetch({ page: 1 });
				}}
			/>

			<BatchFinalizeModal
				open={batchOpen}
				staffNameMap={staffNameMap}
				onCancel={() => setBatchOpen(false)}
				onFinalized={() => fetch({ page: 1 })}
			/>

			<PayrollDetailModal
				open={!!detail}
				payroll={detail}
				onCancel={() => setDetail(null)}
				onAfterAction={() => {
					setDetail(null);
					fetch();
				}}
			/>
		</div>
	);
}
