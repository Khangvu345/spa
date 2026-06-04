// Auth — Đăng nhập. Chạy với context sạch (không dùng storageState).
import { test, expect } from '@playwright/test';
import { CREDENTIALS, expectLoggedIn } from '../helpers/auth';

// Đảm bảo không kế thừa phiên đăng nhập từ project setup.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Auth - Đăng nhập', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/login');
	});

	test('Hiển thị đầy đủ form đăng nhập', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Đăng Nhập' })).toBeVisible();
		await expect(page.getByText('Hệ thống quản lý nội bộ Luna Spa')).toBeVisible();
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.getByPlaceholder('••••••••')).toBeVisible();
		await expect(page.getByText('Ghi nhớ đăng nhập')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Đăng Nhập' })).toBeVisible();
	});

	test('Bỏ trống email/mật khẩu hiện cảnh báo thiếu thông tin', async ({ page }) => {
		await page.getByRole('button', { name: 'Đăng Nhập' }).click();
		await expect(page.getByText('Thiếu thông tin')).toBeVisible();
		await expect(page.getByText('Vui lòng nhập đầy đủ email và mật khẩu')).toBeVisible();
		await expect(page).toHaveURL(/\/login/);
	});

	test('Sai email hoặc mật khẩu hiện cảnh báo lỗi', async ({ page }) => {
		await page.locator('input[type="email"]').fill('khong-ton-tai@spa.local');
		await page.getByPlaceholder('••••••••').fill('SaiMatKhau@123');
		await page.getByRole('button', { name: 'Đăng Nhập' }).click();
		await expect(page.getByText('Sai email hoặc mật khẩu')).toBeVisible();
		await expect(page).toHaveURL(/\/login/);
	});

	test('Nút con mắt bật/tắt hiển thị mật khẩu', async ({ page }) => {
		const pwd = page.getByPlaceholder('••••••••');
		await pwd.fill('secret123');
		await expect(pwd).toHaveAttribute('type', 'password');
		await page.getByRole('button', { name: 'Hiện mật khẩu' }).click();
		await expect(pwd).toHaveAttribute('type', 'text');
		await page.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
		await expect(pwd).toHaveAttribute('type', 'password');
	});

	test('ADMIN đăng nhập thành công vào Dashboard', async ({ page }) => {
		await page.locator('input[type="email"]').fill(CREDENTIALS.admin.email);
		await page.getByPlaceholder('••••••••').fill(CREDENTIALS.admin.password);
		await page.getByRole('button', { name: 'Đăng Nhập' }).click();
		await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 20_000 });
		await expectLoggedIn(page);
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
	});

	test('OPERATOR đăng nhập thành công vào trang Lễ tân', async ({ page }) => {
		await page.locator('input[type="email"]').fill(CREDENTIALS.operator.email);
		await page.getByPlaceholder('••••••••').fill(CREDENTIALS.operator.password);
		await page.getByRole('button', { name: 'Đăng Nhập' }).click();
		await expect(page).toHaveURL(/\/le-tan/, { timeout: 20_000 });
		await expectLoggedIn(page);
		await expect(page.getByRole('heading', { name: 'Lễ tân' })).toBeVisible();
	});
});
