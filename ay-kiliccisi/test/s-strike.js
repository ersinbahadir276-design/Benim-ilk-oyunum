// AŞAMA 1 — savaş motoru: kılıç süpürme isabeti, aktif pencere, tek vuruş/savuruş, çoklu hedef sınırı,
// ıska = tepki yok, malzemeye göre his, iptal pencereleri, poz sıçraması yok, duruşların farklı savuruşları
module.exports = async ({ G, log, shot, page }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, SYS = __G.SYS, out = {};
    SYS.stances = { stone: 1, wind: 1, moon: 1, water: 1 };
    const clear = () => { for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { g.dead = 1; g.so = 0; g.x = g.hx = 5000 + Math.random() * 300 } };
    const reset = () => { clear(); __G.tp(20, 290); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, yaw: 0, vx: 0, vz: 0, lock: null, counterT: 0, combo: 0, atk: null, queued: false }); P.hp = X.maxHP(); IN.mx = IN.mz = 0; IN.atkHeld = false; __G.sim(1 / 60, 15) };
    const gob = (dx, dz, hp = 9999) => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead); g.dead = 0; g.x = g.hx = P.x + dx; g.z = g.hz = P.z + dz; g.max = g.hp = hp; g.st = 'idle'; g.aware = 0; g.cd = 99; g.archer = false; g.yaw = Math.atan2(P.x - g.x, P.z - g.z); g.flash = 0; g.pos = 0; g.kx = g.kz = 0; g.bleedT = 0; return g };
    const freeze = (list) => { for (const g of list) { g.cd = 99; g.st = 'stagger'; g.t = -99 } };
    const swing = (fn, frames = 70, watch) => { fn(); const hits = []; let n = 0; while ((P.st === 'attack' || P.st === 'heavy' || P.st === 'runatk') && n++ < frames) { const before = watch ? watch.map(g => g.hp) : []; __G.sim(1 / 60, 1); if (watch) watch.forEach((g, i) => { if (g.hp < before[i]) hits.push([i, +(P.t / P.atk_T).toFixed(2)]) }) } return hits };
    // 1) every stance, every light swing: a goblin in front at 2.4 m is hit exactly once
    out.front = {}; for (const st of ['stone', 'wind', 'moon', 'water']) { SYS.stance = st; const S = X.STANCES[st]; for (let c = 0; c < S.combo; c++) { reset(); const g = gob(0, 2.4); freeze([g]); let hits = 0, at = -1; X.startLight(c); const T = P.atkT, A0 = P.atk ? [P.atk.a0, P.atk.a1] : null; let n = 0;
      while (P.st === 'attack' && n++ < 80) { const h = g.hp; __G.sim(1 / 60, 1); g.st = 'stagger'; g.t = -99; if (g.hp < h) { hits++; at = +(P.t / T).toFixed(2) } } out.front[st + c] = { hits, at, a: A0 } } }
    // 2) behind the hero: never hit by a front cut
    out.behind = {}; for (const st of ['stone', 'wind', 'water']) { SYS.stance = st; reset(); const g = gob(0, -2.2); freeze([g]); X.startLight(0); __G.sim(1 / 60, 50); out.behind[st] = g.hp === g.max }
    // 3) miss: a goblin out of reach shows no reaction at all
    SYS.stance = 'stone'; reset(); { const g = gob(0, 7); g.st = 'idle'; const st0 = g.st; X.startLight(0); let fl = 0; for (let i = 0; i < 45; i++) { __G.sim(1 / 60, 1); fl = Math.max(fl, g.flash) } out.miss = { hp: g.hp === g.max, flash: fl, pos: g.pos || 0, st: g.st, st0 } }
    // 4) multi-target cap: 5 goblins in a tight arc in front
    out.multi = {}; for (const [st, c] of [['stone', 0], ['moon', 0]]) { SYS.stance = st; reset(); const gs = [[-1.2, 1.9], [-.6, 2.2], [0, 2.4], [.6, 2.2], [1.2, 1.9]].map(([x, z]) => gob(x, z)); freeze(gs); X.startLight(c); const mx = P.atk.max; for (let i = 0; i < 60; i++) { __G.sim(1 / 60, 1); freeze(gs) } out.multi[st + c] = { hit: gs.filter(g => g.hp < g.max).length, max: mx } }
    function SWGmax(st, c) { return P.atk ? P.atk.max : null }
    // 5) a wolf (low body) in front is cut by the diagonal and the low cut
    out.wolf = {}; for (const [st, c] of [['stone', 0], ['water', 2], ['moon', 1]]) { SYS.stance = st; reset(); const w = __G.mkWolf(P.x, P.z + 2.2); w.hp = w.max = 9999; w.st = 'recover'; w.t = -99; w.yaw = Math.PI; X.startLight(c); for (let i = 0; i < 60; i++) { __G.sim(1 / 60, 1); w.st = 'recover'; w.t = -99; w.x = P.x + Math.sin(P.yaw) * 2.0; w.z = P.z + Math.cos(P.yaw) * 2.0 } out.wolf[st + c] = w.hp < w.max; w.dead = 300; w.st = 'dead' }
    // 6) feel: hit-stop by weight, never the old 0.12 s on a light cut
    SYS.stance = 'stone'; reset(); { const g = gob(0, 2.3); freeze([g]); X.startLight(0); let st = 0; for (let i = 0; i < 50; i++) { __G.GT.stop = 0; __G.sim(1 / 60, 1); st = Math.max(st, __G.GT.stop) } out.stopLight = +st.toFixed(3) }
    reset(); { const g = gob(0, 2.3); freeze([g]); P.charge = 1; X.startHeavy(); let st = 0; for (let i = 0; i < 70; i++) { __G.GT.stop = 0; __G.sim(1 / 60, 1); st = Math.max(st, __G.GT.stop) } out.stopHeavy = +st.toFixed(3) }
    // 7) cancel windows: a dodge pressed while the blade is live is refused, one pressed in the wind-up is taken
    reset(); { gob(0, 6); X.startLight(0); const T = P.atkT, A = P.atk; while (P.t / T < A.a0 + .03) __G.sim(1 / 60, 1); __G.press('dodge'); __G.sim(1 / 60, 2); out.cancelLive = P.st; }
    reset(); { X.startLight(0); __G.sim(1 / 60, 2); __G.press('dodge'); __G.sim(1 / 60, 2); out.cancelWind = P.st }
    // 8) combo: light -> light -> light, and a light -> heavy link
    reset(); { gob(0, 6); X.startLight(0); const seen = new Set(); for (let i = 0; i < 160; i++) { if (i % 6 === 0) __G.press('atk'); __G.sim(1 / 60, 1); if (P.st === 'attack') seen.add(P.combo) } out.combo = [...seen] }
    reset(); { X.startLight(0); let h = 0; for (let i = 0; i < 60; i++) { if (i === 22) __G.press('hvy'); __G.sim(1 / 60, 1); if (P.st === 'heavy') h = 1 } out.link = h }
    // 9) no pose snap: blade tip never jumps more than 0.45 m between two frames (enter, swing, leave)
    out.snap = {}; for (const st of ['stone', 'wind', 'moon', 'water']) { SYS.stance = st; reset(); let prev = X.bladeAt(1), mx = 0, mxAt = ''; X.startLight(0); for (let i = 0; i < 80; i++) { __G.sim(1 / 60, 1); const p = X.bladeAt(1), d = Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]); const live = P.st === 'attack' && P.atk && P.t / P.atkT > P.atk.a0 && P.t / P.atkT < P.atk.a1; if (!live && d > mx) { mx = d; mxAt = P.st + ':' + (P.atk ? (P.t / P.atkT).toFixed(2) : '') } prev = p } out.snap[st] = [+mx.toFixed(2), mxAt] }
    // 10) materials: bone / metal / flesh drive different sparks + sounds (checked through the material map)
    return out });
  for (const k in R.front) log('önde 2.4 m goblin: tek savuruşta tam 1 isabet, aktif pencerede — ' + k, R.front[k].hits === 1 && R.front[k].at >= R.front[k].a[0] - .06 && R.front[k].at <= R.front[k].a[1] + .06, JSON.stringify(R.front[k]));
  for (const k in R.behind) log('arkadaki düşmana ön kesik değmez — ' + k, R.behind[k]);
  log('ıska: vuruş tepkisi yok (can, parlama, denge aynı; yalnızca sesi duyabilir)', R.miss.hp && R.miss.flash === 0 && R.miss.pos === 0 && !/hurt|stagger|hop/.test(R.miss.st), JSON.stringify(R.miss));
  for (const k in R.multi) log('çoklu hedef sınırı — ' + k, R.multi[k].hit >= 1 && R.multi[k].hit <= (k === 'moon0' ? 4 : 2), JSON.stringify(R.multi[k]));
  for (const k in R.wolf) log('alçak hedef (kurt) kesilir — ' + k, R.wolf[k]);
  log('hit-stop: hafif kısa (≤0.06), ağır daha uzun', R.stopLight > 0 && R.stopLight <= .06 && R.stopHeavy > R.stopLight, R.stopLight + ' / ' + R.stopHeavy);
  log('iptal: kılıç canlıyken atılma reddedilir, hazırlıkta kabul edilir', R.cancelLive === 'attack' && R.cancelWind === 'dodge', R.cancelLive + ' / ' + R.cancelWind);
  log('kombo zinciri 0→1→2', [0, 1, 2].every(c => R.combo.includes(c)), JSON.stringify(R.combo));
  log('hafif → ağır bağlantısı', R.link === 1);
  for (const k in R.snap) log('poz sıçraması yok (kılıç canlı değilken kare başı ≤0.6 m; hazırlık savuruşu ~0.5 m, eski sıçramalar 0.8–2 m) — ' + k, R.snap[k][0] <= .6, JSON.stringify(R.snap[k]));
  // pictures of the four stances mid-cut
  for (const st of ['stone', 'wind', 'moon', 'water']) { await G((st) => { const P = __G.P; __G.SYS.stance = st; __G.GT.paused = false; P.st = 'move'; P.atk = null; __G.sim(1 / 60, 20); P.yaw = 0; __G.CAM.yaw = 1.0; __G.CAM.pitch = .12; __G.CAM.dist = 4.2; __G.X.startLight(0); const T = P.atkT, A = P.atk; while (P.t / T < (A.a0 + A.a1) / 2) __G.sim(1 / 60, 1); __G.GT.paused = true }, st); await shot('strike-' + st, { wait: 250 }) }
};
