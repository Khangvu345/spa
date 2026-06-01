// Modal Thêm / Sửa khách hàng.
import { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { CUSTOMER_SOURCE_OPTIONS } from '@/services/Customers/constant';

type Props = {
	open: boolean;
	editing?: CustomerMgmt.ICustomer | null;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: any) => Promise<void>;
};

export default function CustomerFormModal({ open, editing, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const isEdit = !!editing;

	useEffect(() => {
		if (open) {
			if (editing) {
				form.setFieldsValue({
					fullName: editing.fullName,
					phone: editing.phone,
					email: editing.email,
					source: editing.source,
					note: editing.note,
				});
			} else {
				form.resetFields();
				form.setFieldsValue({ source: 'MANUAL' });
			}
		}
	}, [open, editing, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			await onSubmit(values);
		} catch (err: any) {
			if (err?.errorFields) return;
			// eslint-disable-next-line no-console
			console.error('[CustomerFormModal] submit error', err?.response?.data || err);
			const msg = err?.response?.data?.message;
			if (msg) {
				const { message } = await import('antd');
				message.error(Array.isArray(msg) ? msg.join(', ') : msg);
			}
		}
	};

	return (
		<Modal
			title={isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
			visible={open}
			centered
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={loading}
			okText={isEdit ? 'Lưu thay đổi' : 'Tạo khách hàng'}
			cancelText='Huỷ'
			width={520}
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Form form={form} layout='vertical' style={{ marginTop: 8 }}>
				<Form.Item
					name='fullName'
					label='Họ tên khách hàng'
					rules={[
						{ required: true, message: 'Nhập họ tên' },
						{ min: 2, max: 100 },
					]}
				>
					<Input placeholder='VD: Nguyễn Văn A' />
				</Form.Item>

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='phone'
						label='Số điện thoại'
						rules={[
							{ required: true, message: 'Nhập SĐT' },
							{ pattern: /^\d{10}$/, message: 'Phải đủ 10 chữ số' },
						]}
						style={{ flex: 1 }}
					>
						<Input placeholder='0911000001' disabled={isEdit} />
					</Form.Item>

					<Form.Item
						name='source'
						label='Nguồn'
						rules={[{ required: true }]}
						style={{ flex: 1 }}
					>
						<Select
							options={CUSTOMER_SOURCE_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
						/>
					</Form.Item>
				</div>

				<Form.Item
					name='email'
					label='Email'
					rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
				>
					<Input placeholder='customer@example.com' />
				</Form.Item>

				<Form.Item name='note' label='Ghi chú' rules={[{ max: 500 }]}>
					<Input.TextArea rows={3} placeholder='VD: Khách VIP, dị ứng tinh dầu...' maxLength={500} showCount />
				</Form.Item>
			</Form>
		</Modal>
	);
}
