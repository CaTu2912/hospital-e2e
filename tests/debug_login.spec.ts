import { test } from '@playwright/test';

test('inspect login page', async ({ page }) => {
    await page.goto('https://hospital.element-trac-group.id.vn/auth/login');
    await page.waitForLoadState('networkidle');

    const placeholders = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => i.placeholder));
    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText));

    const info = JSON.stringify({ placeholders, buttons }, null, 2);
    throw new Error('PAGE INFO: ' + info);
});
