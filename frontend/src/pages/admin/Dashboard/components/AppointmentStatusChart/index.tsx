import React from 'react';
import DonutChart from '@/components/Chart/DonutChart';
import './style.less';

type Props = { data?: Dashboard.IAppointmentStatus[] };

const AppointmentStatusChart: React.FC<Props> = ({ data }) => {
	const rows = data ?? [];
	const hasData = rows.length > 0 && rows.some((r) => r.value > 0);
	return (
		<div className='chart-card'>
			<div className='chart-header'>
				<h3>Phiếu DV theo trạng thái</h3>
			</div>
			{hasData ? (
				<DonutChart
					xAxis={rows.map((s) => s.label)}
					yAxis={[rows.map((s) => s.value)]}
					yLabel={rows.map((s) => s.label)}
					colors={rows.map((s) => s.color)}
					height={270}
					showTotal
					formatY={(val) => `${val}`}
					otherOptions={{
						chart: { fontFamily: 'Inter, sans-serif' },
						legend: { position: 'bottom', fontSize: '13px', markers: { width: 10, height: 10 } },
						dataLabels: { enabled: false },
						stroke: { width: 2 },
					}}
				/>
			) : (
				<div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Chưa có dữ liệu</div>
			)}
		</div>
	);
};

export default AppointmentStatusChart;
