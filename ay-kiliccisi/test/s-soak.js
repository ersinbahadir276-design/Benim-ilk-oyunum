// AŞAMA 6 — performans ve hata önleme: yapay zekâ maliyeti, 60 sn kavga dayanıklılığı (NaN yok), zindan giriş-çıkışında
// nesne/bellek sızıntısı yok, havuzlar sınırlı, eski kayıt güvenle yükleniyor
module.exports = async ({ page, G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; __G.fastFade = 1 });
  // 1) AI cost: a full goblin camp awake + a wolf pack hunting, 300 steps
  const cost = await G(() => { const P = __G.P, X = __G.X, c = __G.GOBS.find(g => g.lookout).camp; __G.tp(c.x + 14, c.z + 14); P.hp = 1e5;
    for (const g of __G.GOBS) if (g.camp === c && !g.dead) { g.aware = 1; g.st = 'chase'; g.ls = [P.x, P.z]; g.unseen = 0 } const pk = X.PACKS.find(p => p.mem.length >= 3 && !p.mem.some(w => w.boss)); pk.mem.forEach((w, i) => { w.dead = 0; w.st = 'stalk'; w.aware = 1; w.x = P.x + 12 + i; w.z = P.z - 8; w.ls = [P.x, P.z]; w.unseen = 0 });
    const n = __G.GOBS.filter(g => g.hostile && g.hostile()).length + pk.mem.length; const t0 = performance.now(); for (let i = 0; i < 300; i++) { __G.step(1 / 60); P.hp = 1e5; P.alive = true; if (P.st === 'dead' || P.st === 'down') { P.st = 'move'; P.rag.ang = 0 } } const stepMs = (performance.now() - t0) / 300;
    const t1 = performance.now(); for (let i = 0; i < 30; i++) __G.render(1 / 60); const renderMs = (performance.now() - t1) / 30; return { enemies: n, stepMs: +stepMs.toFixed(2), renderMs: +renderMs.toFixed(2), drawn: __G.drawn() } });
  // 2) a 60 s brawl: six enemies, the hero swinging, dashing, blocking at random — nothing goes NaN, nothing throws
  const soak = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN; let bad = 0, err = ''; const all = () => [...__G.wolves, ...__G.GOBS].filter(f => !f.dead && Math.hypot(f.x - P.x, f.z - P.z) < 40);
    try { for (let i = 0; i < 3600; i++) { const r = Math.random(); if (i % 20 === 0) { if (r < .35) __G.press('atk'); else if (r < .5) __G.press('dodge'); else if (r < .6) __G.press('hvy'); IN.blockHeld = r > .85 } __G.step(1 / 60); P.hp = 1e5; P.alive = true; if (P.st === 'dead') { P.st = 'move'; P.rag.ang = 0 }
        if (!isFinite(P.x) || !isFinite(P.z) || !isFinite(P.y)) bad++; for (const f of all()) if (!isFinite(f.x) || !isFinite(f.z) || !isFinite(f.hp)) bad++ } } catch (e) { err = String(e).slice(0, 200) }
    IN.blockHeld = false; return { bad, err, kills: (__G.SYS.gkills || 0) } });
  // 3) leaks: enter and leave a dungeon three times — objects, monsters, projectiles and loot come back to the same counts
  const leak = [];
  for (let k = 0; k < 6; k++) { await G(() => __G.X.enterDungeon('crypt', 0)); await page.waitForTimeout(250); await G(() => { for (let i = 0; i < 120; i++) __G.step(1 / 60) }); await G(() => __G.X.leaveDungeon()); await page.waitForTimeout(150); leak.push(await G(() => ({ objs: __G.objCount(), mons: __G.X.MONS.length }))) }
  const pools = await G(() => ({ arrows: __G.X.ARROWS ? __G.X.ARROWS.length : -1 }));
  // 4) an old save (before cameras, habits, dungeons, stances) still loads and gets safe defaults
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('kf2_save') || '{}'); for (const k of ['cam', 'dun', 'lore', 'stances', 'stance', 'dchest', 'dsec', 'mkills', 'guild']) delete s[k]; s.v = 3; localStorage.setItem('kf2_save', JSON.stringify(s)); });
  await page.reload(); await page.waitForFunction('window.__G', { timeout: 120000 }); await page.evaluate(() => { const b = document.getElementById('introb'); if (b && document.getElementById('intro').style.display !== 'none') b.click(); if (__G.X.CINE.on) __G.X.cineEnd() });
  const old = await G(() => { __G.GT.paused = true; let ok = true, e = ''; try { for (let i = 0; i < 60; i++) __G.step(1 / 60); __G.render(1 / 60) } catch (x) { ok = false; e = String(x) } return { ok, e, cam: !!__G.SYS.cam && __G.SYS.cam.sx === 1, stance: __G.SYS.stance } });
  log('yapay zekâ maliyeti: uyanık kamp + avlanan sürü varken adım < 6 ms (yazılımsal tarayıcıda)', cost.stepMs < 6, JSON.stringify(cost));
  log('60 sn karmaşık kavga: NaN yok, hata yok', soak.bad === 0 && !soak.err, JSON.stringify(soak));
  log('zindan 6 kez giriş-çıkış: nesne sayısı sınırlı (yalnız efekt havuzları bir kez ısınır, sonra sabit)', Math.max(...leak.map(l => l.objs)) - leak[1].objs <= 160 && leak[5].objs - leak[4].objs <= 2 && leak.every(l => l.mons === 0), JSON.stringify(leak));
  log('ok havuzu sınırlı (<60)', pools.arrows >= 0 && pools.arrows < 60, JSON.stringify(pools));
  log('eski kayıt yükleniyor, yeni ayarlar varsayılanla geliyor', old.ok && old.cam && old.stance === 'stone', JSON.stringify(old));
};
