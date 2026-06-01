import React from 'react';
import {
	DollarOutlined,
	TagOutlined,
	PrinterOutlined,
	UndoOutlined,
} from '@ant-design/icons';
import { QUICK_ACTIONS, RECENT_PAYMENTS, formatPrice } from '@/services/staff/ThuNgan/constant';
import './styles.less';

const iconMap: Record<string, React.ReactNode> = {
	DollarOutlined: <DollarOutlined />,
	TagOutlined: <TagOutlined />,
	PrinterOutlined: <PrinterOutlined />,
	UndoOutlined: <UndoOutlined />,
};

const QuickActionsPayment: React.FC = () => {
	return (
		<div className='quick-payment-card'>
			<div className='card-header'>
				<h3>Thao tác nhanh</h3>
			</div>
			<div className='action-grid'>
				{QUICK_ACTIONS.map((row, ri) => (
					<div className='action-row' key={ri}>
						{row.map((action, ai) => (
							<div className='action-btn' style={{ background: action.bg }} key={ai}>
								<span style={{ fontSize: 28, color: action.color }}>{iconMap[action.icon]}</span>
								<span className='action-text'>{action.text}</span>
							</div>
						))}
					</div>
				))}
			</div>

			<div className='section-divider' />

			<div className='payment-section'>
				<h3>Thanh toán gần đây</h3>
				<div className='payment-list'>
					{RECENT_PAYMENTS.map((item) => (
						<div className='payment-item' key={item.key}>
							<div className='payment-info'>
								<div className='payment-name'>{item.name}</div>
								<div className='payment-detail'>{item.detail}</div>
							</div>
							<span className='payment-amount'>{formatPrice(item.amount)}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default QuickActionsPayment;
