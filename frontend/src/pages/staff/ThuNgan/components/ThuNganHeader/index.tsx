import React from 'react';
import { Badge } from 'antd';
import { CalendarOutlined, BellOutlined } from '@ant-design/icons';
import './styles.less';

const ThuNganHeader: React.FC = () => {
	const today = new Date().toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});

	return (
		<div className='thu-ngan-header'>
			<div className='header-title'>
				<h2>Dashboard Thu ngân</h2>
				<span>Quản lý thanh toán và hóa đơn</span>
			</div>
			<div className='header-actions'>
				<div className='header-pill'>
					<CalendarOutlined style={{ color: 'var(--accent-deep, #c47070)' }} />
					<span>{today}</span>
				</div>
				<div className='header-pill icon-pill'>
					<Badge dot color='#EF4444' offset={[-2, 2]}>
						<BellOutlined style={{ fontSize: 16, color: '#4A4A4A' }} />
					</Badge>
				</div>
				<div className='header-admin'>
					<div className='admin-avatar'>N</div>
					<div className='admin-info'>
						<span className='admin-name'>Trần Văn Nam</span>
						<span className='admin-role'>Thu ngân</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ThuNganHeader;
