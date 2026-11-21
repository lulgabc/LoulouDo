import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN' });
const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.getByText('开始我的打卡之旅').waitFor();
await page.locator('button[role="button"]').last().click();
await page.waitForTimeout(1200);
await page.locator('[aria-label="钱包"]').click();
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/wallet-initial2.jpg', type: 'jpeg', quality: 90 });
// simulate a chosen emoji avatar
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('louloudou.state.v1'));
  s.profiles.find((p) => p.id === s.activeProfileId).avatar = '🦄';
  localStorage.setItem('louloudou.state.v1', JSON.stringify(s));
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await page.locator('[aria-label="钱包"]').click();
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/wallet-chosen.jpg', type: 'jpeg', quality: 90 });
// simulate custom image avatar
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('louloudou.state.v1'));
  s.profiles.find((p) => p.id === s.activeProfileId).avatarUri = 'http://localhost:4173/test-avatar.png';
  localStorage.setItem('louloudou.state.v1', JSON.stringify(s));
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.locator('[aria-label="钱包"]').click();
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/wallet-custom.jpg', type: 'jpeg', quality: 90 });
console.log(JSON.stringify({ errors }));
await browser.close();
