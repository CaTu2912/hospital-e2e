import { test, expect, Page } from '@playwright/test';

const URL = 'https://hospital.element-trac-group.id.vn/';

// Helpers
function fieldByLabel(page: Page, labelText: string) {
  return page.locator('div').filter({ hasText: new RegExp(`^\\s*${escapeRegExp(labelText)}\\s*$`) }).first()
    .or(page.locator('div').filter({ has: page.getByText(labelText, { exact: true }) }).first());
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function visibleSelectDropdown(page: Page) {
  return page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
}

// Select Helper
async function selectAntdByLabel(page: Page, labelText: string, optionIndex = 0) {
  console.log(`Selecting "${labelText}"...`);
  let container = page.locator('.ant-select-selector').filter({ has: page.getByText(labelText) });

  if (await container.count() === 0) {
    container = page.locator('.ant-col, .ant-form-item, .ant-row')
      .filter({ has: page.getByText(labelText) })
      .locator('.ant-select-selector');
  }

  await expect(container.first(), `Container for "${labelText}" not found`).toBeVisible();
  const finalContainer = container.first();
  await finalContainer.click();

  const dropdown = visibleSelectDropdown(page);
  await expect(dropdown).toBeVisible({ timeout: 15000 });

  const enabledOptions = dropdown.locator('.ant-select-item-option:not(.ant-select-item-option-disabled) .ant-select-item-option-content');
  await expect(async () => {
    const count = await enabledOptions.count();
    expect(count).toBeGreaterThan(0);
  }).toPass({ timeout: 5000 });

  const count = await enabledOptions.count();
  const idx = optionIndex >= count ? 0 : optionIndex;
  await enabledOptions.nth(idx).click({ force: true });
  await expect(dropdown).toBeHidden({ timeout: 10000 });
}

// Date Helper
async function selectFutureDate(page: Page) {
  console.log('Selecting future date...');
  const dateInput = page.getByPlaceholder('Chọn ngày');
  await expect(dateInput).toBeVisible();
  await dateInput.click();
  const panel = page.locator('.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)').last();
  await expect(panel).toBeVisible({ timeout: 15000 });
  const enabledCells = panel.locator('.ant-picker-cell-in-view:not(.ant-picker-cell-disabled)');
  await enabledCells.last().click({ force: true });
  await expect(panel).toBeHidden({ timeout: 10000 });
  console.log('Date selected.');
}

// UC005: Booking Validation Debug
// Chức năng: Debug lỗi validation khi đặt lịch khám
// Liên kết: https://hospital.element-trac-group.id.vn/
// Mục đích: Script này dùng để chạy riêng biệt, kiểm tra kỹ phần validation error
test.describe('UC005 - Booking Validation Debug', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('button', { hasText: /đặt lịch khám/i })).toBeVisible();
  });

  // ====== UC005_TC03 (Debug) ======
  // Chức năng: Debug case không chọn chuyên khoa
  // Liên kết: Bỏ qua chọn Chuyên khoa -> Submit
  // Mục đích: Xác minh xem lỗi validation có hiển thị đúng class .ant-form-item-explain-error không
  test.only('UC005_TC03 - Không chọn chuyên khoa (Debug)', async ({ page }) => {
    await test.step('1) Chọn ngày hợp lệ', async () => {
      await selectFutureDate(page);
    });

    // Strategy: SKIP Select Specialty, Doctor, Time.
    // Just fill Phone and Submit.

    await test.step('2) Nhập SĐT', async () => {
      await page.getByPlaceholder('Số điện thoại').fill('0912345678');
    });

    await test.step('3) Click ĐẶT LỊCH KHÁM', async () => {
      await page.locator('button', { hasText: /đặt lịch khám/i }).click();
    });

    await test.step('Verify: Validation Error', async () => {
      console.log('Checking for validation errors...');
      // Check for .ant-form-item-explain-error
      // Wait slightly
      await page.waitForTimeout(1000);

      const errors = page.locator('.ant-form-item-explain-error');
      const count = await errors.count();
      console.log(`Found ${count} error elements.`);

      if (count > 0) {
        console.log('Error texts:', await errors.allInnerTexts());
        await expect(errors.first()).toBeVisible();
      } else {
        console.log('NO validation errors found in .ant-form-item-explain-error');
        // Capture potential other error alerts
        const alerts = page.locator('[role="alert"]');
        if (await alerts.count() > 0) {
          console.log('Alerts found:', await alerts.allInnerTexts());
        }
        throw new Error('Validation failed to appear');
      }
    });
  });
});
