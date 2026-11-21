import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN' });
const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.getByText('开始我的打卡之旅').waitFor();
await page.locator('button[role="button"]').last().click();
await page.waitForTimeout(1400);
const initial = await page.locator('body').innerText();
const hasHoliday = /假期日记|学做一道新菜|游泳练习/.test(initial);
const geoTabs = await page.evaluate(() => [...document.querySelectorAll('[aria-label="选择分类"]')].length);
await page.screenshot({ path: '/tmp/home-new.jpg', type: 'jpeg', quality: 90 });
// open holidays
await page.locator('[aria-label="设置"]').click();
await page.waitForTimeout(700);
await page.getByText('假期设置').click();
await page.waitForTimeout(700);
const holidayText = await page.locator('body').innerText();
await page.screenshot({ path: '/tmp/holidays-off.jpg', type: 'jpeg', quality: 90 });
// activate 秋假
await page.getByText('开启假期').first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: '/tmp/holidays-on.jpg', type: 'jpeg', quality: 90 });
await page.locator('[aria-label="今日"]').click();
await page.waitForTimeout(800);
const afterOn = await page.locator('body').innerText();
const holidayShown = /假期日记|学做一道新菜|游泳练习/.test(afterOn);
const holidayRows = await page.locator('text=/假期日记|学做一道新菜|游泳练习/').count();
await page.screenshot({ path: '/tmp/home-holiday-on.jpg', type: 'jpeg', quality: 90 });
// complete first task, check dot pattern & star
const first = page.locator('[aria-label^="完成 "]').first();
await first.click();
await page.waitForTimeout(1000);
const pattern = await page.evaluate(() => [...document.querySelectorAll('svg pattern circle')].map((c) => ({ r: c.getAttribute('r'), cx: c.getAttribute('cx') })));
const audio = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => e.name.includes('.wav')).map((e) => e.name.split('/').pop()));
await page.screenshot({ path: '/tmp/home-complete.jpg', type: 'jpeg', quality: 90 });
console.log(JSON.stringify({ errors, hasHolidayInitially: hasHoliday, holidayTextMode: holidayText.includes('开启'), holidayShown, holidayRows, pattern, audio }, null, 1));
await browser.close();
