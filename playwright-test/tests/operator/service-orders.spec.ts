// Phiếu dịch vụ — OPERATOR (tạo/sửa) và ADMIN (chỉ xem).
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder, firstDataRow, clickRowAction } from '../helpers/ui';

test.describe('OPERATOR - Phiếu dịch vụ', () => {
	test.use({ storageState: STORAGE_STATE.operator });

	test.beforeEach(async ({ page }) => {
		await page.goto('/phieu-dich-vu');
		await expect(page.getByRole('heading', { name: 'Phiếu dịch vụ' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Hiển thị cột bảng phiếu dịch vụ', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Mã phiếu', 'Khách hàng', 'Số DV', 'Tổng tiền', 'Trạng thái', 'Người tạo', 'Tạo lúc']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc theo trạng thái Hoàn thành', async ({ page }) => {
		await selectByPlaceholder(page, 'Trạng thái', 'Hoàn thành');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('OPERATOR mở modal Tạo phiếu dịch vụ', async ({ page }) => {
		await page.getByRole('button', { name: 'Tạo phiếu' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Tạo phiếu dịch vụ mới')).toBeVisible();
		await expect(modal.getByText('Khách hàng', { exact: true })).toBeVisible();
	});
});

test.describe('ADMIN - Phiếu dịch vụ (chỉ xem)', () => {
	test.use({ storageState: STORAGE_STATE.admin });

	test.beforeEach(async ({ page }) => {
		await page.goto('/phieu-dich-vu');
		await expect(page.getByRole('heading', { name: 'Phiếu dịch vụ' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('ADMIN không thấy nút Tạo phiếu', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Tạo phiếu' })).toHaveCount(0);
	});

	test('Menu thao tác chỉ cho Xem phiếu dịch vụ', async ({ page }) => {
		const rows = page.locator('.ant-table-tbody tr.ant-table-row');
		if ((await rows.count()) === 0) test.skip(true, 'Chưa có phiếu dịch vụ');
		await clickRowAction(firstDataRow(page), page, 'Xem phiếu dịch vụ');
		await expect(page.locator('.ant-drawer-content')).toBeVisible({ timeout: 15_000 });
	});
});
