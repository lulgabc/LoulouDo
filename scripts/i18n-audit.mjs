/**
 * 七语言巡检：逐语言走欢迎页 → 首页 → 报表 → 设置，检查中文残留、
 * 文本/输入框溢出、Tab 文案裁切，并输出截图。
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const OUT = 'docs/i18n';
fs.mkdirSync(OUT, { recursive: true });

const LANG = {
  zh: { name: '中文', home: '今日', report: '报表', settings: '设置', start: true },
  en: { name: 'English', home: 'Today', report: 'Report', settings: 'Settings' },
  fr: { name: 'Français', home: 'Accueil', report: 'Progrès', settings: 'Réglages' },
  de: { name: 'Deutsch', home: 'Start', report: 'Bericht', settings: 'Mehr' },
  it: { name: 'Italiano', home: 'Oggi', report: 'Report', settings: 'Altro' },
  es: { name: 'Español', home: 'Hoy', report: 'Informe', settings: 'Ajustes' },
  pt: { name: 'Português', home: 'Hoje', report: 'Relatório', settings: 'Ajustes' },
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];

const measure = async (page) => {
  return page.evaluate(() => {
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
      if (r.right > window.innerWidth + 1.5 || r.left < -1.5) {
        overflow.push(text.slice(0, 40));
      }
      if (el.scrollWidth > el.clientWidth + 2 && style.overflow === 'hidden') {
        clipped.push(text.slice(0, 40));
      }
    }
    const inputs = [...document.querySelectorAll('input,textarea')]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { v: el.getAttribute('placeholder'), l: r.left, r: r.right };
      })
      .filter((x) => x.r > window.innerWidth + 1.5 || x.l < -1.5);
    return {
      overflow: [...new Set(overflow)].slice(0, 8),
      clipped: [...new Set(clipped)].slice(0, 8),
      inputs,
      han: [...new Set(
        (document.body.innerText || '')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => /[\u4e00-\u9fff]/.test(l)),
      )].slice(0, 8),
    };
  });
};

const save = (page, name) =>
  page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 82 });

for (const width of [393, 320]) {
  for (const [locale, meta] of Object.entries(LANG)) {
    if (width === 320 && !['de', 'fr', 'pt'].includes(locale)) continue;
    const context = await browser.newContext({
      viewport: { width, height: width === 320 ? 640 : 852 },
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
    await page.getByText('开始我的打卡之旅').waitFor({ timeout: 20000 });

    // 直接点语言胶囊（带 aria-label），不用依赖当前语言
    if (locale !== 'zh') {
      await page.locator(`[aria-label="${meta.name}"]`).first().click();
      await page.waitForTimeout(400);
    }

    const welcomeM = await measure(page);
    if (width === 393) await save(page, `${locale}-01-welcome`);

    // 最后一个带 role 的按钮就是开始按钮（语言胶囊在前）
    await page.locator('button[role="button"]').last().click();
    await page.waitForTimeout(1200);
    await page.getByText(meta.home, { exact: true }).first().waitFor();

    const homeM = await measure(page);
    await save(page, `${locale}-02-home-${width}`);

    await page.locator(`[aria-label="${meta.report}"]`).first().click();
    await page.waitForTimeout(900);
    const reportM = await measure(page);
    if (width === 393) await save(page, `${locale}-03-report`);

    await page.locator(`[aria-label="${meta.settings}"]`).first().click();
    await page.waitForTimeout(900);
    const settingsM = await measure(page);
    await save(page, `${locale}-04-settings-${width}`);

    // 检查保存的语言
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('louloudou.state.v1');
      return raw ? JSON.parse(raw).settings.locale : null;
    });

    results.push({
      locale,
      width,
      errors,
      stored,
      welcome: welcomeM,
      home: homeM,
      report: reportM,
      settings: settingsM,
    });
    await context.close();
  }
}

// 德语切英语，确认示例任务与界面实时翻译
{
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    locale: 'zh-CN',
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByText('开始我的打卡之旅').waitFor();
  await page.locator('[aria-label="Deutsch"]').first().click();
  await page.waitForTimeout(300);
  await page.locator('button[role="button"]').last().click();
  await page.waitForTimeout(1200);
  const before = await page.locator('body').innerText();
  await page.locator('[aria-label="Mehr"]').first().click();
  await page.waitForTimeout(700);
  await page.locator('[aria-label="Sprache"]').first().click();
  await page.waitForTimeout(500);
  await page.locator('[aria-label="English"]').first().click();
  await page.waitForTimeout(600);
  await page.locator('[aria-label="Today"]').first().click();
  await page.waitForTimeout(700);
  const after = await page.locator('body').innerText();
  await save(page, 'switch-de-to-en');
  console.log(
    JSON.stringify(
      {
        switchTest: {
          deHasGermanTask: before.includes('Zähne putzen'),
          enHasEnglishTask: after.includes('Brush teeth'),
          enHasToday: after.includes("Today's tasks"),
        },
      },
      null,
      2,
    ),
  );
  await context.close();
}

fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map((r) => ({
  locale: r.locale,
  width: r.width,
  errors: r.errors.length,
  stored: r.stored,
  han: [...new Set([...r.welcome.han, ...r.home.han, ...r.report.han, ...r.settings.han])],
  overflow: [...new Set([...r.welcome.overflow, ...r.home.overflow, ...r.report.overflow, ...r.settings.overflow])],
  clipped: [...new Set([...r.welcome.clipped, ...r.home.clipped, ...r.report.clipped, ...r.settings.clipped])],
  inputs: [...r.welcome.inputs, ...r.home.inputs, ...r.report.inputs, ...r.settings.inputs],
})), null, 2));

await browser.close();
