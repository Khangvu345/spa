import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import { notification } from 'antd';
import 'moment/locale/vi';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { getIntl, getLocale, history } from 'umi';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import ErrorBoundary from './components/ErrorBoundary';
// import LoadingPage from './components/Loading';
import { OIDCBounder } from './components/OIDCBounder';
import { unCheckPermissionPaths } from './components/OIDCBounder/constant';
import OneSignalBounder from './components/OneSignalBounder';
import AuthFloatingMenu from './components/AuthFloatingMenu';
import TechnicalSupportBounder from './components/TechnicalSupportBounder';
import NotAccessible from './pages/exception/403';
import NotFoundContent from './pages/exception/404';
import type { IInitialState } from './services/base/typing';
import './styles/global.less';
import './styles/tailwind.css';
import { currentRole } from './utils/ip';

/**  loading */
export const initialStateConfig = {
	loading: <></>,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * // Tobe removed
 * */
export async function getInitialState(): Promise<IInitialState & { currentUser?: Auth.IStaff }> {
	const { AUTH_TOKEN_KEY, AUTH_USER_KEY } = await import('@/services/Auth/constant');
	const token = localStorage.getItem(AUTH_TOKEN_KEY);
	let currentUser: Auth.IStaff | undefined;

	if (token) {
		try {
			const { getMe } = await import('@/services/Auth/api');
			const res = await getMe();
			currentUser = res.data;
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
		} catch {
			currentUser = undefined;
		}
	}

	return {
		currentUser,
		permissionLoading: false,
	} as any;
}

// Tobe removed
const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => ({});

/**
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
	errorHandler: (error: ResponseError) => {
		const { messages } = getIntl(getLocale());
		const { response } = error;

		if (response && response.status) {
			const { status, statusText, url } = response;
			const requestErrorMessage = messages['app.request.error'];
			const errorMessage = `${requestErrorMessage} ${status}: ${url}`;
			const errorDescription = messages[`app.request.${status}`] || statusText;
			notification.error({
				message: errorMessage,
				description: errorDescription,
			});
		}

		if (!response) {
			notification.error({
				description: 'Yêu cầu gặp lỗi',
				message: 'Bạn hãy thử lại sau',
			});
		}
		throw error;
	},
	requestInterceptors: [authHeaderInterceptor],
};

// ProLayout  https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
	return {
		unAccessible: (
			<OIDCBounder>
				<TechnicalSupportBounder>
					<NotAccessible />
				</TechnicalSupportBounder>
			</OIDCBounder>
		),
		noFound: <NotFoundContent />,
		rightContentRender: false,
		headerRender: false,
		disableContentMargin: true,
		collapsedWidth: 72,

		footerRender: false,

		onPageChange: () => {
			const { location } = history;
			const path = location.pathname;
			const PUBLIC_PATHS = ['/', '/login', '/feedback', '/403', '/hold-on'];
			const isPublic = PUBLIC_PATHS.includes(path);
			const user = (initialState as any)?.currentUser as Auth.IStaff | undefined;

			// Chưa đăng nhập + vào route bảo vệ → /login
			if (!user && !isPublic) {
				history.replace('/login');
				return;
			}

			// Đã đăng nhập + cần đổi mật khẩu lần đầu → ép /change-password
			if (user?.mustChangePassword && path !== '/change-password') {
				history.replace('/change-password');
				return;
			}

			// STAFF không có UI — nếu lỡ có token thì clear + đẩy về /login.
			if (user?.role === 'STAFF') {
				localStorage.removeItem('spa_access_token');
				localStorage.removeItem('spa_current_user');
				history.replace('/login');
				return;
			}

			// Đã đăng nhập mà còn vào /login → đẩy về home theo role
			if (user && (path === '/login' || path === '/user/login')) {
				const home = user.role === 'ADMIN' ? '/admin/dashboard' : '/le-tan';
				history.replace(home);
			}
		},

		menuItemRender: (item: any, dom: any) => (
			<a
				className='not-underline'
				key={item?.path}
				href={item?.path}
				onClick={(e) => {
					e.preventDefault();
					history.push(item?.path ?? '/');
				}}
				style={{ display: 'block' }}
			>
				{dom}
			</a>
		),

		menuHeaderRender: (logo: any, title: any) => (
			<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
				{logo}
				{title}
			</div>
		),

		menuFooterRender: (props: any) => <AuthFloatingMenu collapsed={!!props?.collapsed} />,

		// Bấm logo trên sidebar không điều hướng (chặn hành vi mặc định của ProLayout).
		onMenuHeaderClick: (e: any) => e?.preventDefault?.(),

		childrenRender: (dom) => (
			<OIDCBounder>
				<ErrorBoundary>
					{/* <TechnicalSupportBounder> */}
					<OneSignalBounder>{dom}</OneSignalBounder>
					{/* </TechnicalSupportBounder> */}
				</ErrorBoundary>
			</OIDCBounder>
		),
		menuHeaderRender: undefined,
		...initialState?.settings,
	};
};
