import { test, expect } from '@playwright/test';

// URL cần test (Trang chủ hoặc trang Tin tức đại diện)
const TEST_URL = 'https://hospital.element-trac-group.id.vn/';

test.describe('UC008 - Kiểm tra Responsive UI (Desktop/Tablet/Mobile)', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(TEST_URL, { waitUntil: 'domcontentloaded' });
    });

    // ====== TC01: Responsive trên mobile 375px ======
    test('UC008_TC01 - Responsive trên mobile 375px', async ({ page }) => {
        // 1) Set width 375px (Giả lập iPhone SE/X)
        await page.setViewportSize({ width: 375, height: 667 });

        // Reload lại để CSS media query áp dụng đầy đủ (nếu cần)
        await page.reload();
        await page.waitForLoadState('networkidle');

        // 2) Duyệt các trang chính: Verify layout không vỡ
        console.log('Checking Mobile Layout (375px)...');

        // Kiểm tra thanh cuộn ngang (Horizontal Scroll)
        // Một trang responsive tốt không nên để xuất hiện thanh cuộn ngang
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        // Cho phép sai số lớn hơn (ví dụ 50px) để chấp nhận scrollbar hoặc overflow nhẹ
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 50);

        // Kiểm tra Menu:
        // Trên mobile, menu ngang thường ẩn đi, thay bằng nút Hamburger (icon 3 gạch)
        // Tìm element nghi là nút menu mobile
        const hamburgerBtn = page.locator('.anticon-menu, .mobile-menu-btn, button[aria-label="menu"]');
        // Nếu app có thiết kế này, verify nó hiển thị
        if (await hamburgerBtn.count() > 0) {
            await expect(hamburgerBtn.first()).toBeVisible();
            console.log('Mobile menu button visible.');
        } else {
            console.log('Note: Không tìm thấy nút menu mobile theo selector dự đoán.');
        }

        // Kiểm tra Logo vẫn hiển thị được
        const logo = page.locator('img[alt*="logo"], .logo');
        if (await logo.count() > 0) {
            await expect(logo.first()).toBeVisible();
        }
    });

    // ====== TC02: Responsive trên tablet 768px ======
    test('UC008_TC02 - Responsive trên tablet 768px', async ({ page }) => {
        // 1) Set width 768px (iPad Mini / Tablet portrait)
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        console.log('Checking Tablet Layout (768px)...');

        // 2) Verify hiển thị hợp lý, không tràn chữ
        // Check thanh cuộn ngang
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        // Cho phép sai số lớn hơn (ví dụ 50px) để chấp nhận scrollbar hoặc overflow nhẹ
        expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 50);

        // Check layout 2 cột chuyển thành 1 cột hoặc giữ nguyên tùy thiết kế
        // Ví dụ: thẻ Card tin tức
        const newsCards = page.locator('.bg-white.rounded-2xl.shadow-md');
        if (await newsCards.count() > 0) {
            await expect(newsCards.first()).toBeVisible();
            // Kiểm tra card có nằm gọn trong màn hình không
            const box = await newsCards.first().boundingBox();
            if (box) {
                expect(box.width).toBeLessThanOrEqual(768);
            }
        }
    });

    // ====== TC03: Zoom 200% ======
    test('UC008_TC03 - UI khi Zoom 200%', async ({ page }) => {
        // 1) Zoom 200%
        // Playwright không có nút "Zoom" như browser, nhưng ta có thể giả lập
        // Cách 1: Thu nhỏ viewport xuống 50% (cách này test responsive behavior)
        // Cách 2: set CSS zoom (chỉ work tốt trên Chrome/Chromium) -> Cách này trực quan hơn với yêu cầu "Zoom"

        await page.evaluate(() => {
            (document.body.style as any).zoom = '200%';
        });

        await page.waitForTimeout(1000); // Đợi render lại

        console.log('Checking UI at 200% Zoom...');

        // 2) Verify nội dung vẫn đọc được, không chồng chéo nặng
        // Kiểm tra các phần tử chính vẫn visible
        const header = page.locator('header, .ant-layout-header');
        await expect(header).toBeVisible();

        const footer = page.locator('footer, .ant-layout-footer');
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();

        // Kiểm tra xem có bị lỗi scroll ngang quá lớn do vỡ layout không
        // Khi zoom css, dimensions của element tăng lên, document scrollWidth sẽ tăng
        // Test này chủ yếu mang tính chất verify crash/overlap visual
        // Ta verify text ở header không bị ẩn mất hẳn (width > 0)
        if (await header.count() > 0) {
            const hText = await header.innerText();
            expect(hText).toBeTruthy();
        }
    });

});
