// Khách hàng — ADMIN (chỉ đọc + toggle) và OPERATOR (thêm/sửa).
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder, firstDataRow, clickRowAction } from '../helpers/ui';

test.describe('ADMIN - Khách hàng (chỉ đọc)', () => {
	test.use({ storageState: STORAGE_STATE.admin });

	test.beforeEach(async ({ page }) => {
		await page.goto('/khach-hang');
		await expect(page.getByRole('heading', { name: 'Quản lý Khách hàng' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('ADMIN không thấy nút Thêm khách hàng', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Thêm khách hàng' })).toHaveCount(0);
	});

	test('Hiển thị cột bảng + lọc theo nguồn', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Họ tên', 'SĐT', 'Email', 'Nguồn', 'Trạng thái', 'Ngày tạo']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
		await selectByPlaceholder(page, 'Nguồn', 'Walk-in');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('Tìm theo SĐT không tồn tại trả về rỗng', async ({ page }) => {
		await page.getByPlaceholder('Tìm theo tên hoặc SĐT...').fill('0000000000');
		await expect(page.locator('.ant-table-placeholder')).toBeVisible({ timeout: 15_000 });
	});
});

test.describe('OPERATOR - Khách hàng (thêm/sửa)', () => {
	test.use({ storageState: STORAGE_STATE.operator });

	test.beforeEach(async ({ page }) => {
		await page.goto('/khach-hang');
		await expect(page.getByRole('heading', { name: 'Quản lý Khách hàng' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Validate bắt buộc khi tạo khách hàng', async ({ page }) => {
		await page.getByRole('button', { name: 'Thêm khách hàng' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Thêm khách hàng mới')).toBeVisible();
		await modal.getByRole('button', { name: 'Tạo khách hàng' }).click();
		await expect(page.getByText('Nhập họ tên')).toBeVisible();
		await expect(page.getByText('Nhập SĐT')).toBeVisible();
	});

	test('Tạo khách hàng mới thành công', async ({ page }) => {
		const stamp = Date.now();
		const name = `E2E Khách ${stamp}`;
		const phone = '09' + String(stamp).slice(-8);

		await page.getByRole('button', { name: 'Thêm khách hàng' }).click();
		const modal = page.locator('.ant-modal-content');
		await modal.getByLabel('Họ tên khách hàng').fill(name);
		await modal.getByLabel('Số điện thoại').fill(phone);
		await modal.getByRole('button', { name: 'Tạo khách hàng' }).click();

		await expect(modal).toBeHidden({ timeout: 15_000 });
		await page.getByPlaceholder('Tìm theo tên hoặc SĐT...').fill(phone);
		await waitTableLoaded(page);
		await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
	});
});
