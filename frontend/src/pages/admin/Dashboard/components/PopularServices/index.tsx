import React from 'react';
import { formatPrice } from '@/services/admin/Dashboard/constant';
import './style.less';

type Props = { data?: Dashboard.IPopularService[] };

const PopularServices: React.FC<Props> = ({ data }) => {
	const rows = data ?? [];
	return (
		<div className='services-card'>
			<div className='card-header'>
				<h3>Dịch vụ phổ biến</h3>
				<span className='chart-badge'>Theo lượt đặt</span>
			</div>
			<div className='services-list'>
				{rows.length === 0 ? (
					<div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>Chưa có dữ liệu</div>
				) : (
					rows.map((svc, idx) => (
						<div
							key={svc._id}
							className='service-item'
							style={{
								backgroundColor: idx === 0 ? '#FFF5F5' : undefined,
								border: idx === 0 ? 'none' : '1px solid #F0F0F0',
							}}
						>
							<div className='svc-icon' style={{ backgroundColor: svc.bgColor }}>
								<span>{svc.icon}</span>
							</div>
							<div className='svc-info'>
								<span className='svc-name'>{svc.name}</span>
								<span className='svc-meta'>
									{svc.bookings} lượt · {formatPrice(svc.price)}
								</span>
							</div>
							<span className='svc-rank' style={{ color: svc.color }}>
								#{idx + 1}
							</span>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default PopularServices;
