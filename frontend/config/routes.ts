export default [
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

	{
		path: '/',
		name: 'LandingPage',
		component: './landingPage',
		layout: false,
		hideInMenu: true,
	},
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
	{
		path: '/feedback',
		name: 'Feedback',
		component: './landingPage/components/FeedbackPage',
		layout: false,
		hideInMenu: true,
	},

	///////////////////////////////////
	// SPA MANAGEMENT MENU — phân quyền theo StaffRole (ADMIN / OPERATOR / STAFF)
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
	{
		component: './exception/404',
	},
];
