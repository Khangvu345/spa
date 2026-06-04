// OPERATOR — Lễ tân: KPI hôm nay, danh sách lịch hẹn, tạo lịch hẹn.
import { test, expect } from '@playwright/test';
import { STORAGE_STATE } from '../helpers/auth';

test.use({ storageState: STORAGE_STATE.operator });

test.describe('OPERATOR - Lễ tân', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/le-tan');
		await expect(page.getByRole('heading', { name: 'Lễ tân' })).toBeVisible();
	});

	test('Hiển thị 4 KPI hôm nay', async ({ page }) => {
		for (const label of ['Lịch hôm nay', 'Chờ đón', 'Đã check-in', 'Huỷ / Vắng']) {
			await expect(page.getByText(label, { exact: true })).toBeVisible();
		}
	});

	test('Hiển thị card danh sách lịch hẹn hôm nay', async ({ page }) => {
		await expect(page.getByText('Danh sách lịch hẹn hôm nay')).toBeVisible();
	});

	test('Mở modal Tạo lịch hẹn với đủ trường', async ({ page }) => {
		await page.getByRole('button', { name: 'Tạo lịch hẹn' }).click();
		const modal = page.locator('.ant-modal-content');
		await expect(modal.getByText('Tạo lịch hẹn', { exact: true })).toBeVisible();
		await expect(modal.getByText('Khách hàng', { exact: true })).toBeVisible();
		await expect(modal.getByText('Dịch vụ', { exact: true })).toBeVisible();
		await expect(modal.getByText('Ngày', { exact: true })).toBeVisible();
	});
});
