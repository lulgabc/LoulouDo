import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [locale, tab, label] of [['de-DE','Plan','de'],['fr-FR','Tâches','fr'],['es-ES','Tareas','es'],['pt-BR','Tarefas','pt'],['it-IT','Compiti','it']]) {
  const page = await browser.newPage({ viewport: { width: 320, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale });
  const errors=[]; page.on('console',m=>m.type()==='error'&&errors.push(m.text())); page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.getByRole('button').last().click();
  await page.waitForTimeout(1200);
  await page.locator(`[aria-label="${tab}"]`).first().click();
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => [...document.querySelectorAll('div')].filter((el) => {
    if (el.children.length) return false;
    const t=(el.textContent||'').trim(); if(!t) return false;
    const r=el.getBoundingClientRect();
    return r.width>0 && (r.right>innerWidth+1 || r.left<-1);
  }).slice(0,4).map(el=>({text:(el.textContent||'').slice(0,24)})));
  await page.screenshot({ path: `/tmp/tasks-${label}.jpg`, type: 'jpeg', quality: 90 });
  console.log(label, JSON.stringify({ errors, overflow }));
  await page.close();
}
await browser.close();
