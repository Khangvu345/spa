import React from 'react';
import { Table, Tag, Button } from 'antd';
import { CreditCardOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { STATUS_CONFIG, formatPrice } from '@/services/staff/ThuNgan/constant';
import './styles.less';

interface Props {
	tickets: ThuNgan.ITicket[];
	onPay: (key: string) => void;
}

const TicketTable: React.FC<Props> = ({ tickets, onPay }) => {
	const columns = [
		{
			title: 'Mã phiếu',
			dataIndex: 'code',
			key: 'code',
			width: 90,
			render: (text: string) => <span style={{ fontWeight: 600, fontSize: 13 }}>{text}</span>,
		},
		{
			title: 'Khách hàng',
			dataIndex: 'customer',
			key: 'customer',
			render: (name: string, record: ThuNgan.ITicket) => (
				<div className='customer-cell'>
					<div className='avatar-circle' style={{ background: record.avatarColor }}>
						{name.charAt(name.lastIndexOf(' ') + 1)}
					</div>
					<span className='customer-name'>{name}</span>
				</div>
			),
		},
		{
			title: 'Dịch vụ',
			dataIndex: 'service',
			key: 'service',
			render: (text: string) => <span style={{ fontSize: 13 }}>{text}</span>,
		},
		{
			title: 'Tổng tiền',
			dataIndex: 'total',
			key: 'total',
			width: 120,
			render: (val: number) => <span style={{ fontWeight: 600, fontSize: 13 }}>{formatPrice(val)}</span>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			width: 110,
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
			render: (_: any, record: ThuNgan.ITicket) => {
				if (record.status === 'cho_thanh_toan') {
					return (
						<Button type='link' size='small' onClick={() => onPay(record.key)}>
							Thanh toán
						</Button>
					);
				}
				return null;
			},
		},
	];

	return (
		<div className='table-card'>
			<div className='card-header'>
				<div className='header-left'>
					<CreditCardOutlined style={{ color: '#c47070', fontSize: 16 }} />
					<h3>Phiếu chờ thanh toán</h3>
					<span className='count-badge'>{tickets.filter((t) => t.status === 'cho_thanh_toan').length}</span>
				</div>
				<a className='view-all not-underline'>
					Xem tất cả <ArrowRightOutlined />
				</a>
			</div>
			<Table dataSource={tickets} columns={columns} rowKey='key' pagination={false} size='middle' className='tickets-table' />
		</div>
	);
};

export default TicketTable;
