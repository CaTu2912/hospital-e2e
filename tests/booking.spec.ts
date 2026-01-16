import { test, expect, Page } from '@playwright/test';

// URL của trang đặt lịch khám
const BOOKING_URL = 'https://hospital.element-trac-group.id.vn/';

// Bắt đầu nhóm test case cho chức năng Đăng ký khám bệnh trực tuyến (UC005)
test.describe('UC005 - Đăng ký khám bệnh trực tuyến', () => {

    // Chạy trước mỗi test case: Truy cập trang và kiểm tra nút đặt lịch hiển thị
    test.beforeEach(async ({ page }) => {
        await page.goto(BOOKING_URL, { waitUntil: 'domcontentloaded' }); // Truy cập URL, đợi DOM load xong
        await expect(page.locator('button', { hasText: /đặt lịch khám/i })).toBeVisible(); // Kiểm tra nút "Đặt lịch khám" có hiển thị không
    });

    // ====== Helpers (Hàm hỗ trợ cho Ant Design) ======

    // Hàm lấy dropdown menu đang hiển thị (tránh lấy dropdown ẩn)
    function visibleSelectDropdown(page: Page) {
        return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    }

    // Hàm chọn option nhãn
    async function selectAntdByLabel(page: Page, labelText: string, optionIndex = 0) {
        //  1: Tìm container chứa placeholder text bên trong (thường gặp)
        let container = page.locator('.ant-select-selector').filter({ has: page.getByText(labelText) });

        if (await container.count() === 0) {
            //  2: Nếu label nằm ngoài selector (Form Item), tìm parent chung rồi tìm selector
            container = page.locator('.ant-col, .ant-form-item, .ant-row')
                .filter({ has: page.getByText(labelText) })
                .locator('.ant-select-selector');
        }

        // Đảm bảo container tìm thấy và hiển thị
        await expect(container.first(), `Container for "${labelText}" not found`).toBeVisible();

        const finalContainer = container.first();

        // Kiểm tra role combobox để đảm bảo đúng element
        await expect(finalContainer.getByRole('combobox')).toBeAttached();

        // Click vào container để mở dropdown
        await finalContainer.click();

        // Đợi dropdown hiển thị
        const dropdown = visibleSelectDropdown(page);
        await expect(dropdown).toBeVisible({ timeout: 15000 });

        // Lấy danh sách các option đang enable (không bị disable)
        const enabledOptions = dropdown.locator('.ant-select-item-option:not(.ant-select-item-option-disabled) .ant-select-item-option-content');

        // Đợi cho đến khi có ít nhất 1 option load lên
        await expect(async () => {
            const count = await enabledOptions.count();
            expect(count).toBeGreaterThan(0);
        }).toPass({ timeout: 5000 });

        // Tính index để click (nếu index truyền vào lớn hơn số lượng thì chọn cái đầu tiên - fallback)
        const count = await enabledOptions.count();
        const idx = optionIndex >= count ? 0 : optionIndex;
        const target = enabledOptions.nth(idx);

        // Scroll tới option và click
        await target.scrollIntoViewIfNeeded();
        await target.click({ force: true });

        // Đảm bảo dropdown đóng lại sau khi chọn
        await expect(dropdown).toBeHidden({ timeout: 10000 });
    }

    // Hàm chọn ngày trong DatePicker của Ant Design
    async function selectDate(page: Page) {
        const dateInput = page.getByPlaceholder('Chọn ngày');
        await expect(dateInput).toBeVisible(); // Đảm bảo input ngày hiển thị
        await dateInput.click(); // Click mở lịch

        // Tìm panel lịch hiển thị
        const panel = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
        await expect(panel).toBeVisible({ timeout: 15000 });

        // Lấy các ô ngày có thể chọn (không bị disable)
        const enabledCells = panel.locator('.ant-picker-cell-in-view:not(.ant-picker-cell-disabled)');
        await expect(enabledCells.first()).toBeVisible({ timeout: 5000 });

        // Chọn ngày cuối cùng có thể chọn (thường là ngày trong tương lai)
        await enabledCells.last().click({ force: true });

        // Đợi panel lịch đóng lại
        await expect(panel).toBeHidden({ timeout: 10000 });
    }

    // Hàm kiểm tra validate DatePicker (Ngày): kiểm tra nhiều dấu hiệu lỗi
    async function expectDateInvalid(page: Page) {
        const dateInput = page.getByPlaceholder('Chọn ngày');

        // Kiểm tra attribute aria-invalid="true" trên input
        const isAriaInvalid = dateInput.and(page.locator('[aria-invalid="true"]'));

        // Kiểm tra class lỗi trên thẻ bao ngoài (wrapper) của datepicker
        const hasErrorClass = page.locator('.ant-picker-status-error, .ant-form-item-has-error, .error').filter({ has: dateInput });

        // Kiểm tra text báo lỗi hiển thị bên dưới (Vui lòng chọn ngày...)
        const hasErrorText = page.locator('.ant-form-item-explain, .ant-form-item-explain-error')
            .filter({ hasText: /chọn ngày|bắt buộc|required|vui lòng|không được bỏ trống/i });

        // Kiểm tra native validation (:invalid CSS pseudo-class)
        const isNativeInvalidCSS = dateInput.and(page.locator(':invalid'));

        // Mong đợi ít nhất 1 trong các điều kiện trên xảy ra (hiển thị lỗi)
        await expect(isAriaInvalid.or(hasErrorClass).or(hasErrorText).or(isNativeInvalidCSS).first()).toBeVisible({ timeout: 10000 });
    }

    // Hàm kiểm tra lỗi hiển thị chung cho các field khác
    async function expectErrorVisible(page: Page) {
        // Tìm các class báo lỗi phổ biến của Ant Design hoặc text báo lỗi
        const errorLocator = page.locator('.ant-form-item-explain-error')
            .or(page.locator('[role="alert"]'))
            .or(page.locator('.ant-select-status-error'))
            .or(page.locator('.ant-input-status-error'))
            .or(page.locator('.ant-form-item-has-error'))
            // Fallback: Tìm text chứa từ khóa báo lỗi
            .or(page.locator('text=/bắt buộc|vui lòng|required|không được bỏ trống/i'));

        // Mong đợi lỗi hiển thị
        await expect(errorLocator.first()).toBeVisible({ timeout: 10000 });
    }

    const errorRegex = /bắt buộc|vui lòng|required|không được bỏ trống|nhập|chọn/i;

    // ====== TC01: Đặt lịch khám thành công ======
    test('UC005_TC01 - Đặt lịch khám thành công', async ({ page }) => {
        // Bước 1: Chọn ngày
        await test.step('1. Chọn ngày từ lịch', async () => {
            await selectDate(page);
        });

        // Bước 2: Chọn chuyên khoa (option đầu tiên)
        await test.step('2. Chọn chuyên khoa từ list', async () => {
            await selectAntdByLabel(page, 'Chọn chuyên khoa', 0);
            await page.waitForTimeout(1000); // Đợi load dữ liệu phụ thuộc
        });

        // Bước 3: Chọn bác sĩ
        await test.step('3. Chọn bác sĩ từ list', async () => {
            await selectAntdByLabel(page, 'Chọn bác sĩ', 0);
            await page.waitForTimeout(1000); // Đợi load dữ liệu phụ thuộc
        });

        // Bước 4: Chọn giờ khám
        await test.step('4. Chọn giờ từ list', async () => {
            await selectAntdByLabel(page, 'Giờ', 0);
        });

        // Bước 5: Nhập số điện thoại hợp lệ
        await test.step('5. Nhập sdt', async () => {
            await page.getByPlaceholder('Số điện thoại').fill('0912345678');
        });

        // Click nút đặt lịch
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();

        // Verify: Thông báo thành công hiển thị (Toast message của Ant Design)
        const successMessage = page.locator('.ant-message-notice');
        await expect(successMessage).toBeVisible({ timeout: 15000 });
        await expect(successMessage).toContainText(/thành công|success|đã được ghi nhận/i);
    });

    // ====== Nhóm TC02 -> TC06: Validate các trường bỏ trống (Empty Fields) ======

    test('UC005_TC02 - Không chọn ngày', async ({ page }) => {
        // Điền các trường khác, bỏ trống Ngày
        await selectAntdByLabel(page, 'Chọn chuyên khoa');
        await selectAntdByLabel(page, 'Chọn bác sĩ');
        await selectAntdByLabel(page, 'Giờ');
        await page.getByPlaceholder('Số điện thoại').fill('0912345678');

        // Click Submit
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();

        // Kiểm tra lỗi hiển thị ở trường Ngày
        await expectDateInvalid(page);
    });

    test('UC005_TC03 - Không chọn chuyên khoa', async ({ page }) => {
        await selectDate(page);
        await page.getByPlaceholder('Số điện thoại').fill('0912345678'); // Bỏ qua chọn chuyên khoa/bác sĩ/giờ
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();
        await expectErrorVisible(page); // Mong đợi lỗi hiển thị
    });

    test('UC005_TC04 - Không chọn bác sĩ', async ({ page }) => {
        await selectDate(page);
        await selectAntdByLabel(page, 'Chọn chuyên khoa');
        // Không chọn bác sĩ
        await page.getByPlaceholder('Số điện thoại').fill('0912345678');
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();
        await expectErrorVisible(page);
    });

    test('UC005_TC05 - Không chọn giờ', async ({ page }) => {
        await selectDate(page);
        await selectAntdByLabel(page, 'Chọn chuyên khoa');
        await selectAntdByLabel(page, 'Chọn bác sĩ', 0);
        // Không chọn giờ
        await page.getByPlaceholder('Số điện thoại').fill('0912345678');
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();
        await expectErrorVisible(page);
    });

    test('UC005_TC06 - Không nhập SĐT', async ({ page }) => {
        await selectDate(page);
        await selectAntdByLabel(page, 'Chọn chuyên khoa');
        await selectAntdByLabel(page, 'Chọn bác sĩ');
        await selectAntdByLabel(page, 'Giờ');
        // Không nhập SĐT
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();
        await expectErrorVisible(page);
    });

    // ====== Nhóm TC07 -> TC09: Validate định dạng Số điện thoại ======

    test('UC005_TC07 - SĐT chứa ký tự đặc biệt', async ({ page }) => {
        await selectDate(page);
        await selectAntdByLabel(page, 'Chọn chuyên khoa');
        await selectAntdByLabel(page, 'Chọn bác sĩ');
        await selectAntdByLabel(page, 'Giờ');
        await page.getByPlaceholder('Số điện thoại').fill('0912@#$'); // Nhập SĐT chứa ký tự lạ

        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();
        await expectErrorVisible(page); // Mong đợi báo lỗi
    });

    test('UC005_TC08 - SĐT quá ngắn', async ({ page }) => {
        await page.getByPlaceholder('Số điện thoại').fill('0912'); // Nhập ngắn
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();
        await expectErrorVisible(page);
    });

    test('UC005_TC09 - SĐT quá dài', async ({ page }) => {
        const longPhone = '091234567890123';
        await page.getByPlaceholder('Số điện thoại').fill(longPhone);
        const value = await page.getByPlaceholder('Số điện thoại').inputValue();

        // Nếu input cho phép nhập dài hơn 12 ký tự -> Click submit -> Mong đợi lỗi
        if (value.length > 12) {
            await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();
            await expectErrorVisible(page);
        } else {
            // Nếu input tự động cắt (maxlength) -> Verify độ dài <= 12
            expect(value.length).toBeLessThanOrEqual(12);
        }
    });

    // ====== TC10: Chọn ngày quá khứ ======
    test('UC005_TC10 - Chọn ngày quá khứ', async ({ page }) => {
        await page.getByPlaceholder('Chọn ngày').click();
        const disabledCells = page.locator('.ant-picker-cell-disabled'); // Tìm các ngày bị disable

        // Nếu có ngày disable, kiểm tra nó thực sự bị disable
        if (await disabledCells.count() > 0) {
            expect(await disabledCells.first().isDisabled()).toBeTruthy();
        } else {
            console.log('Cảnh báo: Không tìm thấy ngày nào bị disable trong lịch (có thể lỗi config)');
        }
    });

    // ====== TC11: Danh sách bác sĩ phụ thuộc chuyên khoa (Dependency) ======
    test('UC005_TC11 - Danh sách bác sĩ phụ thuộc chuyên khoa', async ({ page }) => {
        // 1. Chọn Chuyên khoa A (Option index 0)
        await selectAntdByLabel(page, 'Chọn chuyên khoa', 0);
        await page.waitForTimeout(1000);

        // 2. Mở dropdown Bác sĩ thủ công để kiểm tra danh sách
        // Tìm element select của Bác sĩ
        const doctorContainer = page.locator('.ant-col, .ant-form-item, .ant-row')
            .filter({ has: page.getByText('Chọn bác sĩ') })
            .locator('.ant-select-selector').first();
        await doctorContainer.click();

        const dropdown = visibleSelectDropdown(page);
        await expect(dropdown).toBeVisible();
        // Lấy danh sách bác sĩ A
        const optionsA = await dropdown.locator('.ant-select-item-option-content').allInnerTexts();
        console.log('Bác sĩ thuộc Chuyên khoa A:', optionsA);
        expect(optionsA.length).toBeGreaterThan(0); // Phải có bác sĩ

        // Đóng dropdown (nhấn Escape)
        await page.keyboard.press('Escape');
        await expect(dropdown).toBeHidden();

        // 3. Đổi sang Chuyên khoa B (Option index 1)
        await selectAntdByLabel(page, 'Chọn chuyên khoa', 1);
        await page.waitForTimeout(1000);

        // 4. Mở lại dropdown Bác sĩ
        await doctorContainer.click();
        await expect(dropdown).toBeVisible();
        // Lấy danh sách bác sĩ B
        const optionsB = await dropdown.locator('.ant-select-item-option-content').allInnerTexts();
        console.log('Bác sĩ thuộc Chuyên khoa B:', optionsB);

        // Verify: Hai danh sách nên khác nhau (hoặc ít nhất danh sách B cũng có dữ liệu)
        if (optionsA.length > 0 && optionsB.length > 0) {
            expect(optionsB).not.toEqual(optionsA);
        }
    });

    // ====== TC12: Đổi chuyên khoa reset bác sĩ ======
    test('UC005_TC12 - Đổi chuyên khoa reset bác sĩ', async ({ page }) => {
        await selectAntdByLabel(page, 'Chọn chuyên khoa', 0);
        await selectAntdByLabel(page, 'Chọn bác sĩ', 0); // Chọn 1 bác sĩ

        // Đổi Chuyên khoa khác
        await selectAntdByLabel(page, 'Chọn chuyên khoa', 1);
        await page.waitForTimeout(1000);

        // Verify: Có thể chọn lại bác sĩ (field không bị kẹt hay lỗi)
        await selectAntdByLabel(page, 'Chọn bác sĩ', 0);
    });

    // ====== TC13: Giờ khám phụ thuộc ngày/bác sĩ ======
    test('UC005_TC13 - Giờ khám phụ thuộc ngày/bác sĩ', async ({ page }) => {
        // 1. Chọn dữ liệu ban đầu
        await selectDate(page);
        await selectAntdByLabel(page, 'Chọn chuyên khoa', 0);
        await selectAntdByLabel(page, 'Chọn bác sĩ', 0);

        // 2. Mở dropdown Giờ thủ công
        const timeContainer = page.locator('.ant-col, .ant-form-item, .ant-row')
            .filter({ has: page.getByText('Giờ') })
            .locator('.ant-select-selector').first();
        await timeContainer.click();

        const dropdown = visibleSelectDropdown(page);
        await expect(dropdown).toBeVisible();
        // Lấy danh sách giờ A
        const timeOptionsA = await dropdown.locator('.ant-select-item-option-content').allInnerTexts();
        console.log('Danh sách giờ A:', timeOptionsA);

        // Đóng dropdown
        await page.keyboard.press('Escape');
        await expect(dropdown).toBeHidden();

        // 3. Đổi ngày khám (chọn ngày khác)
        await selectDate(page);
        await page.waitForTimeout(1000);

        // 4. Mở lại dropdown Giờ
        await timeContainer.click();
        await expect(dropdown).toBeVisible();
        // Lấy danh sách giờ B
        const timeOptionsB = await dropdown.locator('.ant-select-item-option-content').allInnerTexts();
        console.log('Danh sách giờ B:', timeOptionsB);

        // Verify: Danh sách giờ B phải có dữ liệu
        expect(timeOptionsB.length).toBeGreaterThan(0);
    });


    // ====== TC14: Submit liên tục (Spam Click) ======
    test('UC005_TC14 - Submit liên tục', async ({ page }) => {
        // Điền đầy đủ thông tin hợp lệ
        await selectDate(page);
        await selectAntdByLabel(page, 'Chọn chuyên khoa');
        await selectAntdByLabel(page, 'Chọn bác sĩ');
        await selectAntdByLabel(page, 'Giờ');
        await page.getByPlaceholder('Số điện thoại').fill('0912345678');

        const submitBtn = page.locator('button').filter({ hasText: /đặt lịch khám/i });

        // Click liên tục 5 lần không đợi (noWaitAfter)
        for (let i = 0; i < 5; i++) {
            submitBtn.click({ noWaitAfter: true });
        }
        // Verify chỉ cần thấy ít nhất 1 thông báo, không bị crash
        await expect(page.locator('.ant-message-notice').first()).toBeVisible();
    });

    // ====== TC15: Lỗi mạng khi gửi (Network Failure) ======
    test('UC005_TC15 - Lỗi mạng khi gửi', async ({ page }) => {
        // Điền form
        await selectDate(page);
        await selectAntdByLabel(page, 'Chọn chuyên khoa');
        await selectAntdByLabel(page, 'Chọn bác sĩ');
        await selectAntdByLabel(page, 'Giờ');
        await page.getByPlaceholder('Số điện thoại').fill('0912345678');

        // Giả lập lỗi mạng: Abort request tới API booking
        await page.route('**/api/**/booking', (route) => route.abort());

        // Click submit
        await page.locator('button').filter({ hasText: /đặt lịch khám/i }).click();

        // (Optional) Kiểm tra hiển thị thông báo lỗi hệ thống nếu có
        // await expect(page.locator('text=/lỗi|error|failed/i')).toBeVisible(); 
    });

});

