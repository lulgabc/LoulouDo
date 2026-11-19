/**
 * 用本机 Chrome 把 SVG 吉祥物渲染成 App 图标。
 * 输出：assets/icon.png、assets/favicon.png、assets/splash-icon.png、
 *      assets/android-icon-foreground.png
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const MASCOT = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <g stroke="#C0906A" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M45 33 C42 24 36 20 29 18" />
    <path d="M40 26 C36 24 33 24 30 26" />
    <path d="M75 33 C78 24 84 20 91 18" />
    <path d="M80 26 C84 24 87 24 90 26" />
  </g>
  <g>
    <ellipse cx="24" cy="51" rx="11" ry="18" fill="#FFE7CF" transform="rotate(-24 24 51)" />
    <ellipse cx="26" cy="52" rx="5.5" ry="11" fill="#FFB9C9" transform="rotate(-24 26 52)" />
    <ellipse cx="96" cy="51" rx="11" ry="18" fill="#FFE7CF" transform="rotate(24 96 51)" />
    <ellipse cx="94" cy="52" rx="5.5" ry="11" fill="#FFB9C9" transform="rotate(24 94 52)" />
  </g>
  <circle cx="60" cy="66" r="35" fill="#FFE7CF" />
  <ellipse cx="60" cy="84" rx="20" ry="15" fill="#FFF6EA" />
  <ellipse cx="60" cy="89" rx="17" ry="8" fill="#F8D3B2" opacity="0.4" />
  <g>
    <ellipse cx="47" cy="61" rx="4.6" ry="5.2" fill="#3F2A33" />
    <ellipse cx="73" cy="61" rx="4.6" ry="5.2" fill="#3F2A33" />
    <circle cx="48.6" cy="59.3" r="1.7" fill="#FFFFFF" />
    <circle cx="74.6" cy="59.3" r="1.7" fill="#FFFFFF" />
  </g>
  <ellipse cx="36" cy="75" rx="7" ry="4.2" fill="#FF9FB5" opacity="0.75" />
  <ellipse cx="84" cy="75" rx="7" ry="4.2" fill="#FF9FB5" opacity="0.75" />
  <ellipse cx="60" cy="78" rx="4.4" ry="3.4" fill="#FF8FA8" />
  <path d="M53 84 Q60 96 67 84 Z" fill="#E0627F" />
  <ellipse cx="60" cy="90" rx="4.5" ry="3" fill="#FF9FB5" />
  <path d="M38 104 Q60 114 82 104 L82 112 Q60 120 38 112 Z" fill="#FF6FA5" />
  <circle cx="60" cy="111" r="5.5" fill="#FFB020" />
  <g fill="#FFB020">
    <path d="M104 42 l2.2 5.4 5.6 1.2 -4.2 3.8 1 5.6 -4.6-3 -4.6 3 1-5.6 -4.2-3.8 5.6-1.2 Z" />
    <path d="M18 34 l1.5 3.8 4 .8 -3 2.7 .7 4 -3.2-2.1 -3.2 2.1 .7-4 -3-2.7 4-.8 Z" opacity="0.7" />
  </g>
</svg>`;

const sparkles = (color, opacity) => `
  <g fill="${color}" opacity="${opacity}">
    <circle cx="180" cy="230" r="9" />
    <circle cx="860" cy="190" r="13" />
    <circle cx="900" cy="760" r="8" />
    <circle cx="160" cy="800" r="11" />
    <circle cx="760" cy="880" r="7" />
  </g>`;

const iconHtml = `<!doctype html><html><head><style>
  html,body{margin:0;padding:0;background:transparent}
  #icon{width:1024px;height:1024px;position:relative;overflow:hidden;
    background:linear-gradient(145deg,#FFD1E3 0%,#FFE8F2 48%,#D8F7EA 100%);}
  #ring{position:absolute;left:130px;top:130px;width:764px;height:764px;border-radius:382px;
    background:rgba(255,255,255,.55);border:10px solid rgba(255,255,255,.7);}
  #mascot{position:absolute;left:222px;top:236px;width:580px;height:580px}
</style></head><body>
  <div id="icon">
    <div id="ring"></div>
    ${sparkles('#FF6FA5', 0.35)}
    ${sparkles('#39C6A3', 0.3)}
    <div id="mascot">${MASCOT}</div>
  </div>
</body></html>`;

const fgHtml = `<!doctype html><html><head><style>
  html,body{margin:0;padding:0;background:transparent}
  #fg{width:1024px;height:1024px;position:relative;background:transparent}
  #m{position:absolute;left:232px;top:242px;width:560px;height:560px}
</style></head><body><div id="fg"><div id="m">${MASCOT}</div></div></body></html>`;

const splashHtml = `<!doctype html><html><head><style>
  html,body{margin:0;padding:0;background:transparent}
  #sp{width:1024px;height:1024px;position:relative;background:transparent}
  #m{position:absolute;left:132px;top:160px;width:760px;height:760px}
</style></head><body><div id="sp"><div id="m">${MASCOT}</div></div></body></html>`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });

const render = async (html, selector, path, transparent = false) => {
  await page.setContent(html);
  await page.waitForTimeout(200);
  await page.locator(selector).screenshot({ path, omitBackground: transparent });
  console.log('wrote', path);
};

await render(iconHtml, '#icon', 'assets/icon.png');
await render(fgHtml, '#fg', 'assets/android-icon-foreground.png', true);
await render(splashHtml, '#sp', 'assets/splash-icon.png', true);
await page.setContent(iconHtml);
await page.waitForTimeout(200);
await page.setViewportSize({ width: 1024, height: 1024 });
await page.locator('#icon').screenshot({ path: 'assets/icon-1024.png' });
await browser.close();

fs.copyFileSync('assets/icon.png', 'assets/favicon.png');
console.log('done');
