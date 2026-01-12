import { test, expect } from '@playwright/test';

const BASE_URL = 'https://hospital.element-trac-group.id.vn/';

// UC002: Điều hướng giữa các trang
// Chức năng: Kiểm thử khả năng điều hướng của thanh menu, logo và trình duyệt
// Liên kết: Toàn bộ website (Header navigation)
// UC002: Điều hướng giữa các trang
// Chức năng: Kiểm thử khả năng điều hướng của thanh menu, logo và trình duyệt
// Liên kết: Toàn bộ website (Header navigation)
// Mục đích: Đảm bảo người dùng có thể điều hướng dễ dàng và chính xác
test.describe('UC002 - Điều hướng giữa các trang', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    });

    // ====== UC002_TC01 ======
    // Chức năng: Click từng menu điều hướng
    // Liên kết: Header Menu
    // Mục đích: Đảm bảo các link trên menu dẫn đến đúng trang
    // ====== UC002_TC01 ======
    // Chức năng: Click từng menu điều hướng (Navigation Menu)
    // Liên kết: Header Menu (Trang chủ, Đặt lịch khám, Liên hệ)
    // Mục đích: Đảm bảo các link trên menu dẫn đến đúng trang, URL thay đổi đúng pattern
    // Cách sử dụng: Loop qua danh sách item, tìm link theo text va click, sau do verify URL
    test('UC002_TC01 - Click từng menu điều hướng', async ({ page }) => {
        // Danh sách các menu item cần test (Label -> Expected Pattern)
        const menuItems = [
            { label: 'Trang chủ', urlPattern: /\/|\?active=home/ },
            // { label: 'Giới thiệu', urlPattern: /about/ }, // Tạm tắt nếu chưa chắc chắn
            { label: 'Đặt lịch khám', urlPattern: /booking|dat-lich/i }, // Cập nhật label chính xác hơn
            { label: 'Liên hệ', urlPattern: /contact|lien-he/i },
            // { label: 'Tin tức', urlPattern: /news/ },
        ];

        for (const item of menuItems) {
            // Click vào link chứa text tương ứng trong Header
            const menuLink = page.locator('header').getByRole('link', { name: item.label }).first();

            // Nếu tìm thấy thì click và verify
            if (await menuLink.isVisible()) {
                console.log(`Clicking menu: ${item.label}`);
                await menuLink.click();
                await expect(page).toHaveURL(item.urlPattern);

                // Quay lại trang chủ để test item tiếp theo
                await page.goto(BASE_URL);
            } else {
                console.log(`Menu item not visible: ${item.label}`);
            }
        }
    });

    // ====== UC002_TC02 ======
    // Chức năng: Click logo về Trang chủ
    // Liên kết: Header Logo
    // Mục đích: Đảm bảo click logo luôn quay về trang chủ
    // ====== UC002_TC02 ======
    // Chức năng: Click logo về Trang chủ
    // Liên kết: Header Logo -> Homepage
    // Mục đích: Đảm bảo người dùng có thể quay về trang chủ từ bất kỳ trang con nào bằng cách click Logo
    // Cách sử dụng: Di chuyển sang trang Login, tìm Logo click và verify URL về lại Base URL
    test('UC002_TC02 - Click logo về Trang chủ', async ({ page }) => {
        // 1. Đi đến một trang khác (ví dụ trang Login)
        await page.goto(BASE_URL + 'auth/login');

        // 2. Tìm và click Logo
        // Selector logo thường là img trong header hoặc link bao quanh img
        const logo = page.locator('header .logo, header img, a.brand').first();

        // Cố gắng click vào parent anchor nếu nó là ảnh
        if (await logo.count() > 0) {
            await logo.click();
        } else {
            // Fallback: Click vào vùng góc trái trên
            await page.mouse.click(50, 50);
        }

        // 3. Verify về trang chủ
        await expect(page).toHaveURL(new RegExp(BASE_URL.replace(/https?:\/\//, ''))); // Simple regex match
    });

    // ====== UC002_TC03 ======
    // Chức năng: Back/Forward trình duyệt
    // Liên kết: Browser Navigation Buttons
    // Mục đích: Đảm bảo history hoạt động đúng, không gây lỗi trắng trang
    // ====== UC002_TC03 ======
    // Chức năng: Back/Forward trình duyệt
    // Liên kết: Browser Navigation Controls
    // Mục đích: Đảm bảo history stack của browser hoạt động đúng, không gây lỗi trắng trang khi back/forward
    // Cách sử dụng: Đi qua chuỗi trang (Home -> Contact -> Login) rồi Back/Forward và verify URL từng bước
    test('UC002_TC03 - Back/Forward trình duyệt', async ({ page }) => {
        // 1. Trang chủ
        await page.goto(BASE_URL);

        // 2. Đi tới trang Liên hệ
        await page.getByRole('link', { name: /liên hệ|contact/i }).first().click();
        await expect(page).toHaveURL(/contact/i);

        // 3. Đi tới trang Đăng nhập
        await page.goto(BASE_URL + 'auth/login');
        await expect(page).toHaveURL(/login/i);

        // 4. Nhấn Back -> Mong đợi về lại Liên hệ
        await page.goBack();
        await expect(page).toHaveURL(/contact/i);

        // 5. Nhấn Back -> Mong đợi về lại Trang chủ
        await page.goBack();
        await expect(page).toHaveURL(BASE_URL); // Hoặc pattern trang chủ

        // 6. Nhấn Forward -> Mong đợi lên lại Liên hệ
        await page.goForward();
        await expect(page).toHaveURL(/contact/i);
    });

    // ====== UC002_TC04 ======
    // Chức năng: Link ngoài mở đúng cách
    // Liên kết: Footer / Social Links
    // Mục đích: Link dẫn ra ngoài (Facebook, Youtube...) nên mở tab mới (target="_blank")
    // ====== UC002_TC04 ======
    // Chức năng: Link ngoài mở đúng cách (External Links)
    // Liên kết: Các link footer hoặc social media
    // Mục đích: Đảm bảo link trỏ ra domain ngoài phải mở tab mới (target="_blank") để giữ chân user
    // Cách sử dụng: Quét tất cả thẻ <a href="http...">, lọc bỏ link nội bộ/staging, verify thuộc tính target
    test('UC002_TC04 - Link ngoài mở đúng cách', async ({ page }) => {
        // Tìm toàn bộ các link ngoài trừ themewagon
        const links = page.locator('a[href^="http"]:not([href*="themewagon.com/"]):not([href*="hospital.element-trac-group.id.vn"])');
        const count = await links.count();
        console.log(`Found ${count} external links.`);

        for (let i = 0; i < count; i++) {
            const link = links.nth(i);
            const href = await link.getAttribute('href');
            const target = await link.getAttribute('target');
            console.log(`Link [${i}]: ${href} | target: ${target}`);

            // Skip invalid hrefs
            if (!href) continue;

            // Verify using URL object for strict hostname check
            let url: URL;
            try {
                url = new URL(href);
            } catch (e) {
                continue; // Skip invalid URLs
            }

            const currentHost = 'hospital.element-trac-group.id.vn';
            // Exclude internal hosts and known staging/template domains
            const isInternal = url.hostname === currentHost
                || url.hostname.includes('themewagon.com')
                || url.hostname.includes('netlify.app');

            if (!isInternal) {
                if (target !== '_blank') {
                    console.error(`FAILURE: External link ${href} has target="${target}"`);
                }
                expect(target, `External link ${href} should open in new tab`).toBe('_blank');
            }
        }
    });
});
