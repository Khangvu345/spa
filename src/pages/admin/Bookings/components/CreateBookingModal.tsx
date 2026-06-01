// Modal tạo lịch hẹn (operator) — cần customer + service + slot.
// Chọn slot từ grid toàn bộ khung giờ FREE/BUSY trong ngày.
import { useEffect, useState } from 'react';
import { Modal, Form, Select, Input, DatePicker, Spin, Tooltip } from 'antd';
import moment from 'moment';
import * as customersApi from '@/services/Customers/api';
import * as servicesApi from '@/services/Services/api';
import * as bookingsApi from '@/services/Bookings/api';

type Props = {
	open: boolean;
	loading?: boolean;
	onCancel: () => void;
	onSubmit: (payload: BookingMgmt.ICreateOperatorPayload) => Promise<any>;
};

export default function CreateBookingModal({ open, loading, onCancel, onSubmit }: Props) {
	const [form] = Form.useForm();
	const [customers, setCustomers] = useState<CustomerMgmt.ICustomer[]>([]);
	const [services, setServices] = useState<SvcMgmt.IService[]>([]);
	const [grid, setGrid] = useState<BookingMgmt.IAvailabilityGrid | null>(null);
	const [fetchingSlots, setFetchingSlots] = useState(false);

	useEffect(() => {
		if (!open) return;
		form.resetFields();
		setGrid(null);
		(async () => {
			try {
				const [cRes, sRes] = await Promise.all([
					customersApi.getCustomers({ isActive: true, limit: 100 }),
					servicesApi.getServices({ isActive: true, limit: 100 }),
				]);
				setCustomers((cRes.data as any).data ?? []);
				setServices((sRes.data as any).data ?? []);
			} catch {}
		})();
	}, [open, form]);

	const serviceId = Form.useWatch('serviceId', form);
	const dateValue = Form.useWatch('date', form);
	const selectedSlot = Form.useWatch('slot', form);

	useEffect(() => {
		if (!serviceId || !dateValue) {
			setGrid(null);
			return;
		}
		const d = moment.isMoment(dateValue) ? dateValue : moment(dateValue);
		const dateStr = d.format('YYYY-MM-DD');
		setFetchingSlots(true);
		bookingsApi
			.getAvailabilityGrid(serviceId, dateStr)
			.then((r) => setGrid(r.data))
			.catch(() => setGrid(null))
			.finally(() => setFetchingSlots(false));
		form.setFieldsValue({ slot: undefined });
	}, [serviceId, dateValue, form]);

	const handleOk = async () => {
		const values = await form.validateFields();
		const d = moment.isMoment(values.date) ? values.date : moment(values.date);
		const [hh, mm] = String(values.slot).split(':');
		const scheduledStart = d
			.clone()
			.hour(Number(hh))
			.minute(Number(mm))
			.second(0)
			.millisecond(0)
			.toISOString();

		const r = await onSubmit({
			customerId: values.customerId,
			serviceId: values.serviceId,
			scheduledStart,
			note: values.note || undefined,
		});
		if (r) form.resetFields();
	};

	const selectSlot = (time: string) => {
		form.setFieldsValue({ slot: time });
		form.setFields([{ name: 'slot', errors: [] }]);
	};

	const renderSlotPicker = () => {
		if (fetchingSlots) {
			return (
				<div style={{ padding: 8 }}>
					<Spin size='small' /> <span style={{ marginLeft: 8 }}>Đang tải slot...</span>
				</div>
			);
		}
		if (!serviceId || !dateValue) {
			return <div style={{ color: '#9CA3AF', fontSize: 13 }}>Chọn dịch vụ + ngày trước.</div>;
		}
		if (!grid || grid.slots.length === 0) {
			return <div style={{ color: '#9CA3AF', fontSize: 13 }}>Không có slot nào trong ngày.</div>;
		}
		return (
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(8, 1fr)',
					gap: 6,
					maxHeight: 220,
					overflowY: 'auto',
					padding: 4,
				}}
			>
				{grid.slots.map((s) => {
					const isFree = s.status === 'FREE';
					const isSelected = selectedSlot === s.time;
					return (
						<Tooltip key={s.time} title={isFree ? 'Trống' : 'Đã có lịch'}>
							<button
								type='button'
								disabled={!isFree}
								onClick={() => selectSlot(s.time)}
								style={{
									padding: '6px 4px',
									borderRadius: 6,
									border: isSelected ? '2px solid #c47070' : '1px solid #E5E7EB',
									background: isSelected ? '#FDF2F2' : isFree ? '#F0FDF4' : '#FEE2E2',
									color: isSelected ? '#9B1C1C' : isFree ? '#059669' : '#9CA3AF',
									fontSize: 12,
									fontWeight: 500,
									cursor: isFree ? 'pointer' : 'not-allowed',
									opacity: isFree ? 1 : 0.6,
								}}
							>
								{s.time}
							</button>
						</Tooltip>
					);
				})}
			</div>
		);
	};

	const serviceName = services.find((s) => s.id === serviceId)?.name;

	return (
		<Modal
			title='Tạo lịch hẹn'
			visible={open}
			centered
			width={680}
			onCancel={onCancel}
			onOk={handleOk}
			confirmLoading={loading}
			okText='Tạo lịch hẹn'
			cancelText='Huỷ'
			okButtonProps={{ style: { background: '#c47070', borderColor: '#c47070' } }}
		>
			<Form form={form} layout='vertical'>
				<Form.Item
					name='customerId'
					label='Khách hàng'
					rules={[{ required: true, message: 'Chọn khách hàng' }]}
				>
					<Select
						showSearch
						optionFilterProp='label'
						placeholder='Tìm theo tên hoặc SĐT'
						options={customers.map((c) => ({ value: c.id, label: `${c.fullName} — ${c.phone}` }))}
					/>
				</Form.Item>

				<Form.Item
					name='serviceId'
					label='Dịch vụ'
					rules={[{ required: true, message: 'Chọn dịch vụ' }]}
				>
					<Select
						showSearch
						optionFilterProp='label'
						placeholder='Chọn dịch vụ'
						options={services.map((s) => ({ value: s.id, label: s.name }))}
					/>
				</Form.Item>

				<Form.Item name='date' label='Ngày' rules={[{ required: true, message: 'Chọn ngày' }]}>
					<DatePicker style={{ width: '100%' }} format='DD/MM/YYYY' />
				</Form.Item>

				<div style={{ marginBottom: 4 }}>
					<span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary, #1F2937)' }}>
						Khung giờ {serviceName ? `(${serviceName})` : ''}
						<span style={{ color: '#FF4D4F', marginLeft: 4 }}>*</span>
					</span>
				</div>
				<Form.Item name='slot' rules={[{ required: true, message: 'Chọn khung giờ' }]}>
					{renderSlotPicker()}
				</Form.Item>

				<Form.Item name='note' label='Ghi chú'>
					<Input.TextArea rows={2} maxLength={500} placeholder='VD: Khách yêu cầu phòng yên tĩnh' />
				</Form.Item>
			</Form>
		</Modal>
	);
}
