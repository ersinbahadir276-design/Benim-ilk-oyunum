module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(1200); await shot('ui-1-intro', { wait: 300 });
  await page.click('#introb'); await page.waitForTimeout(600);
  await G(() => { __G.SYS.gold = 7; __G.SYS.meat = 3; }); await page.tap('#bSys'); await page.waitForTimeout(500); await shot('ui-2-system', { wait: 300 });
  await page.evaluate(() => { document.getElementById('winb').scrollTop = 99999; }); await shot('ui-3-system-bottom', { wait: 300 });
  await page.evaluate(() => { document.getElementById('winx').click(); });
  // touch buttons drive the actions: hold SALDIR -> charge, release -> heavy; BLOK hold -> block
  const box = async (id) => page.locator('#' + id).boundingBox();
  const b = await box('bAtk'); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(2500);
  const st1 = await G(() => __G.P.st); await page.mouse.up(); await page.waitForTimeout(400); const st2 = await G(() => __G.P.st);
  log('dokunmatik: SALDIR basılı tut = yükleme, bırak = ağır saldırı', st1 === 'charge' && st2 === 'heavy', st1 + ' → ' + st2);
  await page.waitForTimeout(4000); const k = await box('bBlk'); await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await page.mouse.down(); await page.waitForTimeout(1500); const st3 = await G(() => __G.P.st); await page.mouse.up(); await page.waitForTimeout(1200); const st4 = await G(() => __G.P.st);
  log('dokunmatik: BLOK basılı tut = blok, bırak = normal', st3 === 'block' && st4 === 'move', st3 + ' → ' + st4);
  const j = await box('bJmp'); await page.mouse.click(j.x + j.width / 2, j.y + j.height / 2); await page.waitForTimeout(150); const st5 = await G(() => __G.P.st);
  log('dokunmatik: ZIPLA', st5 === 'jump', st5);
  // save + reload keeps progress
  await G(() => { __G.SYS.gold = 42; __G.SYS.takedowns = 2; }); await page.waitForTimeout(500);
  await page.reload(); await page.waitForFunction('window.__G', { timeout: 120000 }); const sv = await G(() => [__G.SYS.gold, __G.SYS.takedowns]);
  log('kayıt: telefon hafızasına kaydedip geri yüklüyor', sv[0] === 42 && sv[1] === 2, JSON.stringify(sv));
};
module.exports.portrait = true; module.exports.keepIntro = true;
