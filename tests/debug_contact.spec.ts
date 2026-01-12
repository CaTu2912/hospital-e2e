import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const CONTACT_URL = 'https://hospital.element-trac-group.id.vn/contact?active=lienhe';

// Debug Script: Inspect Contact Page
// Chức năng: Crawl cấu trúc DOM của trang liên hệ và xuất ra file JSON
// Liên kết: https://hospital.element-trac-group.id.vn/contact?active=lienhe
// Mục đích: Phân tích cấu trúc form để tìm selector chính xác
test('inspect contact page', async ({ page }) => {
    await page.goto(CONTACT_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Capture info with explicit any casting
    const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input, textarea')).map((i: any) => ({
        tag: i.tagName,
        placeholder: i.placeholder,
        name: i.name,
        id: i.id,
        class: i.className,
        type: i.type
    })));

    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map((b: any) => ({
        text: b.innerText,
        class: b.className,
        type: b.getAttribute('type')
    })));

    const frames = page.frames();
    const frameInfo = frames.map(f => ({ name: f.name(), url: f.url() }));

    const info = JSON.stringify({ inputs, buttons, frameCount: frames.length, frameInfo }, null, 2);

    fs.writeFileSync('contact_page_info.json', info); // Write to CWD

    console.log('Info written to contact_page_info.json');
});
