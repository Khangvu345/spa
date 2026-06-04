// OPERATOR — Thu ngân: list hoá đơn, filter, search, tạo hoá đơn.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.operator });

test.describe('OPERATOR - Thu ngân', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/thu-ngan');
		await expect(page.getByRole('heading', { name: 'Thu ngân' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Hiển thị cột bảng hoá đơn', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Mã HĐ', 'Khách hàng', 'Số DV', 'Tạm tính', 'Giảm giá', 'Tổng', 'Trạng thái', 'Tạo lúc']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc theo trạng thái Đã thanh toán', async ({ page }) => {
		await selectByPlaceholder(page, 'Trạng thái', 'Đã thanh toán');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('Tìm theo mã HĐ không tồn tại trả về rỗng', async ({ page }) => {
		await page.getByPlaceholder('Tìm theo mã HĐ...').fill('HD_KHONG_TON_TAI_' + Date.now());
		await expect(page.locator('.ant-table-placeholder')).toBeVisible({ timeout: 15_000 });
	});

	test('Mở modal Tạo hoá đơn từ phiếu dịch vụ', async ({ page }) => {
		await page.getByRole('button', { name: 'Tạo hoá đơn' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Tạo hoá đơn từ phiếu dịch vụ')).toBeVisible();
		await expect(modal.getByText('Phiếu dịch vụ (COMPLETED)')).toBeVisible();
	});
});
