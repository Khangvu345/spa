// Modal "Chốt lương hàng loạt": chọn kỳ + tuỳ chọn chỉ NV có hoa hồng →
// gọi finalize-batch → hiển thị kết quả created / skipped + bảng chi tiết.
import { useEffect, useState } from 'react';
import { Modal, Form, Select, Switch, Alert, Table, Tag, Button } from 'antd';
import { useModel } from 'umi';
import { MONTH_OPTIONS, buildYearOptions } from '@/services/Payroll/constant';

type Props = {
	open: boolean;
	// map staffId → tên để hiển thị bảng kết quả
	staffNameMap: Record<string, string>;
	onCancel: () => void;
	onFinalized: () => void;
};

const yearOptions = buildYearOptions();

const STATUS_TAG: Record<PayrollMgmt.IBatchResultDetail['status'], { label: string; color: string }> = {
	created: { label: 'Đã tạo', color: 'green' },
	skipped: { label: 'Bỏ qua', color: 'default' },
	error: { label: 'Lỗi', color: 'red' },
};

const REASON_LABEL: Record<string, string> = {
	PAYROLL_ALREADY_EXISTS: 'Đã có phiếu lương kỳ này',
	STAFF_NOT_FOUND: 'Không tìm thấy nhân viên',
	INTERNAL_ERROR: 'Lỗi hệ thống',
};

export default function BatchFinalizeModal({ open, staffNameMap, onCancel, onFinalized }: Props) {
	const { finalizeBatch, submitting } = useModel('payroll') as any;
	const [form] = Form.useForm();
	const now = new Date();
	const [result, setResult] = useState<PayrollMgmt.IBatchResult | null>(null);

	useEffect(() => {
		if (open) {
			form.resetFields();
			form.setFieldsValue({
				periodYear: now.getFullYear(),
				periodMonth: now.getMonth() + 1,
				onlyWithCommission: true,
			});
			setResult(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	const handleRun = async () => {
		const values = await form.validateFields();
		const res = await finalizeBatch({
			periodYear: values.periodYear,
			periodMonth: values.periodMonth,
			onlyWithCommission: values.onlyWithCommission,
		});
		if (res) {
			setResult(res);
			onFinalized();
		}
	};

	const columns = [
		{
			title: 'Nhân viên',
			dataIndex: 'staffId',
			render: (v: string) => staffNameMap[v] || <code style={{ fontSize: 11 }}>{v}</code>,
		},
		{
			title: 'Kết quả',
			dataIndex: 'status',
			width: 110,
			align: 'center' as const,
			render: (v: PayrollMgmt.IBatchResultDetail['status']) => {
				const t = STATUS_TAG[v];
				return <Tag color={t.color}>{t.label}</Tag>;
			},
		},
		{
			title: 'Mã phiếu / Lý do',
			key: 'detail',
			render: (_: any, r: PayrollMgmt.IBatchResultDetail) =>
				r.payrollCode ? (
					<code style={{ fontSize: 12 }}>{r.payrollCode}</code>
				) : (
					<span style={{ color: '#6B7280' }}>{REASON_LABEL[r.reason ?? ''] ?? r.reason ?? '—'}</span>
				),
		},
	];

	return (
		<Modal
			title='Chốt lương hàng loạt'
			visible={open}
			onCancel={onCancel}
			width={640}
			footer={
				result
					? [
							<Button key='close' onClick={onCancel}>
								Đóng
							</Button>,
					  ]
					: [
							<Button key='cancel' onClick={onCancel}>
								Huỷ
							</Button>,
							<Button
								key='run'
								type='primary'
								loading={submitting}
								onClick={handleRun}
								style={{ background: '#c47070', borderColor: '#c47070' }}
							>
								Chốt hàng loạt
							</Button>,
					  ]
			}
		>
			{!result ? (
				<>
					<Form form={form} layout='vertical'>
						<div style={{ display: 'flex', gap: 12 }}>
							<Form.Item name='periodYear' label='Năm' rules={[{ required: true }]} style={{ flex: 1 }}>
								<Select options={yearOptions} />
							</Form.Item>
							<Form.Item name='periodMonth' label='Tháng' rules={[{ required: true }]} style={{ flex: 1 }}>
								<Select options={MONTH_OPTIONS} />
							</Form.Item>
						</div>
						<Form.Item
							name='onlyWithCommission'
							label='Chỉ chốt nhân viên có phát sinh hoa hồng'
							valuePropName='checked'
							tooltip='Bật: chỉ NV có hoa hồng trong kỳ. Tắt: chốt mọi STAFF đang làm việc (kể cả hoa hồng = 0).'
						>
							<Switch />
						</Form.Item>
					</Form>
					<Alert
						type='info'
						showIcon
						message='Mỗi nhân viên chỉ có 1 phiếu cho 1 kỳ. Nhân viên đã có phiếu sẽ được bỏ qua.'
					/>
				</>
			) : (
				<>
					<div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
						<div
							style={{
								flex: 1,
								padding: '12px 16px',
								borderRadius: 12,
								background: '#ecfdf5',
								textAlign: 'center',
							}}
						>
							<div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{result.created}</div>
							<div style={{ fontSize: 12, color: '#6B7280' }}>Phiếu đã tạo</div>
						</div>
						<div
							style={{
								flex: 1,
								padding: '12px 16px',
								borderRadius: 12,
								background: '#f3f4f6',
								textAlign: 'center',
							}}
						>
							<div style={{ fontSize: 22, fontWeight: 800, color: '#6B7280' }}>{result.skipped}</div>
							<div style={{ fontSize: 12, color: '#6B7280' }}>Bỏ qua</div>
						</div>
					</div>

					<Table
						rowKey={(r) => r.staffId + r.status}
						size='small'
						dataSource={result.details}
						columns={columns}
						pagination={false}
						scroll={{ y: 280 }}
						locale={{ emptyText: 'Không có nhân viên nào cần chốt' }}
					/>
				</>
			)}
		</Modal>
	);
}
