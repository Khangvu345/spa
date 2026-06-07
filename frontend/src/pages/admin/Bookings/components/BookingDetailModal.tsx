// Chi tiết booking — read-only view.
import { Modal, Tag, Button, Divider } from 'antd';
import moment from 'moment';
import { BOOKING_STATUS_OPTIONS, BOOKING_SOURCE_LABEL } from '@/services/Bookings/constant';

type Props = {
	open: boolean;
	booking: BookingMgmt.IBooking | null;
	loading?: boolean;
	onCancel: () => void;
	onUpdate?: (id: string, payload: BookingMgmt.IUpdatePayload) => Promise<any>;
	onAfterAction?: () => void;
};

const fmtTime = (v?: string | null) => (v ? moment(v).format('DD/MM/YYYY HH:mm') : '—');

export default function BookingDetailModal({ open, booking, onCancel }: Props) {
	if (!booking) return null;

	const statusOpt = BOOKING_STATUS_OPTIONS.find((s) => s.value === booking.status);

	return (
		<Modal
			title={
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<span style={{ fontWeight: 600 }}>{booking.bookingCode}</span>
					<Tag color={statusOpt?.color}>{statusOpt?.label}</Tag>
					<Tag color={booking.source === 'LANDING_PAGE' ? '#2563EB' : '#7C3AED'}>
						{BOOKING_SOURCE_LABEL[booking.source]}
					</Tag>
				</div>
			}
			visible={open}
			centered
			width={680}
			onCancel={onCancel}
			footer={<Button onClick={onCancel}>Đóng</Button>}
		>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
				<div>
					<div style={{ color: '#6B7280' }}>Khách hàng</div>
					<div style={{ fontWeight: 500 }}>{booking.customerSnapshot.fullName}</div>
					<div style={{ color: '#6B7280', fontSize: 12 }}>
						{booking.customerSnapshot.phone}
						{booking.customerSnapshot.email ? ` · ${booking.customerSnapshot.email}` : ''}
					</div>
				</div>
				<div>
					<div style={{ color: '#6B7280' }}>Dịch vụ</div>
					<div style={{ fontWeight: 500 }}>
						{booking.serviceSnapshot.name} ({booking.serviceSnapshot.code})
					</div>
					<div style={{ color: '#6B7280', fontSize: 12 }}>
						{booking.serviceSnapshot.price.toLocaleString('vi-VN')}đ ·{' '}
						{booking.serviceSnapshot.durationMinutes} phút
					</div>
				</div>
				<div>
					<div style={{ color: '#6B7280' }}>Chuyên viên</div>
					<div>{booking.staffSnapshot.fullName}</div>
				</div>
				<div>
					<div style={{ color: '#6B7280' }}>Khung giờ</div>
					<div>
						{fmtTime(booking.scheduledStart)} – {moment(booking.scheduledEnd).format('HH:mm')}
					</div>
				</div>
				{booking.serviceOrderId && (
					<div>
						<div style={{ color: '#6B7280' }}>Phiếu DV liên kết</div>
						<code>{booking.serviceOrderId}</code>
					</div>
				)}
				{booking.cancelledAt && (
					<div>
						<div style={{ color: '#6B7280' }}>Huỷ</div>
						<div style={{ color: '#DC2626' }}>{booking.cancelReason}</div>
						<div style={{ color: '#6B7280', fontSize: 12 }}>{fmtTime(booking.cancelledAt)}</div>
					</div>
				)}
			</div>

			{booking.note && (
				<>
					<Divider style={{ margin: '14px 0' }} />
					<div style={{ fontSize: 13 }}>
						<div style={{ color: '#6B7280', marginBottom: 4 }}>Ghi chú</div>
						<div style={{ whiteSpace: 'pre-wrap' }}>{booking.note}</div>
					</div>
				</>
			)}
		</Modal>
	);
}
