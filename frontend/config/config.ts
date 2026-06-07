// https://umijs.org/config/
import { join } from 'path';
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import routes from './routes';

// Model admin thuần (an toàn để stub khi build landing). GIỮ THẬT: auth,
// thongbao/noticeicon, tienich/phanhoi (global widget dùng) + landingServices,
// landingPage/* (trang landing dùng).
const ADMIN_ONLY_MODELS =
	/[\\/]src[\\/]models[\\/](bom|bookings|customers|dashboard|employees|import|invoices|materials|randomuser|serviceOrders|services|staffServiceAssignments|stockLedger|suppliers|danhmuc[\\/]chucvu|thongbao[\\/](nhansu|receiver|sinhvien|thongbao)|tienich[\\/](auditlog|caidat))(\.tsx?)?$/;
// import proxy from './proxy';
// const { REACT_APP_ENV } = process.env;

export default defineConfig({
	hash: true,
	antd: {},
	dva: {
		hmr: true,
	},
	layout: {
		// https://umijs.org/zh-CN/plugins/plugin-layout
		locale: true,
		...defaultSettings,
	},
	// https://umijs.org/zh-CN/plugins/plugin-locale
	locale: {
		// enable: true,
		default: 'vi-VN',
		antd: true,
		// default true, when it is true, will use `navigator.language` overwrite default
		baseNavigator: false,
		// baseSeparator: '_',
	},
	dynamicImport: {
		loading: '@/components/Loading',
	},
	targets: {
		ie: 11,
	},
	routes,
	openAPI: {
		schemaPath: 'https://api.ptit-khangvu.me/api-docs-json',
		projectName: 'luna',
		requestLibPath: '@/utils/openapiRequest',
		apiPrefix: "APP_CONFIG_API_URL.replace(/\\/api\\/v1$/, '')",
		mock: false,
	},
	// Theme for antd: https://ant.design/docs/react/customize-theme-cn
	theme: {
		'primary-color': defaultSettings.primaryColor,
		'border-radius-base': defaultSettings.borderRadiusBase,
	},
	// esbuild is father build tools
	// https://umijs.org/plugins/plugin-esbuild
	esbuild: {},
	title: false,
	ignoreMomentLocale: true,
	// proxy: proxy[REACT_APP_ENV || 'dev'],
	manifest: {
		basePath: '/',
	},
	// Fast Refresh 热更新
	fastRefresh: {},

	// Build landing: thay model admin bằng stub rỗng để webpack loại code model
	// quản lý + service API kéo theo khỏi bundle landing (plugin-model bundle mọi
	// model global nên không tự tách theo route).
	chainWebpack(memo: any, { webpack }: any) {
		if (process.env.APP_CONFIG_TARGET === 'landing') {
			memo
				.plugin('stub-admin-models')
				.use(webpack.NormalModuleReplacementPlugin, [ADMIN_ONLY_MODELS, join(__dirname, 'emptyModel.ts')]);
		}
	},

	extraPostCSSPlugins: [require('@tailwindcss/postcss7-compat'), require('autoprefixer')],
	nodeModulesTransform: {
		type: 'none',
	},
	// mfsu: {}, // TẮT: gây trắng màn trên template base-web-umi tuỳ biến (dva + model global)
	webpack5: {},
	exportStatic: {},
	define: Object.entries(process.env).reduce((result, [key, value]) => {
		if (key.startsWith('APP_CONFIG_')) {
			return {
				...result,
				[key]: value,
			};
		}
		return result;
	}, {}),
});
