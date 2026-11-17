// Phase 1 combat core: stances, perfect dodge, chain parry, attack cancel, resolve heal, pinned-hit bug
module.exports = async ({ G, log }) => {
  const r = await G(() => { const g = __G, P = g.P, X = g.X, IN = g.IN, SYS = g.SYS, DT = 1 / 60; g.GT.paused = true; const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f && f() === false) break; } };
    const fresh = (x, z) => { g.tp(x, z); Object.assign(P, { st: 'move', t: 0, hp: X.maxHP(), sta: 100, guard: 100, inv: 0, pinBy: null, alive: true, air: false, yaw: 0, counterT: 0, rage: 0, berserk: 0 }); P.rag.ang = 0; IN.blockHeld = false; IN.atkHeld = false; for (const k in g.BUF) g.BUF[k] = -9; };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - x, a.z - z) < 60) { a.x += 400; a.hx = a.x; } };
    const o = {}; const T0 = [30, 420]; far(...T0);
    // unlocks
    SYS.stances = { stone: 1 }; SYS.stance = 'stone'; SYS.qk = 0; SYS.main = 0; SYS.ashmane = 0; SYS.chief = 0; X.checkStances(); o.start = Object.keys(SYS.stances).join(',');
    SYS.qk = 5; SYS.ashmane = 1; SYS.chief = 1; X.checkStances(); o.all = Object.keys(SYS.stances).length;
    // combo length and speed per stance: count hits by holding the attack queue
    const combo = (k) => { fresh(...T0); X.setStance(k); let hits = 0, last = -1, t0 = g.GT.clock; g.press('atk'); IN.atkEdge = true; sim(4, () => { if (P.st === 'attack') { if (P.combo !== last) { hits++; last = P.combo; } g.press('atk'); } else if (hits) return false; }); return [hits, +(g.GT.clock - t0).toFixed(2)]; };
    o.stone = combo('stone'); o.water = combo('water'); o.moon = combo('moon'); o.wind = combo('wind');
    // stance advantage: same hit, wolf, wind vs stone
    const post = (k) => { fresh(...T0); X.setStance(k); const w = g.wolves.find((x) => !x.dead && !x.boss && !x.tame); w.x = P.x; w.z = P.z + 1.5; w.hx = w.x; w.hz = w.z; w.hp = w.max = 9999; w.pos = 0; w.st = 'idle'; g.press('atk'); IN.atkEdge = true; sim(.5); const p = w.pos; w.x += 400; w.hx = w.x; return +p.toFixed(1); };
    o.postStone = post('stone'); o.postWind = post('wind');
    // perfect dodge: dodge 0.1 s before the blow
    fresh(...T0); X.setStance('stone'); const src = { x: P.x, z: P.z + 2, hp: 50, max: 50 }; g.press('dodge'); sim(.1); const st = P.st; const res = g.hitPlayer({ src, dmg: 20, knock: 'flinch' }); o.pd = [st, res, P.counterT > 1, g.GT.slow > 0];
    fresh(...T0); g.press('dodge'); sim(.3); const res2 = g.hitPlayer({ src, dmg: 20, knock: 'flinch' }); o.lateDodge = [res2, P.counterT > 0];
    // chain parry
    fresh(...T0); const gob = g.GOBS.find((x) => !x.dead && !x.big && !x.boss && !x.archer); gob.x = P.x; gob.z = P.z + 1.5; gob.hx = gob.x; gob.hz = gob.z; gob.hp = gob.max = 9999; gob.pos = 0; const pr = [];
    for (let k = 0; k < 2; k++) { IN.blockHeld = true; sim(.08); pr.push(g.hitPlayer({ src: gob, dmg: 10, guard: 20 })); IN.blockHeld = false; sim(.5); } o.chain = [pr.join(','), P.chain]; gob.x += 400; gob.hx = gob.x;
    // attack cancel into dodge during the wind-up
    fresh(...T0); g.press('atk'); IN.atkEdge = true; sim(.05); const a0 = P.st; g.press('dodge'); sim(.03); o.cancel = [a0, P.st];
    // resolve heal with no flasks
    fresh(...T0); SYS.flasks = 0; P.hp = 20; P.rage = 60; X.drinkFlask(); const ds = P.st; sim(1.3); o.heal = [ds, Math.round(P.hp), Math.round(P.rage)]; SYS.flasks = 3;
    // pinned by a wolf + arrow hit: stays pinned/down, no knockback, wolf lets go cleanly afterwards
    fresh(...T0); const w = g.wolves.find((x) => !x.dead && !x.boss && !x.tame && Math.hypot(x.x - P.x, x.z - P.z) > 100); w.x = P.x; w.z = P.z + 5.5; w.hx = w.x; w.hz = w.z; w.hp = w.max = 500; w.yaw = Math.PI; w.st = 'windup'; w.t = 0; w.dodged = false; w.resolved = false; w.pack = null; w.aware = 1; w.cd = 0; w.unseen = 0; w.sees = true; w.ls = [P.x, P.z];
    let pinned = false; sim(6, () => { P.hp = 200; if (P.pinBy) { pinned = true; return false; } }); const x0 = P.x, z0 = P.z; g.hitPlayer({ src: { x: P.x + 5, z: P.z }, dmg: 5, dir: [1, 0], knock: 'flinch', noPush: 1 }); const stAfter = P.st; sim(.3); const moved = Math.hypot(P.x - x0, P.z - z0);
    sim(8, () => { P.hp = 200; IN.mash = 1; if (P.st === 'move') return false; }); o.pin = { pinned, stAfter, moved: +moved.toFixed(2), end: P.st, pinBy: !!P.pinBy, ang: +P.rag.ang.toFixed(2), wolf: w.st };
    // arrow push on an upright player
    fresh(...T0); g.hitPlayer({ src: { x: P.x + 5, z: P.z }, dmg: 5, dir: [1, 0], knock: 'flinch', noPush: 1 }); sim(.4); o.arrowPush = +Math.hypot(P.x - T0[0], P.z - T0[1]).toFixed(2);
    return o; });
  const j = JSON.stringify(r);
  log('duruşlar: Taş ile başlar, ilerledikçe 4 duruş açılır', r.start === 'stone' && r.all === 4, j);
  log('duruşlar: kombo uzunluğu farklı (Taş 3, Su 4, Ay 2, Rüzgâr 3)', r.stone[0] === 3 && r.water[0] === 4 && r.moon[0] === 2 && r.wind[0] === 3, JSON.stringify([r.stone, r.water, r.moon, r.wind]));
  log('duruşlar: Su vuruş başına Ay\'dan çok daha hızlı', r.water[1] / 4 < r.moon[1] / 2 * 0.7, JSON.stringify([r.water, r.moon]));
  log('duruş avantajı: kurda Rüzgâr, Taş\'tan çok daha fazla denge hasarı', r.postWind > r.postStone * 1.5, JSON.stringify([r.postStone, r.postWind]));
  log('kusursuz kaçınma: son anda kaçınınca yavaş çekim + karşı saldırı hakkı', r.pd[0] === 'dodge' && r.pd[1] === 'iframe' && r.pd[2] && r.pd[3], JSON.stringify(r.pd));
  log('kusursuz kaçınma: erken kaçınınca ödül yok (yalnızca dokunulmazlık biterse vurulur)', !r.lateDodge[1], JSON.stringify(r.lateDodge));
  log('zincir savuşturma: art arda iki tam savuşturma ZİNCİR ×2', r.chain[0] === 'parry,parry' && r.chain[1] === 2, JSON.stringify(r.chain));
  log('saldırı iptali: hazırlık sırasında KAÇIN saldırıyı keser', r.cancel[0] === 'attack' && r.cancel[1] === 'dodge', JSON.stringify(r.cancel));
  log('azim: iksir bitince 40 öfke ile %25 iyileşme', r.heal[0] === 'drink' && r.heal[1] > 40 && r.heal[2] <= 21, JSON.stringify(r.heal));
  log('hata: kurt yakalamışken vurulunca yerde kalıyor, sonra düzgün kalkıyor', r.pin.pinned && r.pin.stAfter === 'down' && r.pin.end === 'move' && !r.pin.pinBy && r.pin.ang < 0.05, JSON.stringify(r.pin));
  log('ok: vurulunca itilmiyor (yalnızca acı tepkisi)', r.arrowPush < 0.15, String(r.arrowPush));
};
module.exports.pauseAtStart = true;
