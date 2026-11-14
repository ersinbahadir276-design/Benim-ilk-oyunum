// Çalıştırma:  python3 -m http.server 8765  (depo kökünde)  →  node test/run-tests.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 960, height: 540 } });
const errs = []; p.on('pageerror', (e) => errs.push(String(e.stack || e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto((process.env.URL || 'http://localhost:8765') + '/index.html?test=1');
await p.waitForFunction('window.GAME && window.GAME.running', { timeout: 120000 });
await p.addScriptTag({ url: 'test/gameplay-test.js' });
const res = await p.evaluate(() => window.runGameplayTests());
let fail = 0; for (const r of res) { if (!r.pass) fail++; console.log(`${r.pass ? '✔' : '✘'} ${r.name}${r.extra ? '  [' + r.extra + ']' : ''}`); }
console.log(`\n${res.length - fail}/${res.length} test geçti` + (errs.length ? `\nKonsol hataları:\n${errs.join('\n')}` : '\nKonsol hatası yok'));
await b.close(); process.exit(fail || errs.length ? 1 : 0);
