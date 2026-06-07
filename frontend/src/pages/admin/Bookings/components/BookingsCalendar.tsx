// Lịch grid Tuần / Ngày / Tháng cho /lich-hen.
import { useMemo, useState } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import { Modal, Tag } from 'antd';
import { Layers } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BOOKING_STATUS_OPTIONS } from '@/services/Bookings/constant';
import './calendar.less';

moment.locale('vi');
const localizer = momentLocalizer(moment);

// Từ 2 lịch trở lên TRÙNG GIỜ BẮT ĐẦU → gom thành 1 thẻ "chồng" + số lượng.
const GROUP_FROM = 2;

type Props = {
	bookings: BookingMgmt.IBooking[];
	loading?: boolean;
	view: View;
	date: Date;
	onView: (v: View) => void;
	onDate: (d: Date) => void;
	onSelectEvent: (b: BookingMgmt.IBooking) => void;
	onSelectSlot?: (start: Date, end: Date) => void;
};

type CalEvent = {
	id: string;
	title: string;
	start: Date;
	end: Date;
	resource?: BookingMgmt.IBooking; // thẻ đơn
	group?: BookingMgmt.IBooking[]; // thẻ gom (nhiều lịch cùng giờ)
	count?: number;
};

const MESSAGES = {
	today: 'Hôm nay',
	previous: 'Trước',
	next: 'Sau',
	month: 'Tháng',
	week: 'Tuần',
	day: 'Ngày',
	agenda: 'Danh sách',
	date: 'Ngày',
	time: 'Giờ',
	event: 'Lịch hẹn',
	noEventsInRange: 'Không có lịch nào trong khoảng này',
	showMore: (n: number) => `+ ${n} lịch khác`,
};

// Format date label trên toolbar — rõ ràng, dễ đọc.
const FORMATS = {
	dayHeaderFormat: (d: Date) =>
		`${moment(d).format('dddd')} · ${moment(d).format('DD/MM/YYYY')}`,
	dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
		`${moment(start).format('DD/MM')} – ${moment(end).format('DD/MM/YYYY')}`,
	monthHeaderFormat: (d: Date) => moment(d).format('MMMM YYYY'),
	weekdayFormat: (d: Date) => moment(d).format('ddd · DD/MM'),
	dayFormat: (d: Date) => moment(d).format('DD ddd'),
};

// Nội dung trong thẻ: thẻ gom hiện badge số lượng, thẻ đơn hiện tiêu đề thường.
function CalEventContent({ event }: { event: CalEvent }) {
	if (event.group) {
		return (
			<div className='rbc-group-event'>
				<span className='rbc-group-badge'>
					<Layers size={12} /> {event.count}
				</span>
				<span>lịch cùng giờ — bấm xem</span>
			</div>
		);
	}
	return <span>{event.title}</span>;
}

