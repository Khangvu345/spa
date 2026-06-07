// Lịch hẹn — ADMIN/OPERATOR. View-only.
// Mọi thao tác (check-in, huỷ, vắng, tạo lịch) nằm ở /le-tan và /thu-ngan.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, Tag, Input, Select, DatePicker, Tabs, Tooltip } from 'antd';
import { useModel } from 'umi';
import { Search, CalendarDays, List as ListIcon } from 'lucide-react';
import moment from 'moment';
import { View } from 'react-big-calendar';
import PageHeader from '@/components/PageHeader';
import { BOOKING_STATUS_OPTIONS, BOOKING_SOURCE_LABEL } from '@/services/Bookings/constant';
import BookingDetailModal from './components/BookingDetailModal';
import BookingsCalendar from './components/BookingsCalendar';
import '@/pages/admin/Employees/styles.less';
import './responsive.less';

const { RangePicker } = DatePicker;

export default function BookingsPage() {
	const { list, total, loading, detail, query, fetch, loadDetail, setDetail } = useModel(
		'bookings',
	) as any;

	const [searchInput, setSearchInput] = useState('');
	const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
	// Mobile (<768px) mặc định xem theo NGÀY cho dễ đọc; desktop xem Tuần.
	const [calView, setCalView] = useState<View>(
		typeof window !== 'undefined' && window.innerWidth < 768 ? 'day' : 'week',
	);
	const [calDate, setCalDate] = useState<Date>(new Date());
	const searchTimerRef = useRef<number | undefined>();
	const wasMobileRef = useRef<boolean | null>(null);

	// Đổi view tự động khi vượt ngưỡng mobile/desktop (chỉ khi ĐỔI trạng thái, để
	// không phá lựa chọn thủ công của người dùng trong cùng một chế độ màn hình).
	useEffect(() => {
		const onResize = () => {
			const mobile = window.innerWidth < 768;
			if (wasMobileRef.current === mobile) return;
			wasMobileRef.current = mobile;
			setCalView(mobile ? 'day' : 'week');
		};
		onResize();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	useEffect(() => {
		if (activeTab !== 'calendar') return;
		const d = moment(calDate);
		let from: moment.Moment;
		let to: moment.Moment;
		if (calView === 'month') {
			from = d.clone().startOf('month').startOf('week');
			to = d.clone().endOf('month').endOf('week');
		} else if (calView === 'day') {
			from = d.clone().startOf('day');
			to = d.clone().endOf('day');
		} else {
			from = d.clone().startOf('week');
			to = d.clone().endOf('week');
		}
		fetch({
			fromDate: from.format('YYYY-MM-DD'),
			toDate: to.format('YYYY-MM-DD'),
			limit: 100,
			page: 1,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [calView, calDate, activeTab]);

	// Tìm kiếm CHỈ thuộc tab Danh sách. Trước đây effect này chạy cả khi ở tab Lịch
	// → sau 300ms nó fetch không lọc ngày, đè mất dữ liệu cả tuần của lịch. Gate theo
	// activeTab để không đụng tới dữ liệu calendar; đổi sang tab Danh sách thì tự nạp.
	useEffect(() => {
		if (activeTab !== 'list') return;
		if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
		searchTimerRef.current = window.setTimeout(() => {
			fetch({ search: searchInput.trim() || undefined, page: 1 });
		}, 300);
		return () => {
			if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchInput, activeTab]);

	const openDetail = async (id: string) => {
		const b = await loadDetail(id);
		if (b) setDetailOpen(true);
	};

	const closeDetail = () => {
		setDetailOpen(false);
		setDetail(null);
	};

	const columns = useMemo(
		() => [
			{
				title: 'Mã lịch',
				dataIndex: 'bookingCode',
				width: 160,
				render: (v: string) => <code style={{ fontSize: 12, fontWeight: 600 }}>{v}</code>,
			},
			{
				title: 'Khách hàng',
				dataIndex: ['customerSnapshot', 'fullName'],
				width: 200,
				ellipsis: true,
				render: (_: any, r: BookingMgmt.IBooking) => (
					<div>
						<div style={{ fontWeight: 500 }}>{r.customerSnapshot.fullName}</div>
						<div style={{ color: '#6B7280', fontSize: 12 }}>{r.customerSnapshot.phone}</div>
					</div>
				),
			},
			{
				title: 'Dịch vụ',
				dataIndex: ['serviceSnapshot', 'name'],
				width: 200,
				ellipsis: true,
			},
			{
				title: 'Chuyên viên',
				dataIndex: ['staffSnapshot', 'fullName'],
				width: 140,
				ellipsis: true,
			},
			{
				title: 'Bắt đầu',
				dataIndex: 'scheduledStart',
				width: 150,
				render: (v: string) => moment(v).format('DD/MM/YYYY HH:mm'),
			},
			{
				title: 'Kết thúc',
				dataIndex: 'scheduledEnd',
				width: 90,
				render: (v: string) => moment(v).format('HH:mm'),
			},
			{
				title: 'Nguồn',
				dataIndex: 'source',
				width: 120,
				render: (v: BookingMgmt.TSource) => (
					<Tag color={v === 'LANDING_PAGE' ? '#2563EB' : '#7C3AED'}>{BOOKING_SOURCE_LABEL[v]}</Tag>
				),
			},
			{
				title: 'Ghi chú',
				dataIndex: 'note',
				width: 200,
				ellipsis: true,
				render: (v: string) =>
					v ? (
						<Tooltip title={v}>
							<span style={{ color: '#4B5563', fontSize: 12 }}>{v}</span>
						</Tooltip>
					) : (
						<span style={{ color: '#D1D5DB' }}>—</span>
					),
			},
			{
				title: 'Trạng thái',
				dataIndex: 'status',
				width: 140,
				align: 'center' as const,
				render: (v: BookingMgmt.TStatus) => {
					const opt = BOOKING_STATUS_OPTIONS.find((s) => s.value === v);
					return <Tag color={opt?.color}>{opt?.label}</Tag>;
				},
			},
		],
		[],
	);

	return (
		<div className='employees-page bookings-page'>
			<PageHeader
				title='Lịch hẹn'
				subtitle='Xem nhanh toàn bộ lịch — thao tác check-in/huỷ ở Lễ tân & Thu ngân'
			/>

			<Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as 'calendar' | 'list')}>
				<Tabs.TabPane
					key='calendar'
					tab={
						<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
							<CalendarDays size={14} /> Lịch
						</span>
					}
				>
					<BookingsCalendar
						bookings={list}
						loading={loading}
						view={calView}
						date={calDate}
						onView={setCalView}
						onDate={setCalDate}
						onSelectEvent={(b) => openDetail(b.id)}
					/>
				</Tabs.TabPane>
				<Tabs.TabPane
					key='list'
					tab={
						<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
							<ListIcon size={14} /> Danh sách
						</span>
					}
				>
					<div className='employees-page__toolbar' style={{ marginBottom: 16 }}>
						<Input
							prefix={<Search size={14} color='#9B9B9B' />}
							placeholder='Tìm theo SĐT hoặc tên khách...'
							allowClear
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							style={{ width: 260, borderRadius: 10 }}
						/>
						<Select
							allowClear
							placeholder='Trạng thái'
							style={{ width: 180 }}
							options={BOOKING_STATUS_OPTIONS.map((s) => ({
								value: s.value,
								label: s.label,
							}))}
							onChange={(v) => fetch({ status: v, page: 1 })}
						/>
						<RangePicker
							value={dateRange as any}
							format='DD/MM/YYYY'
							onChange={(range) => {
								setDateRange(range as any);
								fetch({
									fromDate: range?.[0]?.startOf('day').format('YYYY-MM-DD'),
									toDate: range?.[1]?.endOf('day').format('YYYY-MM-DD'),
									page: 1,
								});
							}}
						/>
					</div>

					<Table
						rowKey='id'
						loading={loading}
						dataSource={list}
						columns={columns as any}
						scroll={{ x: 1500 }}
						onRow={(r: BookingMgmt.IBooking) => ({
							onClick: () => openDetail(r.id),
							style: { cursor: 'pointer' },
						})}
						pagination={{
							current: query.page,
							pageSize: query.limit,
							total,
							showSizeChanger: true,
							onChange: (page, limit) => fetch({ page, limit }),
						}}
						className='employees-page__table'
					/>
				</Tabs.TabPane>
			</Tabs>

			<BookingDetailModal open={detailOpen} booking={detail} onCancel={closeDetail} />
		</div>
	);
}
