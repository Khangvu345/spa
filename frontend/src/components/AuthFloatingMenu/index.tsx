// Footer của sidebar (ProLayout menuFooterRender):
//  - Hồ sơ của tôi
//  - Thu gọn / Mở rộng
//  - Đăng xuất (đỏ, có confirm)
import { Modal } from 'antd';
import { history, useModel } from 'umi';
import { LogOut, UserCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function AuthFloatingMenu({ collapsed = false }: { collapsed?: boolean }) {
	const { currentUser, logout } = useModel('auth') as {
		currentUser: Auth.IStaff | null;
		logout: () => void;
	};
	const { setInitialState, initialState } = useModel('@@initialState') as any;

	if (!currentUser) return null;

	const handleLogout = () => {
		Modal.confirm({
			title: 'Đăng xuất',
			content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
			okText: 'Đăng xuất',
			cancelText: 'Huỷ',
			okButtonProps: { danger: true },
			onOk: async () => {
				logout();
				await setInitialState({ ...(initialState ?? {}), currentUser: undefined });
				history.replace('/login');
			},
		});
	};

	const toggleCollapse = () => {
		// ProLayout lưu trạng thái collapsed trong @@initialState.settings hoặc qua MenuFooter context.
		// Cách đơn giản: phát event nhấn vào sider trigger có sẵn.
		const trigger = document.querySelector('.ant-pro-sider-collapsed-button, .ant-layout-sider-trigger') as HTMLElement;
		if (trigger) trigger.click();
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
				padding: '12px',
				borderTop: '1px solid rgba(196, 112, 112, 0.1)',
				fontFamily: 'Nunito, sans-serif',
			}}
		>
			<FooterItem
				icon={<UserCircle size={18} />}
				label='Hồ sơ của tôi'
				collapsed={collapsed}
				onClick={() => history.push('/ho-so-cua-toi')}
			/>
			{/* Thu gọn/Mở rộng — ẩn trên mobile (sidebar là Drawer, không cần thu gọn) */}
			<FooterItem
				icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
				label={collapsed ? 'Mở rộng' : 'Thu gọn'}
				collapsed={collapsed}
				muted
				className='auth-footer-collapse'
				onClick={toggleCollapse}
			/>
			<FooterItem
				icon={<LogOut size={18} />}
				label='Đăng xuất'
				collapsed={collapsed}
				danger
				onClick={handleLogout}
			/>
		</div>
	);
}

function FooterItem({
	icon,
	label,
	collapsed,
	danger,
	muted,
	className,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	collapsed: boolean;
	danger?: boolean;
	muted?: boolean;
	className?: string;
	onClick: () => void;
}) {
	const color = danger ? '#c44545' : muted ? 'var(--clay-muted)' : 'var(--clay-foreground)';
	const iconColor = danger ? '#c44545' : 'var(--clay-muted)';
	const hoverBg = danger ? 'rgba(196, 69, 69, 0.08)' : 'rgba(196, 112, 112, 0.08)';
	const hoverColor = danger ? '#a33333' : 'var(--clay-accent)';
	return (
		<button
			onClick={onClick}
			title={label}
			className={className}
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: collapsed ? 'center' : 'flex-start',
				gap: 12,
				padding: collapsed ? '10px 0' : '10px 14px',
				background: 'transparent',
				border: 'none',
				borderRadius: 14,
				color,
				fontSize: 14,
				fontWeight: 700,
				cursor: 'pointer',
				transition: 'all 0.2s ease',
				width: '100%',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = hoverBg;
				e.currentTarget.style.color = hoverColor;
				(e.currentTarget.firstChild as HTMLElement).style.color = hoverColor;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = 'transparent';
				e.currentTarget.style.color = color;
				(e.currentTarget.firstChild as HTMLElement).style.color = iconColor;
			}}
		>
			<span style={{ display: 'flex', color: iconColor, transition: 'color 0.2s ease' }}>{icon}</span>
			{!collapsed && <span>{label}</span>}
		</button>
	);
}
