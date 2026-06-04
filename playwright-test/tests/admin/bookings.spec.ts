// ADMIN/OPERATOR — Lịch hẹn (xem): tab Lịch (calendar) và Danh sách + bộ lọc.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Lịch hẹn', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/lich-hen');
		await expect(page.getByRole('heading', { name: 'Lịch hẹn' })).toBeVisible();
	});

	test('Mặc định hiển thị tab Lịch (calendar)', async ({ page }) => {
		await expect(page.getByRole('tab', { name: /Lịch/ })).toBeVisible();
		await expect(page.getByRole('tab', { name: /Danh sách/ })).toBeVisible();
		await expect(page.locator('.rbc-calendar')).toBeVisible({ timeout: 15_000 });
	});

	test('Chuyển sang tab Danh sách hiển thị bảng + bộ lọc', async ({ page }) => {
		await page.getByRole('tab', { name: /Danh sách/ }).click();
		await expect(page.getByPlaceholder('Tìm theo SĐT hoặc tên khách...')).toBeVisible();
		await waitTableLoaded(page);
		const head = page.locator('.ant-table-thead');
		for (const col of ['Mã lịch', 'Khách hàng', 'Dịch vụ', 'Chuyên viên', 'Bắt đầu', 'Nguồn', 'Trạng thái']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc danh sách theo trạng thái Đã xác nhận', async ({ page }) => {
		await page.getByRole('tab', { name: /Danh sách/ }).click();
		await waitTableLoaded(page);
		await selectByPlaceholder(page, 'Trạng thái', 'Đã xác nhận');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});
});
