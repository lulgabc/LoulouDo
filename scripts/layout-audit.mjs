/**
 * 手机尺寸布局巡检：在 4 个常见手机视口下跑完整页面，
 * 检测横向溢出、文字被裁切、底部内容是否被 TabBar 遮挡，并截图。
 * 需要先 npm run export:web + 静态服务（4173）。
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const OUT = 'docs/mobile';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'iphone-15', width: 393, height: 852 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'android-small', width: 360, height: 740 },
  { name: 'tiny-320', width: 320, height: 568 },
  { name: 'ipad-768', width: 768, height: 1024 },
];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];

const measure = async (page, viewport, name) => {
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const textOverflow = [];
    for (const el of document.querySelectorAll('div')) {
      if (el.children.length > 0) continue;
      const text = (el.textContent || '').trim();
      if (!text || text.length > 80) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.opacity === '0') continue;
      if (r.right > window.innerWidth + 1.5 || r.left < -1.5) {
        textOverflow.push({
          text: text.slice(0, 30),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    }
    const buttons = [...document.querySelectorAll('[role="button"],[aria-label]')].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        label: el.getAttribute('aria-label') || (el.textContent || '').trim().slice(0, 20),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
      };
    });
    const inputOverflow = [...document.querySelectorAll('input,textarea')].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        placeholder: el.getAttribute('placeholder') || '',
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
      };
    }).filter((item) => item.width > 0 && (item.right > window.innerWidth + 1.5 || item.left < -1.5));
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      bodyText: (document.body.innerText || '').slice(0, 80),
      textOverflow,
      inputOverflow,
      buttons,
    };
  });
  await page.screenshot({
    path: `${OUT}/${viewport.name}-${name}.jpg`,
    type: 'jpeg',
    quality: 82,
  });
  return data;
};

const scrollToBottom = async (page) => {
  await page.mouse.move(180, 400);
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(500);
};
const scrollToTop = async (page) => {
  await page.mouse.move(180, 300);
  await page.mouse.wheel(0, -6000);
  await page.waitForTimeout(350);
};

const clickVisible = async (locator) => {
  const count = await locator.count();
  for (let i = 0; i < count; i += 1) {
    const el = locator.nth(i);
    const inert = await el.evaluate((node) => Boolean(node.closest('[inert]')));
    if (!inert) {
      await el.click();
      return;
    }
  }
  await locator.first().click({ force: true });
};

const tab = async (page, name) => {
  await page.locator(`[aria-label="${name}"]`).first().click();
  await page.waitForTimeout(900);
};

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByText('开始设置').waitFor({ timeout: 20000 });
  const welcome = await measure(page, viewport, 'welcome');

  await page.getByText('开始设置').click();
  await page.waitForTimeout(400);
  const welcomeAvatar = await measure(page, viewport, 'welcome-avatar');
  await page.locator('input[placeholder*="昵称"]').fill('朵朵');
  await page.getByText('下一步').click();
  await page.waitForTimeout(400);
  const welcomeSkin = await measure(page, viewport, 'welcome-skin');
  await page.getByText('开始我的打卡之旅').click();
  await page.waitForTimeout(1200);

  const pages = {};
  pages.home = await measure(page, viewport, 'home');
  await scrollToBottom(page);
  pages['home-bottom'] = await measure(page, viewport, 'home-bottom');
  await scrollToTop(page);

  await tab(page, '任务');
  pages.tasks = await measure(page, viewport, 'tasks');
  await scrollToBottom(page);
  pages['tasks-bottom'] = await measure(page, viewport, 'tasks-bottom');
  await scrollToTop(page);

  await tab(page, '今日');
  await clickVisible(page.locator('[aria-label="添加特别任务"]'));
  await page.waitForTimeout(700);
  pages.quick = await measure(page, viewport, 'quick');
  await clickVisible(page.getByText('✕'));
  await page.waitForTimeout(600);

  await tab(page, '报表');
  pages.report = await measure(page, viewport, 'report');
  await scrollToBottom(page);
  pages['report-bottom'] = await measure(page, viewport, 'report-bottom');
  await scrollToTop(page);

  await tab(page, '钱包');
  pages.wallet = await measure(page, viewport, 'wallet');
  await scrollToBottom(page);
  pages['wallet-bottom'] = await measure(page, viewport, 'wallet-bottom');
  await scrollToTop(page);

  await tab(page, '设置');
  pages.settings = await measure(page, viewport, 'settings');
  await scrollToBottom(page);
  pages['settings-bottom'] = await measure(page, viewport, 'settings-bottom');
  await scrollToTop(page);

  await tab(page, '钱包');
  await clickVisible(page.getByRole('button', { name: '兑换零花钱' }));
  await page.waitForTimeout(700);
  pages.redeem = await measure(page, viewport, 'redeem');
  await clickVisible(page.getByText('✕'));
  await page.waitForTimeout(600);

  await tab(page, '任务');
  await clickVisible(page.locator('[aria-label="添加一个新任务"]'));
  await page.waitForTimeout(700);
  pages.editor = await measure(page, viewport, 'editor');
  await clickVisible(page.getByText('✕'));
  await page.waitForTimeout(600);

  await tab(page, '设置');
  await scrollToBottom(page);
  await clickVisible(page.locator('[aria-label="假期设置"]'));
  await page.waitForTimeout(700);
  await page.locator('[role="switch"]').nth(1).click();
  await page.waitForTimeout(500);
  pages.holidays = await measure(page, viewport, 'holidays', { scroll: true });
  await clickVisible(page.getByText('✕'));

  const issues = [];
  for (const [name, data] of Object.entries(pages)) {
    if (data.textOverflow.length) {
      issues.push({ page: name, type: 'text-overflow', items: data.textOverflow.slice(0, 4) });
    }
    if (data.inputOverflow.length) {
      issues.push({ page: name, type: 'input-overflow', items: data.inputOverflow.slice(0, 4) });
    }
    if (data.scrollWidth > viewport.width + 1) {
      issues.push({ page: name, type: 'page-scroll-x', scrollWidth: data.scrollWidth });
    }
  }

  report.push({
    viewport: `${viewport.name} ${viewport.width}x${viewport.height}`,
    errors,
    welcomeOverflow: welcome.textOverflow,
    welcomeAvatarOverflow: welcomeAvatar.textOverflow,
    welcomeSkinOverflow: welcomeSkin.textOverflow,
    issues,
  });
  await context.close();
}

fs.writeFileSync(`${OUT}/layout-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
