import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN' });
const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.getByText('开始我的打卡之旅').waitFor();
await page.locator('button[role="button"]').last().click();
await page.waitForTimeout(1100);
let guard=0;
while (guard<20) {
  const next = page.locator('[aria-label^="完成 "]').first();
  if ((await next.count())===0) break;
  await next.click(); await page.waitForTimeout(200); guard++;
}
await page.locator('[aria-label="钱包"]').click();
await page.waitForTimeout(900);
const walletText = await page.locator('body').innerText();
const collapseVisible = walletText.includes('展开全部');
await page.screenshot({ path: '/tmp/wallet-collapsed.jpg', type: 'jpeg', quality: 90 });
if (collapseVisible) {
  await page.getByText(/展开全部/).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/wallet-expanded.jpg', type: 'jpeg', quality: 90 });
}
await page.locator('[aria-label="任务"]').click();
await page.waitForTimeout(800);
const before = await page.locator('body').innerText();
const row = page.locator('[aria-label^="取消完成 "],[aria-label^="完成 "]').first();
const rowCount = await row.count();
if (rowCount) await row.click();
await page.waitForTimeout(500);
const after = await page.locator('body').innerText();
const beforeCount = (before.match(/· (\d+)/)||[])[1];
const afterCount = (after.match(/· (\d+)/)||[])[1];
// pencil
const pencil = page.locator('[aria-label^="编辑 "]').first();
await pencil.click(); await page.waitForTimeout(600);
const editor = page.url().includes('task-editor');
console.log(JSON.stringify({ errors, collapseVisible, rowCount, beforeCount, afterCount, editor }));
await browser.close();
