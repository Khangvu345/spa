// Modal tạo hoá đơn từ Service Order đã COMPLETED.
import { useEffect, useState } from 'react';
import { Modal, Select, InputNumber, Input, Form, Spin, Tag, Empty } from 'antd';
import * as ordersApi from '@/services/ServiceOrders/api';

type Props = {
	open: boolean;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: InvoiceMgmt.ICreatePayload) => Promise<any>;
};

const fmtVnd = (v: number) => `${v.toLocaleString('vi-VN')}đ`;

export default function CreateInvoiceModal({ open, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const [orders, setOrders] = useState<SvcOrderMgmt.IServiceOrder[]>([]);
	const [fetching, setFetching] = useState(false);

	useEffect(() => {
		if (!open) return;
		form.resetFields();
		(async () => {
			setFetching(true);
			try {
				const res = await ordersApi.getServiceOrders({
					status: 'COMPLETED',
					page: 1,
					limit: 50,
					sortBy: 'createdAt',
					sortOrder: 'desc',
				});
				setOrders(res.items ?? []);
			} finally {
				setFetching(false);
			}
		})();
	}, [open, form]);

	const selectedId = Form.useWatch('serviceOrderId', form);
	const selected = orders.find((o) => o.id === selectedId);

	const handleOk = async () => {
		const values = await form.validateFields();
		const r = await onSubmit({
			serviceOrderId: values.serviceOrderId,
			discountAmount: Number(values.discountAmount ?? 0),
			note: values.note ?? '',
		});
		if (r) form.resetFields();
	};

	return (
		<Modal
			title='Tạo hoá đơn từ phiếu dịch vụ'
			visible={open}
			centered
			width={620}
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={loading}
			okText='Tạo hoá đơn'
			cancelText='Huỷ'
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Spin spinning={fetching}>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='serviceOrderId'
						label='Phiếu dịch vụ (COMPLETED)'
						rules={[{ required: true, message: 'Chọn phiếu DV' }]}
					>
						<Select
							showSearch
							optionFilterProp='label'
							placeholder='Chọn phiếu dịch vụ đã hoàn thành'
							notFoundContent={
								orders.length === 0 ? (
									<Empty
										description='Không có phiếu nào COMPLETED chưa xuất HĐ'
										image={Empty.PRESENTED_IMAGE_SIMPLE}
									/>
								) : null
							}
							options={orders.map((o) => ({
								value: o.id,
								label: `${o.orderCode} — ${o.customer?.fullName ?? '—'} — ${fmtVnd(o.totalAmount)}`,
							}))}
						/>
					</Form.Item>

					{selected && (
						<div
							style={{
								background: '#FAFBFD',
								borderRadius: 10,
								padding: 12,
								marginBottom: 12,
								fontSize: 13,
							}}
						>
							<div>
								<strong>{selected.orderCode}</strong>{' '}
								<Tag color='#059669'>COMPLETED</Tag>
							</div>
							<div style={{ color: '#6B7280', marginTop: 4 }}>
								Khách: {selected.customer?.fullName} · {selected.customer?.phone}
							</div>
							<div style={{ color: '#6B7280', marginTop: 4 }}>
								{selected.items.length} dịch vụ · Tạm tính {fmtVnd(selected.itemsSubtotal)} · Phụ thu{' '}
								{fmtVnd(selected.extraCharge)}
							</div>
							<div style={{ marginTop: 6 }}>
								Tổng tiền phiếu: <strong>{fmtVnd(selected.totalAmount)}</strong>
							</div>
						</div>
					)}

					<Form.Item name='discountAmount' label='Giảm giá (VND)' initialValue={0}>
						<InputNumber
							style={{ width: '100%' }}
							min={0}
							step={1000}
							formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							parser={((v: string) => v.replace(/[^\d]/g, '')) as any}
						/>
					</Form.Item>

					<Form.Item name='note' label='Ghi chú'>
						<Input.TextArea rows={2} maxLength={500} placeholder='VD: Khách thanh toán cuối ngày' />
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
}
