// ADMIN — Vật liệu: list, search, filter, tạo (cần NCC), điều chỉnh tồn, xem chi tiết.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder, selectAntd, firstDataRow, clickRowAction } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Vật liệu', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/vat-lieu');
		await expect(page.getByRole('heading', { name: 'Quản lý Vật liệu' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Hiển thị cột bảng vật liệu', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Mã', 'Tên vật liệu', 'NCC', 'Đơn vị', 'Tồn kho', 'Tối thiểu', 'Giá nhập', 'Loại', 'Trạng thái']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc theo loại Tiêu hao', async ({ page }) => {
		await selectByPlaceholder(page, 'Loại', 'Tiêu hao');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('Validate bắt buộc khi tạo vật liệu', async ({ page }) => {
		await page.getByRole('button', { name: 'Thêm vật liệu' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Thêm vật liệu mới')).toBeVisible();
		await modal.getByRole('button', { name: 'Tạo vật liệu' }).click();
		await expect(page.getByText('Nhập mã')).toBeVisible();
		await expect(page.getByText('Nhập tên vật liệu')).toBeVisible();
		await expect(page.getByText('Chọn nhà cung cấp')).toBeVisible();
	});

	test('Tạo vật liệu mới thành công (chọn NCC đầu tiên)', async ({ page }) => {
		const stamp = Date.now();
		const code = 'E2EM_' + String(stamp).slice(-6);
		const name = `E2E Vật liệu ${stamp}`;

		await page.getByRole('button', { name: 'Thêm vật liệu' }).click();
		const modal = page.locator('.ant-modal-content');
		await modal.getByLabel('Mã vật liệu').fill(code);
		await modal.getByLabel('Tên vật liệu').fill(name);

		// Chọn NCC đầu tiên trong danh sách; nếu chưa có NCC nào thì bỏ qua test.
		const supplierSelect = modal.locator('.ant-form-item', { hasText: 'Nhà cung cấp' }).locator('.ant-select');
		await supplierSelect.click();
		const options = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option');
		if ((await options.count()) === 0) test.skip(true, 'Chưa có nhà cung cấp nào để gán vật liệu');
		await options.first().click();

		await modal.getByLabel('Đơn vị').fill('ml');
		await modal.getByLabel('Giá nhập (VND)').fill('50000');
		await modal.getByRole('button', { name: 'Tạo vật liệu' }).click();

		await expect(modal).toBeHidden({ timeout: 15_000 });
		await page.getByPlaceholder('Tìm theo tên vật liệu...').fill(name);
		await waitTableLoaded(page);
		await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
	});

	test('Mở modal Điều chỉnh tồn kho', async ({ page }) => {
		const rows = page.locator('.ant-table-tbody tr.ant-table-row');
		if ((await rows.count()) === 0) test.skip(true, 'Chưa có vật liệu');
		await clickRowAction(firstDataRow(page), page, 'Điều chỉnh tồn kho');
		await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15_000 });
	});

	test('Mở drawer Xem chi tiết vật liệu', async ({ page }) => {
		const rows = page.locator('.ant-table-tbody tr.ant-table-row');
		if ((await rows.count()) === 0) test.skip(true, 'Chưa có vật liệu');
		await clickRowAction(firstDataRow(page), page, 'Xem chi tiết');
		await expect(page.locator('.ant-drawer-content')).toBeVisible({ timeout: 15_000 });
	});
});
