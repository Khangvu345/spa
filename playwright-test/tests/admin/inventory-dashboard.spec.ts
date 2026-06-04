// ADMIN — Dashboard kho vật liệu: KPI, danh sách, cảnh báo, điều hướng "Xem tất cả".
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Kho vật liệu (dashboard)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/kho-dashboard');
		await expect(page.getByRole('heading', { name: 'Quản lý kho vật liệu' })).toBeVisible();
	});

	test('Hiển thị 4 KPI kho', async ({ page }) => {
		for (const label of [
			'Tổng vật liệu',
			'Sắp hết hàng',
			'Đơn vị vật liệu tiêu thụ hôm nay',
			'Tổng giá trị kho',
		]) {
			await expect(page.getByText(label, { exact: true })).toBeVisible();
		}
	});

	test('Hiển thị các khối: danh sách, cảnh báo, tiêu thụ', async ({ page }) => {
		await expect(page.getByText('Danh sách vật liệu')).toBeVisible();
		await expect(page.getByText('Cảnh báo tồn kho')).toBeVisible();
		await expect(page.getByText('Vật liệu tiêu thụ nhiều nhất (30 ngày)')).toBeVisible();
	});

	test('Bấm "Xem tất cả" điều hướng sang trang Vật liệu', async ({ page }) => {
		await page.getByText('Xem tất cả').click();
		await expect(page).toHaveURL(/\/vat-lieu/, { timeout: 15_000 });
		await expect(page.getByRole('heading', { name: 'Quản lý Vật liệu' })).toBeVisible();
	});
});
