// Ay Kılıççısı test düzeneği (Playwright + yazılımsal WebGL).
// node test/harness.js <senaryo.js> [çıktı-klasörü]
// Senaryo dosyası: module.exports = async ({page, shot, G, log}) => {...}
const { chromium, devices } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const scen = require(path.resolve(process.argv[2]));
  const out = process.argv[3] || path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const land = scen.portrait ? devices['Pixel 7'] : devices['Pixel 7 landscape'];
  const ctx = await b.newContext({ ...land, deviceScaleFactor: 1, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERR ' + String(e.stack || e).slice(0, 600)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 400)); if (m.type() === 'log' && process.env.VERBOSE) console.log('page:', m.text()); });
  await page.addInitScript(() => { try { if (window.name !== 'kept') { localStorage.clear(); window.name = 'kept'; } } catch (e) {} });
  await page.goto('file://' + path.resolve(__dirname, '../dist/ay-kiliccisi.html') + (scen.query || ''));
  try { await page.waitForFunction('window.__G', { timeout: 120000, polling: 500 }); } catch (e) { console.log('YÜKLENEMEDİ\n' + errs.join('\n')); await b.close(); process.exit(2); }
  if (!scen.keepIntro) await page.evaluate((keepStrip) => { const b = document.getElementById('introb'); if (b && document.getElementById('intro').style.display !== 'none') b.click(); if (!keepStrip && window.__G && __G.X.CINE.on) __G.X.cineEnd(); }, !!scen.keepStrip);
  // combat-geometry suites run in classic camera mode (the hero turns to his foe); shift-lock has its own suite (s-v29)
  await page.evaluate((sl) => { __G.SYS.cam = __G.SYS.cam || {}; __G.SYS.cam.shift = sl ? 1 : 0 }, !!scen.shiftLock);
  if (scen.pauseAtStart) await page.evaluate(() => { __G.GT.paused = true; });
  const shot = async (name, opts = {}) => { await page.waitForTimeout(opts.wait ?? 250); await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 72 }); };
  const G = (fn, arg) => page.evaluate(fn, arg);
  const results = []; const log = (name, pass, extra = '') => { results.push({ name, pass: !!pass, extra: String(extra) }); };
  try { await scen({ page, shot, G, log, out }); } catch (e) { errs.push('SCENARIO ' + (e.stack || e)); }
  let fail = 0; for (const r of results) { if (!r.pass) fail++; console.log(`${r.pass ? '✔' : '✘'} ${r.name}${r.extra ? '  [' + r.extra + ']' : ''}`); }
  console.log(`${results.length - fail}/${results.length} geçti` + (errs.length ? '\n' + errs.join('\n') : '\nhata yok'));
  await b.close(); process.exit(fail || errs.length ? 1 : 0);
})();
