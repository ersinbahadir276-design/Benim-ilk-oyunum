// node test/view.js <model> <out-prefix> [views...]  view = yaw,pitch,dist,ty[,tx]
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [m, pre, ...views] = process.argv.slice(2); const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 520, height: 640 } });
  for (const [i, v] of (views.length ? views : ['0.4,0.1,3.4,1.05', '3.4,0.1,3.4,1.05']).entries()) { const [yaw, pitch, dist, ty, tx, show] = v.split(',');
    await p.goto('file://' + path.resolve(__dirname, 'viewer.html') + `?m=${m}&yaw=${yaw}&pitch=${pitch}&dist=${dist}&ty=${ty}&tx=${tx || 0}&show=${show || 0}`); await p.waitForFunction('window.done', { timeout: 60000 });
    const d = await p.evaluate(() => window.done); if (i === 0) console.log(JSON.stringify(d)); await p.screenshot({ path: `${pre}-${i}.png` }); }
  await b.close(); })();
