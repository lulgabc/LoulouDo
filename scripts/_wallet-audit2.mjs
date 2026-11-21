import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const labels = { fr: 'Argent', es: 'Dinero', pt: 'Carteira', zh: '钱包' };
const results = [];
for (const [loc, w] of [['fr',320],['es',393],['pt',320],['zh',393]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: loc });
  const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.getByRole('button').last().click();
  await page.waitForTimeout(1200);
  await page.locator(`[aria-label="${labels[loc]}"]`).click();
  await page.waitForTimeout(900);
  const bodyText = await page.locator('body').innerText();
  const expandBtn = page.locator('[role="button"]').filter({ hasText: /全部|entrées|todas|todo/i }).last();
  const hasExpand = (await expandBtn.count()) > 0;
  if (hasExpand) { await expandBtn.click(); await page.waitForTimeout(400); }
  const overflow = await page.evaluate(() => {
    const vw = window.innerWidth;
    return [...document.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !el.closest('[data-focusable]');
    }).slice(0, 3).map((el) => ({ tag: el.tagName, text: (el.textContent||'').slice(0, 24), right: Math.round(el.getBoundingClientRect().right) }));
  });
  await page.screenshot({ path: `/tmp/wallet-${loc}-${w}-expanded.jpg`, type: 'jpeg', quality: 88 });
  results.push({ loc, w, errors, hasExpand, overflow, hasAvatar: await page.locator('img[alt=""], [role="img"]').count() });
  await page.close();
}
console.log(JSON.stringify(results, null, 1));
await browser.close();
