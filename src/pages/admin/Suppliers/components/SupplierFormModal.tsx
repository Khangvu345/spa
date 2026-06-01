// Modal Thêm / Sửa nhà cung cấp — khớp design Pencil.
import { useEffect } from 'react';
import { Modal, Form, Input, Switch } from 'antd';

type Props = {
	open: boolean;
	editing?: SupplierMgmt.ISupplier | null;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: any) => Promise<void>;
};

export default function SupplierFormModal({ open, editing, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const isEdit = !!editing;

	useEffect(() => {
		if (open) {
			if (editing) {
				form.setFieldsValue({
					name: editing.name,
					contactPerson: editing.contactPerson,
					phone: editing.phone,
					email: editing.email,
					address: editing.address,
					taxCode: editing.taxCode,
					note: editing.note,
					isActive: editing.isActive,
				});
			} else {
				form.resetFields();
				form.setFieldsValue({ isActive: true });
			}
		}
	}, [open, editing, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			// BE CreateSupplierDto không nhận isActive (default true). Update thì nhận.
			if (!isEdit) {
				delete (values as any).isActive;
			}
			await onSubmit(values);
		} catch (err: any) {
			if (err?.errorFields) return;
			// eslint-disable-next-line no-console
			console.error('[SupplierFormModal] submit error', err?.response?.data || err);
			const msg = err?.response?.data?.message;
			if (msg) {
				const { message } = await import('antd');
				message.error(Array.isArray(msg) ? msg.join(', ') : msg);
			}
		}
	};

	return (
		<Modal
			title={isEdit ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
			visible={open}
			centered
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={loading}
			okText={isEdit ? 'Lưu thay đổi' : 'Tạo nhà cung cấp'}
			cancelText='Huỷ'
			width={560}
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Form form={form} layout='vertical' style={{ marginTop: 8 }}>
				<Form.Item
					name='name'
					label='Tên nhà cung cấp'
					rules={[
						{ required: true, message: 'Nhập tên nhà cung cấp' },
						{ min: 2, max: 200 },
					]}
				>
					<Input placeholder='VD: Công ty TNHH Mỹ Phẩm Hoa Sen' />
				</Form.Item>

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='contactPerson'
						label='Người liên hệ'
						rules={[{ required: true, message: 'Nhập người liên hệ' }]}
						style={{ flex: 1 }}
					>
						<Input placeholder='VD: Nguyễn Văn An' />
					</Form.Item>

					<Form.Item
						name='phone'
						label='Số điện thoại'
						rules={[
							{ required: true, message: 'Nhập số điện thoại' },
							{ pattern: /^\d{10}$/, message: 'Số điện thoại phải đủ 10 chữ số' },
						]}
						style={{ flex: 1 }}
					>
						<Input placeholder='VD: 0912345678' />
					</Form.Item>
				</div>

				<Form.Item
					name='email'
					label='Email'
					rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
				>
					<Input placeholder='VD: an@hoasen.vn' />
				</Form.Item>

				<Form.Item
					name='address'
					label='Địa chỉ'
					rules={[
						{ required: true, message: 'Nhập địa chỉ' },
						{ min: 5, max: 500, message: 'Địa chỉ 5-500 ký tự' },
					]}
				>
					<Input placeholder='VD: 123 Nguyễn Huệ, Q.1, TP.HCM' />
				</Form.Item>

				<Form.Item
					name='taxCode'
					label='Mã số thuế'
					rules={[{ max: 20, message: 'Tối đa 20 ký tự' }]}
				>
					<Input placeholder='VD: 0312345678' />
				</Form.Item>

				<Form.Item name='note' label='Ghi chú' rules={[{ max: 1000, message: 'Tối đa 1000 ký tự' }]}>
					<Input.TextArea rows={3} placeholder='Ghi chú nội bộ' maxLength={1000} showCount />
				</Form.Item>

				<Form.Item name='isActive' label='Trạng thái' valuePropName='checked'>
					<Switch checkedChildren='Đang hợp tác' unCheckedChildren='Ngưng hợp tác' />
				</Form.Item>
			</Form>
		</Modal>
	);
}
