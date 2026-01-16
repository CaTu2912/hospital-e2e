import { test, expect } from '@playwright/test';

const REGISTER_URL = 'https://hospital.element-trac-group.id.vn/auth/register';


function uniqueUser() {
  const stamp = Date.now();
  return {
    username: `auto${stamp}`,
    email: `auto${stamp}@gmail.com`,
    password: 'Test@12345',
  };
}

// UC_012: Đăng ký tài khoản
// Chức năng: Cho phép người dùng mới đăng ký tài khoản hệ thống
// Liên kết: https://hospital.element-trac-group.id.vn/auth/register
test.describe('UC_012 - Đăng ký tài khoản', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REGISTER_URL, { waitUntil: 'domcontentloaded', timeout: 60000, });
    await expect(page.getByText('Đăng ký tài khoản')).toBeVisible();
  });

  // ====== UC012_TC01 (Auto) ======
  // Chức năng: Đăng ký hợp lệ
  // Liên kết: Form Register -> Button "Đăng ký"
  // Mục đích: Xác nhận người dùng đăng ký thành công với thông tin chưa tồn tại
  test('UC012_TC01 - Đăng ký thành công với dữ liệu hợp lệ', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page).toHaveURL('https://hospital.element-trac-group.id.vn/auth/otp-verification',{ timeout: 15000 });
  });

  // ====== UC012_TC02 (Auto) ======
  // Chức năng: Validate thiếu Username
  // Liên kết: Form (Username trống) -> Submit
  // Mục đích: Kiểm tra validation trường Tên tài khoản
  test('UC012_TC02 - Không nhập Tên tài khoản', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/tên tài khoản.*bắt buộc|vui lòng nhập.*tên tài khoản|required/i')).toBeVisible();
  });

  // ====== UC012_TC03 (Auto) ======
  // Chức năng: Validate thiếu Email
  // Liên kết: Form (Email trống) -> Submit
  // Mục đích: Kiểm tra validation trường Email
  test('UC012_TC03 - Không nhập Email', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/email.*bắt buộc|vui lòng nhập.*email|required/i')).toBeVisible();
  });

  // ====== UC012_TC04 (Auto) ======
  // Chức năng: Validate thiếu Password
  // Liên kết: Form (Password trống) -> Submit
  // Mục đích: Kiểm tra validation trường Mật khẩu
  test('UC012_TC04 - Không nhập Mật khẩu', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/mật khẩu.*bắt buộc|vui lòng nhập.*mật khẩu|required/i')).toBeVisible();
  });

  // ====== UC012_TC05 (Auto) ======
  // Chức năng: Validate thiếu Confirm Password
  // Liên kết: Form (Confirm Password trống) -> Submit
  // Mục đích: Kiểm tra validation trường Xác nhận mật khẩu
  test('UC012_TC05 - Không nhập Xác nhận mật khẩu', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/xác nhận mật khẩu.*bắt buộc|vui lòng nhập.*xác nhận|required/i')).toBeVisible();
  });

  // ====== UC012_TC06 (Auto) ======
  // Chức năng: Validate Email sai định dạng
  // Liên kết: Form (Email invalid) -> Submit
  // Mục đích: Kiểm tra format email chuẩn
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
  // Chức năng: Validate Mật khẩu không trùng khớp
  // Liên kết: Password != Confirm Password -> Submit
  // Mục đích: Kiểm tra logic so sánh mật khẩu
  test('UC012_TC07 - Mật khẩu và xác nhận mật khẩu không trùng', async ({ page }) => {
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill('123456');
    await page.getByPlaceholder('Nhập lại mật khẩu').fill('1234567');

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/Mật khẩu và xác nhận không khớp!|not match/i')).toBeVisible();
  });

  // ====== UC012_TC10 (Auto) ======
  // Chức năng: Validate Username đã tồn tại
  // Liên kết: Form (Username duplicate) -> Submit
  // Mục đích: Đảm bảo tính duy nhất của Username
  test('UC012_TC10 - Tên tài khoản đã tồn tại', async ({ page }) => {
    // Cần 1 username đã tồn tại. Bạn có thể tạo trước bằng TC01 rồi thay vào đây.
    const existingUsername = 'admin'; // TODO: đổi đúng username tồn tại trong hệ thống của bạn
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(existingUsername);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(u.email);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/email.*Đăng ký không thành công|email.*exists|Đăng ký không thành công. Vui lòng thử lại!/i')).toBeVisible();
  });

  // ====== UC012_TC11 (Auto) ======
  // Chức năng: Validate Email đã tồn tại
  // Liên kết: Form (Email duplicate) -> Submit
  // Mục đích: Đảm bảo tính duy nhất của Email
  test('UC012_TC11 - Email đã được đăng ký', async ({ page }) => {
    const existingEmail = 'tuongcat080304@gmail.com';
    const u = uniqueUser();

    await page.getByPlaceholder('Nhập tên tài khoản').fill(u.username);
    await page.getByPlaceholder('Nhập địa chỉ email').fill(existingEmail);
    await page.getByPlaceholder('Nhập mật khẩu').fill(u.password);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(u.password);

    await page.getByRole('button', { name: 'Đăng ký' }).click();

    await expect(page.locator('text=/email.*Đăng ký không thành công|email.*exists|Đăng ký không thành công. Vui lòng thử lại!/i')).toBeVisible();
  });

  // ====== UC012_TC14 (Auto) ======
  // Chức năng: Điều hướng về Login
  // Liên kết: Link "Đăng nhập ngay" -> Page Login
  // Mục đích: Kiểm tra khả năng quay lại trang đăng nhập
  test('UC012_TC14 - Click "Đăng nhập ngay"', async ({ page }) => {
    await page.getByRole('link', { name: /đăng nhập ngay/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/i);
  });
});
