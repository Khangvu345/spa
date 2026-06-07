// Routes tách theo APP_CONFIG_TARGET:
//   - landing : chỉ trang công khai (landing + đặt lịch + feedback).  '/' = landing.
//   - admin   : login + toàn bộ hệ thống quản lý, KHÔNG có landing.   '/' redirect '/login'.
//   - (dev)   : khi `yarn start` không set target → gộp cả hai để dev tiện thử.
const target = process.env.APP_CONFIG_TARGET;
const isLanding = target === 'landing';
const isAdmin = target === 'admin';

// ── Trang công khai (chỉ thuộc bản landing) ──
const landingRoutes = [
	{
		path: '/',
		name: 'LandingPage',
		component: './landingPage',
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/feedback',
		name: 'Feedback',
		component: './landingPage/components/FeedbackPage',
		layout: false,
		hideInMenu: true,
	},
];

// ── Login (Keycloak legacy) ──
const userRoutes = [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},
];

// ── Auth của hệ thống quản lý ──
const authRoutes = [
	{
		path: '/login',
		name: 'Login',
		component: './loginPage',
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/change-password',
		name: 'ChangePassword',
		component: './auth/ChangePassword',
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/ho-so-cua-toi',
		name: 'Hồ sơ của tôi',
		component: './MyProfile',
		hideInMenu: true,
		access: 'canAny',
	},
];

// ── Menu hệ thống quản lý — phân quyền theo StaffRole (ADMIN / OPERATOR / STAFF) ──
const managementRoutes = [
	{
		path: '/admin/dashboard',
		name: 'Dashboard',
		component: './admin/Dashboard',
		icon: 'DashboardOutlined',
		access: 'canAdmin',
	},
	// OPERATOR kiêm Lễ tân + Thu ngân (xem docs/role-decision.md). Đưa lên đầu
	// vì là tác vụ vận hành hằng ngày tại quầy.
	{
		path: '/le-tan',
		name: 'Lễ tân',
		component: './staff/LeTan',
		icon: 'UserSwitchOutlined',
		access: 'canOperator',
	},
	{
		path: '/thu-ngan',
		name: 'Thu ngân',
		component: './staff/ThuNgan',
		icon: 'DollarOutlined',
		access: 'canOperator',
	},
	{
		path: '/lich-hen',
		name: 'Lịch hẹn',
		component: './admin/Bookings',
		icon: 'CalendarOutlined',
		access: 'canAdminOrOperator',
	},
	{
		path: '/phieu-dich-vu',
		name: 'Phiếu dịch vụ',
		component: './admin/ServiceOrders',
		icon: 'FileDoneOutlined',
		access: 'canAdminOrOperator',
	},
	{
		path: '/dich-vu',
		name: 'Dịch vụ',
		component: './admin/Services',
		icon: 'StarOutlined',
		access: 'canAdmin',
	},
	{
		path: '/khach-hang',
		name: 'Khách hàng',
		component: './admin/Customers',
		icon: 'TeamOutlined',
		access: 'canAdminOrOperator',
	},
	// ADMIN: top-level "Nhân viên" trỏ thẳng vào Quản lý nhân viên.
	{
		path: '/nhan-vien/quan-ly',
		name: 'Nhân viên',
		component: './admin/Employees',
		icon: 'TeamOutlined',
		access: 'canAdmin',
	},
	{
		path: '/bang-luong',
		name: 'Bảng lương',
		component: './admin/Payroll',
		icon: 'WalletOutlined',
		access: 'canAdmin',
	},
	{
		path: '/kho-dashboard',
		name: 'Kho vật liệu',
		component: './admin/InventoryDashboard',
		icon: 'AppstoreOutlined',
		access: 'canAdmin',
	},
	{
		path: '/vat-lieu',
		name: 'Vật liệu',
		component: './admin/Materials',
		icon: 'InboxOutlined',
		access: 'canAdmin',
	},
	{
		path: '/lich-su-kho',
		name: 'Lịch sử kho',
		component: './admin/StockLedger',
		icon: 'HistoryOutlined',
		access: 'canAdmin',
	},
	{
		path: '/nha-cung-cap',
		name: 'Nhà cung cấp',
		component: './admin/Suppliers',
		icon: 'ShopOutlined',
		access: 'canAdmin',
	},
];

// ── Route ngoại lệ (dùng chung) ──
const exceptionRoutes = [
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
];

const notFound = { component: './exception/404', layout: false };

let routes: any[];
if (isLanding) {
	// Bản landing: chỉ trang công khai, không kèm login/quản lý.
	routes = [...landingRoutes, ...exceptionRoutes, notFound];
} else if (isAdmin) {
	// Bản quản lý: vào thẳng login, không có landing.
	routes = [
		...userRoutes,
		{ path: '/', redirect: '/login' },
		...authRoutes,
		...managementRoutes,
		...exceptionRoutes,
		notFound,
	];
} else {
	// Dev (yarn start): gộp cả hai. '/' = landing như trước.
	routes = [
		...userRoutes,
		...landingRoutes,
		...authRoutes,
		...managementRoutes,
		...exceptionRoutes,
		notFound,
	];
}

export default routes;
