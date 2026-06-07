// Modal Thêm / Sửa dịch vụ — khớp design Pencil (rounded-16, fields: Mã / Tên / Danh mục / Giá / Thời lượng / Buffer / Mô tả).
import { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Select, InputNumber, Switch, Row, Col, Upload, Button, Image, message } from 'antd';
import { SERVICE_CATEGORY_OPTIONS } from '@/services/Services/constant';
import { uploadServiceImage } from '@/services/Services/api';

type Props = {
	open: boolean;
	editing?: SvcMgmt.IService | null;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: any) => Promise<void>;
};

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SERVICE_IMAGE_SIZE_MB = 5;

export default function ServiceFormModal({ open, editing, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const isEdit = !!editing;
	const [imageUrl, setImageUrl] = useState('');
	const [uploadingImage, setUploadingImage] = useState(false);

	useEffect(() => {
		if (open) {
			if (editing) {
				const nextImageUrl = editing.imageUrl ?? '';
				form.setFieldsValue({
					code: editing.code,
					name: editing.name,
					category: editing.category,
					unitPrice: editing.unitPrice,
					durationMinutes: editing.durationMinutes,
					bufferMinutes: editing.bufferMinutes,
					slotsRequired: editing.slotsRequired,
					description: editing.description,
					imageUrl: nextImageUrl,
					isActive: editing.isActive,
				});
				setImageUrl(nextImageUrl);
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
				setImageUrl('');
			}
		}
	}, [open, editing, form]);

	const beforeUploadImage = (file: any) => {
		if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
			message.error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP');
			return Upload.LIST_IGNORE;
		}
		if (file.size / 1024 / 1024 > MAX_SERVICE_IMAGE_SIZE_MB) {
			message.error(`Ảnh dịch vụ tối đa ${MAX_SERVICE_IMAGE_SIZE_MB}MB`);
			return Upload.LIST_IGNORE;
		}
		return true;
	};

	const handleUploadImage = async ({ file, onSuccess, onError }: any) => {
		setUploadingImage(true);
		try {
			const res = await uploadServiceImage(file);
			form.setFieldsValue({ imageUrl: res.data.url });
			setImageUrl(res.data.url);
			message.success('Upload ảnh dịch vụ thành công');
			onSuccess?.(res.data);
		} catch (err: any) {
			message.error(err?.response?.data?.message || 'Upload ảnh dịch vụ thất bại');
			onError?.(err);
		} finally {
			setUploadingImage(false);
		}
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			const nextImageUrl = values.imageUrl?.trim();
			const payload: any = {
				...values,
				imageUrl: nextImageUrl || null,
			};
			if (!isEdit && !nextImageUrl) delete payload.imageUrl;
			await onSubmit(payload);
		} catch (err: any) {
			if (err?.errorFields) return;
			// eslint-disable-next-line no-console
			console.error('[ServiceFormModal] submit error', err?.response?.data || err);
			const msg = err?.response?.data?.message;
			if (msg) {
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
			confirmLoading={loading || uploadingImage}
			okText={isEdit ? 'Lưu thay đổi' : 'Tạo dịch vụ'}
			cancelText='Huỷ'
			width={560}
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' }, disabled: uploadingImage }}
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

				<Form.Item name='unitPrice' label='Giá (VND)' rules={[{ required: true, message: 'Nhập giá' }]}>
					<InputNumber
						style={{ width: '100%' }}
						min={0}
						step={50000}
						formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
						parser={((v: string | undefined) => Number(`${v}`.replace(/,/g, ''))) as any}
					/>
				</Form.Item>

				<Row gutter={12}>
					<Col xs={24} md={12}>
						<Form.Item name='durationMinutes' label='Thời lượng (phút)' rules={[{ required: true }]}>
							<InputNumber style={{ width: '100%' }} min={1} max={480} />
						</Form.Item>
					</Col>
					<Col xs={24} md={12}>
						<Form.Item name='bufferMinutes' label='Buffer (phút)'>
							<InputNumber style={{ width: '100%' }} min={0} max={120} />
						</Form.Item>
					</Col>
				</Row>

				<Form.Item name='description' label='Mô tả'>
					<Input.TextArea rows={3} placeholder='Mô tả ngắn về dịch vụ' maxLength={1000} showCount />
				</Form.Item>

				<Form.Item
					name='imageUrl'
					label='Ảnh dịch vụ'
					rules={[
						{ type: 'url', message: 'URL ảnh không hợp lệ' },
						{ max: 500, message: 'URL ảnh tối đa 500 ký tự' },
					]}
				>
					<Input
						allowClear
						placeholder='Dán URL ảnh hoặc upload file bên dưới'
						onChange={(e) => setImageUrl(e.target.value.trim())}
					/>
				</Form.Item>

				<div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: -12, marginBottom: 20 }}>
					{imageUrl ? (
						<Image
							src={imageUrl}
							alt='Ảnh dịch vụ'
							width={92}
							height={68}
							style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0dada' }}
						/>
					) : null}
					<Upload
						accept='image/jpeg,image/png,image/webp'
						maxCount={1}
						showUploadList={false}
						beforeUpload={beforeUploadImage}
						customRequest={handleUploadImage}
					>
						<Button icon={<UploadOutlined />} loading={uploadingImage}>
							Upload ảnh
						</Button>
					</Upload>
				</div>

				<Form.Item name='isActive' label='Trạng thái' valuePropName='checked'>
					<Switch checkedChildren='Hoạt động' unCheckedChildren='Tạm ngưng' />
				</Form.Item>
			</Form>
		</Modal>
	);
}