export default function BookingsCalendar({
	bookings,
	loading,
	view,
	date,
	onView,
	onDate,
	onSelectEvent,
	onSelectSlot,
}: Props) {
	// Popup danh sách các lịch cùng giờ khi bấm thẻ gom.
	const [groupModal, setGroupModal] = useState<{ items: BookingMgmt.IBooking[]; label: string } | null>(
		null,
	);

	const events = useMemo<CalEvent[]>(() => {
		// Gom theo giờ bắt đầu (scheduledStart trùng nhau = chồng thẻ lên nhau).
		const byStart = new Map<string, BookingMgmt.IBooking[]>();
		bookings.forEach((b) => {
			const arr = byStart.get(b.scheduledStart);
			if (arr) arr.push(b);
			else byStart.set(b.scheduledStart, [b]);
		});

		const result: CalEvent[] = [];
		byStart.forEach((arr) => {
			if (arr.length < GROUP_FROM) {
				const b = arr[0];
				result.push({
					id: b.id,
					title: `${b.customerSnapshot.fullName} — ${b.serviceSnapshot.name}`,
					start: new Date(b.scheduledStart),
					end: new Date(b.scheduledEnd),
					resource: b,
				});
				return;
			}
			// Thẻ gom: phủ từ giờ bắt đầu đến giờ kết thúc muộn nhất trong nhóm.
			const start = new Date(arr[0].scheduledStart);
			const latestEnd = arr.reduce(
				(mx, x) => Math.max(mx, new Date(x.scheduledEnd).getTime()),
				0,
			);
			result.push({
				id: `group-${arr[0].scheduledStart}`,
				title: `${arr.length} lịch hẹn`,
				start,
				end: new Date(latestEnd),
				group: arr,
				count: arr.length,
			});
		});
		return result;
	}, [bookings]);

	const eventStyleGetter = (ev: CalEvent) => {
		// Thẻ gom: nền nhấn + bóng so le tạo cảm giác nhiều thẻ chồng nhau.
		if (ev.group) {
			return {
				style: {
					background: 'linear-gradient(135deg, #c47070 0%, #a85a5a 100%)',
					border: 'none',
					borderRadius: 12,
					color: '#FFFFFF',
					fontSize: 12,
					fontWeight: 700,
					boxShadow:
						'3px 3px 0 -1px #f0c9c9, 6px 6px 0 -2px #e6b3b3, 0 6px 14px rgba(168, 90, 90, 0.3)',
				},
			};
		}
		const status = ev.resource!.status;
		const opt = BOOKING_STATUS_OPTIONS.find((s) => s.value === status);
		const color = opt?.color ?? '#2563EB';
		const muted = ['CANCELLED', 'NO_SHOW'].includes(status);
		return {
			style: {
				background: muted ? `${color}33` : color,
				border: 'none',
				borderRadius: 6,
				color: muted ? color : '#FFFFFF',
				fontSize: 12,
				fontWeight: 500,
				padding: '2px 6px',
				textDecoration: muted ? 'line-through' : 'none',
				opacity: muted ? 0.85 : 1,
			},
		};
	};

	const handleSelect = (ev: CalEvent) => {
		if (ev.group) {
			setGroupModal({ items: ev.group, label: moment(ev.start).format('HH:mm · DD/MM/YYYY') });
		} else if (ev.resource) {
			onSelectEvent(ev.resource);
		}
	};

	const openFromGroup = (b: BookingMgmt.IBooking) => {
		setGroupModal(null);
		onSelectEvent(b);
	};

	return (
		<div
			className={`bookings-calendar${view === 'day' ? ' is-day' : ''}`}
			style={{ opacity: loading ? 0.5 : 1 }}
		>
			<Calendar<CalEvent>
				localizer={localizer}
				events={events}
				view={view}
				date={date}
				onView={onView}
				onNavigate={onDate}
				views={['month', 'week', 'day']}
				step={30}
				timeslots={2}
				min={moment().hour(7).minute(0).toDate()}
				max={moment().hour(22).minute(0).toDate()}
				culture='vi'
				messages={MESSAGES}
				formats={FORMATS as any}
				eventPropGetter={eventStyleGetter as any}
				components={{ event: CalEventContent as any }}
				onSelectEvent={(ev) => handleSelect(ev as CalEvent)}
				selectable={!!onSelectSlot}
				onSelectSlot={(s) => onSelectSlot && onSelectSlot(s.start as Date, s.end as Date)}
				style={{ height: 'calc(100vh - 220px)', minHeight: 760 }}
				popup
			/>

			<Modal
				visible={!!groupModal}
				onCancel={() => setGroupModal(null)}
				footer={null}
				width={520}
				title={
					<span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>
						{groupModal?.items.length} lịch hẹn lúc {groupModal?.label}
					</span>
				}
				className='bookings-group-modal'
			>
				<div className='bookings-group-list'>
					{groupModal?.items.map((b) => {
						const opt = BOOKING_STATUS_OPTIONS.find((s) => s.value === b.status);
						return (
							<button
								key={b.id}
								type='button'
								className='bookings-group-item'
								onClick={() => openFromGroup(b)}
							>
								<div className='bookings-group-item__main'>
									<span className='bookings-group-item__name'>{b.customerSnapshot.fullName}</span>
									<span className='bookings-group-item__service'>{b.serviceSnapshot.name}</span>
								</div>
								<div className='bookings-group-item__meta'>
									<span className='bookings-group-item__time'>
										{moment(b.scheduledStart).format('HH:mm')} –{' '}
										{moment(b.scheduledEnd).format('HH:mm')}
									</span>
									<Tag color={opt?.color}>{opt?.label}</Tag>
								</div>
							</button>
						);
					})}
				</div>
			</Modal>
		</div>
	);
}
