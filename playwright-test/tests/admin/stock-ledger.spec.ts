// ADMIN — Lịch sử kho: summary cards, filter loại giao dịch, bảng audit trail.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Lịch sử kho', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/lich-su-kho');
		await expect(page.getByRole('heading', { name: 'Lịch sử kho' })).toBeVisible();
	});

	test('Hiển thị 4 thẻ tổng hợp', async ({ page }) => {
		for (const label of ['Nhập kho', 'Xuất theo HĐ', 'Xuất thủ công', 'Điều chỉnh']) {
			await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
		}
	});

	test('Hiển thị cột bảng giao dịch', async ({ page }) => {
		await waitTableLoaded(page);
		const head = page.locator('.ant-table-thead');
		for (const col of ['Thời gian', 'Mã VL', 'Tên vật liệu', 'Loại', 'SL thay đổi', 'Tồn trước', 'Tồn sau', 'Nhân viên']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc theo loại giao dịch Nhập kho', async ({ page }) => {
		await selectByPlaceholder(page, 'Loại giao dịch', 'Nhập kho');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});
});
