import { chromium } from 'playwright-core';

const BASE = 'http://localhost:4173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 393, height: 852 },
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
await page.locator('[aria-label="English"]').first().click();
await page.waitForTimeout(400);
await page.locator('button[role="button"]').last().click();
await page.waitForTimeout(1200);

// 完成第一件事
await page.locator('[aria-label^="Complete Brush teeth"]').first().click();
await page.waitForTimeout(800);

// 兑换 5 金币
await page.locator('[aria-label="Wallet"]').first().click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Redeem pocket money' }).click();
await page.waitForTimeout(700);
await page.locator('input[placeholder="0"]').fill('5');
await page.getByRole('button', { name: /^Redeem ¥/ }).click();
await page.waitForTimeout(800);
const redeemSuccess = (await page.locator('body').innerText()).includes('Redeemed!');
await page.getByRole('button', { name: 'Done', exact: true }).click();
await page.waitForTimeout(700);
const walletEn = await page.locator('body').innerText();

// 切到德语，检查存折与任务标题即时翻译
await page.locator('[aria-label="Settings"]').first().click();
await page.waitForTimeout(700);
await page.locator('[aria-label="Deutsch"]').first().click();
await page.waitForTimeout(700);
await page.locator('[aria-label="Geld"]').first().click();
await page.waitForTimeout(800);
const walletDe = await page.locator('body').innerText();
await page.screenshot({ path: '/tmp/wallet-de-after-switch.jpg', type: 'jpeg', quality: 84 });

// 报表里的“最常完成”也应该翻译
await page.locator('[aria-label="Bericht"]').first().click();
await page.waitForTimeout(900);
const reportDe = await page.locator('body').innerText();

console.log(
  JSON.stringify(
    {
      errors,
      redeemSuccess,
      enWallet: {
        task: walletEn.includes('Brush teeth'),
        redeem: walletEn.includes('Pocket money'),
        bonus: walletEn.includes('Welcome gift'),
      },
      deWallet: {
        task: walletDe.includes('Zähne putzen'),
        redeem: walletDe.includes('Taschengeld'),
        bonus: walletDe.includes('Willkommensgeschenk'),
        noEnglishTask: !walletDe.includes('Brush teeth'),
      },
      deReport: {
        mostDoneGerman: reportDe.includes('Zähne putzen'),
        parentSummary: reportDe.includes('Eltern-Kurzbericht'),
      },
      stored: await page.evaluate(() => {
        const raw = localStorage.getItem('louloudou.state.v1');
        return raw ? JSON.parse(raw).settings.locale : null;
      }),
    },
    null,
    2,
  ),
);
await browser.close();
