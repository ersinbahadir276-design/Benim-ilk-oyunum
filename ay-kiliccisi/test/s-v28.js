// v28 — Bataklık Tapınağı (Yılan Rahibe), Kül Kale (Şeytan Kral Azgal, final), kül toprakları, ana görev, duruş rolleri
module.exports = async ({ page, G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; __G.fastFade = 1; __G.SYS.dun = { boss: {}, deep: {} }; __G.SYS.azgal = 0 });
  const res = {};
  for (const id of ['swamp', 'citadel']) {
    await G((id) => { const D = __G.X.DUNS[id]; __G.X.enterDungeon(id, D.floors - 1) }, id); await page.waitForTimeout(700);
    res[id] = await G(() => { const X = __G.X, P = __G.P; for (let i = 0; i < 30; i++) __G.step(1 / 60); const b = X.DUN ? X.DUN.boss : null; const boss = b || X.MONS.find(m => m.boss); if (!boss) return { boss: null, on: !!__G.X.DUN };
      const name = boss.title; P.hp = 1e5; const dead = X.foeHurt(boss, 1e6, 0, 1, 'heavy'); if (dead) X.onFoeKilled(boss, false); for (let i = 0; i < 30; i++) __G.step(1 / 60); return { name, dead, rec: !!(__G.SYS.dun.boss || {})[__G.X.DUN.id], azgal: __G.SYS.azgal || 0, title: __G.SYS.title } });
    await G(() => __G.X.leaveDungeon()); await page.waitForTimeout(300) }
  await page.waitForTimeout(3000);
  const w = await G(() => ({ ash: __G.zoneAt(-1880, -1880), lv: __G.X.regionLevel(-1880, -1880), title: __G.SYS.title, quest: (__G.X.MAINQ || []).length, st: __G.X.STANCES ? Object.keys(__G.X.STANCES).length : 0 }));
  log('BATAKLIK TAPINAĞI: son katta YILAN RAHİBE çıkıyor, ölünce kaydediliyor', res.swamp.name && /YILAN RAHİBE/.test(res.swamp.name) && res.swamp.dead && res.swamp.rec, JSON.stringify(res.swamp));
  log('KÜL KALE: son katta ŞEYTAN KRAL AZGAL; ölünce ana hikâye biter (Kral Katili)', res.citadel.name && /AZGAL/.test(res.citadel.name) && res.citadel.dead && res.citadel.azgal === 1 && w.title === 'Kral Katili', JSON.stringify({ c: res.citadel, w }));
  log('KÜL TOPRAKLARI bölgesi (Sv.22)', w.ash === 'ash' && w.lv === 22, JSON.stringify(w));
};
