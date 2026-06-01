import React, { useEffect } from 'react';
import { Row, Col, Spin } from 'antd';
import { useModel } from 'umi';
import PageHeader from '@/components/PageHeader';
import KpiCards from './components/KpiCards';
import RevenueChart from './components/RevenueChart';
import AppointmentStatusChart from './components/AppointmentStatusChart';
import RecentAppointments from './components/RecentAppointments';
import PopularServices from './components/PopularServices';
import './style.less';

const Dashboard: React.FC = () => {
	const { data, loading, fetch } = useModel('dashboard') as any;

	useEffect(() => {
		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className='spa-dashboard'>
			<PageHeader title='Dashboard' subtitle='Chúc mừng trở lại đây là tổng quan hôm nay.' />

			<Spin spinning={loading}>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
					<KpiCards data={data} />

					<Row gutter={[20, 20]} className='charts-row'>
						<Col xs={24} lg={14}>
							<RevenueChart data={data?.revenue7days} />
						</Col>
						<Col xs={24} lg={10}>
							<AppointmentStatusChart data={data?.statusBreakdown} />
						</Col>
					</Row>

					<Row gutter={[20, 20]} className='bottom-row'>
						<Col xs={24} lg={15}>
							<RecentAppointments data={data?.recentAppointments} />
						</Col>
						<Col xs={24} lg={9}>
							<PopularServices data={data?.popularServices} />
						</Col>
					</Row>
				</div>
			</Spin>
		</div>
	);
};

export default Dashboard;
