// Auth — Phân quyền sidebar + chặn truy cập chéo role.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';

test.describe('Phân quyền - ADMIN', () => {
	test.use({ storageState: STORAGE_STATE.admin });

	const sider = (page: any) => page.locator('.ant-pro-sider, aside.ant-layout-sider').first();

	test.beforeEach(async ({ page }) => {
		await page.goto('/admin/dashboard');
		await expect(sider(page)).toBeVisible();
	});

	test('Sidebar hiển thị đủ menu ADMIN', async ({ page }) => {
		const s = sider(page);
		for (const name of [
			'Dashboard',
			'Lịch hẹn',
			'Phiếu dịch vụ',
			'Dịch vụ',
			'Khách hàng',
			'Nhân viên',
			'Bảng lương',
			'Vật liệu',
			'Lịch sử kho',
			'Nhà cung cấp',
		]) {
			await expect(s.getByRole('link', { name, exact: true })).toBeVisible();
		}
	});

	test('Sidebar KHÔNG có menu riêng của OPERATOR', async ({ page }) => {
		const s = sider(page);
		await expect(s.getByRole('link', { name: 'Lễ tân', exact: true })).toHaveCount(0);
		await expect(s.getByRole('link', { name: 'Thu ngân', exact: true })).toHaveCount(0);
	});

	test('ADMIN vào trang OPERATOR (/le-tan) bị từ chối 403', async ({ page }) => {
		await page.goto('/le-tan');
		await expect(page.getByText('Truy cập bị từ chối')).toBeVisible({ timeout: 15_000 });
	});
});

test.describe('Phân quyền - OPERATOR', () => {
	test.use({ storageState: STORAGE_STATE.operator });

	const sider = (page: any) => page.locator('.ant-pro-sider, aside.ant-layout-sider').first();

	test.beforeEach(async ({ page }) => {
		await page.goto('/le-tan');
		await expect(sider(page)).toBeVisible();
	});

	test('Sidebar hiển thị đủ menu OPERATOR', async ({ page }) => {
		const s = sider(page);
		for (const name of ['Lễ tân', 'Thu ngân', 'Lịch hẹn', 'Phiếu dịch vụ', 'Khách hàng']) {
			await expect(s.getByRole('link', { name, exact: true })).toBeVisible();
		}
	});

	test('Sidebar KHÔNG có menu riêng của ADMIN', async ({ page }) => {
		const s = sider(page);
		for (const name of ['Dashboard', 'Nhân viên', 'Bảng lương', 'Dịch vụ', 'Nhà cung cấp']) {
			await expect(s.getByRole('link', { name, exact: true })).toHaveCount(0);
		}
	});

	test('OPERATOR vào trang ADMIN (/bang-luong) bị từ chối 403', async ({ page }) => {
		await page.goto('/bang-luong');
		await expect(page.getByText('Truy cập bị từ chối')).toBeVisible({ timeout: 15_000 });
	});
});
