import { test, expect } from '@playwright/test';

test('playwright automation test', async ({ page }) => {
    await page.goto('https://material.playwrightvn.com/018-mouse.html');
    const element= page.locator('#clickArea')
    await element.click()
    await element.click({button: 'right'})
    await element.dblclick()
    await element.click({clickCount: 10})
    
});