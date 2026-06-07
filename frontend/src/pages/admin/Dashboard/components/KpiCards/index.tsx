import React from 'react';
import { Row, Col } from 'antd';
import {
	RiseOutlined,
	CalendarOutlined,
	UserAddOutlined,
	CheckCircleOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
} from '@ant-design/icons';
import CountUp from '../CountUp';
import { formatPrice } from '@/services/admin/Dashboard/constant';
import type { IDashboardData } from '@/services/admin/Dashboard/api';
import './style.less';

type Props = { data: IDashboardData | null };

const KpiCards: React.FC<Props> = ({ data }) => {
	const revToday = data?.revenueToday ?? 0;
	const revYest = data?.revenueYesterday ?? 0;
	const revDelta = revYest ? Math.round(((revToday - revYest) / revYest) * 100) : 0;

	const ordToday = data?.ordersToday ?? 0;
	const ordYest = data?.ordersYesterday ?? 0;
	const ordDelta = ordToday - ordYest;

	const cards = [
		{
			key: 'revenue',
			label: 'Doanh thu hôm nay',
			value: formatPrice(revToday),
			trend: `${revDelta >= 0 ? '+' : ''}${revDelta}% so với hôm qua`,
			trendUp: revDelta >= 0,
			icon: <RiseOutlined />,
			color: '#c47070',
			bgColor: '#FFF0F0',
		},
		{
			key: 'orders',
			label: 'Phiếu DV hôm nay',
			value: String(ordToday),
			trend: `${ordDelta >= 0 ? '+' : ''}${ordDelta} so với hôm qua`,
			trendUp: ordDelta >= 0,
			icon: <CalendarOutlined />,
			color: '#2563EB',
			bgColor: '#EFF6FF',
		},
		{
			key: 'completed',
			label: 'Đã hoàn thành',
			value: String(data?.completedToday ?? 0),
			trend: 'Hôm nay',
			trendUp: true,
			icon: <CheckCircleOutlined />,
			color: '#059669',
			bgColor: '#ECFDF5',
		},
		{
			key: 'customers',
			label: 'Khách hàng',
			value: String(data?.totalCustomers ?? 0),
			trend: 'Tổng',
			trendUp: true,
			icon: <UserAddOutlined />,
			color: '#7C3AED',
			bgColor: '#F5F3FF',
		},
	];

	return (
		<Row gutter={[20, 20]} className='kpi-row'>
			{cards.map((card) => (
				<Col xs={12} sm={12} lg={6} key={card.key}>
					<div className='kpi-card'>
						<div className='kpi-top'>
							<div className='kpi-icon' style={{ backgroundColor: card.bgColor }}>
								<span style={{ color: card.color, fontSize: 20 }}>{card.icon}</span>
							</div>
							<div
								className='kpi-trend'
								style={{
									color: card.trendUp ? '#059669' : '#DC2626',
									backgroundColor: card.trendUp ? '#ECFDF5' : '#FEF2F2',
								}}
							>
								{card.trendUp ? (
									<ArrowUpOutlined style={{ fontSize: 10 }} />
								) : (
									<ArrowDownOutlined style={{ fontSize: 10 }} />
								)}
								<span>{card.trend}</span>
							</div>
						</div>
						<span className='kpi-value'>
							{card.key === 'revenue' ? (
								card.value
							) : (
								<CountUp value={card.value} duration={1200} />
							)}
						</span>
						<span className='kpi-label'>{card.label}</span>
					</div>
				</Col>
			))}
		</Row>
	);
};

export default KpiCards;
