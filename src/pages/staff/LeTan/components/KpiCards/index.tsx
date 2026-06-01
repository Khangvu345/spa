import React from 'react';
import { Row, Col } from 'antd';
import {
	CalendarOutlined,
	ClockCircleOutlined,
	LoginOutlined,
	UserAddOutlined,
	ArrowUpOutlined,
} from '@ant-design/icons';
import './styles.less';

const iconMap: Record<string, React.ReactNode> = {
	CalendarOutlined: <CalendarOutlined />,
	ClockCircleOutlined: <ClockCircleOutlined />,
	LoginOutlined: <LoginOutlined />,
	UserAddOutlined: <UserAddOutlined />,
};

interface Props {
	kpiData: LeTan.IKpiCard[];
}

const KpiCards: React.FC<Props> = ({ kpiData }) => {
	return (
		<Row gutter={[20, 20]} className='kpi-row'>
			{kpiData.map((card) => (
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
