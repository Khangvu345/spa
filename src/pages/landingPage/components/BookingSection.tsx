import { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Spin, Alert } from 'antd';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import MyDatePicker from '@/components/MyDatePicker';
import { useModel } from 'umi';
import moment from 'moment';
import OtpModal from './OtpModal';

const { TextArea } = Input;

export function BookingSection() {
	const [form] = Form.useForm();
	// Lỗi đặt lịch hiển thị ngay trong form (trùng giờ / ngoài giờ / lỗi khác) — chắc chắn khách thấy.
	const [bookingError, setBookingError] = useState<string>('');
	const {
		loading,
		perks,
		services,
		slots,
		loadingSlots,
		loadServices,
		loadSlots,
		requestOtp,
		verifyOtp,
		resendOtp,
		closeOtp,
		otpBooking,
		verifying,
		resending,
	} = useModel('landingPage.booking');

	useEffect(() => {
		loadServices();
	}, [loadServices]);

	const serviceId = Form.useWatch('serviceId', form);
	const dateValue = Form.useWatch('date', form);
	const selectedSlot = Form.useWatch('slot', form);

	useEffect(() => {
		if (!serviceId || !dateValue) return;
		const d = moment.isMoment(dateValue) ? dateValue : moment(dateValue);
		loadSlots(serviceId, d.format('YYYY-MM-DD'));
		form.setFieldsValue({ slot: undefined });
	}, [serviceId, dateValue, loadSlots, form]);

	const selectSlot = (time: string) => {
		form.setFieldsValue({ slot: time });
		form.setFields([{ name: 'slot', errors: [] }]);
		setBookingError('');
	};

	const onFinish = async (values: any) => {
		setBookingError('');
		const phone = String(values.phone || '').replace(/\D/g, '');
		if (phone.length !== 10) {
			form.setFields([{ name: 'phone', errors: ['Số điện thoại phải đủ 10 chữ số'] }]);
			return;
		}
		const d = moment.isMoment(values.date) ? values.date : moment(values.date);
		const [hh, mm] = String(values.slot).split(':');
		const scheduledStart = d
			.clone()
			.hour(Number(hh))
			.minute(Number(mm))
			.second(0)
			.millisecond(0)
			.toISOString();

		const fullName = [values.firstName, values.lastName].filter(Boolean).join(' ').trim();
		// Tạo booking PENDING_OTP + gửi mã; form giữ nguyên đến khi xác thực xong.
		const res = await requestOtp({
			serviceId: values.serviceId,
			scheduledStart,
			fullName,
			phone,
			email: values.email,
			note: values.notes || undefined,
		});
		if (!res.ok) {
			// Hiện alert ngay trong form để khách biết lý do không đặt được.
			setBookingError(res.errorMsg || 'Không đặt được lịch, vui lòng thử lại.');
			// Slot vừa bị người khác đặt (409) → bỏ slot đã chọn và tải lại khung giờ trống mới.
			if (res.conflict) {
				form.setFieldsValue({ slot: undefined });
				loadSlots(values.serviceId, d.format('YYYY-MM-DD'));
			}
		}
	};

	return (
		<section
			id='booking'
			className='flex gap-[72px] px-[120px] py-[100px]'
			style={{ backgroundColor: 'var(--clay-canvas)', fontFamily: 'DM Sans, sans-serif' }}
		>
			<div className='flex-1 flex flex-col gap-6'>
				<span
					className='text-[13px] font-bold tracking-[4px]'
					style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-accent)' }}
				>
					ĐẶT LỊCH
				</span>
				<h2
					className='text-[40px] font-black leading-[1.2] tracking-tight'
					style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--clay-foreground)' }}
				>
					Đặt Lịch
					<br />
					Thư Giãn
				</h2>
				<p
					className='text-base leading-relaxed'
					style={{
						fontFamily: 'DM Sans, sans-serif',
						color: 'var(--clay-muted)',
						fontWeight: 500,
					}}
				>
					Hãy bắt đầu hành trình thư giãn tuyệt đối. Đặt lịch hẹn trực tuyến và để chúng tôi lo
					liệu phần còn lại. Chọn dịch vụ, ngày giờ và chuyên viên trị liệu mà bạn yêu thích.
				</p>
				<div className='flex flex-col gap-4'>
					{perks.map((perk) => (
						<div key={perk} className='flex items-center gap-3'>
							<CheckCircleOutlined style={{ color: 'var(--clay-accent)', fontSize: 20 }} />
							<span
								className='text-sm'
								style={{
									fontFamily: 'DM Sans, sans-serif',
									color: 'var(--clay-muted)',
									fontWeight: 500,
								}}
							>
								{perk}
							</span>
						</div>
					))}
				</div>
			</div>

			<div
				className='flex-1 p-10'
				style={{
					borderRadius: 24,
					background: 'rgba(255, 255, 255, 0.75)',
					backdropFilter: 'blur(16px)',
					boxShadow:
						'16px 16px 32px rgba(180, 150, 150, 0.22), -10px -10px 24px rgba(255, 255, 255, 0.95), inset 4px 4px 8px rgba(196, 112, 112, 0.03), inset -4px -4px 8px rgba(255, 255, 255, 1)',
					border: 'none',
				}}
			>
				<h3
					className='text-[22px] font-extrabold mb-6'
					style={{
						fontFamily: 'Nunito, sans-serif',
						color: 'var(--clay-foreground)',
					}}
				>
					Đặt Lịch Hẹn
				</h3>
				{bookingError && (
					<Alert
						type='error'
						showIcon
						closable
						message={bookingError}
						onClose={() => setBookingError('')}
						style={{ marginBottom: 20, borderRadius: 14 }}
					/>
				)}
				<Form form={form} layout='vertical' onFinish={onFinish} requiredMark={false}>
					<div className='flex gap-4'>
						<Form.Item
							name='firstName'
							label='Họ'
							style={{ flex: 1 }}
							rules={[{ required: true, message: 'Nhập họ' }]}
						>
							<Input placeholder='Nhập họ' className='landing-input' />
						</Form.Item>
						<Form.Item
							name='lastName'
							label='Tên'
							style={{ flex: 1 }}
							rules={[{ required: true, message: 'Nhập tên' }]}
						>
							<Input placeholder='Nhập tên' className='landing-input' />
						</Form.Item>
					</div>
					<Form.Item
						name='email'
						label='Địa chỉ email'
						rules={[
							{ required: true, message: 'Nhập email để nhận mã xác thực' },
							{ type: 'email', message: 'Email không hợp lệ' },
						]}
					>
						<Input placeholder='email@example.com' className='landing-input' />
					</Form.Item>
					<Form.Item
						name='phone'
						label='Số điện thoại'
						rules={[{ required: true, message: 'Nhập số điện thoại 10 chữ số' }]}
					>
						<Input placeholder='0xxxxxxxxx' className='landing-input' />
					</Form.Item>
					<div className='flex gap-4'>
						<Form.Item
							name='serviceId'
							label='Dịch vụ'
							style={{ flex: 1 }}
							rules={[{ required: true, message: 'Chọn dịch vụ' }]}
						>
							<Select
								placeholder='Chọn dịch vụ'
								className='landing-select'
								options={services.map((s) => ({ value: s.id, label: s.name }))}
								showSearch
								optionFilterProp='label'
							/>
						</Form.Item>
						<Form.Item
							name='date'
							label='Ngày mong muốn'
							style={{ flex: 1 }}
							rules={[{ required: true, message: 'Chọn ngày' }]}
						>
							<MyDatePicker placeholder='Chọn ngày' format='DD/MM/YYYY' />
						</Form.Item>
					</div>

					<Form.Item
						name='slot'
						label='Khung giờ'
						rules={[{ required: true, message: 'Chọn khung giờ' }]}
					>
						{loadingSlots ? (
							<div style={{ padding: 8 }}>
								<Spin size='small' /> <span style={{ marginLeft: 8 }}>Đang tải slot...</span>
							</div>
						) : !serviceId || !dateValue ? (
							<div style={{ color: 'var(--clay-muted)', fontSize: 13 }}>
								Chọn dịch vụ và ngày để xem khung giờ trống.
							</div>
						) : slots.length === 0 ? (
							<div style={{ color: 'var(--clay-muted)', fontSize: 13 }}>
								Không có khung giờ trống trong ngày — vui lòng chọn ngày khác.
							</div>
						) : (
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(4, 1fr)',
									gap: 8,
									maxHeight: 200,
									overflowY: 'auto',
									paddingRight: 2,
								}}
							>
								{slots.map((time) => {
									const isSelected = selectedSlot === time;
									return (
										<button
											key={time}
											type='button'
											title='Còn trống'
											onClick={() => selectSlot(time)}
											style={{
												padding: '8px 4px',
												borderRadius: 12,
												border: isSelected
													? '2px solid var(--clay-accent)'
													: '1px solid rgba(196, 112, 112, 0.18)',
												background: isSelected
													? 'rgba(196, 112, 112, 0.12)'
													: 'rgba(255, 255, 255, 0.7)',
												color: isSelected ? 'var(--clay-accent)' : 'var(--clay-foreground)',
												fontSize: 14,
												fontWeight: 600,
												fontFamily: 'Nunito, sans-serif',
												cursor: 'pointer',
												transition: 'all 0.15s ease',
											}}
										>
											{time}
										</button>
									);
								})}
							</div>
						)}
					</Form.Item>

					<Form.Item name='notes' label='Yêu cầu đặc biệt (Tùy chọn)'>
						<TextArea
							rows={3}
							placeholder='Dị ứng, sở thích hoặc yêu cầu đặc biệt...'
							className='landing-input'
							maxLength={500}
						/>
					</Form.Item>
					<Form.Item style={{ marginBottom: 0 }}>
						<Button
							type='primary'
							htmlType='submit'
							block
							loading={loading}
							className='landing-btn-primary'
						>
							Đặt lịch hẹn <ArrowRightOutlined />
						</Button>
					</Form.Item>
				</Form>
			</div>

			<OtpModal
				open={!!otpBooking}
				email={otpBooking?.customerSnapshot?.email}
				verifying={verifying}
				resending={resending}
				onVerify={async (code) => {
					const r = await verifyOtp(code);
					if (r.ok) form.resetFields();
					// Booking bị huỷ (closed) → modal đóng, báo lý do ngay trên form để khách đặt lại.
					else if (r.closed) setBookingError(r.error);
					return r;
				}}
				onResend={resendOtp}
				onClose={closeOtp}
			/>
		</section>
	);
}

export default BookingSection;
