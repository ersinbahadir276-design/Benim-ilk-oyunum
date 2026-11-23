// v22 — goblin seviye hatası, kaçan yaralı kurt, tekme, siper karşılığı, yakala-fırlat
module.exports = async ({ G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, out = {};
    const clear = () => { for (const w of __G.wolves) { if (w.boss) continue; w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { if (!g.dead) { g.dead = 1; g.x = 5000 + Math.random() * 100 } g.so = 0 } };
    const reset = (x = 20, z = 290) => { clear(); __G.tp(x, z); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, yaw: 0, vx: 0, vz: 0, pinBy: null, atk: null, crouch: false, slowT: 0, blindT: 0, held: 0, gcT: 0 }); P.hp = X.maxHP(); IN.mx = IN.mz = 0; IN.blockHeld = false; __G.sim(1 / 60, 5) };
    const gob = (dx, dz, st = 'chase') => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead && !g.lookout && !g.elite); g.dead = 0; g.deadT = 0; g.x = g.hx = P.x + dx; g.z = g.hz = P.z + dz; g.hp = g.max = 150; g.lv = 5; g.st = st; g.t = 0; g.aware = 1; g.unseen = 0; g.cd = 9; g.archer = false; g.feigned = 1; g.group = 'tv'; g.camp = null; g.yaw = Math.atan2(P.x - g.x, P.z - g.z); g.ls = [P.x, P.z]; g.dirtCd = g.tkCd = 1e9; return g };
    const run = (n, f) => { for (let i = 0; i < n; i++) { __G.sim(1 / 60, 1); P.hp = Math.max(P.hp, 60); if (f && f(i) === false) break } };
    // 1) level stays the level after goblins swing (it used to be overwritten by the lunge speed: "Sv.2.847284…")
    reset(); { const g = gob(0, 2.5); g.cd = 0; g.dirtCd = g.tkCd = 1e9; const lv0 = g.lv; let strikes = 0; run(600, () => { if (g.st === 'strike') strikes++; P.hp = X.maxHP() }); out.lv = { lv0, lv: g.lv, int: Number.isInteger(g.lv), strikes } }
    // 2) a badly wounded wolf flees but limps: a sprinting hero catches it, it turns and fights, it does not forget
    reset(); { const w = __G.mkWolf(P.x, P.z + 4); w.hp = 50; w.max = 180; w.aware = 1; w.st = 'flee'; w.t = 0; w.pack = null; w.yaw = 0; IN.mz = 1; __G.CAM.yaw = 0; P.sprintHeld = true; let caught = false, forgot = false, minD = 99, fought = false;
      run(600, () => { P.sta = 100; P.yaw = Math.atan2(w.x - P.x, w.z - P.z); __G.CAM.yaw = P.yaw; const d = Math.hypot(w.x - P.x, w.z - P.z); minD = Math.min(minD, d); if (d < 2.5) caught = true; if (w.st === 'return' || w.aware < .5) forgot = true; if (/^(bitewind|rush|bite)$/.test(w.st)) fought = true; if (P.st !== 'move') { P.st = 'move'; P.rag.ang = 0 } });
      IN.mz = 0; P.sprintHeld = false; out.flee = { caught, minD: +minD.toFixed(1), fought, forgot }; w.dead = 300; w.st = 'dead' }
    // 3) kick: a guarding goblin's guard breaks
    reset(); { const g = gob(0, 1.6, 'guard'); g.yaw = Math.PI; P.yaw = 0; IN.blockHeld = true; run(4); __G.press('atk'); let kicked = false; run(40, () => { if (P.st === 'kick') kicked = true; if (g.st === 'guard') g.t = 0 }); IN.blockHeld = false; out.kick = { kicked, gob: g.st, pos: +(g.pos || 0).toFixed(0) } }
    // 4) guard counter: block a goblin blow, then △ inside 0.7 s = fast heavy counter
    reset(); { const g = gob(0, 1.5); g.yaw = Math.PI; P.yaw = 0; IN.blockHeld = true; run(3); P.blockAt = -9; X.hitPlayer ? 0 : 0; const r = __G.X.hitPlayerTest ? 0 : 0; g.st = 'windup'; g.t = .5; g.peril = 0; g.cn = 0; g.delay = 0; g.hitDone = false; g.cd = 9; g.feinted = 1; let blocked = false; run(40, () => { if (P.gcT > __G.GT.clock && !blocked) { blocked = true; return false } }); const hp0 = g.hp; __G.press('hvy'); let heavy = false; run(80, () => { if (P.st === 'heavy') heavy = true }); IN.blockHeld = false; out.gc = { blocked, heavy, dmg: hp0 - g.hp } }
    // 5) grab and throw: a staggered goblin is hurled into another, who goes down
    reset(); { const a = gob(0, 1.4, 'stagger'), b = gob(.3, 7, 'chase'); b.cd = 9; P.yaw = 0; const can = !!X.throwTarget(); const ok = X.startThrow(); let flew = 0, bDown = false, x0 = a.z; run(90, () => { flew = Math.max(flew, a.z - x0); if (b.st === 'sprawl' || b.st === 'escape') bDown = true; if (a.st === 'stagger') a.t = 0 }); out.thr = { can, ok, flew: +flew.toFixed(1), bDown, aHurt: a.hp < a.max } }
    return out });
  log('HATA: goblin seviyesi saldırıdan sonra bozulmuyor (eskiden atılma hızı yazılıyordu)', R.lv.int && R.lv.lv === R.lv.lv0 && R.lv.strikes > 0, JSON.stringify(R.lv));
  log('yaralı kurt topallayarak kaçıyor: koşan kahraman yetişiyor, kurt dönüp savaşıyor, unutmuyor', R.flee.caught && R.flee.fought && !R.flee.forgot, JSON.stringify(R.flee));
  log('TEKME: siperdeki goblinin siperi kırılıyor', R.kick.kicked && R.kick.gob === 'stagger', JSON.stringify(R.kick));
  log('SİPER KARŞILIĞI: blok sonrası △ = hızlı ağır karşılık, hasar veriyor', R.gc.blocked && R.gc.heavy && R.gc.dmg > 0, JSON.stringify(R.gc));
  log('YAKALA-FIRLAT: sendeleyen goblin fırlatılıyor, çarptığı goblin devriliyor', R.thr.can && R.thr.ok && R.thr.flew > 3 && R.thr.bDown && R.thr.aHurt, JSON.stringify(R.thr));
};
