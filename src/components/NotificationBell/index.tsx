// Chuông thông báo — dùng model `notifications` (poll endpoint sẵn có).
// Badge số chưa đọc + dropdown danh sách; bấm 1 noti → điều hướng tới trang liên quan.
import React from 'react';
import { Badge, Dropdown, Empty } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useModel, history } from 'umi';
import { CalendarDays, AlertTriangle, Clock, Receipt } from 'lucide-react';
import type { AppNoti, TNotiType } from '@/models/notifications';

const ICON: Record<TNotiType, React.ReactNode> = {
	booking: <CalendarDays size={16} color='#2563EB' />,
	lowstock: <AlertTriangle size={16} color='#DC2626' />,
	upcoming: <Clock size={16} color='#D97706' />,
	invoice: <Receipt size={16} color='#059669' />,
};

export default function NotificationBell() {
	const { items, unreadCount, readIds, markAllRead } = useModel('notifications') as {
		items: AppNoti[];
		unreadCount: number;
		readIds: string[];
		markAllRead: () => void;
	};
	const readSet = new Set(readIds);

	const overlay = (
		<div
			style={{
				width: 340,
				maxHeight: 440,
				overflowY: 'auto',
				background: '#fff5f5',
				borderRadius: 16,
				boxShadow: '0 12px 32px rgba(120, 90, 90, 0.22)',
				padding: 8,
				fontFamily: "'DM Sans', sans-serif",
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '8px 10px 10px',
				}}
			>
				<strong style={{ fontFamily: "'Nunito', sans-serif", fontSize: 15, color: 'var(--clay-foreground)' }}>
					Thông báo {unreadCount > 0 && <span style={{ color: '#EF4444' }}>({unreadCount})</span>}
				</strong>
				{unreadCount > 0 && (
					<a onClick={markAllRead} style={{ fontSize: 12, color: 'var(--clay-accent)' }}>
						Đánh dấu đã đọc
					</a>
				)}
			</div>

			{items.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description='Không có thông báo'
					style={{ padding: '20px 0' }}
				/>
			) : (
				items.map((n) => {
					const unread = !readSet.has(n.id);
					return (
						<div
							key={n.id}
							onClick={() => history.push(n.link)}
							style={{
								display: 'flex',
								gap: 10,
								padding: '10px 10px',
								borderRadius: 12,
								cursor: 'pointer',
								background: unread ? 'rgba(196, 112, 112, 0.08)' : 'transparent',
								marginBottom: 2,
								transition: 'background 0.15s ease',
							}}
							onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(196, 112, 112, 0.14)')}
							onMouseLeave={(e) =>
								(e.currentTarget.style.background = unread ? 'rgba(196, 112, 112, 0.08)' : 'transparent')
							}
						>
							<span style={{ display: 'flex', alignItems: 'flex-start', paddingTop: 2 }}>{ICON[n.type]}</span>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div
									style={{
										fontWeight: unread ? 700 : 500,
										fontSize: 13,
										color: 'var(--clay-foreground)',
									}}
								>
									{n.title}
								</div>
								<div
									style={{
										fontSize: 12,
										color: 'var(--clay-muted)',
										whiteSpace: 'nowrap',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
									}}
								>
									{n.desc}
								</div>
								<div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{n.timeLabel}</div>
							</div>
							{unread && (
								<span
									style={{
										width: 8,
										height: 8,
										borderRadius: '50%',
										background: '#EF4444',
										marginTop: 5,
										flexShrink: 0,
									}}
								/>
							)}
						</div>
					);
				})
			)}
		</div>
	);

	return (
		<Dropdown overlay={overlay} trigger={['click']} placement='bottomRight'>
			<div className='page-header-card__icon-btn'>
				<Badge count={unreadCount} size='small' offset={[-2, 2]}>
					<BellOutlined style={{ fontSize: 16, color: '#4A4A4A' }} />
				</Badge>
			</div>
		</Dropdown>
	);
}
