import { test, expect } from '@playwright/test';
const BASE_URL = 'https://hospital.element-trac-group.id.vn/';



// Nhóm các test case thuộc UC001 - Truy cập và hiển thị Trang chủ
test.describe('UC001 - Truy cập và hiển thị Trang chủ', () => {

    // ====== UC001_TC01: Mở trang chủ thành công ======
    test('UC001_TC01 - Mở trang chủ thành công', async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
        await expect(page).toHaveTitle(/Trang chủ|Hospital|Home/i);
        expect(page.url()).toContain(BASE_URL);
    });

    // ====== UC001_TC02: Reload trang chủ ======
    test('UC001_TC02 - Reload trang chủ', async ({ page }) => {
        await page.goto(BASE_URL);
        await page.reload({ waitUntil: 'domcontentloaded' });
        const mainContent = page.locator('header, .banner, #root');
        await expect(mainContent.first()).toBeVisible();
    });

    // ====== UC001_TC03: Kiểm tra hiển thị header/footer ======
    test('UC001_TC03 - Kiểm tra hiển thị header/footer', async ({ page }) => {
        await page.goto(BASE_URL);
        const header = page.locator('header, .ant-layout-header');
        await expect(header).toBeVisible();
        const footer = page.locator('footer, .ant-layout-footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();
        expect(await header.innerText()).toBeTruthy();
        expect(await footer.innerText()).toBeTruthy();
    });

    // ====== UC001_TC04: Mở trang chủ trên mobile view ======
    test('UC001_TC04 - Mở trang chủ trên mobile view', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(BASE_URL);
        const mobileMenuIcon = page.locator('.anticon-menu, .mobile-menu-btn, [aria-label="menu"]');
        if (await mobileMenuIcon.count() > 0) {
            await expect(mobileMenuIcon).toBeVisible();
        } else {
            console.log('Note: Không tìm thấy icon menu mobile cụ thể, kiểm tra thủ công layout.');
        }

        // Đảm bảo không có thanh cuộn ngang (horizontal scroll) - dấu hiệu vỡ layout
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        // Cho phép sai số nhỏ, nhưng cơ bản scrollWidth không nên lớn hơn nội dung hiển thị quá nhiều
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 10);
    });

    // ====== UC001_TC05: Truy cập bằng đường dẫn sai ======
    test('UC001_TC05 - Truy cập bằng đường dẫn sai', async ({ page }) => {
        const wrongUrl = BASE_URL + 'trang-nay-khong-ton-tai-123456';
        await page.goto(wrongUrl);
        const notFoundText = page.getByRole('heading', { name: /404|Not Found|Không tìm thấy/i })
            .or(page.getByText(/404|Not Found|Không tìm thấy/i));
        const notFoundImage = page.locator('img[alt*="404"], .ant-result-404');


        try {
            await expect(notFoundText.or(notFoundImage).first()).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log('Không thấy trang 404 cụ thể, kiểm tra xem có redirect về trang chủ không...');
            await expect(page).toHaveURL(BASE_URL + '?active=home');
            console.log('-> Đã redirect về trang chủ thành công.');
        }
        const bodyContent = await page.locator('body').innerText();
        expect(bodyContent.length).toBeGreaterThan(10); 
    });

});
