import React from 'react';
import { Tag, Badge } from 'antd';
import {
	PlusCircleOutlined,
	UserAddOutlined,
	FileTextOutlined,
	LoginOutlined,
} from '@ant-design/icons';
import './styles.less';

interface Props {
	waitingList: LeTan.IWaitingCustomer[];
	onCreateAppointment: () => void;
	onCheckin: () => void;
}

const QuickActions: React.FC<Props> = ({ waitingList, onCreateAppointment, onCheckin }) => {
	return (
		<div className='quick-actions-card'>
			<div className='card-header'>
				<h3>Thao tác nhanh</h3>
			</div>
			<div className='action-grid'>
				<div className='action-row'>
					<div className='action-btn' style={{ background: '#FFF0F0' }} onClick={onCreateAppointment}>
						<PlusCircleOutlined style={{ fontSize: 28, color: '#c47070' }} />
						<span className='action-text'>Tạo lịch hẹn</span>
					</div>
					<div className='action-btn' style={{ background: '#EFF6FF' }} onClick={onCheckin}>
						<UserAddOutlined style={{ fontSize: 28, color: '#3B82F6' }} />
						<span className='action-text'>Thêm khách</span>
					</div>
				</div>
				<div className='action-row'>
					<div className='action-btn' style={{ background: '#EDE9FE' }}>
						<FileTextOutlined style={{ fontSize: 28, color: '#7C3AED' }} />
						<span className='action-text'>Tạo phiếu DV</span>
					</div>
					<div className='action-btn' style={{ background: '#FEF3C7' }} onClick={onCheckin}>
						<LoginOutlined style={{ fontSize: 28, color: '#D97706' }} />
						<span className='action-text'>Check-in</span>
					</div>
				</div>
			</div>

			<div className='section-divider' />

			<div className='waiting-section'>
				<div className='section-header'>
					<h3>Khách đang chờ</h3>
					<Badge count={waitingList.length} style={{ backgroundColor: '#D97706' }} />
				</div>
				<div className='waiting-list'>
					{waitingList.map((item) => (
						<div
							className='waiting-item'
							key={item.key}
							style={{ background: item.type === 'walkin' ? '#EFF6FF' : '#FFF7ED' }}
						>
							<div>
								<div className='waiting-name'>{item.name}</div>
								<div className='waiting-detail'>{item.detail}</div>
							</div>
							<Tag
								style={{
									border: 'none',
									borderRadius: 12,
									fontWeight: 600,
									fontSize: 11,
									background: item.type === 'walkin' ? '#DBEAFE' : '#FFEDD5',
									color: item.type === 'walkin' ? '#2563EB' : '#D97706',
								}}
							>
								{item.type === 'walkin' ? 'Walk-in' : 'Chờ'}
							</Tag>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default QuickActions;
