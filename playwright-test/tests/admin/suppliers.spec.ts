// ADMIN — Nhà cung cấp: list, search, filter, tạo, validate.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Nhà cung cấp', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/nha-cung-cap');
		await expect(page.getByRole('heading', { name: 'Quản lý Nhà cung cấp' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Hiển thị cột bảng nhà cung cấp', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Tên NCC', 'Người liên hệ', 'Số điện thoại', 'Email', 'Mã thuế', 'Trạng thái']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc theo trạng thái Đang hợp tác', async ({ page }) => {
		await selectByPlaceholder(page, 'Trạng thái', 'Đang hợp tác');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('Validate bắt buộc khi tạo NCC', async ({ page }) => {
		await page.getByRole('button', { name: 'Thêm NCC' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Thêm nhà cung cấp mới')).toBeVisible();
		await modal.getByRole('button', { name: 'Tạo nhà cung cấp' }).click();
		await expect(page.getByText('Nhập tên nhà cung cấp')).toBeVisible();
		await expect(page.getByText('Nhập người liên hệ')).toBeVisible();
		await expect(page.getByText('Nhập địa chỉ')).toBeVisible();
	});

	test('Tạo nhà cung cấp mới thành công', async ({ page }) => {
		const stamp = Date.now();
		const name = `E2E NCC ${stamp}`;
		const phone = '09' + String(stamp).slice(-8);

		await page.getByRole('button', { name: 'Thêm NCC' }).click();
		const modal = page.locator('.ant-modal-content');
		await modal.getByLabel('Tên nhà cung cấp').fill(name);
		await modal.getByLabel('Người liên hệ').fill('Người E2E');
		await modal.getByLabel('Số điện thoại').fill(phone);
		await modal.getByLabel('Địa chỉ').fill('123 Đường E2E, Quận 1, TP.HCM');
		await modal.getByRole('button', { name: 'Tạo nhà cung cấp' }).click();

		await expect(modal).toBeHidden({ timeout: 15_000 });
		await page.getByPlaceholder('Tìm theo tên, SĐT...').fill(name);
		await waitTableLoaded(page);
		await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
	});
});
