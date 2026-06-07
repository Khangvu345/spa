// PageHeader dùng chung — card trắng bo tròn 16px chứa title + subtitle + actions phải.
// Mặc định actions chỉ có chuông thông báo. Có thể truyền `extras` để thêm/đè actions.
import React from 'react';
import NotificationBell from '@/components/NotificationBell';
import './style.less';

type Props = {
	title: string;
	subtitle?: string;
	extras?: React.ReactNode;
	showBell?: boolean;
};

const PageHeader: React.FC<Props> = ({ title, subtitle, extras, showBell = true }) => {
	return (
		<div className='page-header-card'>
			<div className='page-header-card__title'>
				<h2>{title}</h2>
				{subtitle && <span>{subtitle}</span>}
			</div>
			{extras && <div className='page-header-card__extras'>{extras}</div>}
			{showBell && <NotificationBell />}
		</div>
	);
};

export default PageHeader;
