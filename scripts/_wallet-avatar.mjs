import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN' });
const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.getByText('开始我的打卡之旅').waitFor();
await page.locator('button[role="button"]').last().click();
await page.waitForTimeout(1200);
await page.locator('[aria-label="钱包"]').click();
await page.waitForTimeout(900);
await page.screenshot({ path: '/tmp/wallet-initial.jpg', type: 'jpeg', quality: 90 });
// set custom avatar emoji via settings
await page.locator('[aria-label="设置"]').click();
await page.waitForTimeout(700);
await page.locator('[aria-label="更换头像"]').first().click();
await page.waitForTimeout(700);
await page.getByText('🦄').first().click();
await page.waitForTimeout(500);
const save = page.getByRole('button', { name: /保存|Enregistrer|Save/ }).first();
if (await save.count()) { await save.click(); await page.waitForTimeout(800); }
await page.locator('[aria-label="钱包"]').click();
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/wallet-unicorn.jpg', type: 'jpeg', quality: 90 });
console.log(JSON.stringify({ errors }));
await browser.close();
