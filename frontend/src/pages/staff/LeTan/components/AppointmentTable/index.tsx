import React from 'react';
import { Table, Tag, Button } from 'antd';
import { CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { STATUS_CONFIG, formatPrice } from '@/services/staff/LeTan/constant';
import './styles.less';

interface Props {
	appointments: LeTan.IAppointment[];
	waitingCount: number;
	onConfirm: (key: string) => void;
	onStartService: (key: string) => void;
}

const AppointmentTable: React.FC<Props> = ({ appointments, waitingCount, onConfirm, onStartService }) => {
	const columns = [
		{
			title: 'Thời gian',
			dataIndex: 'time',
			key: 'time',
			width: 90,
			render: (text: string) => <span style={{ fontWeight: 600, fontSize: 13 }}>{text}</span>,
		},
		{
			title: 'Khách hàng',
			dataIndex: 'customer',
			key: 'customer',
			render: (name: string, record: LeTan.IAppointment) => (
				<div className='customer-cell'>
					<div className='avatar-circle' style={{ background: record.avatarColor }}>
						{name.charAt(name.lastIndexOf(' ') + 1)}
					</div>
					<div>
						<span className='customer-name'>{name}</span>
						<br />
						<span style={{ fontSize: 11, color: '#9B9B9B' }}>{record.phone}</span>
					</div>
				</div>
			),
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'service',
			key: 'service',
			render: (text: string, record: LeTan.IAppointment) => (
				<div>
					<span style={{ fontSize: 13 }}>{text}</span>
					<br />
					<span style={{ fontSize: 11, color: '#9B9B9B' }}>{formatPrice(record.price)}</span>
				</div>
			),
		},
		{
			title: 'Chuyên viên',
			dataIndex: 'specialist',
			key: 'specialist',
			width: 120,
			render: (text: string) => <span style={{ fontSize: 13, color: '#6B6B6B' }}>{text}</span>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			width: 140,
			render: (status: string) => {
				const cfg = STATUS_CONFIG[status];
				if (!cfg) return null;
				return (
					<Tag className='status-tag' style={{ color: cfg.color, backgroundColor: cfg.bgColor, border: 'none' }}>
						{cfg.label}
					</Tag>
				);
			},
		},
		{
			title: '',
			key: 'action',
			width: 100,
			render: (_: any, record: LeTan.IAppointment) => {
				if (record.status === 'cho_xac_nhan') {
					return <Button type='link' size='small' onClick={() => onConfirm(record.key)}>Xác nhận</Button>;
				}
				if (record.status === 'da_xac_nhan') {
					return <Button type='link' size='small' onClick={() => onStartService(record.key)}>Bắt đầu</Button>;
				}
				return null;
			},
		},
	];

	return (
		<div className='table-card'>
			<div className='card-header'>
				<div className='header-left'>
					<CalendarOutlined style={{ color: '#c47070', fontSize: 16 }} />
					<h3>Lịch hẹn hôm nay</h3>
					<span className='count-badge'>{waitingCount}</span>
				</div>
				<a className='view-all not-underline'>
					Xem tất cả <ArrowRightOutlined />
				</a>
			</div>
			<Table
				dataSource={appointments}
				columns={columns}
				rowKey='key'
				pagination={false}
				size='middle'
				className='appointments-table'
			/>
		</div>
	);
};

export default AppointmentTable;
