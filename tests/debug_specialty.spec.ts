import { test } from '@playwright/test';

const SPECIALTY_URL = 'https://hospital.element-trac-group.id.vn/specialty?active=dichvu';

// Debug script to inspect the content of the Specialty page
test('inspect specialty page', async ({ page }) => {
    await page.goto(SPECIALTY_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // Wait for dynamic content

    console.log('--- Inspecting Sidebar / Menu ---');
    // Try to find anything looking like a menu
    const potentialMenus = page.locator('.ant-menu, ul, .sidebar, .menu');
    const count = await potentialMenus.count();
    console.log(`Found ${count} potential menu containers.`);

    for (let i = 0; i < count; i++) {
        const classAttr = await potentialMenus.nth(i).getAttribute('class');
        console.log(`Menu ${i} class: ${classAttr}`);
        const text = await potentialMenus.nth(i).innerText();
        console.log(`Menu ${i} content preview: ${text.substring(0, 100)}...`);
    }

    console.log('--- Inspecting Titles ---');
    const titles = page.locator('h1, h2, h3, .title');
    const tCount = await titles.count();
    for (let i = 0; i < tCount; i++) {
        console.log(`Title ${i}: ${await titles.nth(i).innerText()}`);
    }
});
