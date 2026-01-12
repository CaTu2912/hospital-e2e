import { test, expect } from '@playwright/test';
const BASE_URL = 'https://hospital.element-trac-group.id.vn/';



// Nhóm các test case thuộc UC001 - Truy cập và hiển thị Trang chủ
test.describe('UC001 - Truy cập và hiển thị Trang chủ', () => {

    // ====== UC001_TC01: Mở trang chủ thành công ======
    test('UC001_TC01 - Mở trang chủ thành công', async ({ page }) => {
        // Bước 1 & 2: Mở trình duyệt và truy cập vào URL trang chủ
        // waitUntil: 'domcontentloaded' nghĩa là đợi cho đến khi HTML load xong
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

        // Verify (Kiểm thử): Kiểm tra tiêu đề trang (Title) có chứa từ khóa mong đợi
        // Điều này đảm bảo trang đã load lên và đúng là trang web mình cần test
        await expect(page).toHaveTitle(/Trang chủ|Hospital|Home/i);

        // Kiểm tra URL hiện tại phải đúng là URL trang chủ (không bị redirect đi đâu đó lạ)
        expect(page.url()).toContain(BASE_URL);
    });

    // ====== UC001_TC02: Reload trang chủ ======
    test('UC001_TC02 - Reload trang chủ', async ({ page }) => {
        // Tiền điều kiện: Đang ở trang chủ
        await page.goto(BASE_URL);

        // Bước 1: Reload trang (tương đương nhấn F5)
        await page.reload({ waitUntil: 'domcontentloaded' });

        // Verify: Sau khi reload, trang vẫn phải hiển thị bình thường
        // Kiểm tra một phần tử chính (ví dụ: Logo hoặc Banner) để chắc chắn trang không bị trắng hoặc crash
        const mainContent = page.locator('header, .banner, #root'); // Chọn các phần tử đặc trưng
        await expect(mainContent.first()).toBeVisible();
    });

    // ====== UC001_TC03: Kiểm tra hiển thị header/footer ======
    test('UC001_TC03 - Kiểm tra hiển thị header/footer', async ({ page }) => {
        // Tiền điều kiện: Vào trang chủ
        await page.goto(BASE_URL);

        // Bước 1: Quan sát Header
        // Tìm phần tử header và kiểm tra nó có hiển thị trên màn hình không
        const header = page.locator('header, .ant-layout-header');
        await expect(header).toBeVisible();

        // Bước 2: Cuộn xuống Footer và quan sát
        // Tìm phần tử footer
        const footer = page.locator('footer, .ant-layout-footer');

        // Scroll (cuộn) tới footer để nạp nội dung (nếu lazy load) và kiểm tra hiển thị
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeVisible();

        // Verify bổ sung: Header và Footer không được rỗng (phải có nội dung bên trong)
        // Lấy text bên trong và kiểm tra độ dài > 0
        expect(await header.innerText()).toBeTruthy();
        expect(await footer.innerText()).toBeTruthy();
    });

    // ====== UC001_TC04: Mở trang chủ trên mobile view ======
    test('UC001_TC04 - Mở trang chủ trên mobile view', async ({ page }) => {
        // Bước 1: Thiết lập kích thước màn hình giống iPhone 12 Pro (390 x 844)
        // Playwright cho phép giả lập kích thước viewport
        await page.setViewportSize({ width: 390, height: 844 });

        // Bước 2: Truy cập trang chủ
        await page.goto(BASE_URL);

        // Verify: Giao diện co giãn, menu thường sẽ chuyển thành icon "Hamburger" (3 gạch)
        // Tìm icon menu mobile (thường dùng trong Ant Design hoặc Bootstrap)
        const mobileMenuIcon = page.locator('.anticon-menu, .mobile-menu-btn, [aria-label="menu"]');

        // Nếu có icon menu mobile thì kiểm tra nó hiển thị
        // Lưu ý: Tùy code frontend cụ thể mà selector có thể khác, đây là dự đoán
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
        // Bước 1: Sửa URL thành endpoint không tồn tại (404)
        const wrongUrl = BASE_URL + 'trang-nay-khong-ton-tai-123456';
        await page.goto(wrongUrl);

        // Verify: Hệ thống nên hiển thị trang 404 hoặc điều hướng về Trang chủ
        // Tìm các dấu hiệu của trang 404
        // Sử dụng Regex để match linh hoạt (Heading, text to...)
        const notFoundText = page.getByRole('heading', { name: /404|Not Found|Không tìm thấy/i })
            .or(page.getByText(/404|Not Found|Không tìm thấy/i));
        const notFoundImage = page.locator('img[alt*="404"], .ant-result-404'); // Ant Design thường có class này

        // Kịch bản hợp lệ:
        // 1. Hiển thị UI 404
        // 2. Tự động redirect về trang chủ

        try {
            await expect(notFoundText.or(notFoundImage).first()).toBeVisible({ timeout: 5000 });
        } catch (e) {
            console.log('Không thấy trang 404 cụ thể, kiểm tra xem có redirect về trang chủ không...');
            await expect(page).toHaveURL(BASE_URL + '?active=home');
            console.log('-> Đã redirect về trang chủ thành công.');
        }

        // Đảm bảo app không bị crash trắng tinh (vẫn render được cái gì đó)
        const bodyContent = await page.locator('body').innerText();
        expect(bodyContent.length).toBeGreaterThan(10); // Body phải có nội dung
    });

});
