// Helper thao tác với các component Ant Design (Select, Dropdown menu, message...).
import { Page, Locator, expect } from '@playwright/test';

/** Dropdown của antd Select đang mở (portal ở body). */
function openSelectDropdown(page: Page): Locator {
	return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
}

/**
 * Chọn 1 option trong antd <Select>.
 * @param trigger locator trỏ tới ô select (vd: page.locator('.ant-select').filter({ hasText: 'Trạng thái' }))
 */
export async function selectAntd(page: Page, trigger: Locator, optionLabel: string) {
	await trigger.click();
	const dropdown = openSelectDropdown(page);
	await expect(dropdown).toBeVisible();
	await dropdown.locator('.ant-select-item-option', { hasText: optionLabel }).first().click();
}

/**
 * Chọn option cho 1 antd Select xác định bởi placeholder hiển thị.
 */
export async function selectByPlaceholder(page: Page, placeholder: string, optionLabel: string) {
	const trigger = page.locator('.ant-select', {
		has: page.locator(`.ant-select-selection-placeholder`, { hasText: placeholder }),
	});
	await selectAntd(page, trigger.first(), optionLabel);
}

/**
 * Mở menu "Thao tác" (nút ba chấm) trên 1 dòng bảng rồi click 1 mục menu.
 */
export async function clickRowAction(row: Locator, page: Page, menuItemText: string) {
	await row.locator('button').last().click();
	const menu = page.locator('.ant-dropdown:not(.ant-dropdown-hidden) .ant-dropdown-menu');
	await expect(menu).toBeVisible();
	await menu.locator('.ant-dropdown-menu-item', { hasText: menuItemText }).first().click();
}

/** Lấy locator dòng bảng đầu tiên (bỏ qua placeholder rỗng). */
export function firstDataRow(page: Page): Locator {
	return page.locator('.ant-table-tbody tr.ant-table-row').first();
}

/** Chờ bảng load xong (spinner tắt). */
export async function waitTableLoaded(page: Page) {
	await expect(page.locator('.ant-table')).toBeVisible();
	// Spinner của antd Table khi loading
	await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: 20_000 });
}

/** Đóng modal antd đang mở bằng nút X. */
export async function closeModal(page: Page) {
	await page.locator('.ant-modal-close:visible').first().click();
}
