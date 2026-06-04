// ADMIN — Quản lý nhân viên: list, search, filter, tạo, xem hồ sơ, validate.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';
import { waitTableLoaded, selectByPlaceholder, firstDataRow, clickRowAction } from '../helpers/ui';

test.use({ storageState: STORAGE_STATE.admin });

test.describe('ADMIN - Nhân viên', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/nhan-vien/quan-ly');
		await expect(page.getByRole('heading', { name: 'Quản lý Nhân viên' })).toBeVisible();
		await waitTableLoaded(page);
	});

	test('Hiển thị tiêu đề cột bảng nhân viên', async ({ page }) => {
		const head = page.locator('.ant-table-thead');
		for (const col of ['Họ tên', 'Email', 'SĐT', 'Vai trò', 'Trạng thái TK', 'Công việc', 'Ngày bắt đầu']) {
			await expect(head.getByText(col, { exact: true })).toBeVisible();
		}
	});

	test('Lọc theo vai trò OPERATOR', async ({ page }) => {
		await selectByPlaceholder(page, 'Tất cả vai trò', 'OPERATOR');
		await waitTableLoaded(page);
		// Sau khi lọc, bảng vẫn render (không lỗi)
		await expect(page.locator('.ant-table')).toBeVisible();
	});

	test('Tìm kiếm theo từ khoá không tồn tại trả về rỗng', async ({ page }) => {
		await page.getByPlaceholder('Tìm theo tên, email...').fill('zzz_khong_ton_tai_' + Date.now());
		await expect(page.locator('.ant-table-placeholder')).toBeVisible({ timeout: 15_000 });
	});

	test('Mở modal Thêm nhân viên và kiểm tra validate bắt buộc', async ({ page }) => {
		await page.getByRole('button', { name: 'Thêm nhân viên' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Thêm nhân viên mới')).toBeVisible();
		// Bấm Tạo khi để trống → hiện lỗi validate
		await modal.getByRole('button', { name: 'Tạo nhân viên' }).click();
		await expect(page.getByText('Nhập họ tên')).toBeVisible();
		await expect(page.getByText('Nhập email')).toBeVisible();
		await page.getByRole('button', { name: 'Huỷ' }).click();
		await expect(modal).toBeHidden();
	});

	test('Tạo nhân viên mới thành công', async ({ page }) => {
		const stamp = Date.now();
		const fullName = `E2E Nhân Viên ${stamp}`;
		const email = `e2e_${stamp}@spa.local`;
		const phone = '09' + String(stamp).slice(-8);

		await page.getByRole('button', { name: 'Thêm nhân viên' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Thêm nhân viên mới')).toBeVisible();

		await modal.getByLabel('Họ tên').fill(fullName);
		await modal.getByLabel('Email').fill(email);
		await modal.getByLabel('Mật khẩu mặc định').fill('MatKhau@123');
		await modal.getByLabel('Số điện thoại').fill(phone);
		await modal.getByRole('button', { name: 'Tạo nhân viên' }).click();

		await expect(modal).toBeHidden({ timeout: 15_000 });
		// Kiểm tra bằng cách tìm kiếm tên vừa tạo
		await page.getByPlaceholder('Tìm theo tên, email...').fill(fullName);
		await waitTableLoaded(page);
		await expect(page.getByText(fullName)).toBeVisible({ timeout: 15_000 });
	});

	test('Xem hồ sơ nhân viên từ menu thao tác', async ({ page }) => {
		const row = firstDataRow(page);
		await clickRowAction(row, page, 'Xem hồ sơ');
		await expect(page.locator('.ant-modal-content')).toBeVisible();
	});
});
