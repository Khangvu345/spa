// ADMIN — Bảng lương: filter kỳ/NV/trạng thái, modal chốt 1 NV, chốt hàng loạt, chi tiết.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder, firstDataRow } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Bảng lương', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/bang-luong');
		await expect(page.getByRole('heading', { name: 'Bảng lương' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Hiển thị cột bảng phiếu lương + bộ lọc', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Mã phiếu', 'Nhân viên', 'Kỳ', 'Lương cứng', 'Hoa hồng', 'Điều chỉnh', 'Tổng nhận', 'Trạng thái']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
		await expect(page.getByText('Tất cả nhân viên')).toBeVisible();
		await expect(page.getByText('Tất cả trạng thái')).toBeVisible();
	});

	test('Lọc theo trạng thái Đã chốt', async ({ page }) => {
		await selectByPlaceholder(page, 'Tất cả trạng thái', 'Đã chốt');
		await waitTableLoaded(page);
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('Mở modal "Chốt lương" (xem trước) — nút Chốt bị khoá khi chưa chọn', async ({ page }) => {
		await page.getByRole('button', { name: 'Chốt lương' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Xem trước & chốt lương')).toBeVisible();
		await expect(modal.getByText('Chọn nhân viên và kỳ để xem trước')).toBeVisible();
		// Nút OK "Chốt lương" của modal bị disabled khi chưa có dữ liệu preview
		await expect(modal.locator('.ant-modal-footer button.ant-btn-primary')).toBeDisabled();
	});

	test('Mở modal "Chốt hàng loạt"', async ({ page }) => {
		await page.getByRole('button', { name: 'Chốt hàng loạt' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Chốt lương hàng loạt')).toBeVisible();
		await expect(
			modal.getByText('Mỗi nhân viên chỉ có 1 phiếu cho 1 kỳ. Nhân viên đã có phiếu sẽ được bỏ qua.'),
		).toBeVisible();
		await expect(modal.locator('.ant-switch')).toBeVisible();
	});

	test('Xem chi tiết phiếu lương (nếu có dữ liệu)', async ({ page }) => {
		const rows = page.locator('.ant-table-tbody tr.ant-table-row');
		if ((await rows.count()) === 0) test.skip(true, 'Chưa có phiếu lương để xem chi tiết');
		await firstDataRow(page).getByRole('button').last().click();
		await expect(page.locator('.ant-modal-content')).toBeVisible({ timeout: 15_000 });
		// Modal chi tiết có mục "Hoa hồng theo dịch vụ"
		await expect(page.getByText('Hoa hồng theo dịch vụ')).toBeVisible();
	});
});
