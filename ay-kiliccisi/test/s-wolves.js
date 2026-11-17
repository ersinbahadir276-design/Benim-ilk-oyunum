// AŞAMA 3 — kurt yapay zekâsı: tek kurt, 3'lü sürü, korku/kaçış, sürü yaşamı, koku, gözetleme, yürüyerek kaçamama
module.exports = async ({ G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, GT = __G.GT, out = {};
    const away = () => { for (const w of __G.wolves) { if (w.boss) continue; w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { g.dead = 1; g.x = g.hx = 5000 } };
    const reset = (x = 20, z = 300) => { away(); __G.tp(x, z); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, yaw: 0, vx: 0, vz: 0, pinBy: null, atk: null }); P.hp = X.maxHP(); IN.mx = IN.mz = 0; X.WKILL.length = 0; __G.sim(1 / 60, 5) };
    const wolf = (dx, dz, o = {}) => { const w = __G.mkWolf(P.x + dx, P.z + dz, o); w.hp = w.max = o.hp || 105; w.aware = 1; w.st = 'stalk'; w.t = 0; w.ls = [P.x, P.z]; w.unseen = 0; w.cd = .5; w.calm = 0; w.bold = o.bold || .65; w.yaw = Math.atan2(P.x - w.x, P.z - w.z); return w };
    const keep = () => { P.hp = X.maxHP(); P.alive = true; if (P.pinBy) { const w = P.pinBy; P.pinBy = null; w.st = 'recover'; w.t = 0 } if (P.st !== 'move') { P.st = 'move'; P.t = 0; P.rag.ang = 0 } };
    // 1) one wolf, 25 s, standing still
    reset(); { const w = wolf(0, 14); const c = { bite: 0, pounce: 0, retreat: 0, circle: 0, stalk: 0 }; let last = ''; for (let i = 0; i < 1500; i++) { __G.sim(1 / 60, 1); keep(); if (w.st !== last) { if (c[w.st] !== undefined) c[w.st]++; last = w.st } } out.one = c; w.dead = 300; w.st = 'dead' }
    // 2) a pack of three: one attacker at a time, they work round to the flanks
    reset(); { const ws = [wolf(-6, 12), wolf(0, 14), wolf(6, 12)]; const pk = { id: 99, den: [P.x, P.z + 40], mem: ws, lead: ws[1], mode: 'hunt', t: 9 }; ws.forEach((w, i) => { w.pack = pk; w.slot = i }); let maxAtk = 0, flank = 0, bites = 0, last = ws.map(w => w.st);
      for (let i = 0; i < 1500; i++) { __G.sim(1 / 60, 1); keep(); const atk = ws.filter(w => /^(bitewind|rush|bite|windup|pounce|pin)$/.test(w.st)).length; maxAtk = Math.max(maxAtk, atk); for (const w of ws) if (Math.abs(__G.X.angd ? 0 : 0) === 0 && Math.abs(Math.atan2(w.x - P.x, w.z - P.z) - P.yaw) % (2 * Math.PI) > 2.0 && Math.abs(Math.atan2(w.x - P.x, w.z - P.z) - P.yaw) % (2 * Math.PI) < 4.3) flank++; ws.forEach((w, k) => { if (w.st === 'bite' && last[k] !== 'bite') bites++; last[k] = w.st }) }
      out.pack = { maxAtk, flankFrames: flank, bites }; ws.forEach(w => { w.dead = 300; w.st = 'dead' }) }
    // 3) a badly wounded wolf flees to its den
    reset(); { const w = wolf(0, 6); w.hp = w.max * .25; const pk = { id: 98, den: [P.x + 40, P.z + 40], mem: [w], lead: w, mode: 'hunt', t: 9 }; w.pack = pk; w.st = 'circle'; let fled = false; for (let i = 0; i < 240; i++) { __G.sim(1 / 60, 1); keep(); if (w.st === 'flee') fled = true } out.flee = { fled, d: +Math.hypot(w.x - P.x, w.z - P.z).toFixed(1) }; w.dead = 300; w.st = 'dead' }
    // 4) the hero just killed two wolves: the last one loses heart (retreat / watch / flee)
    reset(); { const ws = [wolf(-3, 8), wolf(3, 8), wolf(0, 10, { bold: .5 })]; const pk = { id: 97, den: [P.x, P.z + 50], mem: ws, lead: ws[2], mode: 'hunt', t: 9 }; ws.forEach((w, i) => { w.pack = pk; w.slot = i }); for (const k of [0, 1]) { const dead = __G.X.foeHurt(ws[k], 9999, 0, 1, 'heavy'); if (dead) __G.X.onFoeKilled(ws[k], false) } let lost = false; for (let i = 0; i < 300; i++) { __G.sim(1 / 60, 1); keep(); if (/^(retreat|watch|flee|return)$/.test(ws[2].st)) lost = true } out.morale = { lost, st: ws[2].st }; ws.forEach(w => { w.dead = 300; w.st = 'dead' }) }
    // 5) pack life: far from the hero, the pack rests at its den or roams behind the leader
    reset(); { const pk = X.PACKS.find(p => p.mem.length >= 3 && !p.mem.some(w => w.boss)); const out5 = { found: !!pk }; if (pk) { pk.mem.forEach((w, i) => { w.dead = 0; w.st = 'idle'; w.aware = 0; w.calm = 0; w.x = w.hx = pk.den[0] + i * 1.5; w.z = w.hz = pk.den[1] + 1; w.hp = w.max }); __G.tp(pk.den[0] + 150, pk.den[1]); pk.mode = 'roam'; pk.t = 30; pk.tgt = X.packRoamTarget(pk); for (let i = 0; i < 600; i++) { __G.sim(1 / 60, 1); pk.t = 30; for (const w of pk.mem) X.updateWolf(w, P, 1 / 60, X.GS) } const L = pk.lead; out5.follow = pk.mem.filter(w => w !== L && !w.dead && Math.hypot(w.x - L.x, w.z - L.z) < 9).length; out5.mem = pk.mem.length; out5.states = pk.mem.map(w => w.st);
      pk.mode = 'rest'; pk.t = 30; for (let i = 0; i < 1500; i++) { pk.t = 30; for (const w of pk.mem) X.updateWolf(w, P, 1 / 60, X.GS) } out5.rest = pk.mem.filter(w => w.st === 'rest').length; out5.restInfo = pk.mem.map(w => w.st + ':' + Math.hypot(w.x - pk.den[0], w.z - pk.den[1]).toFixed(1) + ':' + pk.mode) } out.packLife = out5 }
    // 6) scent: an unseen hero 8 m behind a wolf is smelled; crouching he is not
    const smell = (crouch) => { reset(); const w = __G.mkWolf(P.x, P.z + 8); w.yaw = 0; w.st = 'idle'; w.aware = 0; w.calm = 0; w.pack = null; P.crouch = crouch; for (let i = 0; i < 300; i++) { __G.sim(1 / 60, 1); w.yaw = 0; w.hyaw = 0 } const a = w.aware; P.crouch = false; w.dead = 300; w.st = 'dead'; return +a.toFixed(2) };
    out.scent = { open: smell(false), crouch: smell(true) };
    // 7) walking away from a wolf does not shake it off
    reset(); { const w = wolf(0, 9); w.st = 'circle'; let hits = 0; IN.mz = -1; __G.CAM.yaw = 0; for (let i = 0; i < 900; i++) { const h = P.hp; __G.sim(1 / 60, 1); if (P.hp < h || P.pinBy) hits++; keep() } IN.mz = 0; out.walk = { hits, d: +Math.hypot(w.x - P.x, w.z - P.z).toFixed(1) }; w.dead = 300; w.st = 'dead' }
    return out });
  log('tek kurt: temel saldırı ısırma, sıçrama nadir (ısırmanın yarısından az)', R.one.bite >= 3 && R.one.pounce * 2 <= R.one.bite, JSON.stringify(R.one));
  log('tek kurt: ısırdıktan sonra geri çekilir, çevresinde döner', R.one.retreat >= R.one.bite - 1 && R.one.circle >= 2, JSON.stringify(R.one));
  log('sürü: aynı anda en fazla 1 saldıran', R.pack.maxAtk <= 1, JSON.stringify(R.pack));
  log('sürü: kahramanın yanına/arkasına dolanır ve ısırır', R.pack.flankFrames > 60 && R.pack.bites >= 2, JSON.stringify(R.pack));
  log('ağır yaralı kurt yuvasına kaçar', R.flee.fled, JSON.stringify(R.flee));
  log('kahraman iki kurdu öldürünce sonuncusu cesaretini kaybeder', R.morale.lost, JSON.stringify(R.morale));
  log('sürü yaşamı: lider dolaşırken diğerleri arkasından gelir', R.packLife.found && R.packLife.follow >= R.packLife.mem - 2, JSON.stringify(R.packLife));
  log('sürü yaşamı: dinlenirken yuvada yatar', R.packLife.rest >= R.packLife.mem - 1, JSON.stringify(R.packLife));
  log('koku: arkasındaki kahramanı koklar, eğilen kahramanı koklamaz', R.scent.open >= .4 && R.scent.crouch < .1, JSON.stringify(R.scent));
  log('yürüyerek kurttan kaçılamaz (15 sn sonra hâlâ 10 m içinde ve vurmuş)', R.walk.d < 10 && R.walk.hits >= 1, JSON.stringify(R.walk));
};
