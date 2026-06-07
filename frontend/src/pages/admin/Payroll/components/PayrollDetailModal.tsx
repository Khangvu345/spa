// Chi tiết phiếu lương: breakdown hoa hồng + audit + thao tác theo trạng thái
// (Mark-paid / Cancel kèm lý do / Xuất PDF).
import { useState } from 'react';
import { Modal, Tag, Button, Divider, Table, Popconfirm, Input, message } from 'antd';
import moment from 'moment';
import { useModel } from 'umi';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { PAYROLL_STATUS_MAP } from '@/services/Payroll/constant';

type Props = {
	open: boolean;
	payroll: PayrollMgmt.IPayroll | null;
	onCancel: () => void;
	onAfterAction: () => void;
};

const fmt = (n?: number) => (n ?? 0).toLocaleString('vi-VN');
const fmtTime = (v?: string | null) => (v ? moment(v).format('DD/MM/YYYY HH:mm') : '—');

export default function PayrollDetailModal({ open, payroll, onCancel, onAfterAction }: Props) {
	const { markPaid, cancel, exportPdf, submitting } = useModel('payroll') as any;
	const [cancelReason, setCancelReason] = useState('');
	const [cancelOpen, setCancelOpen] = useState(false);

	if (!payroll) return null;

	const statusOpt = PAYROLL_STATUS_MAP[payroll.status];

	const handleMarkPaid = async () => {
		const res = await markPaid(payroll.id);
		if (res) onAfterAction();
	};

	const handleCancel = async () => {
		if (!cancelReason.trim()) {
			message.warning('Vui lòng nhập lý do huỷ');
			return;
		}
		const res = await cancel(payroll.id, cancelReason.trim());
		if (res) {
			setCancelOpen(false);
			setCancelReason('');
			onAfterAction();
		}
	};

	const breakdownColumns = [
		{ title: 'Dịch vụ', dataIndex: 'serviceName', ellipsis: true },
		{ title: 'SL', dataIndex: 'serviceCount', width: 70, align: 'center' as const },
		{
			title: 'Hoa hồng (đ)',
			dataIndex: 'totalCommission',
			width: 140,
			align: 'right' as const,
			render: (v: number) => fmt(v),
		},
	];

	const footer: React.ReactNode[] = [
		<Button key='close' onClick={onCancel}>
			Đóng
		</Button>,
		<Button
			key='pdf'
			icon={<FileText size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
			loading={submitting}
			onClick={() => exportPdf(payroll.id, payroll.payrollCode)}
		>
			Xuất PDF
		</Button>,
	];

	if (payroll.status === 'FINALIZED') {
		footer.push(
			<Popconfirm
				key='paid'
				title='Xác nhận đã chi lương cho nhân viên này?'
				onConfirm={handleMarkPaid}
				okText='Đã chi'
				cancelText='Huỷ'
			>
				<Button
					type='primary'
					icon={<CheckCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
					loading={submitting}
					style={{ background: '#059669', borderColor: '#059669' }}
				>
					Đánh dấu đã chi
				</Button>
			</Popconfirm>,
		);
		footer.push(
			<Button
				key='cancel'
				danger
				icon={<XCircle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
				onClick={() => setCancelOpen(true)}
			>
				Huỷ phiếu
			</Button>,
		);
	}

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<span style={{ fontWeight: 600 }}>{payroll.payrollCode}</span>
					<Tag color={statusOpt?.color}>{statusOpt?.label}</Tag>
					<span style={{ color: '#6B7280', fontSize: 13, fontWeight: 400 }}>
						Kỳ {payroll.periodMonth}/{payroll.periodYear}
					</span>
				</div>
			}
			visible={open}
			centered
			width={720}
			style={{ maxWidth: '95vw' }}
			bodyStyle={{ maxHeight: '72vh', overflowY: 'auto' }}
			onCancel={onCancel}
			footer={footer}
		>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, fontSize: 13 }}>
				<div>
					<div style={{ color: '#6B7280' }}>Nhân viên</div>
					<div style={{ fontWeight: 600 }}>{payroll.staffSnapshot.fullName}</div>
					<Tag style={{ marginTop: 4 }}>{payroll.staffSnapshot.role}</Tag>
				</div>
				<div>
					<div style={{ color: '#6B7280' }}>Số hoá đơn đã thanh toán trong kỳ</div>
					<div style={{ fontWeight: 500 }}>{payroll.invoiceCount}</div>
				</div>
			</div>

			<Divider style={{ margin: '14px 0' }}>Hoa hồng theo dịch vụ</Divider>

			<Table
				rowKey='serviceId'
				size='small'
				dataSource={payroll.commissionBreakdown}
				columns={breakdownColumns}
				pagination={false}
				locale={{ emptyText: 'Không có hoa hồng trong kỳ' }}
				scroll={{ y: 200 }}
			/>

			<Divider style={{ margin: '16px 0' }} />

			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px 24px', fontSize: 13 }}>
				<Row label='Lương cứng' value={`${fmt(payroll.baseSalary)} đ`} />
				<Row label='Tổng hoa hồng' value={`${fmt(payroll.totalCommission)} đ`} />
				<Row
					label='Điều chỉnh'
					value={`${payroll.adjustment >= 0 ? '+' : ''}${fmt(payroll.adjustment)} đ`}
					valueColor={payroll.adjustment < 0 ? '#DC2626' : payroll.adjustment > 0 ? '#059669' : undefined}
				/>
				<Row label='Tổng thực nhận' value={`${fmt(payroll.totalIncome)} đ`} strong />
			</div>

			{payroll.note && (
				<>
					<Divider style={{ margin: '14px 0' }} />
					<div style={{ fontSize: 13 }}>
						<div style={{ color: '#6B7280', marginBottom: 4 }}>Ghi chú</div>
						<div style={{ whiteSpace: 'pre-wrap' }}>{payroll.note}</div>
					</div>
				</>
			)}

			<Divider style={{ margin: '14px 0' }}>Nhật ký</Divider>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px 24px', fontSize: 13 }}>
				<div>
					<div style={{ color: '#6B7280' }}>Chốt bởi</div>
					<div>{payroll.finalizedByName}</div>
					<div style={{ color: '#6B7280', fontSize: 12 }}>{fmtTime(payroll.finalizedAt)}</div>
				</div>
				{payroll.paidAt && (
					<div>
						<div style={{ color: '#6B7280' }}>Đã chi</div>
						<div style={{ color: '#059669' }}>{fmtTime(payroll.paidAt)}</div>
					</div>
				)}
				{payroll.cancelledAt && (
					<div>
						<div style={{ color: '#6B7280' }}>Huỷ</div>
						<div style={{ color: '#DC2626' }}>{payroll.cancelReason}</div>
						<div style={{ color: '#6B7280', fontSize: 12 }}>{fmtTime(payroll.cancelledAt)}</div>
					</div>
				)}
			</div>

			<Modal
				title='Huỷ phiếu lương'
				visible={cancelOpen}
				onCancel={() => setCancelOpen(false)}
				onOk={handleCancel}
				confirmLoading={submitting}
				okText='Xác nhận huỷ'
				cancelText='Đóng'
				okButtonProps={{ danger: true }}
				width={460}
				style={{ maxWidth: '95vw' }}
			>
				<p style={{ fontSize: 13, color: '#6B7280' }}>
					Phiếu sau khi huỷ không thể khôi phục. Bạn có thể chốt lại phiếu mới cho kỳ này.
				</p>
				<Input.TextArea
					rows={3}
					maxLength={500}
					value={cancelReason}
					onChange={(e) => setCancelReason(e.target.value)}
					placeholder='Nhập lý do huỷ phiếu...'
				/>
			</Modal>
		</Modal>
	);
}

function Row({
	label,
	value,
	strong,
	valueColor,
}: {
	label: string;
	value: string;
	strong?: boolean;
	valueColor?: string;
}) {
	return (
		<div style={{ display: 'flex', justifyContent: 'space-between' }}>
			<span style={{ color: '#6B7280' }}>{label}</span>
			<span
				style={{
					fontWeight: strong ? 800 : 500,
					color: strong ? '#c47070' : valueColor,
					fontSize: strong ? 15 : undefined,
				}}
			>
				{value}
			</span>
		</div>
	);
}
