import { test, expect } from '@playwright/test';

const CONTACT_URL = 'https://hospital.element-trac-group.id.vn/contact?active=lienhe';

test.describe('UC_007 - Gửi liên hệ', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(CONTACT_URL, { waitUntil: 'domcontentloaded' });
    });

    // ====== UC007_TC01 (Auto) ======
    test('UC007_TC01 - Gửi liên hệ thành công với dữ liệu hợp lệ', async ({ page }) => {
        await page.locator('#fullName').fill('Nguyen Van A');
        await page.locator('#phoneNumber').fill('0912345678');
        await page.locator('#email').fill('test.contact@example.com');
        await page.locator('#content').fill('Tôi muốn tư vấn về gói khám tổng quát.');

        // Nút Gửi liên hệ
        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        // Verify success
        await expect(page.locator('text=/thành công|success|cảm ơn/i').first()).toBeVisible({ timeout: 10000 });
    });

    // ====== UC007_TC02 -> TC05: Empty Fields (Auto) ======
    test('UC007_TC02 - validate empty name', async ({ page }) => {
        await page.locator('#phoneNumber').fill('0912345678');
        await page.locator('#email').fill('test@example.com');
        await page.locator('#content').fill('Content');

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        await expect(page.locator('text=/họ tên.*bắt buộc|vui lòng nhập.*họ tên|required/i')).toBeVisible();
    });

    test('UC007_TC03 - validate empty phone', async ({ page }) => {
        await page.locator('#fullName').fill('Nguyen Van A');
        await page.locator('#email').fill('test@example.com');
        await page.locator('#content').fill('Content');

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        await expect(page.locator('text=/số điện thoại.*bắt buộc|vui lòng nhập.*số điện thoại|required/i')).toBeVisible();
    });

    // ====== UC007_TC06 -> TC07: Invalid Formats (Auto) ======
    test('UC007_TC06 - Email sai định dạng', async ({ page }) => {
        await page.locator('#fullName').fill('Nguyen Van A');
        await page.locator('#phoneNumber').fill('0912345678');
        await page.locator('#email').fill('invalid_email'); // Missing @
        await page.locator('#content').fill('Content');

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        await expect(page.locator('text=/email.*không hợp lệ|định dạng/i')).toBeVisible();
    });

    test('UC007_TC07 - Số điện thoại chứa ký tự đặc biệt', async ({ page }) => {
        await page.locator('#fullName').fill('Nguyen Van A');
        await page.locator('#phoneNumber').fill('0912@#$');
        await page.locator('#email').fill('test@example.com');
        await page.locator('#content').fill('Content');

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        await expect(page.locator('text=/số điện thoại.*không hợp lệ|định dạng/i')).toBeVisible();
    });

    // ====== TC08 -> TC09: Phone Length (Manual -> Auto) ======
    test('UC007_TC08 - Số điện thoại quá ngắn', async ({ page }) => {
        await page.locator('#fullName').fill('Nguyen Van A');
        await page.locator('#phoneNumber').fill('09123'); // Too short
        await page.locator('#email').fill('test@example.com');
        await page.locator('#content').fill('Content');

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        await expect(page.locator('text=/độ dài|không hợp lệ|invalid/i')).toBeVisible();
    });

    // ====== TC10 -> TC13: Content & Special Chars (Manual -> Auto) ======
    test('UC007_TC10 - Nội dung đúng 1000 ký tự', async ({ page }) => {
        const content = 'a'.repeat(1000);
        await page.locator('#fullName').fill('Test Max Len');
        await page.locator('#phoneNumber').fill('0912345678');
        await page.locator('#email').fill('test@example.com');
        await page.locator('#content').fill(content);

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();
        await expect(page.locator('text=/thành công|success/i').first()).toBeVisible();
    });

    test('UC007_TC12 - Trim khoảng trắng đầu/cuối', async ({ page }) => {
        await page.locator('#fullName').fill('  Nguyen Van A  ');
        await page.locator('#phoneNumber').fill('0912345678');
        await page.locator('#email').fill('test@example.com');
        await page.locator('#content').fill('Content');

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        await expect(page.locator('text=/thành công|success/i').first()).toBeVisible();
    });

    test('UC007_TC13 - Ký tự đặc biệt trong nội dung', async ({ page }) => {
        await page.locator('#fullName').fill('Nguyen Van A');
        await page.locator('#phoneNumber').fill('0912345678');
        await page.locator('#email').fill('test@example.com');
        const specialContent = 'Test <>@#$% content';
        await page.locator('#content').fill(specialContent);

        await page.locator('button').filter({ hasText: 'Gửi liên hệ' }).click();

        await expect(page.locator('text=/thành công|success/i').first()).toBeVisible();
    });

});
