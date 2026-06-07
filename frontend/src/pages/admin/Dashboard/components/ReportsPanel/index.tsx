import React, { useCallback, useEffect, useState } from 'react';
import { Tabs, Table, DatePicker, Button, message, Tooltip } from 'antd';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Eye } from 'lucide-react';
import moment, { Moment } from 'moment';
import * as reportsApi from '@/services/Reports/api';
import { formatPrice } from '@/services/admin/Dashboard/constant';
import ServiceInvoicesModal from './ServiceInvoicesModal';
import './style.less';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const fmt = (m: Moment) => m.format('YYYY-MM-DD');

// Báo cáo doanh thu (RP-02..RP-07) — đặt ngay dưới Dashboard. Lọc theo kỳ +
// 2 tab (theo dịch vụ / theo nhân viên) + drill-down hoá đơn + export Excel.
const ReportsPanel: React.FC = () => {
	const [range, setRange] = useState<[Moment, Moment]>([moment().startOf('month'), moment().endOf('month')]);
	const [loading, setLoading] = useState(false);
	const [exporting, setExporting] = useState(false);
	const [exportingPdf, setExportingPdf] = useState(false);
	const [revenue, setRevenue] = useState<ReportMgmt.IRevenueReport | null>(null);
	const [byService, setByService] = useState<ReportMgmt.IServiceRevenueRow[]>([]);
	const [byStaff, setByStaff] = useState<ReportMgmt.IStaffStats[]>([]);
	const [drill, setDrill] = useState<{ serviceId: string; serviceName: string } | null>(null);

	const fetchAll = useCallback(async (from: string, to: string) => {
		setLoading(true);
		try {
			const q = { fromDate: from, toDate: to };
			const [rev, svc, staff] = await Promise.all([
				reportsApi.getRevenueReport(q),
				reportsApi.getReportByService(q),
				reportsApi.getReportByStaff(q),
			]);
			setRevenue(rev);
			setByService(svc);
			setByStaff(staff);
		} catch (e: any) {
			message.error(e?.response?.data?.message || 'Không tải được báo cáo');
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAll(fmt(range[0]), fmt(range[1]));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const applyRange = (a: Moment, b: Moment) => {
		setRange([a, b]);
		fetchAll(fmt(a), fmt(b));
	};

	const onRangeChange = (r: any) => {
		if (!r || !r[0] || !r[1]) return;
		applyRange(r[0], r[1]);
	};

	// Preset chip lọc nhanh (chủ yếu dùng trên mobile).
	const presets: { key: string; label: string; range: () => [Moment, Moment] }[] = [
		{ key: 'today', label: 'Hôm nay', range: () => [moment().startOf('day'), moment().endOf('day')] },
		{ key: '7d', label: '7 ngày', range: () => [moment().subtract(6, 'day').startOf('day'), moment().endOf('day')] },
		{ key: '30d', label: '30 ngày', range: () => [moment().subtract(29, 'day').startOf('day'), moment().endOf('day')] },
		{ key: 'month', label: 'Tháng này', range: () => [moment().startOf('month'), moment().endOf('month')] },
		{
			key: 'lastMonth',
			label: 'Tháng trước',
			range: () => [
				moment().subtract(1, 'month').startOf('month'),
				moment().subtract(1, 'month').endOf('month'),
			],
		},
	];
	const isActivePreset = (p: { range: () => [Moment, Moment] }) => {
		const [a, b] = p.range();
		return a.isSame(range[0], 'day') && b.isSame(range[1], 'day');
	};

	const onExport = async () => {
		setExporting(true);
		try {
			await reportsApi.exportRevenueExcel({ fromDate: fmt(range[0]), toDate: fmt(range[1]) });
		} catch {
			message.error('Xuất Excel thất bại');
		} finally {
			setExporting(false);
		}
	};

	// RP-07B — xuất PDF báo cáo doanh thu (mở tab mới để xem/in).
	const onExportPdf = async () => {
		setExportingPdf(true);
		try {
			await reportsApi.exportRevenuePdf({ fromDate: fmt(range[0]), toDate: fmt(range[1]) });
		} catch {
			message.error('Xuất PDF thất bại');
		} finally {
			setExportingPdf(false);
		}
	};

	// Căn giữa các cột số liệu; riêng cột tên (Dịch vụ / Nhân viên) giữ căn trái.
	const serviceColumns = [
		{ title: 'Dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
		{ title: 'Số lượt', dataIndex: 'count', key: 'count', align: 'center' as const, width: 100 },
		{
			title: 'Doanh thu',
			dataIndex: 'revenue',
			key: 'revenue',
			align: 'center' as const,
			width: 160,
			render: (v: number) => formatPrice(v),
		},
		{
			title: '',
			key: 'action',
			align: 'center' as const,
			width: 60,
			render: (_: any, row: ReportMgmt.IServiceRevenueRow) => (
				<Tooltip title='Xem hoá đơn'>
					<Button
						type='text'
						icon={<Eye size={16} />}
						onClick={() => setDrill({ serviceId: row.serviceId, serviceName: row.serviceName })}
					/>
				</Tooltip>
			),
		},
	];

	const staffColumns = [
		{ title: 'Nhân viên', dataIndex: 'staffName', key: 'staffName' },
		{ title: 'Số ca', dataIndex: 'serviceCount', key: 'serviceCount', align: 'center' as const, width: 100 },
		{
			title: 'Doanh thu mang lại',
			dataIndex: 'revenueGenerated',
			key: 'revenueGenerated',
			align: 'center' as const,
			width: 180,
			render: (v: number) => formatPrice(v),
		},
		{
			title: 'Hoa hồng',
			dataIndex: 'totalCommission',
			key: 'totalCommission',
			align: 'center' as const,
			width: 160,
			render: (v: number) => formatPrice(v),
		},
	];

	return (
		<div className='reports-panel'>
			<div className='reports-panel__header'>
				<div>
					<h3>Báo cáo doanh thu</h3>
					{revenue && (
						<span className='reports-panel__summary'>
							Tổng doanh thu kỳ: <b>{formatPrice(revenue.totalRevenue)}</b> · {revenue.invoiceCount} hoá đơn đã thanh toán
						</span>
					)}
				</div>
				<div className='reports-panel__actions'>
					<RangePicker
						value={range as any}
						allowClear={false}
						format='DD/MM/YYYY'
						dropdownClassName='reports-range-dropdown'
						onChange={onRangeChange}
						ranges={{
							'Tháng này': [moment().startOf('month'), moment().endOf('month')],
							'Tháng trước': [
								moment().subtract(1, 'month').startOf('month'),
								moment().subtract(1, 'month').endOf('month'),
							],
							'7 ngày qua': [moment().subtract(6, 'day').startOf('day'), moment().endOf('day')],
						}}
					/>
					<Button icon={<DownloadOutlined />} loading={exporting} onClick={onExport}>
						Xuất Excel
					</Button>
					<Button icon={<FilePdfOutlined />} loading={exportingPdf} onClick={onExportPdf}>
						Xuất PDF
					</Button>
				</div>
			</div>

			{/* Chip lọc nhanh — chỉ hiện ở mobile (ẩn desktop qua CSS) */}
			<div className='reports-panel__quick'>
				{presets.map((p) => (
					<button
						key={p.key}
						type='button'
						className={`reports-panel__chip${isActivePreset(p) ? ' is-active' : ''}`}
						onClick={() => {
							const [a, b] = p.range();
							applyRange(a, b);
						}}
					>
						{p.label}
					</button>
				))}
			</div>

			<Tabs defaultActiveKey='service'>
				<TabPane tab='Theo dịch vụ' key='service'>
					<Table
						rowKey='serviceId'
						loading={loading}
						dataSource={byService}
						columns={serviceColumns}
						size='small'
						pagination={false}
						scroll={{ x: 560 }}
					/>
				</TabPane>
				<TabPane tab='Theo nhân viên' key='staff'>
					<Table
						rowKey='staffId'
						loading={loading}
						dataSource={byStaff}
						columns={staffColumns}
						size='small'
						pagination={false}
						scroll={{ x: 620 }}
					/>
				</TabPane>
			</Tabs>

			<ServiceInvoicesModal
				open={!!drill}
				serviceId={drill?.serviceId ?? ''}
				serviceName={drill?.serviceName ?? ''}
				fromDate={fmt(range[0])}
				toDate={fmt(range[1])}
				onClose={() => setDrill(null)}
			/>
		</div>
	);
};

export default ReportsPanel;
