import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://hospital.element-trac-group.id.vn/auth/login';
const VALID_USER = {
    username: 'nguoidung1',
    password: 'thanhthanh'
};

// UC_010: Đăng nhập hệ thống
// Chức năng: Xác thực người dùng truy cập hệ thống
// Liên kết: https://hospital.element-trac-group.id.vn/auth/login
test.describe('UC_010 - Đăng nhập hệ thống', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    });

    // ====== UC010_TC01 (Auto) ======
    // Chức năng: Đăng nhập thành công
    // Liên kết: Input Username/Password -> Button "Đăng nhập"
    // Mục đích: Xác nhận người dùng có thể đăng nhập với tài khoản hợp lệ
    test('UC010_TC01 - Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
        await page.locator('input[type="text"], input[type="email"], input[name="username"]').first().fill(VALID_USER.username);
        await page.locator('input[type="password"]').fill(VALID_USER.password);
        await page.locator('button[type="submit"], button:has-text("Đăng nhập"), button:has-text("Login")').first().click();
        await expect(page).not.toHaveURL(/login/i, { timeout: 20000 });
    });

    // ====== UC010_TC02 (Auto) ======
    // Chức năng: Validate bỏ trống tên tài khoản
    // Liên kết: Input Password (x), Username (trống) -> Submit
    // Mục đích: Kiểm tra lỗi hiển thị khi thiếu username
    test('UC010_TC02 - Không nhập tên tài khoản', async ({ page }) => {
        await page.locator('input[type="password"]').fill(VALID_USER.password);
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
        await expect(page.locator('text=/Vui lòng nhập tên tài khoản!|required/i')).toBeVisible();
    });

    // ====== UC010_TC03 (Auto) ======
    // Chức năng: Validate bỏ trống mật khẩu
    // Liên kết: Input Username (x), Password (trống) -> Submit
    // Mục đích: Kiểm tra lỗi hiển thị khi thiếu password
    test('UC010_TC03 - Không nhập mật khẩu', async ({ page }) => {
        await page.locator('input[type="text"], input[type="email"]').first().fill(VALID_USER.username);
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        // Validate error
        await expect(page.locator('text=/Vui lòng nhập mật khẩu!/i')).toBeVisible();
    });

    // ====== UC010_TC04 (Auto) ======
    // Chức năng: Validate bỏ trống cả 2 trường
    // Liên kết: Submit Form Empty
    // Mục đích: Đảm bảo validate cả 2 trường cùng lúc
    test('UC010_TC04 - Không nhập cả tên tài khoản và mật khẩu', async ({ page }) => {
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        // Validate error for both
        await expect(page.locator('text=/Vui lòng nhập tên tài khoản!|required/i')).toBeVisible();
        await expect(page.locator('text=/Vui lòng nhập mật khẩu!/i')).toBeVisible();
    });

    // ====== UC010_TC05 (Auto) ======
    // Chức năng: Validate sai mật khẩu
    // Liên kết: Username (đúng), Password (sai) -> Submit
    // Mục đích: Kiểm tra phản hồi khi xác thực thất bại do sai pass
    test('UC010_TC05 - Nhập sai mật khẩu', async ({ page }) => {
        await page.locator('input[type="text"], input[type="email"]').first().fill(VALID_USER.username);
        await page.locator('input[type="password"]').fill('WrongPass123');
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        await expect(page.locator('text=/Đăng nhập không thành công. Vui lòng thử lại!/i')).toBeVisible();
    });

    // ====== UC010_TC06 (Auto) ======
    // Chức năng: Validate tài khoản không tồn tại
    // Liên kết: Username (sai), Password (bất kỳ) -> Submit
    // Mục đích: Kiểm tra phản hồi khi user chưa đăng ký
    test('UC010_TC06 - Nhập tài khoản không tồn tại', async ({ page }) => {
        await page.locator('input[type="text"], input[type="email"]').first().fill('non_existent_user_999');
        await page.locator('input[type="password"]').fill('Anything123');
        await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();

        await expect(page.locator('text=/sai.*thông tin|không tồn tại|invalid/i')).toBeVisible();
    });

    // ====== UC010_TC11 (Auto) ======
    // Chức năng: Chuyển hướng Quên mật khẩu
    // Liên kết: Link "Quên mật khẩu" -> Page Forgot Password
    // Mục đích: Kiểm tra link điều hướng đúng
    test('UC010_TC11 - Click "Quên mật khẩu"', async ({ page }) => {
        await page.getByText(/quên mật khẩu/i).click();
        await expect(page).toHaveURL(/\/forgot-password|quên-mật-khẩu/i);
    });

    // ====== UC010_TC12 (Auto) ======
    // Chức năng: Chuyển hướng Đăng ký
    // Liên kết: Link "Đăng ký" -> Page Register
    // Mục đích: Kiểm tra link điều hướng sang trang đăng ký
    test('UC010_TC12 - Click "Đăng ký"', async ({ page }) => {
        await page.getByRole('link', { name: /đăng ký/i }).click();
        await expect(page).toHaveURL(/\/register|đăng-ký/i);
    });

});
