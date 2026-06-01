// Lễ tân — OPERATOR. View tập trung lịch hẹn HÔM NAY + thao tác nhanh.
import { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Button, Modal, Input, Empty, Spin, Dropdown, Menu, Tooltip } from 'antd';
import { MoreHorizontal } from 'lucide-react';
import { useModel, history } from 'umi';
import {
	CalendarDays,
	Clock,
	CheckCircle2,
	UserX,
	XCircle,
	LogIn,
	Plus,
	Users,
} from 'lucide-react';
import moment from 'moment';
import PageHeader from '@/components/PageHeader';
import { BOOKING_STATUS_OPTIONS } from '@/services/Bookings/constant';
import CreateBookingModal from '@/pages/admin/Bookings/components/CreateBookingModal';
import './styles.less';

const KPI_BG = ['#EFF6FF', '#FEF3C7', '#ECFDF5', '#FCE7F3'];
const KPI_COLOR = ['#2563EB', '#D97706', '#059669', '#DB2777'];

export default function LeTanPage() {
	const { list, loading, submitting, fetch, createOperator, checkIn, cancel, noShow } = useModel(
		'bookings',
	) as any;

	const [createOpen, setCreateOpen] = useState(false);
	const [cancelTarget, setCancelTarget] = useState<BookingMgmt.IBooking | null>(null);
	const [cancelReason, setCancelReason] = useState('');

	useEffect(() => {
		const today = moment().startOf('day').format('YYYY-MM-DD');
		const tomorrow = moment().endOf('day').format('YYYY-MM-DD');
		fetch({ fromDate: today, toDate: tomorrow, limit: 50, page: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stats = useMemo(() => {
		const total = list.length;
		const upcoming = list.filter((b: BookingMgmt.IBooking) => b.status === 'CONFIRMED').length;
		const checkedIn = list.filter((b: BookingMgmt.IBooking) =>
			['CHECKED_IN', 'IN_PROGRESS'].includes(b.status),
		).length;
		const cancelled = list.filter((b: BookingMgmt.IBooking) =>
			['CANCELLED', 'NO_SHOW'].includes(b.status),
		).length;
		return { total, upcoming, checkedIn, cancelled };
	}, [list]);

	const kpis = [
		{ icon: <CalendarDays size={20} />, label: 'Lịch hôm nay', value: stats.total },
		{ icon: <Clock size={20} />, label: 'Chờ đón', value: stats.upcoming },
		{ icon: <CheckCircle2 size={20} />, label: 'Đã check-in', value: stats.checkedIn },
		{ icon: <Users size={20} />, label: 'Huỷ / Vắng', value: stats.cancelled },
	];

	const handleCheckIn = async (b: BookingMgmt.IBooking) => {
		const r = await checkIn(b.id);
		if (r?.data?.serviceOrder?.id) {
			Modal.confirm({
				title: 'Đã check-in & tạo phiếu DV',
				content: 'Mở phiếu dịch vụ vừa tạo?',
				okText: 'Mở phiếu DV',
				cancelText: 'Ở lại',
				onOk: () => history.push('/phieu-dich-vu'),
			});
			fetch();
		}
	};

	const submitCancel = async () => {
		if (!cancelTarget || !cancelReason.trim()) return;
		const r = await cancel(cancelTarget.id, cancelReason.trim());
		if (r) {
			setCancelTarget(null);
			setCancelReason('');
			fetch();
		}
	};

	return (
		<div className='le-tan-dashboard'>
			<PageHeader
				title='Lễ tân'
				subtitle={`Lịch hẹn hôm nay — ${moment().format('dddd, DD/MM/YYYY')}`}
				extras={
					<Button
						type='primary'
						icon={<Plus size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
						className='employees-page__add-btn'
						onClick={() => setCreateOpen(true)}
					>
						Tạo lịch hẹn
					</Button>
				}
			/>

			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				{kpis.map((k, i) => (
					<Col xs={12} md={6} key={k.label}>
						<Card bodyStyle={{ padding: 16 }} style={{ borderRadius: 12 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<div
									style={{
										width: 40,
										height: 40,
										background: KPI_BG[i],
										color: KPI_COLOR[i],
										borderRadius: 10,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									{k.icon}
								</div>
								<div>
									<div style={{ fontSize: 22, fontWeight: 700 }}>{k.value}</div>
									<div style={{ color: '#6B7280', fontSize: 12 }}>{k.label}</div>
								</div>
							</div>
						</Card>
					</Col>
				))}
			</Row>

			<Card
				title='Danh sách lịch hẹn hôm nay'
				bodyStyle={{ padding: 0 }}
				style={{ borderRadius: 12 }}
			>
				<Spin spinning={loading}>
					{list.length === 0 ? (
						<div style={{ padding: 48 }}>
							<Empty description='Không có lịch hẹn nào hôm nay' />
						</div>
					) : (
						<div>
							{list
								.slice()
								.sort(
									(a: BookingMgmt.IBooking, b: BookingMgmt.IBooking) =>
										new Date(a.scheduledStart).getTime() -
										new Date(b.scheduledStart).getTime(),
								)
								.map((b: BookingMgmt.IBooking) => {
									const statusOpt = BOOKING_STATUS_OPTIONS.find((s) => s.value === b.status);
									const canCheckIn = b.status === 'CONFIRMED';
									const canCancel = ['CONFIRMED', 'CHECKED_IN', 'PENDING_OTP'].includes(b.status);
									const canNoShow = b.status === 'CONFIRMED';
									return (
										<div
											key={b.id}
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 16,
												padding: '14px 20px',
												borderBottom: '1px solid #F3F4F6',
											}}
										>
											<div style={{ minWidth: 70, fontWeight: 600, color: '#1F2937' }}>
												{moment(b.scheduledStart).format('HH:mm')}
											</div>
											<div style={{ flex: 1, minWidth: 0 }}>
												<div style={{ fontWeight: 500 }}>
													{b.customerSnapshot.fullName}{' '}
													<span style={{ color: '#6B7280', fontWeight: 400, fontSize: 12 }}>
														· {b.customerSnapshot.phone}
													</span>
												</div>
												<div style={{ color: '#6B7280', fontSize: 12 }}>
													{b.serviceSnapshot.name} · CV {b.staffSnapshot.fullName}
												</div>
											</div>
											<span
												style={{
													display: 'inline-flex',
													alignItems: 'center',
													gap: 6,
													padding: '2px 10px',
													fontSize: 12,
													fontWeight: 500,
													color: statusOpt?.color,
													background: `${statusOpt?.color}14`,
													borderRadius: 6,
												}}
											>
												<span
													style={{
														width: 6,
														height: 6,
														borderRadius: '50%',
														background: statusOpt?.color,
													}}
												/>
												{statusOpt?.label}
											</span>
											<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
												{canCheckIn && (
													<Button
														type='primary'
														size='small'
														loading={submitting}
														onClick={() => handleCheckIn(b)}
														style={{
															background: '#059669',
															borderColor: '#059669',
															display: 'inline-flex',
															alignItems: 'center',
															gap: 6,
														}}
													>
														<LogIn size={14} />
														<span>Check-in</span>
													</Button>
												)}
												{(canNoShow || canCancel) && (
													<Dropdown
														trigger={['click']}
														overlay={
															<Menu>
																{canNoShow && (
																	<Menu.Item
																		key='noshow'
																		icon={<UserX size={14} />}
																		onClick={async () => {
																			const ok = await noShow(b.id);
																			if (ok) fetch();
																		}}
																	>
																		Khách không đến
																	</Menu.Item>
																)}
																{canCancel && (
																	<Menu.Item
																		key='cancel'
																		icon={<XCircle size={14} />}
																		danger
																		onClick={() => {
																			setCancelTarget(b);
																			setCancelReason('');
																		}}
																	>
																		Huỷ lịch
																	</Menu.Item>
																)}
															</Menu>
														}
													>
														<Tooltip title='Tuỳ chọn khác'>
															<Button type='text' size='small' icon={<MoreHorizontal size={16} />} />
														</Tooltip>
													</Dropdown>
												)}
											</div>
										</div>
									);
								})}
						</div>
					)}
				</Spin>
			</Card>

			<CreateBookingModal
				open={createOpen}
				loading={submitting}
				onCancel={() => setCreateOpen(false)}
				onSubmit={async (payload) => {
					const r = await createOperator(payload);
					if (r) {
						setCreateOpen(false);
						const today = moment().startOf('day').format('YYYY-MM-DD');
						const tomorrow = moment().endOf('day').format('YYYY-MM-DD');
						fetch({ fromDate: today, toDate: tomorrow, page: 1 });
					}
					return r;
				}}
			/>

			<Modal
				title='Huỷ lịch hẹn'
				visible={!!cancelTarget}
				centered
				onCancel={() => {
					setCancelTarget(null);
					setCancelReason('');
				}}
				onOk={submitCancel}
				okButtonProps={{ danger: true, disabled: !cancelReason.trim(), loading: submitting }}
				okText='Xác nhận huỷ'
				cancelText='Đóng'
			>
				{cancelTarget && (
					<>
						<div style={{ marginBottom: 12, padding: 10, background: '#FAFBFD', borderRadius: 8 }}>
							<strong>{cancelTarget.bookingCode}</strong> — {cancelTarget.customerSnapshot.fullName}
							<div style={{ color: '#6B7280', fontSize: 12 }}>
								{cancelTarget.serviceSnapshot.name} ·{' '}
								{moment(cancelTarget.scheduledStart).format('DD/MM/YYYY HH:mm')}
							</div>
						</div>
						<div style={{ marginBottom: 8 }}>Lý do huỷ (bắt buộc):</div>
						<Input.TextArea
							rows={3}
							value={cancelReason}
							onChange={(e) => setCancelReason(e.target.value)}
							placeholder='VD: Khách báo huỷ lịch'
							maxLength={500}
						/>
					</>
				)}
			</Modal>
		</div>
	);
}
