import React from 'react';
import { Input, Badge } from 'antd';
import { SearchOutlined, CalendarOutlined, BellOutlined } from '@ant-design/icons';
import './styles.less';

interface Props {
	searchText: string;
	onSearchChange: (val: string) => void;
}

const LeTanHeader: React.FC<Props> = ({ searchText, onSearchChange }) => {
	const today = new Date().toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	});

	return (
		<div className='le-tan-header'>
			<div className='header-title'>
				<h2>Dashboard Lễ tân</h2>
				<span>Quản lý lịch hẹn và tiếp nhận khách hàng</span>
			</div>
			<div className='header-actions'>
				<Input
					prefix={<SearchOutlined style={{ color: '#9B9B9B' }} />}
					placeholder='Tìm kiếm khách hàng...'
					className='header-search'
					value={searchText}
					onChange={(e) => onSearchChange(e.target.value)}
					allowClear
				/>
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
					<div className='admin-avatar'>M</div>
					<div className='admin-info'>
						<span className='admin-name'>Nguyễn Thị Mai</span>
						<span className='admin-role'>Lễ tân</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LeTanHeader;
