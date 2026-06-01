// Modal Thêm / Sửa dịch vụ — khớp design Pencil (rounded-16, fields: Mã / Tên / Danh mục / Giá / Thời lượng / Buffer / Mô tả).
import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import { SERVICE_CATEGORY_OPTIONS } from '@/services/Services/constant';

type Props = {
	open: boolean;
	editing?: SvcMgmt.IService | null;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: any) => Promise<void>;
};

export default function ServiceFormModal({ open, editing, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const isEdit = !!editing;

	useEffect(() => {
		if (open) {
			if (editing) {
				form.setFieldsValue({
					code: editing.code,
					name: editing.name,
					category: editing.category,
					unitPrice: editing.unitPrice,
					durationMinutes: editing.durationMinutes,
					bufferMinutes: editing.bufferMinutes,
					slotsRequired: editing.slotsRequired,
					description: editing.description,
					isActive: editing.isActive,
				});
			} else {
				form.resetFields();
				form.setFieldsValue({
					category: 'SWEDISH',
					unitPrice: 350000,
					durationMinutes: 60,
					bufferMinutes: 15,
					slotsRequired: 1,
					isActive: true,
				});
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
			console.error('[ServiceFormModal] submit error', err?.response?.data || err);
			const msg = err?.response?.data?.message;
			if (msg) {
				const { message } = await import('antd');
				message.error(Array.isArray(msg) ? msg.join(', ') : msg);
			}
		}
	};

	return (
		<Modal
			title={isEdit ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}
			visible={open}
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={loading}
			okText={isEdit ? 'Lưu thay đổi' : 'Tạo dịch vụ'}
			cancelText='Huỷ'
			width={560}
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Form form={form} layout='vertical' style={{ marginTop: 8 }}>
				<Form.Item
					name='code'
					label='Mã dịch vụ'
					rules={[
						{ required: true, message: 'Nhập mã dịch vụ' },
						{ pattern: /^[A-Z0-9_]{3,30}$/, message: 'Chữ in hoa, số, gạch dưới (3-30 ký tự)' },
					]}
				>
					<Input placeholder='VD: SWEDISH_60' disabled={isEdit} />
				</Form.Item>

				<Form.Item
					name='name'
					label='Tên dịch vụ'
					rules={[
						{ required: true, message: 'Nhập tên dịch vụ' },
						{ min: 2, max: 100 },
					]}
				>
					<Input placeholder='VD: Massage Thụy Điển' />
				</Form.Item>

				<Form.Item name='category' label='Danh mục' rules={[{ required: true }]}>
					<Select
						options={SERVICE_CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
						placeholder='Chọn danh mục'
					/>
				</Form.Item>

				<Form.Item
					name='unitPrice'
					label='Giá (VND)'
					rules={[{ required: true, message: 'Nhập giá' }]}
				>
					<InputNumber
						style={{ width: '100%' }}
						min={0}
						step={50000}
						formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
						parser={((v: string | undefined) => Number(`${v}`.replace(/,/g, ''))) as any}
					/>
				</Form.Item>

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='durationMinutes'
						label='Thời lượng (phút)'
						rules={[{ required: true }]}
						style={{ flex: 1 }}
					>
						<InputNumber style={{ width: '100%' }} min={1} max={480} />
					</Form.Item>

					<Form.Item name='bufferMinutes' label='Buffer (phút)' style={{ flex: 1 }}>
						<InputNumber style={{ width: '100%' }} min={0} max={120} />
					</Form.Item>
				</div>

				<Form.Item name='description' label='Mô tả'>
					<Input.TextArea rows={3} placeholder='Mô tả ngắn về dịch vụ' maxLength={1000} showCount />
				</Form.Item>

				<Form.Item name='isActive' label='Trạng thái' valuePropName='checked'>
					<Switch checkedChildren='Hoạt động' unCheckedChildren='Tạm ngưng' />
				</Form.Item>
			</Form>
		</Modal>
	);
}
