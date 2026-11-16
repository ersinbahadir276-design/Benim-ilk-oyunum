module.exports = async ({ page, G, log }) => {
  await page.waitForTimeout(1500);
  await G(() => { __G.SYS.gold = 42; __G.SYS.takedowns = 2; });
  await page.waitForTimeout(7000);
  const raw = await page.evaluate(() => { try { return localStorage.getItem('kf2_save'); } catch (e) { return 'ERR ' + e; } });
  console.log('stored gold:', raw && JSON.parse(raw).gold, 'session:', await page.evaluate(() => { try { return sessionStorage.getItem('t'); } catch (e) { return 'ERR' } }));
  const st = await G(() => ({ paused: __G.GT.paused, gold: __G.SYS.gold }));
  console.log('state:', JSON.stringify(st));
  await page.reload(); await page.waitForFunction('window.__G', { timeout: 120000 }); console.log('after reload stored:', await page.evaluate(() => { const r = localStorage.getItem('kf2_save'); return r && JSON.parse(r).gold; })); const sv = await G(() => [__G.SYS.gold, __G.SYS.takedowns]);
  log('kayıt: telefon hafızasına kaydedip geri yüklüyor', sv[0] === 42 && sv[1] === 2, JSON.stringify(sv));
};
