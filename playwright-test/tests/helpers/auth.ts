// Helper đăng nhập + hằng số dùng chung cho toàn bộ e2e.
import { Page, expect } from '@playwright/test';
import * as path from 'path';

export type Role = 'admin' | 'operator';

export const CREDENTIALS = {
	admin: {
		email: process.env.ADMIN_EMAIL || 'admin@spa.local',
		password: process.env.ADMIN_PASSWORD || 'Admin@123456',
		home: '/admin/dashboard',
	},
	operator: {
		email: process.env.OPERATOR_EMAIL || 'operator@spa.local',
		password: process.env.OPERATOR_PASSWORD || 'Staff@123456',
		home: '/le-tan',
	},
} as const;

// Nơi lưu storageState sau khi đăng nhập (đã được .gitignore).
export const STORAGE_DIR = path.resolve(__dirname, '..', '..', 'playwright', '.auth');
export const STORAGE_STATE: Record<Role, string> = {
	admin: path.join(STORAGE_DIR, 'admin.json'),
	operator: path.join(STORAGE_DIR, 'operator.json'),
};

/**
 * Đăng nhập qua UI trang /login. Trả về khi đã rời khỏi trang đăng nhập.
 */
export async function login(page: Page, role: Role) {
	const cred = CREDENTIALS[role];
	await page.goto('/login');
	await page.locator('input[type="email"]').fill(cred.email);
	await page.getByPlaceholder('••••••••').fill(cred.password);
	await page.getByRole('button', { name: 'Đăng Nhập' }).click();
	// Đăng nhập thành công → điều hướng khỏi /login (về home theo role).
	await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
}

/**
 * Đảm bảo sidebar đã hiển thị (đã vào layout quản lý) — dùng làm mốc "đã đăng nhập".
 */
export async function expectLoggedIn(page: Page) {
	await expect(page.locator('.ant-pro-sider, aside.ant-layout-sider').first()).toBeVisible({
		timeout: 20_000,
	});
}
