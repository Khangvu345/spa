import React from 'react';
import ColumnChart from '@/components/Chart/ColumnChart';
import { formatPrice } from '@/services/admin/Dashboard/constant';
import './style.less';

type Props = { data?: Dashboard.IRevenueData[] };

const RevenueChart: React.FC<Props> = ({ data }) => {
	const rows = data ?? [];
	return (
		<div className='chart-card'>
			<div className='chart-header'>
				<h3>Doanh thu 7 ngày gần đây</h3>
				<span className='chart-badge'>Theo phiếu COMPLETED</span>
			</div>
			<ColumnChart
				title=' '
				xAxis={rows.map((d) => d.day)}
				yAxis={[rows.map((d) => d.revenue)]}
				yLabel={['Doanh thu']}
				colors={['#c47070']}
				height={240}
				formatY={(val) => `${(val / 1000000).toFixed(1)}M`}
				otherOptions={{
					chart: { toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
					plotOptions: { bar: { borderRadius: 6, columnWidth: '60%' } },
					fill: {
						type: 'gradient',
						gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.3, opacityFrom: 1, opacityTo: 0.85 },
					},
					xaxis: {
						categories: rows.map((d) => d.day),
						axisBorder: { show: false },
						axisTicks: { show: false },
						labels: { style: { colors: '#9B9B9B', fontSize: '12px' } },
					},
					grid: { borderColor: '#F0F0F0', strokeDashArray: 4 },
					tooltip: { y: { formatter: (val: number) => formatPrice(val) } },
				}}
			/>
		</div>
	);
};

export default RevenueChart;
