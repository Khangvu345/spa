import React from 'react';
import { Row, Col } from 'antd';
import {
	DollarOutlined,
	CheckCircleOutlined,
	ClockCircleOutlined,
	TagOutlined,
	ArrowUpOutlined,
} from '@ant-design/icons';
import { KPI_CARDS } from '@/services/staff/ThuNgan/constant';
import './styles.less';

const iconMap: Record<string, React.ReactNode> = {
	DollarOutlined: <DollarOutlined />,
	CheckCircleOutlined: <CheckCircleOutlined />,
	ClockCircleOutlined: <ClockCircleOutlined />,
	TagOutlined: <TagOutlined />,
};

const KpiCards: React.FC = () => {
	return (
		<Row gutter={[20, 20]} className='kpi-row'>
			{KPI_CARDS.map((card) => (
				<Col xs={24} sm={12} lg={6} key={card.key}>
					<div className='kpi-card'>
						<div className='kpi-top'>
							<div className='kpi-icon' style={{ backgroundColor: card.bgColor }}>
								<span style={{ color: card.color, fontSize: 20 }}>{iconMap[card.icon]}</span>
							</div>
							<div
								className='kpi-trend'
								style={{
									color: card.trendUp ? '#059669' : card.color,
									backgroundColor: card.trendUp ? '#ECFDF5' : card.bgColor,
								}}
							>
								{card.trendUp && <ArrowUpOutlined style={{ fontSize: 10 }} />}
								<span>{card.trend}</span>
							</div>
						</div>
						<span className='kpi-value'>{card.value}</span>
						<span className='kpi-label'>{card.label}</span>
					</div>
				</Col>
			))}
		</Row>
	);
};

export default KpiCards;
