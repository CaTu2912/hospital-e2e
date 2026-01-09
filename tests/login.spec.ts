import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://hospital.element-trac-group.id.vn/auth/login';
const VALID_USER = {
    username: 'nguoidung1',
    password: 'thanhthanh'
};

test.describe('UC_010 - Đăng nhập hệ thống', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    });

    // ====== UC010_TC01 (Auto) ======
    test('UC010_TC01 - Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
        // Fill Username (Try generic selectors)
        await page.locator('input[type="text"], input[type="email"], input[name="username"]').first().fill(VALID_USER.username);
        // Fill Password
        await page.locator('input[type="password"]').fill(VALID_USER.password);

        // Click button "Đăng nhập"
        await page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').first().click();

        // Warn if URL doesn't change
        await expect(page).not.toHaveURL(/login/i, { timeout: 20000 });
    });

    // ====== UC010_TC02 (Auto) ======
    test('UC010_TC02 - Không nhập tên tài khoản', async ({ page }) => {
        await page.locator('input[type="password"]').fill(VALID_USER.password);
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        // Validate error
        await expect(page.locator('text=/tên tài khoản.*bắt buộc|vui lòng nhập.*tên tài khoản|required/i')).toBeVisible();
    });

    // ====== UC010_TC03 (Auto) ======
    test('UC010_TC03 - Không nhập mật khẩu', async ({ page }) => {
        await page.locator('input[type="text"], input[type="email"]').first().fill(VALID_USER.username);
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        // Validate error
        await expect(page.locator('text=/mật khẩu.*bắt buộc|vui lòng nhập.*mật khẩu|required/i')).toBeVisible();
    });

    // ====== UC010_TC04 (Auto) ======
    test('UC010_TC04 - Không nhập cả tên tài khoản và mật khẩu', async ({ page }) => {
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        // Validate error for both
        await expect(page.locator('text=/tên tài khoản.*bắt buộc|vui lòng nhập.*tên tài khoản/i')).toBeVisible();
        await expect(page.locator('text=/mật khẩu.*bắt buộc|vui lòng nhập.*mật khẩu/i')).toBeVisible();
    });

    // ====== UC010_TC05 (Auto) ======
    test('UC010_TC05 - Nhập sai mật khẩu', async ({ page }) => {
        await page.locator('input[type="text"], input[type="email"]').first().fill(VALID_USER.username);
        await page.locator('input[type="password"]').fill('WrongPass123');
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        await expect(page.locator('text=/sai.*thông tin|không chính xác|invalid/i')).toBeVisible();
    });

    // ====== UC010_TC06 (Auto) ======
    test('UC010_TC06 - Nhập tài khoản không tồn tại', async ({ page }) => {
        await page.locator('input[type="text"], input[type="email"]').first().fill('non_existent_user_999');
        await page.locator('input[type="password"]').fill('Anything123');
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        await expect(page.locator('text=/sai.*thông tin|không tồn tại|invalid/i')).toBeVisible();
    });

    // ====== UC010_TC11 (Auto) ======
    test('UC010_TC11 - Click "Quên mật khẩu"', async ({ page }) => {
        await page.getByText(/quên mật khẩu/i).click();
        await expect(page).toHaveURL(/\/forgot-password|quên-mật-khẩu/i);
    });

    // ====== UC010_TC12 (Auto) ======
    test('UC010_TC12 - Click "Đăng ký"', async ({ page }) => {
        await page.getByRole('link', { name: /đăng ký/i }).click();
        await expect(page).toHaveURL(/\/register|đăng-ký/i);
    });

});
