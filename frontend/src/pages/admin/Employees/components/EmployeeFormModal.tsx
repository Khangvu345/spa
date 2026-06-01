// Modal Thêm / Sửa nhân viên — khớp design Pencil (white, rounded-16, shadow).
import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker } from 'antd';
import moment from 'moment';
import { ROLE_OPTIONS, WORK_STATUS_OPTIONS } from '@/services/Employees/constant';

type Props = {
	open: boolean;
	editing?: Employees.IEmployee | null;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: any) => Promise<void>;
};

export default function EmployeeFormModal({ open, editing, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const isEdit = !!editing;

	useEffect(() => {
		if (open) {
			if (editing) {
				form.setFieldsValue({
					fullName: editing.fullName,
					email: editing.email,
					phone: editing.phone,
					role: editing.role,
					baseSalary: editing.baseSalary,
					startedAt: editing.startedAt ? moment(editing.startedAt) : null,
					workStatus: editing.workStatus,
				});
			} else {
				form.resetFields();
				form.setFieldsValue({
					role: 'STAFF',
					baseSalary: 0,
					startedAt: moment(),
				});
			}
		}
	}, [open, editing, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			const payload = {
				...values,
				startedAt: values.startedAt ? values.startedAt.toISOString() : undefined,
			};
			if (isEdit) {
				delete payload.email;
				delete payload.password;
			}
			await onSubmit(payload);
		} catch (err: any) {
			if (err?.errorFields) return; // form validation error — đã hiện border đỏ
			// eslint-disable-next-line no-console
			console.error('[EmployeeFormModal] submit error', err?.response?.data || err);
			const msg = err?.response?.data?.message;
			if (msg) {
				const { message } = await import('antd');
				message.error(Array.isArray(msg) ? msg.join(', ') : msg);
			}
		}
	};

	return (
		<Modal
			title={isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
			visible={open}
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={loading}
			okText={isEdit ? 'Lưu thay đổi' : 'Tạo nhân viên'}
			cancelText='Huỷ'
			width={560}
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Form form={form} layout='vertical' style={{ marginTop: 8 }}>
				<Form.Item
					name='fullName'
					label='Họ tên'
					rules={[{ required: true, message: 'Nhập họ tên' }]}
				>
					<Input placeholder='Nhập tên nhân viên' />
				</Form.Item>

				<Form.Item
					name='email'
					label='Email'
					rules={[
						{ required: true, message: 'Nhập email' },
						{ type: 'email', message: 'Email không hợp lệ' },
					]}
				>
					<Input placeholder='nguyen@spa.local' disabled={isEdit} />
				</Form.Item>

				{!isEdit && (
					<Form.Item
						name='password'
						label='Mật khẩu mặc định'
						rules={[
							{ required: true, message: 'Nhập mật khẩu' },
							{ min: 8, message: 'Tối thiểu 8 ký tự' },
						]}
					>
						<Input.Password placeholder='Tối thiểu 8 ký tự' />
					</Form.Item>
				)}

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='phone'
						label='Số điện thoại'
						rules={[
							{ required: true, message: 'Nhập SĐT' },
							{ pattern: /^[0-9]{10}$/, message: 'SĐT phải đủ 10 chữ số' },
						]}
						style={{ flex: 1 }}
					>
						<Input placeholder='0901234567' />
					</Form.Item>

					<Form.Item name='role' label='Vai trò' rules={[{ required: true }]} style={{ flex: 1 }}>
						<Select
							options={ROLE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
							placeholder='Chọn vai trò'
						/>
					</Form.Item>
				</div>

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item name='baseSalary' label='Lương cứng (VND)' rules={[{ required: true }]} style={{ flex: 1 }}>
						<InputNumber
							style={{ width: '100%' }}
							min={0}
							step={100000}
							formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							parser={((v: string | undefined) => Number(`${v}`.replace(/,/g, ''))) as any}
						/>
					</Form.Item>

					<Form.Item
						name='startedAt'
						label='Ngày bắt đầu'
						rules={[{ required: true, message: 'Chọn ngày' }]}
						style={{ flex: 1 }}
					>
						<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
					</Form.Item>
				</div>

				{isEdit && (
					<Form.Item name='workStatus' label='Trạng thái làm việc'>
						<Select options={WORK_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))} />
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
}
