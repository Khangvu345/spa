// Lịch grid Tuần / Ngày / Tháng cho /lich-hen.
import { useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { BOOKING_STATUS_OPTIONS } from '@/services/Bookings/constant';
import './calendar.less';

moment.locale('vi');
const localizer = momentLocalizer(moment);

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
	resource: BookingMgmt.IBooking;
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
	const events = useMemo<CalEvent[]>(
		() =>
			bookings.map((b) => ({
				id: b.id,
				title: `${b.customerSnapshot.fullName} — ${b.serviceSnapshot.name}`,
				start: new Date(b.scheduledStart),
				end: new Date(b.scheduledEnd),
				resource: b,
			})),
		[bookings],
	);

	const eventStyleGetter = (ev: CalEvent) => {
		const status = ev.resource.status;
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

	return (
		<div className='bookings-calendar' style={{ opacity: loading ? 0.5 : 1 }}>
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
				onSelectEvent={(ev) => onSelectEvent((ev as CalEvent).resource)}
				selectable={!!onSelectSlot}
				onSelectSlot={(s) => onSelectSlot && onSelectSlot(s.start as Date, s.end as Date)}
				style={{ height: 'calc(100vh - 220px)', minHeight: 760 }}
				popup
			/>
		</div>
	);
}
