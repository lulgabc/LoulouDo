/** 320px 下检查兑换、任务编辑、假期三个弹层在多语言下的溢出。 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = 'docs/i18n';
const LANGS = {
  en: {
    name: 'English', settings: 'Settings', wallet: 'Wallet', tasks: 'Tasks',
    redeem: 'Redeem pocket money', add: 'Add', holiday: /^Holidays$/,
  },
  de: {
    name: 'Deutsch', settings: 'Mehr', wallet: 'Geld', tasks: 'Plan',
    redeem: 'Taschengeld abholen', add: 'Hinzufügen', holiday: /^Ferien$/,
  },
  fr: {
    name: 'Français', settings: 'Réglages', wallet: 'Argent', tasks: 'Tâches',
    redeem: 'Retirer de l’argent de poche', add: 'Ajouter', holiday: /^Vacances$/,
  },
  pt: {
    name: 'Português', settings: 'Ajustes', wallet: 'Carteira', tasks: 'Tarefas',
    redeem: 'Resgatar mesada', add: 'Adicionar', holiday: /^Férias$/,
  },
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];

const clickNonInert = async (locator) => {
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

const measure = (page) =>
  page.evaluate(() => {
    const overflow = [];
    const clipped = [];
    for (const el of document.querySelectorAll('div')) {
      if (el.children.length > 0) continue;
      const text = (el.textContent || '').trim();
      if (!text) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.opacity === '0') continue;
      if (r.right > window.innerWidth + 1.5 || r.left < -1.5) overflow.push(text.slice(0, 40));
      if (el.scrollWidth > el.clientWidth + 2 && style.overflow === 'hidden') clipped.push(text.slice(0, 40));
    }
    return { overflow: [...new Set(overflow)], clipped: [...new Set(clipped)] };
  });

const close = async (page) => {
  const buttons = page.locator('[aria-label="✕"]');
  const count = await buttons.count();
  for (let i = 0; i < count; i += 1) {
    const el = buttons.nth(i);
    if (!(await el.evaluate((n) => Boolean(n.closest('[inert]'))))) {
      await el.click();
      return;
    }
  }
  await buttons.first().click({ force: true });
};

for (const [locale, meta] of Object.entries(LANGS)) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 640 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByText('开始我的打卡之旅').waitFor();
  await page.locator(`[aria-label="${meta.name}"]`).first().click();
  await page.waitForTimeout(400);
  await page.locator('button[role="button"]').last().click();
  await page.waitForTimeout(1200);

  // 兑换
  await page.locator(`[aria-label="${meta.wallet}"]`).first().click();
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: meta.redeem }).click();
  await page.waitForTimeout(800);
  const redeem = await measure(page);
  await page.screenshot({ path: `${OUT}/${locale}-redeem-320.jpg`, type: 'jpeg', quality: 82 });
  await close(page);
  await page.waitForTimeout(600);

  // 任务编辑器
  await page.locator(`[aria-label="${meta.tasks}"]`).first().click();
  await page.waitForTimeout(800);
  await page.getByText(`＋ ${meta.add}`).first().click();
  await page.waitForTimeout(800);
  const editor = await measure(page);
  await page.screenshot({ path: `${OUT}/${locale}-editor-320.jpg`, type: 'jpeg', quality: 82 });
  await close(page);
  await page.waitForTimeout(600);

  // 假期
  await page.locator(`[aria-label="${meta.settings}"]`).first().click();
  await page.waitForTimeout(800);
  await page.mouse.move(160, 400);
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(400);
  await clickNonInert(page.getByText(meta.holiday));
  await page.waitForTimeout(800);
  const holidays = await measure(page);
  await page.screenshot({ path: `${OUT}/${locale}-holidays-320.jpg`, type: 'jpeg', quality: 82 });

  results.push({ locale, errors, redeem, editor, holidays });
  await context.close();
}

fs.writeFileSync(`${OUT}/modals-report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
