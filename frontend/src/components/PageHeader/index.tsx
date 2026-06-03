// PageHeader dùng chung — card trắng bo tròn 16px chứa title + subtitle + actions phải.
// Mặc định actions chỉ có chuông thông báo. Có thể truyền `extras` để thêm/đè actions.
import React from 'react';
import { Badge } from 'antd';
import { BellOutlined } from '@ant-design/icons';
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
			<div className='page-header-card__actions'>
				{extras}
				{showBell && (
					<div className='page-header-card__icon-btn'>
						<Badge dot color='#EF4444' offset={[-2, 2]}>
							<BellOutlined style={{ fontSize: 16, color: '#4A4A4A' }} />
						</Badge>
					</div>
				)}
			</div>
		</div>
	);
};

export default PageHeader;
