// ADMIN — Quản lý dịch vụ: list, search, filter, tạo, BOM, phân công chuyên viên.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder, firstDataRow, clickRowAction } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Dịch vụ', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/dich-vu');
		await expect(page.getByRole('heading', { name: 'Quản lý Dịch vụ' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Hiển thị cột bảng dịch vụ', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Mã DV', 'Tên dịch vụ', 'Danh mục', 'Giá (VND)', 'Thời lượng', 'Trạng thái']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc theo danh mục', async ({ page }) => {
		await selectByPlaceholder(page, 'Tất cả danh mục', 'Massage Thụy Điển');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('Validate khi tạo dịch vụ thiếu mã/tên', async ({ page }) => {
		await page.getByRole('button', { name: 'Thêm dịch vụ' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Thêm dịch vụ mới')).toBeVisible();
		await modal.getByRole('button', { name: 'Tạo dịch vụ' }).click();
		await expect(page.getByText('Nhập mã dịch vụ')).toBeVisible();
		await expect(page.getByText('Nhập tên dịch vụ')).toBeVisible();
	});

	test('Tạo dịch vụ mới thành công', async ({ page }) => {
		const stamp = Date.now();
		const code = 'E2E_' + String(stamp).slice(-6);
		const name = `E2E Dịch vụ ${stamp}`;

		await page.getByRole('button', { name: 'Thêm dịch vụ' }).click();
		const modal = page.locator('.ant-modal-content');
		await modal.getByLabel('Mã dịch vụ').fill(code);
		await modal.getByLabel('Tên dịch vụ').fill(name);
		await modal.getByRole('button', { name: 'Tạo dịch vụ' }).click();

		await expect(modal).toBeHidden({ timeout: 15_000 });
		await page.getByPlaceholder('Tìm theo tên dịch vụ...').fill(name);
		await waitTableLoaded(page);
		await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
	});

	test('Mở drawer Định mức nguyên liệu (BOM)', async ({ page }) => {
		await clickRowAction(firstDataRow(page), page, 'Định mức nguyên liệu');
		await expect(page.locator('.ant-drawer-content')).toBeVisible({ timeout: 15_000 });
	});

	test('Mở modal Phân công chuyên viên', async ({ page }) => {
		await clickRowAction(firstDataRow(page), page, 'Phân công chuyên viên');
		await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15_000 });
	});
});
