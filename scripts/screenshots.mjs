/**
 * 端到端演示脚本：用本机 Chrome 跑一遍真实交互，并输出截图到 docs/screenshots。
 * 运行前先 `npx expo export -p web` 并启动 dist 静态服务（默认 4173）。
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const OUT = 'docs/screenshots';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  locale: 'zh-CN',
});
const page = await context.newPage();
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
});
page.on('pageerror', (err) => errors.push(`pageerror: ${String(err)}`));

const shot = async (name, wait = 350) => {
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log('saved', name);
};
const click = async (text, { exact = false, wait = 500 } = {}) => {
  await page.getByText(text, { exact }).first().click();
  await page.waitForTimeout(wait);
};
const clickAria = async (label, wait = 500) => {
  const locator = page.locator(`[aria-label="${label}"]`);
  const count = await locator.count();
  for (let i = 0; i < count; i += 1) {
    const el = locator.nth(i);
    if (!(await el.evaluate((node) => Boolean(node.closest('[inert]'))))) {
      await el.click();
      break;
    }
  }
  await page.waitForTimeout(wait);
};
const tab = async (name, wait = 1300) => {
  await page.locator(`[aria-label="${name}"]`).first().click();
  await page.waitForTimeout(wait);
};

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.getByText('开始设置').waitFor({ timeout: 20000 });
await shot('01-welcome-candy');

await page.getByText('开始设置').click();
await page.waitForTimeout(400);
await page.locator('input[placeholder*="昵称"]').fill('朵朵');
await page.locator('[aria-label="小鹿"]').click();
await page.waitForTimeout(300);
await shot('01b-welcome-avatar', 200);

await page.getByText('下一步').click();
await page.waitForTimeout(400);
await click('森林贴纸');
await shot('02-welcome-forest');

await page.getByRole('button', { name: '开始我的打卡之旅' }).click();
await page.waitForTimeout(1200);
await shot('03-home-forest', 700);

const homeText = await page.locator('body').innerText();
if (!homeText.includes('今天的任务')) throw new Error('首页没有渲染任务区');
if (!homeText.includes('朵朵')) throw new Error('昵称没有生效');

// 逐条完成今日任务
let guard = 0;
while (guard < 30) {
  const next = page.locator('[aria-label^="完成 "]').first();
  if ((await next.count()) === 0) break;
  await next.click();
  await page.waitForTimeout(220);
  guard += 1;
}
await shot('04-home-alldone', 500);
await page.waitForTimeout(1500);

const doneText = await page.locator('body').innerText();
if (!doneText.includes('今日全勤宝箱打开啦')) throw new Error('未触发全勤宝箱');
if (!doneText.includes('连续 1 天')) throw new Error('连续打卡天数没有更新');

await tab('任务');
await shot('05-tasks');

await tab('报表');
await shot('06-report-top');
await page.mouse.move(215, 600);
await page.mouse.wheel(0, 640);
await shot('07-report-bottom', 500);
const reportText = await page.locator('body').innerText();
if (!reportText.includes('成长报表')) throw new Error('报表页缺失');
if (!reportText.includes('家长小报告')) throw new Error('家长报告缺失');

await tab('钱包', 1800);
await shot('08-wallet');
const expectedBalance = await page.evaluate(() => {
  const raw = localStorage.getItem('louloudou.state.v1');
  if (!raw) return 0;
  const stored = JSON.parse(raw);
  const profileId = stored.activeProfileId;
  return stored.entries
    .filter((e) => e.profileId === profileId)
    .reduce((sum, e) => (e.type === 'redeem' ? sum - e.coins : sum + e.coins), 0);
});
const walletText = await page.locator('body').innerText();
if (!walletText.includes('金币存折')) throw new Error('钱包存折缺失');


await page.getByRole('button', { name: '兑换零花钱' }).click();
await page.waitForTimeout(800);
await page.locator('input[placeholder="0"]').fill('50');
await shot('09-redeem');
await page.getByRole('button', { name: /^确认兑换/ }).click();
await page.waitForTimeout(900);
await shot('10-redeem-success');
const successText = await page.locator('body').innerText();
if (!successText.includes('兑换成功')) throw new Error('兑换没有成功');
await page.getByRole('button', { name: '完成', exact: true }).click();
await page.waitForTimeout(800);
const afterRedeem = await page.locator('body').innerText();
if (!afterRedeem.includes(String(expectedBalance - 50))) throw new Error(`兑换后余额不是 ${expectedBalance - 50}`);

await tab('设置');
await shot('11-settings-forest');
await page.locator('[aria-label="语言"]').first().click();
await page.waitForTimeout(500);
await shot('11b-language-menu');
await page.locator('[aria-label="中文"]').last().click();
await page.waitForTimeout(500);
await click('奇幻', { wait: 700 });
await shot('12-settings-fantasy', 500);

await tab('今日');
await shot('13-home-fantasy');

await tab('设置');
await clickAria('假期设置', 800);
await page.locator('[role="switch"]').nth(1).click();
await page.waitForTimeout(600);
await shot('14-holidays', 600);
await page.locator('[role="switch"]').nth(1).click();
await page.waitForTimeout(300);
await page.getByText('✕').first().click();
await page.waitForTimeout(800);

// 首页特别任务快捷入口
await tab('今日');
await clickAria('添加特别任务', 700);
await shot('14b-quick-task', 500);
await page.getByText('✕').first().click();
await page.waitForTimeout(600);

// 新建任务，验证 CRUD
await tab('任务');
await clickAria('添加一个新任务', 700);
await page.waitForTimeout(700);
await shot('15-task-editor');
await page.locator('input[placeholder*="整理床铺"]').fill('给植物浇水');
await page.getByRole('button', { name: '创建任务' }).click();
await page.waitForTimeout(900);
const tasksText = await page.locator('body').innerText();
if (!tasksText.includes('给植物浇水')) throw new Error('新任务没有创建成功');
await shot('16-tasks-new');

// 刷新验证本地持久化
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1400);
const persisted = await page.locator('body').innerText();
await shot('17-reload-persisted', 500);
if (!persisted.includes('朵朵')) throw new Error('刷新后昵称丢失');
if (!persisted.includes('给植物浇水')) throw new Error('刷新后新任务丢失');
const storedTheme = await page.evaluate(() => {
  const raw = localStorage.getItem('louloudou.state.v1');
  return raw ? JSON.parse(raw).settings.themeId : null;
});

const summary = {
  errors,
  tasksCompletedInDemo: guard,
  afterRedeem,
  storedTheme,
  screenshots: fs.readdirSync(OUT).filter((f) => f.endsWith('.png')),
};
console.log(JSON.stringify(summary, null, 2));
if (errors.length) process.exitCode = 1;

await browser.close();
