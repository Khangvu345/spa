// Modal Thêm / Sửa vật liệu — khớp design Pencil.
import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, AutoComplete } from 'antd';
import { MATERIAL_TYPE_OPTIONS, COMMON_UNITS } from '@/services/Materials/constant';

type Props = {
	open: boolean;
	editing?: MaterialMgmt.IMaterial | null;
	suppliers: SupplierMgmt.ISupplier[];
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: any) => Promise<void>;
};

export default function MaterialFormModal({ open, editing, suppliers, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const isEdit = !!editing;
	const watchType = Form.useWatch('type', form);

	useEffect(() => {
		if (open) {
			if (editing) {
				form.setFieldsValue({
					code: editing.code,
					name: editing.name,
					description: editing.description,
					unit: editing.unit,
					type: editing.type,
					unitPrice: editing.unitPrice,
					stockQuantity: editing.stockQuantity,
					reorderLevel: editing.reorderLevel,
					expectedUsesPerUnit: editing.expectedUsesPerUnit,
					supplierId: editing.supplierId,
					isActive: editing.isActive,
				});
			} else {
				form.resetFields();
				form.setFieldsValue({
					type: 'CONSUMABLE',
					unitPrice: 0,
					stockQuantity: 0,
					reorderLevel: 0,
					isActive: true,
				});
			}
		}
	}, [open, editing, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			// BE Create không nhận isActive (default true). Update thì nhận.
			if (!isEdit) delete (values as any).isActive;
			// Ép code uppercase
			if (values.code) values.code = String(values.code).toUpperCase();
			await onSubmit(values);
		} catch (err: any) {
			if (err?.errorFields) return;
			// eslint-disable-next-line no-console
			console.error('[MaterialFormModal] submit error', err?.response?.data || err);
			const msg = err?.response?.data?.message;
			if (msg) {
				const { message } = await import('antd');
				message.error(Array.isArray(msg) ? msg.join(', ') : msg);
			}
		}
	};

	return (
		<Modal
			title={isEdit ? 'Cập nhật vật liệu' : 'Thêm vật liệu mới'}
			visible={open}
			centered
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={loading}
			okText={isEdit ? 'Lưu thay đổi' : 'Tạo vật liệu'}
			cancelText='Huỷ'
			width={640}
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Form form={form} layout='vertical' style={{ marginTop: 8 }}>
				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='code'
						label='Mã vật liệu'
						rules={[
							{ required: true, message: 'Nhập mã' },
							{ pattern: /^[A-Z0-9_]{3,30}$/i, message: 'Chữ in hoa / số / gạch dưới (3-30 ký tự)' },
						]}
						style={{ flex: 1 }}
					>
						<Input placeholder='VD: OIL_OLIVE' disabled={isEdit} />
					</Form.Item>

					<Form.Item
						name='name'
						label='Tên vật liệu'
						rules={[
							{ required: true, message: 'Nhập tên vật liệu' },
							{ min: 2, max: 200 },
						]}
						style={{ flex: 2 }}
					>
						<Input placeholder='VD: Tinh dầu Olive' />
					</Form.Item>
				</div>

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='supplierId'
						label='Nhà cung cấp'
						rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}
						style={{ flex: 1 }}
					>
						<Select
							showSearch
							optionFilterProp='label'
							placeholder='Chọn NCC'
							options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
						/>
					</Form.Item>

					<Form.Item
						name='type'
						label='Loại'
						rules={[{ required: true }]}
						style={{ flex: 1 }}
					>
						<Select
							options={MATERIAL_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
						/>
					</Form.Item>
				</div>

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item
						name='unit'
						label='Đơn vị'
						rules={[{ required: true, message: 'Nhập đơn vị' }, { max: 20 }]}
						style={{ flex: 1 }}
					>
						<AutoComplete
							options={COMMON_UNITS.map((u) => ({ value: u }))}
							placeholder='ml / gram / chai...'
							filterOption
						/>
					</Form.Item>

					<Form.Item
						name='unitPrice'
						label='Giá nhập (VND)'
						rules={[{ required: true, message: 'Nhập giá' }]}
						style={{ flex: 1 }}
					>
						<InputNumber
							style={{ width: '100%' }}
							min={0}
							step={1000}
							formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							parser={((v: string | undefined) => Number(`${v}`.replace(/,/g, ''))) as any}
						/>
					</Form.Item>
				</div>

				<div style={{ display: 'flex', gap: 12 }}>
					<Form.Item name='stockQuantity' label='Tồn kho' style={{ flex: 1 }}>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>

					<Form.Item name='reorderLevel' label='Tồn tối thiểu' style={{ flex: 1 }}>
						<InputNumber style={{ width: '100%' }} min={0} />
					</Form.Item>

					{watchType === 'DEPRECIATION' && (
						<Form.Item
							name='expectedUsesPerUnit'
							label='Số lần dùng / đơn vị'
							style={{ flex: 1 }}
						>
							<InputNumber style={{ width: '100%' }} min={0} max={100000} />
						</Form.Item>
					)}
				</div>

				<Form.Item name='description' label='Mô tả' rules={[{ max: 1000 }]}>
					<Input.TextArea rows={2} placeholder='Mô tả chi tiết vật liệu' maxLength={1000} showCount />
				</Form.Item>

				{isEdit && (
					<Form.Item name='isActive' label='Trạng thái' valuePropName='checked'>
						<Switch checkedChildren='Đang sử dụng' unCheckedChildren='Ngưng' />
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
}
