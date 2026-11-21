import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN' });
const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(String(e)));
await page.addInitScript(() => {
  window.__plays = [];
  const orig = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    window.__plays.push(this.src.split('/').pop());
    return orig.apply(this, arguments);
  };
});
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.getByText('开始我的打卡之旅').waitFor();
await page.locator('button[role="button"]').last().click();
await page.waitForTimeout(1400);
// complete one task -> sound + dots + star
await page.locator('[aria-label^="完成 "]').first().click();
await page.waitForTimeout(900);
const plays = await page.evaluate(() => window.__plays);
const star = await page.getByText('★').count();
const pattern = await page.evaluate(() => [...document.querySelectorAll('svg pattern circle')].map((c) => c.getAttribute('r')));
await page.screenshot({ path: '/tmp/home-star.jpg', type: 'jpeg', quality: 90 });
// single-day challenge editor
await page.locator('[aria-label="任务"]').click();
await page.waitForTimeout(800);
await page.locator('[aria-label="添加任务"]').click();
await page.waitForTimeout(700);
await page.getByPlaceholder('例如：自己整理床铺').fill('今天的小挑战');
await page.getByText('挑战', { exact: true }).last().click();
await page.waitForTimeout(400);
const modeVisible = await page.getByText('指定一天').count();
await page.getByText('指定一天').click();
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/editor-single-day.jpg', type: 'jpeg', quality: 90 });
await page.locator('[aria-label="保存"]').click();
await page.waitForTimeout(900);
await page.locator('[aria-label="今日"]').click();
await page.waitForTimeout(900);
const homeBody = await page.locator('body').innerText();
const hasTodayChallenge = homeBody.includes('今天的小挑战');
const created = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('louloudou.state.v1'));
  const t = s.tasks.find((x) => x.title === '今天的小挑战');
  return t ? { start: t.startDate, end: t.endDate, kind: t.kind, category: t.category } : null;
});
await page.screenshot({ path: '/tmp/home-single-day.jpg', type: 'jpeg', quality: 90 });
// edit to tomorrow -> should disappear today
await page.locator('[aria-label="任务"]').click();
await page.waitForTimeout(700);
await page.locator('[aria-label^="编辑 今天的小挑战"]').click();
await page.waitForTimeout(700);
const dateInputs = page.locator('input');
const count = await dateInputs.count();
// in single-day mode the last input is the date (name input first)
const dateInput = dateInputs.nth(count - 1);
const tomorrow = new Date(Date.now() + 86400000);
const iso = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
await dateInput.fill(iso);
await page.locator('[aria-label="保存"]').click();
await page.waitForTimeout(900);
await page.locator('[aria-label="今日"]').click();
await page.waitForTimeout(800);
const hiddenToday = !(await page.locator('body').innerText()).includes('今天的小挑战');
const moved = await page.evaluate(() => {
  const t = JSON.parse(localStorage.getItem('louloudou.state.v1')).tasks.find((x) => x.title === '今天的小挑战');
  return t ? { start: t.startDate, end: t.endDate } : null;
});
console.log(JSON.stringify({ errors, plays, star, pattern, modeVisible, hasTodayChallenge, created, hiddenToday, moved }, null, 1));
await browser.close();
