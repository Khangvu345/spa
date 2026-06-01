// Modal tạo phiếu DV mới — chọn khách hàng có sẵn (search by phone/name) + note.
import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Spin } from 'antd';
import * as customersApi from '@/services/Customers/api';

type Props = {
	open: boolean;
	onCancel: () => void;
	onCreated: (orderId: string) => void | Promise<void>;
	create: (payload: SvcOrderMgmt.ICreatePayload) => Promise<SvcOrderMgmt.IServiceOrder>;
};

export default function CreateOrderModal({ open, onCancel, onCreated, create }: Props) {
	const [form] = Form.useForm();
	const [options, setOptions] = useState<CustomerMgmt.ICustomer[]>([]);
	const [searching, setSearching] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!open) {
			form.resetFields();
			setOptions([]);
		}
	}, [open, form]);

	const handleSearch = async (text: string) => {
		const q = text.trim();
		if (!q) {
			setOptions([]);
			return;
		}
		setSearching(true);
		try {
			const res = await customersApi.getCustomers({ search: q, isActive: true, limit: 20 });
			setOptions((res.data as any).data ?? []);
		} finally {
			setSearching(false);
		}
	};

	const onOk = async () => {
		const values = await form.validateFields();
		setSubmitting(true);
		try {
			const order = await create({ customerId: values.customerId, note: values.note?.trim() || undefined });
			await onCreated(order.id);
		} catch (e: any) {
			if (!e?.errorFields) {
				// error đã hiện qua model.create
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			visible={open}
			title='Tạo phiếu dịch vụ mới'
			okText='Tạo phiếu'
			cancelText='Huỷ'
			onCancel={onCancel}
			onOk={onOk}
			confirmLoading={submitting}
			destroyOnClose
		>
			<Form form={form} layout='vertical'>
				<Form.Item
					name='customerId'
					label='Khách hàng'
					rules={[{ required: true, message: 'Chọn khách hàng' }]}
				>
					<Select
						showSearch
						placeholder='Tìm theo tên hoặc SĐT...'
						filterOption={false}
						onSearch={handleSearch}
						notFoundContent={searching ? <Spin size='small' /> : 'Không tìm thấy'}
						options={options.map((c) => ({
							value: c.id,
							label: `${c.fullName} — ${c.phone}`,
						}))}
					/>
				</Form.Item>

				<Form.Item name='note' label='Ghi chú phiếu'>
					<Input.TextArea rows={3} maxLength={500} placeholder='Tuỳ chọn' showCount />
				</Form.Item>
			</Form>
		</Modal>
	);
}
