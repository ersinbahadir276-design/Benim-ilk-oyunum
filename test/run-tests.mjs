// Çalıştırma:  node test/run-tests.mjs   (sunucu gerekmez: dosyalar diskten doğrudan sunulur)
// İsteğe bağlı gerçek sunucu:  python3 -m http.server 8765  →  URL=http://localhost:8765 node test/run-tests.mjs
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.glb': 'model/gltf-binary', '.json': 'application/json', '.png': 'image/png' };
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 960, height: 540 } });
const errs = []; p.on('pageerror', (e) => errs.push(String(e.stack || e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
const BASE = process.env.URL || 'http://game.local';
if (!process.env.URL) await p.route('http://game.local/**', async (route) => {
  const rel = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\/+/, '');
  const file = path.resolve(ROOT, rel || 'index.html');
  if (!file.startsWith(ROOT)) return route.fulfill({ status: 403 });
  try { route.fulfill({ status: 200, body: await readFile(file), contentType: MIME[path.extname(file)] || 'application/octet-stream' }); }
  catch { route.fulfill({ status: 404, body: 'not found' }); }
});
await p.goto(BASE + '/index.html?test=1');
await p.waitForFunction('window.GAME && window.GAME.running', { timeout: 120000 });
await p.addScriptTag({ url: 'test/gameplay-test.js' });
const res = await p.evaluate(() => window.runGameplayTests());
let fail = 0; for (const r of res) { if (!r.pass) fail++; console.log(`${r.pass ? '✔' : '✘'} ${r.name}${r.extra ? '  [' + r.extra + ']' : ''}`); }
console.log(`\n${res.length - fail}/${res.length} test geçti` + (errs.length ? `\nKonsol hataları:\n${errs.join('\n')}` : '\nKonsol hatası yok'));
await b.close(); process.exit(fail || errs.length ? 1 : 0);
