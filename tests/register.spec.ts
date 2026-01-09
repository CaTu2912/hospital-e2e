import { test, expect } from '@playwright/test';

const REGISTER_URL = 'https://hospital.element-trac-group.id.vn/auth/register';


// Helper tạo dữ liệu unique
function uniqueUser() {
  const stamp = Date.now();
  return {
    username: `auto_${stamp}`,
    email: `auto_${stamp}@test.com`,
    password: 'Test@12345',
  };
}

test.describe('UC_012 - Đăng ký tài khoản', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REGISTER_URL, { waitUntil: 'domcontentloaded' ,  timeout: 60000,});
    await expect(page.getByText('Đăng ký tài khoản')).toBeVisible();
  });

  // ====== UC012_TC01 (Auto) ======
  test('UC012_TC01 - Đăng ký thành công với dữ liệu hợp lệ', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    // Kỳ vọng: thường redirect sang login
    await expect(page).toHaveURL(/\/auth\/login/i, { timeout: 15000 });

    // Nếu hệ thống dùng toast thay vì redirect, comment dòng trên và dùng:
    // await expect(page.locator('text=/đăng ký thành công|thành công/i')).toBeVisible({ timeout: 15000 });
  });

  // ====== UC012_TC02 (Auto) ======
  test('UC012_TC02 - Không nhập Tên tài khoản', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/tên tài khoản.*bắt buộc|vui lòng nhập.*tên tài khoản|required/i')).toBeVisible();
  });

  // ====== UC012_TC03 (Auto) ======
  test('UC012_TC03 - Không nhập Email', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/email.*bắt buộc|vui lòng nhập.*email|required/i')).toBeVisible();
  });

  // ====== UC012_TC04 (Auto) ======
  test('UC012_TC04 - Không nhập Mật khẩu', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/mật khẩu.*bắt buộc|vui lòng nhập.*mật khẩu|required/i')).toBeVisible();
  });

  // ====== UC012_TC05 (Auto) ======
  test('UC012_TC05 - Không nhập Xác nhận mật khẩu', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/xác nhận mật khẩu.*bắt buộc|vui lòng nhập.*xác nhận|required/i')).toBeVisible();
  });

  // ====== UC012_TC06 (Auto) ======
  test('UC012_TC06 - Email sai định dạng', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill('abc@');
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/email.*không hợp lệ|định dạng email|invalid email/i')).toBeVisible();
  });

  // ====== UC012_TC07 (Auto) ======
  test('UC012_TC07 - Mật khẩu và xác nhận mật khẩu không trùng', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill('123456');
    await page.getByPlaceholder('Nhập lại mật khẩu').fill('1234567');

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/không khớp|xác nhận mật khẩu|not match/i')).toBeVisible();
  });

  // ====== UC012_TC10 (Auto) ======
  test('UC012_TC10 - Tên tài khoản đã tồn tại', async ({ page }) => {
    // Cần 1 username đã tồn tại. Bạn có thể tạo trước bằng TC01 rồi thay vào đây.
    const existingUsername = 'admin'; // TODO: đổi đúng username tồn tại trong hệ thống của bạn
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(existingUsername);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/tài khoản.*đã tồn tại|username.*exists|đã được sử dụng/i')).toBeVisible();
  });

  // ====== UC012_TC11 (Auto) ======
  test('UC012_TC11 - Email đã được đăng ký', async ({ page }) => {
    // Cần 1 email đã tồn tại. Bạn có thể tạo trước bằng TC01 rồi thay vào đây.
    const existingEmail = 'admin@test.com'; // TODO: đổi đúng email tồn tại trong hệ thống của bạn
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(existingEmail);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/email.*đã tồn tại|email.*exists|đã được sử dụng/i')).toBeVisible();
  });

  // ====== UC012_TC14 (Auto) ======
  test('UC012_TC14 - Click "Đăng nhập ngay"', async ({ page }) => {
    await page.getByRole('link', { name: /đăng nhập ngay/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/i);
  });
});
