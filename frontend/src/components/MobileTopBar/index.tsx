import { useEffect, useRef } from 'react';
import { useLocation, useModel } from 'umi';
import './index.less';

// Các trang `layout: false` (landing, login…) — ProLayout vẫn gọi childrenRender
// ở chế độ pure nên topbar sẽ đè lên navbar riêng của các trang này nếu không chặn.
const LAYOUTLESS_PATHS = ['/', '/feedback', '/login', '/change-password', '/user/login', '/403', '/hold-on'];

/**
 * Thanh top bar + nút hamburger cho admin trên MOBILE (<768px).
 * - Chỉ hiển thị ở mobile (ẩn ở desktop qua CSS) → desktop không đổi.
 * - Chỉ render trên trang quản lý (có sidebar) — ẩn ở landing/login/feedback.
 * - Bấm hamburger toggle `initialState.collapsed`; ProLayout tự render
 *   sidebar thành Drawer trượt ra ở chế độ mobile.
 */
export default function MobileTopBar() {
	const { initialState, setInitialState } = useModel('@@initialState') as any;
	const location = useLocation();
	const collapsed = !!initialState?.collapsed;
	const wasMobile = useRef<boolean | null>(null);

	// Khi vượt ngưỡng 768px: vào mobile → đóng Drawer; ra desktop → mở sidebar.
	// Chỉ tác động khi ĐỔI trạng thái mobile/desktop, tránh đóng menu lung tung
	// khi mobile browser fire resize lúc cuộn (ẩn/hiện thanh URL).
	useEffect(() => {
		const onResize = () => {
			const mobile = window.innerWidth < 768;
			if (wasMobile.current === mobile) return;
			wasMobile.current = mobile;
			setInitialState((s: any) => ({ ...(s ?? {}), collapsed: mobile }));
		};
		onResize();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, [setInitialState]);

	const toggle = () =>
		setInitialState((s: any) => ({ ...(s ?? {}), collapsed: !s?.collapsed }));

	// Bỏ slash cuối (Netlify pretty URLs) rồi so khớp — giống onPageChange ở app.tsx.
	const path = location.pathname.replace(/\/+$/, '') || '/';
	if (LAYOUTLESS_PATHS.includes(path)) return null;

	return (
		<>
			{/* ProLayout tự render mask cho Drawer + đóng khi bấm ngoài, nên ở đây
			    không cần backdrop tự chế nữa. */}
			<div className="admin-mobile-topbar">
				<button
					type="button"
					className={`admin-mobile-burger${collapsed ? '' : ' is-open'}`}
					aria-label="Mở menu"
					aria-expanded={!collapsed}
					onClick={toggle}
				>
					<span />
					<span />
					<span />
				</button>
				<div className="admin-mobile-brand">
					<img src="/spalogo.png" alt="Luna Spa" />
					<span>Luna Spa</span>
				</div>
			</div>
			{/* Spacer đẩy nội dung xuống dưới top bar fixed (cao 56px ở mobile, 0 ở desktop) */}
			<div className="admin-mobile-topbar-spacer" />
		</>
	);
}
