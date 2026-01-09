import { test } from '@playwright/test';

const LOGIN_URL = 'https://hospital.element-trac-group.id.vn/auth/login';
const CHAT_URL = 'https://hospital.element-trac-group.id.vn/patient/chat';
const VALID_USER = {
    username: 'nguoidung1',
    password: 'thanhthanh'
};

test('inspect chat page', async ({ page }) => {
    // Login first
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('input[type="text"], input[name="username"]').first().fill(VALID_USER.username);
    await page.locator('input[type="password"]').fill(VALID_USER.password);
    await page.locator('button[type="submit"], button:has-text("Đăng nhập")').first().click();
    await page.waitForURL(/home|dashboard|patient/i, { timeout: 30000 });

    // Go to chat
    await page.goto(CHAT_URL);
    await page.waitForLoadState('networkidle');

    // Capture info
    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b: any) => ({ text: b.innerText, class: b.className, id: b.id })));
    const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input, textarea')).map((i: any) => ({ placeholder: i.placeholder, name: i.name, class: i.className })));
    const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map((a: any) => ({ text: a.innerText, href: a.href })));

    const info = JSON.stringify({ buttons, inputs, links }, null, 2);
    // Throw error to print info
    throw new Error('CHAT PAGE INFO: ' + info);
});
