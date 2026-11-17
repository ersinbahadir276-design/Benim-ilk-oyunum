// Savaş: atılma (dash), goblin baskısı, siper, 危 saldırısı, okçu isabeti, KAFA KAFAYA
module.exports = async ({ page, shot, G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, IN = __G.IN, X = __G.X, out = {};
    const clear = () => { for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { g.dead = 1; g.so = 0; g.x = g.hx = 5000 + Math.random() * 300 } };
    const reset = (x = 20, z = 290) => { clear(); __G.tp(x, z); P.st = 'move'; P.t = 0; P.alive = true; P.inv = 0; P.hp = X.maxHP(); P.sta = 100; P.yaw = 0; P.vx = P.vz = 0; IN.mx = IN.mz = 0; P.lock = null; P.rag.ang = 0 };
    const gob = (x, z) => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead); g.dead = 0; g.x = g.hx = x; g.z = g.hz = z; g.hp = g.max; g.st = 'chase'; g.aware = 1; g.unseen = 0; g.cd = 0; g.archer = false; g.peril = 0; g.cn = 0; g.yaw = Math.atan2(P.x - x, P.z - z); return g };
    // 1) dash: fast, ~3+ m, no somersault, i-frames
    reset(); const x0 = P.x, z0 = P.z; __G.press('dodge'); let spin = 0, inv = 0; for (let i = 0; i < 30; i++) { __G.sim(1 / 60, 1); spin = Math.max(spin, Math.abs(P.spin || 0)); inv = Math.max(inv, P.inv) }
    out.dash = { dist: +Math.hypot(P.x - x0, P.z - z0).toFixed(2), dir: +(P.z - z0).toFixed(2), spin, inv: +inv.toFixed(2), st: P.st };
    // 2) chained dash and dash -> lunge slash
    reset(); __G.press('dodge'); __G.sim(1 / 60, 12); __G.press('dodge'); __G.sim(1 / 60, 2); out.chain = P.st === 'dodge' && P.t < .1;
    reset(); __G.press('dodge'); __G.sim(1 / 60, 10); __G.press('atk'); __G.sim(1 / 60, 2); out.dashAtk = P.st;
    // 3) goblin never overlaps the hero and keeps attacking up close
    reset(); let g = gob(P.x, P.z + 2); let minD = 9, hits = 0; for (let i = 0; i < 600; i++) { const h = P.hp; __G.sim(1 / 60, 1); if (P.hp < h) hits++; P.hp = X.maxHP(); if (P.st !== 'move') { P.st = 'move'; P.t = 0; P.rag.ang = 0 } minD = Math.min(minD, Math.hypot(g.x - P.x, g.z - P.z)) }
    out.close = { minD: +minD.toFixed(2), hits };
    // 4) walking away does not escape a goblin
    reset(); g = gob(P.x, P.z + 2); hits = 0; IN.mz = -1; __G.CAM.yaw = 0; for (let i = 0; i < 600; i++) { const h = P.hp; __G.sim(1 / 60, 1); if (P.hp < h) hits++; P.hp = X.maxHP(); if (P.st !== 'move') { P.st = 'move'; P.t = 0; P.rag.ang = 0 } } IN.mz = 0; out.walk = hits;
    // 5) dash through a goblin swing = no damage
    reset(); g = gob(P.x, P.z + 1.6); g.st = 'strike'; g.t = 0; g.lv = 4; g.hitDone = false; g.peril = 0; g.yaw = Math.PI; const hd = P.hp; __G.press('dodge'); __G.sim(1 / 60, 1); __G.sim(1 / 60, 20); out.dodgeHit = hd - P.hp;
    // 6) guard: light blocked, heavy breaks
    reset(); g = gob(P.x, P.z + 2); g.st = 'guard'; g.t = 0; g.yaw = Math.PI; const g0 = g.hp; X.foeHurt(g, 30, 0, 1, 'light0'); out.guardLight = g0 - g.hp; out.blockedAt = g.blockedAt === __G.GT.clock; g.st = 'guard'; g.t = 0; X.foeHurt(g, 30, 0, 1, 'heavy'); out.guardHeavy = g.st;
    // 7) 危 lunge goes through a block
    reset(); g = gob(P.x, P.z + 1.4); g.yaw = Math.PI; P.st = 'block'; IN.blockHeld = true; g.peril = 1; g.st = 'strike'; g.t = 0; g.lv = 0; g.hitDone = false; const hb = P.hp; __G.sim(1 / 60, 14); IN.blockHeld = false; out.peril = { lost: +(hb - P.hp).toFixed(1), st: P.st };
    // 8) archers: many shots at a standing target hit well under half
    reset(); let hitN = 0; const N = 200; for (let i = 0; i < N; i++) { const to = X.archerAimPoint ? X.archerAimPoint(10, [P.x, P.z]) : null; if (!to) break; if (Math.hypot(to[0] - P.x, to[2] - P.z) < .45 && to[1] > P.y + .1 && to[1] < P.y + 1.8) hitN++ } out.archerRate = hitN / N;
    // 9) standoff: success chain and failure when pressing early
    reset(20, 290); const a = gob(P.x + 1, P.z + 10), b = gob(P.x - 1, P.z + 11), c = gob(P.x + 2, P.z + 12); for (const o of [a, b, c]) { o.group = 'soT'; o.st = 'idle'; o.aware = 0 }
    const T = X.standoffTarget(); out.soPrompt = !!T && T.grp.length;
    X.startStandoff(T); let kills = 0, guard = 0; while (X.SO.on && guard++ < 3000) { __G.sim(1 / 60, 1); if (X.SO.phase === 'charge' && Math.hypot(X.SO.lead.x - P.x, X.SO.lead.z - P.z) < 3) __G.press('atk'); P.hp = X.maxHP() } kills = [a, b, c].filter(o => o.dead).length; out.so = { kills, n: X.SO.n };
    reset(20, 290); const d1 = gob(P.x + 1, P.z + 10), d2 = gob(P.x - 1, P.z + 11); for (const o of [d1, d2]) { o.group = 'soF'; o.st = 'idle'; o.aware = 0 } X.startStandoff(); __G.sim(1 / 60, 30); const hf = P.hp; __G.press('atk'); __G.sim(1 / 60, 3); out.soFail = { on: X.SO.on, lost: +(hf - P.hp).toFixed(1), hostile: d1.hostile() };
    return out });
  log('atılma hızlı ve uzun (≥3 m), takla yok, ileri', R.dash.dist >= 3 && R.dash.dir > 2.5 && R.dash.spin === 0 && R.dash.inv > .3, JSON.stringify(R.dash));
  log('atılma zincirlenir', R.chain);
  log('atılmadan saldırı = hamle (runatk)', R.dashAtk === 'runatk', R.dashAtk);
  log('goblin kahramanın içine girmiyor ve yakında vurmaya devam ediyor', R.close.minD > .65 && R.close.hits >= 5, JSON.stringify(R.close));
  log('yürüyerek goblinden kaçılmıyor', R.walk >= 4, R.walk);
  log('atılma goblin vuruşundan korur', R.dodgeHit === 0, R.dodgeHit);
  log('siper: hafif vuruş bloklanır, ağır kırar', R.guardLight === 0 && R.blockedAt && R.guardHeavy === 'stagger', JSON.stringify([R.guardLight, R.blockedAt, R.guardHeavy]));
  log('危 hamlesi bloğu deler', R.peril.lost > 0, JSON.stringify(R.peril));
  log('okçu isabeti yarının altında', R.archerRate > .15 && R.archerRate < .5, R.archerRate);
  log('KAFA KAFAYA: istem görünür, doğru anda basınca zincirle öldürür', R.soPrompt >= 3 && R.so.kills >= 2, JSON.stringify([R.soPrompt, R.so]));
  log('KAFA KAFAYA: erken basınca ağır yara ve kavga başlar', !R.soFail.on && R.soFail.lost > 0 && R.soFail.hostile, JSON.stringify(R.soFail));
  await G(() => { __G.GT.paused = false });
};
