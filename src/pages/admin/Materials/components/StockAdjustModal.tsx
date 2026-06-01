// Modal điều chỉnh tồn kho — gọi /stock/in & /stock/out/manual.
// Ledger entry được BE tự lưu kèm snapshot material/supplier/staff.
import { useEffect } from 'react';
import { Modal, Form, InputNumber, Radio, Input, Select, AutoComplete } from 'antd';
import { useModel } from 'umi';
import { COMMON_OUT_REASONS, COMMON_IN_REASON_DEFAULT } from '@/services/StockLedger/constant';

type Props = {
	open: boolean;
	material: MaterialMgmt.IMaterial | null;
	suppliers: SupplierMgmt.ISupplier[];
	onCancel: () => void;
	onSuccess: () => void;
};

export default function StockAdjustModal({ open, material, suppliers, onCancel, onSuccess }: Props) {
	const [form] = Form.useForm();
	const { stockIn, stockOut, submitting } = useModel('stockLedger') as any;
	const watchDirection = Form.useWatch('direction', form);
	const watchAmount = Form.useWatch('amount', form) ?? 0;

	useEffect(() => {
		if (open && material) {
			form.resetFields();
			form.setFieldsValue({
				direction: 'IN',
				amount: 0,
				supplierId: material.supplierId,
				unitPrice: material.unitPrice,
				reason: COMMON_IN_REASON_DEFAULT,
			});
		}
	}, [open, material, form]);

	if (!material) return null;

	const current = material.stockQuantity;
	const delta = watchDirection === 'OUT' ? -watchAmount : watchAmount;
	const next = current + delta;

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			const amount = Number(values.amount);
			if (amount <= 0) return;

			let ok = false;
			if (values.direction === 'IN') {
				ok = await stockIn({
					materialId: material.id,
					quantity: amount,
					supplierId: values.supplierId,
					unitPrice: Number(values.unitPrice),
					reason: values.reason || COMMON_IN_REASON_DEFAULT,
				});
			} else {
				if (current - amount < 0) {
					const { message } = await import('antd');
					message.error('Tồn kho sau xuất không được âm');
					return;
				}
				ok = await stockOut({
					materialId: material.id,
					quantity: amount,
					reason: values.reason,
				});
			}

			if (ok) onSuccess();
		} catch (err: any) {
			if (err?.errorFields) return;
		}
	};

	return (
		<Modal
			title={`Điều chỉnh tồn kho — ${material.name}`}
			visible={open}
			centered
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={submitting}
			okText='Xác nhận'
			cancelText='Huỷ'
			width={520}
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<div style={{ marginBottom: 12, fontSize: 13 }}>
				<span style={{ color: '#6B7280' }}>Tồn kho hiện tại: </span>
				<strong>{current}</strong> {material.unit}
			</div>

			<Form form={form} layout='vertical'>
				<Form.Item name='direction' label='Loại giao dịch'>
					<Radio.Group
						buttonStyle='solid'
						onChange={() =>
							form.setFieldsValue({
								reason: form.getFieldValue('direction') === 'IN' ? COMMON_IN_REASON_DEFAULT : '',
							})
						}
					>
						<Radio.Button value='IN'>Nhập kho</Radio.Button>
						<Radio.Button value='OUT'>Xuất kho (vỡ / mất / kiểm kê)</Radio.Button>
					</Radio.Group>
				</Form.Item>

				<Form.Item
					name='amount'
					label='Số lượng'
					rules={[
						{ required: true, message: 'Nhập số lượng' },
						{
							validator: (_, v) =>
								v > 0 ? Promise.resolve() : Promise.reject(new Error('Phải > 0')),
						},
					]}
				>
					<InputNumber style={{ width: '100%' }} min={0} step={1} />
				</Form.Item>

				{watchDirection === 'IN' && (
					<>
						<Form.Item
							name='supplierId'
							label='Nhà cung cấp'
							rules={[{ required: true, message: 'Chọn NCC' }]}
						>
							<Select
								showSearch
								optionFilterProp='label'
								options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
								placeholder='Chọn nhà cung cấp'
							/>
						</Form.Item>

						<Form.Item
							name='unitPrice'
							label='Đơn giá nhập (VND)'
							rules={[
								{ required: true, message: 'Nhập đơn giá' },
								{
									validator: (_, v) =>
										v >= 0 ? Promise.resolve() : Promise.reject(new Error('Không âm')),
								},
							]}
						>
							<InputNumber
								style={{ width: '100%' }}
								min={0}
								step={1000}
								formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
								parser={((v: string) => v.replace(/[^\d]/g, '')) as any}
							/>
						</Form.Item>
					</>
				)}

				<Form.Item
					name='reason'
					label={watchDirection === 'OUT' ? 'Lý do xuất kho (bắt buộc)' : 'Ghi chú'}
					rules={
						watchDirection === 'OUT'
							? [{ required: true, message: 'Nhập lý do xuất kho' }]
							: undefined
					}
				>
					{watchDirection === 'OUT' ? (
						<AutoComplete
							options={COMMON_OUT_REASONS.map((r) => ({ value: r }))}
							placeholder='VD: Hỏng do rơi vỡ'
						>
							<Input.TextArea rows={2} />
						</AutoComplete>
					) : (
						<Input.TextArea rows={2} placeholder='VD: Nhập kho từ NCC Hoa Sen 29/05/2026' />
					)}
				</Form.Item>

				<div
					style={{
						background: '#FAFBFD',
						borderRadius: 8,
						padding: '10px 14px',
						fontSize: 13,
					}}
				>
					<span style={{ color: '#6B7280' }}>Tồn kho sau giao dịch: </span>
					<strong style={{ color: next < 0 ? '#DC2626' : '#059669' }}>
						{next} {material.unit}
					</strong>
				</div>
			</Form>
		</Modal>
	);
}
