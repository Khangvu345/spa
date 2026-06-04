// Auth — Phiên đăng nhập: bảo vệ route, redirect, đăng xuất.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';

test.describe('Phiên - chưa đăng nhập', () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test('Vào route bảo vệ khi chưa đăng nhập sẽ bị đẩy về /login', async ({ page }) => {
		await page.goto('/bang-luong');
		await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
		await expect(page.getByRole('heading', { name: 'Đăng Nhập' })).toBeVisible();
	});
});

test.describe('Phiên - đã đăng nhập (ADMIN)', () => {
	test.use({ storageState: STORAGE_STATE.admin });

	test('Đã đăng nhập mà vào /login sẽ tự về Dashboard', async ({ page }) => {
		await page.goto('/login');
		await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
	});

	test('Đăng xuất từ sidebar đưa về /login', async ({ page }) => {
		await page.goto('/admin/dashboard');
		const sider = page.locator('.ant-pro-sider, aside.ant-layout-sider').first();
		await expect(sider).toBeVisible();

		await sider.getByRole('button', { name: 'Đăng xuất' }).click();
		// Modal xác nhận của antd
		await expect(page.getByText('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')).toBeVisible();
		await page.locator('.ant-modal-confirm-btns').getByRole('button', { name: 'Đăng xuất' }).click();

		await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
	});
});
