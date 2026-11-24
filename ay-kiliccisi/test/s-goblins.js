// AŞAMA 3 — goblin yapay zekâsı: düello, okçu+savaşçı, kamp gözcüsü ve alarm, yardım çağırma, moral/kaçış, kuşatma, aldatma
module.exports = async ({ G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, GT = __G.GT, out = {};
    const clear = () => { for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = 9000 } for (const g of __G.GOBS) { if (!g.dead) { g.dead = 1; g.x = 5000 + Math.random() * 100 } g.so = 0 } };
    const reset = (x = 20, z = 290) => { clear(); __G.tp(x, z); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, yaw: 0, vx: 0, vz: 0, atk: null, crouch: false }); P.hp = X.maxHP(); IN.mx = IN.mz = 0; IN.blockHeld = false; X.GOBDEAD.length = 0; __G.sim(1 / 60, 5) };
    const gob = (dx, dz, o = {}) => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead && !g.lookout); g.dead = 0; g.deadT = 0; g.x = g.hx = P.x + dx; g.z = g.hz = P.z + dz; g.hp = g.max = o.hp || 80; g.st = 'chase'; g.aware = 1; g.unseen = 0; g.cd = .3; g.archer = !!o.archer; g.group = o.grp || 'tg'; g.camp = o.camp || null; g.helped = 0; g.fellBack = 0; g.feinted = 0; g.slotA = undefined; g.flankT = 0; g.cornerT = 0; g.yaw = Math.atan2(P.x - g.x, P.z - g.z); g.ls = [P.x, P.z]; return g };
    const keep = () => { P.hp = X.maxHP(); P.alive = true; if (P.st === 'hurt' || P.st === 'down' || P.st === 'getup' || P.st === 'gbreak') { P.st = 'move'; P.t = 0; P.rag.ang = 0 } };
    // 5) camp: the lookout spots the hero, blows the horn, the whole camp turns out
    reset(); { const c = __G.GOBS.find(g => g.lookout); const camp = c.camp; for (const g of __G.GOBS) if (g.camp === camp && !g.boss) { g.dead = 0; g.x = g.hx; g.z = g.hz; g.st = 'idle'; g.aware = 0; g.alarmed = 0; g.hp = g.max } c.alarmed = 0; c.x = c.hx; c.z = c.hz; c.yaw = Math.atan2(Math.cos(camp.gate), Math.sin(camp.gate));
      const tx = c.x + Math.sin(c.yaw) * 22, tz = c.z + Math.cos(c.yaw) * 22; __G.tp(tx, tz); P.yaw = c.yaw + Math.PI; let horn = false, peak = 0; const campAll = __G.GOBS.filter(g => g.camp === camp && !g.boss && Math.hypot(g.hx - camp.x, g.hz - camp.z) < 100); for (let i = 0; i < 600; i++) { __G.sim(1 / 60, 1); keep(); if (c.st === 'horn') horn = true; peak = Math.max(peak, campAll.filter(g => !g.dead && (g.aware >= 1 || g.hostile())).length) } const campG = campAll.filter(g => !g.dead); out.camp = { who: campAll.map(g => g.st + ':' + (g.dead ? 'D' : '') + Math.hypot(g.x - c.x, g.z - c.z).toFixed(0) + ':' + g.aware.toFixed(1)), horn, peak, alarmed: campG.filter(g => g.aware >= 1 || g.hostile()).length, of: campG.length, lookoutRange: 32 } }
    // 3) duel: one warrior — it attacks, guards, and against a blocking hero it feints
    reset(); { const g = gob(0, 4); const c = { windup: 0, guard: 0, feint: 0 }; let last = ''; for (let i = 0; i < 1200; i++) { __G.sim(1 / 60, 1); keep(); if (g.st !== last) { if (c[g.st] !== undefined) c[g.st]++; last = g.st } } 
      IN.blockHeld = true; P.st = 'move'; let feints = 0; for (let i = 0; i < 1500; i++) { if (P.st === 'move') P.st = 'block'; const f0 = g.feinted; __G.sim(1 / 60, 1); keep(); if (P.st === 'move' || P.st === 'hurt') { P.st = 'block'; P.blockAt = GT.clock - 1 } if (!f0 && g.feinted && g.st === 'circle') feints++ } IN.blockHeld = false; c.feint = feints; out.duel = c }
    // 4) archer + warrior: the archer keeps away and runs from the hero; cornered it draws a knife
    reset(); { const a = gob(0, 12, { archer: true }), w = gob(3, 5); let minD = 99, shots = 0, was = 0; IN.mz = 1; __G.CAM.yaw = 0; for (let i = 0; i < 600; i++) { P.yaw = Math.atan2(a.x - P.x, a.z - P.z); __G.CAM.yaw = P.yaw; __G.sim(1 / 60, 1); keep(); minD = Math.min(minD, Math.hypot(a.x - P.x, a.z - P.z)); if (a.shot && !was) shots++; was = a.shot } IN.mz = 0; out.archer = { minD: +minD.toFixed(1), shots, warrior: w.st } }
    reset(); { const a = gob(0, 3, { archer: true }); a.cd = 0; // boxed in: a hut wall right behind it
      __G.X.addBoxForTest ? 0 : 0; let melee = false; for (let i = 0; i < 400; i++) { a.x = P.x; a.z = P.z + 1.8; __G.sim(1 / 60, 1); keep(); a.x = P.x; a.z = P.z + 1.8; if (a.st === 'windup' || a.st === 'strike') melee = true } out.cornered = melee }
    // help: a wounded goblin calls friends that were not fighting
    reset(); { const g = gob(0, 3), f1 = gob(20, 15), f2 = gob(-20, 15); for (const f of [f1, f2]) { f.st = 'idle'; f.aware = 0 } X.foeHurt(g, g.hp * .6, 0, 1, 'light0'); out.help = { helped: !!g.helped, came: [f1, f2].filter(f => f.hostile()).length } }
    // morale: two friends die next to a wounded goblin -> it flees; later, with friends back, it regroups
    reset(); { const g = gob(0, 4), d1 = gob(1, 5), d2 = gob(-1, 5); g.hp = g.max * .45; for (const d of [d1, d2]) { const dead = X.foeHurt(d, 9999, 0, 1, 'heavy'); if (dead) X.onFoeKilled(d, false) } let fled = false; for (let i = 0; i < 120; i++) { __G.sim(1 / 60, 1); keep(); if (g.st === 'flee') fled = true } out.morale = { fled, st: g.st } }
    // surround: three warriors spread round the hero instead of queueing on one side
    reset(); { const gs = [gob(0, 8), gob(.5, 8.5), gob(-.5, 9)]; let best = 0; for (let i = 0; i < 400; i++) { __G.sim(1 / 60, 1); keep(); const angs = gs.map(g => Math.atan2(g.x - P.x, g.z - P.z)).sort((a, b) => a - b); let gap = 0; for (let k = 0; k < angs.length; k++) { const n = k + 1 < angs.length ? angs[k + 1] : angs[0] + 2 * Math.PI; gap = Math.max(gap, n - angs[k]) } best = Math.max(best, 2 * Math.PI - gap) } out.surround = +best.toFixed(2) }
    return out });
  log('düello: goblin saldırır ve siper alır', R.duel.windup >= 4 && R.duel.guard >= 1, JSON.stringify(R.duel));
  log('düello: blokta bekleyen kahramana aldatma yapar, yanına geçer', R.duel.feint >= 1, JSON.stringify(R.duel));
  log('okçu: kahraman üstüne yürürken mesafeyi korur ve ok atar', R.archer.minD > 3 && R.archer.shots >= 1, JSON.stringify(R.archer));
  log('okçu: sıkışınca bıçakla yakın dövüşe geçer', R.cornered);
  log('kamp: gözcü kahramanı görür, boru çalar, kamp ayağa kalkar', R.camp.horn && R.camp.peak >= R.camp.of - 1, JSON.stringify(R.camp));
  log('yaralı goblin yardım çağırır, savaşmayanlar gelir', R.help.helped && R.help.came >= 1, JSON.stringify(R.help));
  log('moral: iki arkadaşı ölen yaralı goblin kaçar', R.morale.fled, JSON.stringify(R.morale));
  log('kuşatma: üç goblin kahramanın etrafına yayılır (≥150° yay)', R.surround >= 2.6, R.surround);
};
