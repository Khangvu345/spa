// Auth — Đổi mật khẩu (chỉ kiểm tra validate phía client, KHÔNG submit thật
// để tránh thay đổi mật khẩu tài khoản test).
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('Auth - Đổi mật khẩu (validate)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/change-password');
		await expect(page.getByRole('heading', { name: 'Đổi mật khẩu' })).toBeVisible();
	});

	const pwInputs = (page: any) => page.locator('input[type="password"]');

	test('Mật khẩu mới dưới 8 ký tự bị chặn', async ({ page }) => {
		const inputs = pwInputs(page);
		await inputs.nth(0).fill('Admin@123456');
		await inputs.nth(1).fill('short');
		await inputs.nth(2).fill('short');
		await page.getByRole('button', { name: 'Đổi mật khẩu' }).click();
		await expect(page.getByText('Mật khẩu mới phải có ít nhất 8 ký tự')).toBeVisible();
	});

	test('Xác nhận mật khẩu không khớp bị chặn', async ({ page }) => {
		const inputs = pwInputs(page);
		await inputs.nth(0).fill('Admin@123456');
		await inputs.nth(1).fill('NewPass@123');
		await inputs.nth(2).fill('Khac@123456');
		await page.getByRole('button', { name: 'Đổi mật khẩu' }).click();
		await expect(page.getByText('Xác nhận mật khẩu không khớp')).toBeVisible();
	});
});
