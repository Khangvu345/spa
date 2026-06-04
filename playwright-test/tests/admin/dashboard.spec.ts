// ADMIN — Dashboard tổng quan.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/admin/dashboard');
		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
	});

	test('Hiển thị 4 thẻ KPI', async ({ page }) => {
		for (const label of ['Doanh thu hôm nay', 'Phiếu DV hôm nay', 'Đã hoàn thành', 'Khách hàng']) {
			await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
		}
	});

	test('Hiển thị các biểu đồ & danh sách tổng quan', async ({ page }) => {
		await expect(page.getByText('Doanh thu 7 ngày gần đây')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Phiếu DV theo trạng thái' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Phiếu DV gần đây' })).toBeVisible();
		await expect(page.getByText('Dịch vụ phổ biến')).toBeVisible();
	});
});
