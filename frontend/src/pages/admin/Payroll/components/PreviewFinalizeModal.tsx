// Modal "Xem trước & chốt" 1 nhân viên: chọn NV + kỳ → preview hoa hồng →
// nhập điều chỉnh + ghi chú → finalize. Tính tổng nhận = base + commission + adjustment.
import { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, Table, Divider, Empty, Spin, Tag } from 'antd';
import { useModel } from 'umi';
import { MONTH_OPTIONS, buildYearOptions } from '@/services/Payroll/constant';

type Props = {
	open: boolean;
	staffOptions: { value: string; label: string }[];
	onCancel: () => void;
	onFinalized: () => void;
};

const yearOptions = buildYearOptions();
const fmt = (n?: number) => (n ?? 0).toLocaleString('vi-VN');

export default function PreviewFinalizeModal({ open, staffOptions, onCancel, onFinalized }: Props) {
	const { preview, finalize, submitting } = useModel('payroll') as any;
	const [form] = Form.useForm();

	const now = new Date();
	const [previewing, setPreviewing] = useState(false);
	const [data, setData] = useState<PayrollMgmt.IPreview | null>(null);

	const staffId = Form.useWatch('staffId', form);
	const periodYear = Form.useWatch('periodYear', form);
	const periodMonth = Form.useWatch('periodMonth', form);
	const adjustment = Form.useWatch('adjustment', form);

	// Reset khi mở lại.
	useEffect(() => {
		if (open) {
			form.resetFields();
			form.setFieldsValue({
				periodYear: now.getFullYear(),
				periodMonth: now.getMonth() + 1,
				adjustment: 0,
			});
			setData(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	// Tự preview khi đủ NV + kỳ.
	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			if (!open || !staffId || !periodYear || !periodMonth) {
				setData(null);
				return;
			}
			setPreviewing(true);
			const res = await preview({ staffId, periodYear, periodMonth });
			if (!cancelled) {
				setData(res ?? null);
				setPreviewing(false);
			}
		};
		run();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, staffId, periodYear, periodMonth]);

	const totalIncome = useMemo(() => {
		if (!data) return 0;
		return data.baseSalary + data.totalCommission + (Number(adjustment) || 0);
	}, [data, adjustment]);

	const handleOk = async () => {
		const values = await form.validateFields();
		const res = await finalize({
			staffId: values.staffId,
			periodYear: values.periodYear,
			periodMonth: values.periodMonth,
			adjustment: Number(values.adjustment) || 0,
			note: values.note?.trim() || undefined,
		});
		if (res) {
			onFinalized();
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

	return (
		<Modal
			title='Xem trước & chốt lương'
			visible={open}
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={submitting}
			okText='Chốt lương'
			cancelText='Huỷ'
			width={680}
			okButtonProps={{ disabled: !data, style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Form form={form} layout='vertical'>
				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='staffId'
						label='Nhân viên'
						rules={[{ required: true, message: 'Chọn nhân viên' }]}
						style={{ flex: 2 }}
					>
						<Select
							showSearch
							placeholder='Chọn nhân viên'
							optionFilterProp='label'
							options={staffOptions}
						/>
					</Form.Item>
					<Form.Item name='periodYear' label='Năm' rules={[{ required: true }]} style={{ flex: 1 }}>
						<Select options={yearOptions} />
					</Form.Item>
					<Form.Item name='periodMonth' label='Tháng' rules={[{ required: true }]} style={{ flex: 1 }}>
						<Select options={MONTH_OPTIONS} />
					</Form.Item>
				</div>

				<Divider style={{ margin: '4px 0 16px' }} />

				{previewing ? (
					<div style={{ textAlign: 'center', padding: '32px 0' }}>
						<Spin />
					</div>
				) : !data ? (
					<Empty description='Chọn nhân viên và kỳ để xem trước' image={Empty.PRESENTED_IMAGE_SIMPLE} />
				) : (
					<>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
							<span style={{ fontWeight: 600, fontSize: 15 }}>{data.staffSnapshot.fullName}</span>
							<Tag>{data.staffSnapshot.role}</Tag>
							<span style={{ color: '#6B7280', fontSize: 12 }}>
								· {data.invoiceCount} hoá đơn đã thanh toán trong kỳ
							</span>
						</div>

						<Table
							rowKey='serviceId'
							size='small'
							dataSource={data.commissionBreakdown}
							columns={breakdownColumns}
							pagination={false}
							locale={{ emptyText: 'Không có hoa hồng trong kỳ' }}
							scroll={{ y: 200 }}
						/>

						<Divider style={{ margin: '16px 0' }} />

						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
								gap: '8px 24px',
								fontSize: 13,
								marginBottom: 12,
							}}
						>
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<span style={{ color: '#6B7280' }}>Lương cứng</span>
								<span style={{ fontWeight: 500 }}>{fmt(data.baseSalary)} đ</span>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between' }}>
								<span style={{ color: '#6B7280' }}>Tổng hoa hồng</span>
								<span style={{ fontWeight: 500 }}>{fmt(data.totalCommission)} đ</span>
							</div>
						</div>

						<Form.Item
							name='adjustment'
							label='Điều chỉnh (âm/dương)'
							style={{ marginBottom: 8 }}
							tooltip='Phụ cấp (dương) hoặc khấu trừ/phạt (âm) thủ công'
						>
							<InputNumber
								style={{ width: '100%' }}
								step={50000}
								formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
								parser={((v: string | undefined) => Number(`${v}`.replace(/,/g, ''))) as any}
							/>
						</Form.Item>

						<Form.Item
							name='note'
							label='Ghi chú'
							style={{ marginBottom: 4 }}
							rules={[{ max: 500, message: 'Ghi chú tối đa 500 ký tự' }]}
						>
							<Input.TextArea rows={2} maxLength={500} placeholder='Lý do điều chỉnh, ghi chú nội bộ...' />
						</Form.Item>

						<div
							style={{
								marginTop: 12,
								padding: '12px 16px',
								borderRadius: 12,
								background: '#fff5f5',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<span style={{ fontWeight: 700, color: '#c47070' }}>Tổng thực nhận</span>
							<span style={{ fontWeight: 800, fontSize: 18, color: '#c47070' }}>{fmt(totalIncome)} đ</span>
						</div>
					</>
				)}
			</Form>
		</Modal>
	);
}
