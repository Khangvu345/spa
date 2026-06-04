// Project "setup": đăng nhập sẵn từng role một lần, lưu storageState để các spec
// khác tái dùng (nhanh hơn login lại mỗi test). Xem playwright.config.ts.
import { test as setup } from '@playwright/test';
import * as fs from 'fs';
import { login, expectLoggedIn, STORAGE_DIR, STORAGE_STATE } from './helpers/auth';

setup.beforeAll(() => {
	if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
});

setup('authenticate as admin', async ({ page }) => {
	await login(page, 'admin');
	await expectLoggedIn(page);
	await page.context().storageState({ path: STORAGE_STATE.admin });
});

setup('authenticate as operator', async ({ page }) => {
	await login(page, 'operator');
	await expectLoggedIn(page);
	await page.context().storageState({ path: STORAGE_STATE.operator });
});
