import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Nạp file `.env` (nếu có) vào process.env mà không cần thư viện dotenv.
 * Cho phép cấu hình BASE_URL + tài khoản test ngoài source code.
 */
function loadDotEnv() {
	const envPath = path.resolve(__dirname, '.env');
	if (!fs.existsSync(envPath)) return;
	const content = fs.readFileSync(envPath, 'utf-8');
	for (const rawLine of content.split('\n')) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) continue;
		const eq = line.indexOf('=');
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		let val = line.slice(eq + 1).trim();
		// Bỏ dấu nháy bao quanh nếu có
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
			val = val.slice(1, -1);
		}
		if (!(key in process.env)) process.env[key] = val;
	}
}
loadDotEnv();

const BASE_URL = process.env.BASE_URL || 'http://localhost:8000';

/**
 * Cấu hình e2e cho hệ thống quản lý Luna Spa.
 * Xem README.md để biết cách chạy. https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './tests',
	/* Chạy song song các file test */
	fullyParallel: true,
	/* Trên CI: chặn commit còn sót test.only */
	forbidOnly: !!process.env.CI,
	/* Retry chỉ trên CI */
	retries: process.env.CI ? 2 : 0,
	/* Trên CI giới hạn worker để ổn định hơn */
	workers: process.env.CI ? 1 : undefined,
	/* Báo cáo HTML */
	reporter: 'html',
	/* Tăng timeout vì umi dev + antd render khá chậm lần đầu */
	timeout: 60_000,
	expect: { timeout: 10_000 },
	use: {
		baseURL: BASE_URL,
		/* Thu trace khi retry để debug */
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
		actionTimeout: 15_000,
		navigationTimeout: 30_000,
	},

	projects: [
		/* Project "setup": đăng nhập sẵn ADMIN + OPERATOR, lưu storageState để tái dùng */
		{ name: 'setup', testMatch: /auth\.setup\.ts/ },

		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
			dependencies: ['setup'],
		},

		/* Bật thêm các trình duyệt khác khi cần kiểm thử cross-browser:
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
			dependencies: ['setup'],
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
			dependencies: ['setup'],
		},
		*/
	],

	/* Tự khởi động FE trước khi test. Bỏ comment nếu muốn Playwright tự chạy umi dev.
	webServer: {
		command: 'yarn --cwd ../frontend start:dev',
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
	*/
});
