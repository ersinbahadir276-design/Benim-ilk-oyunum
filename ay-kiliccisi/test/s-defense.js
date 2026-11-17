// AŞAMA 2 — savuşturma, atılma, kombo ve duruşlar
module.exports = async ({ G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, SYS = __G.SYS, GT = __G.GT, out = {};
    SYS.stances = { stone: 1, wind: 1, moon: 1, water: 1 };
    const clear = () => { for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { g.dead = 1; g.so = 0; g.x = g.hx = 5000 + Math.random() * 300 } };
    const reset = (st = 'stone') => { clear(); SYS.stance = st; __G.tp(20, 290); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, guard: 100, yaw: 0, vx: 0, vz: 0, lock: null, counterT: 0, combo: 0, atk: null, queued: false, ripT: 0, bspam: 0, blockRel: -9, dodgeLast: -9, dodgeN: 0, chain: 0, lastParry: -9, flowAt: -9, atkStart: 0 }); P.hp = X.maxHP(); IN.mx = IN.mz = 0; IN.atkHeld = false; IN.blockHeld = false; __G.sim(1 / 60, 10) };
    const gob = (dx, dz, hp = 9999) => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead); g.dead = 0; g.x = g.hx = P.x + dx; g.z = g.hz = P.z + dz; g.max = g.hp = hp; g.st = 'idle'; g.aware = 0; g.cd = 99; g.archer = false; g.yaw = Math.atan2(P.x - g.x, P.z - g.z); g.pos = 0; g.parN = 0; g.parAt = -9; g.adapt = 0; g.kx = g.kz = 0; g.bleedT = 0; return g };
    const hold = (gs) => { for (const g of gs) { g.cd = 99; if (g.st !== 'guard') { g.st = 'stagger'; g.t = -99 } } };
    const blockThen = (delay, src) => { IN.blockHeld = true; __G.sim(1 / 60, 1); const n = Math.round(delay * 60); for (let i = 0; i < n; i++) { __G.sim(1 / 60, 1); if (src.hp !== undefined) { src.cd = 99; if (src.st !== 'strike') { src.st = 'strike'; src.t = 0 } src.hitDone = true } } const r = __G.hitPlayer({ src, dmg: 7, guard: 18 }); IN.blockHeld = false; __G.sim(1 / 60, 2); return r };
    // 1) parry timing per stance (window: stone .24, water .32, moon .19)
    out.par = {}; for (const [st, d] of [['stone', .1], ['stone', .4], ['water', .29], ['moon', .22], ['moon', .1]]) { reset(st); const g = gob(0, 1.4); g.st = 'strike'; g.t = 0; g.hitDone = true; out.par[st + d] = blockThen(d, g) }
    // 2) a real goblin swing parried at its real contact moment
    reset(); { const g = gob(0, 1.6); g.st = 'chase'; g.aware = 1; g.unseen = 0; g.cd = 0; let res = null, blocked = false; const trace = []; for (let i = 0; i < 240 && !res; i++) { if (g.st === 'windup' && g.peril) { g.peril = 0; g.cn = 0 } // a normal (parryable) swing is what is tested here
      if (i % 20 === 0) trace.push(g.st + '/' + P.st + '/' + Math.hypot(g.x - P.x, g.z - P.z).toFixed(1)); if (g.st === 'strike' && !blocked) { blocked = true; IN.blockHeld = true; P.st = 'move' } const pst = P.st; __G.sim(1 / 60, 1); if (P.st === 'parry' && pst !== 'parry') res = { r: 'parry', gob: g.st }; else if (P.st === 'hurt') res = { r: 'hit' } } IN.blockHeld = false; out.realParry = res || { trace } }
    // 3) parry fatigue + adaptation
    reset(); { const g = gob(0, 1.4); const sts = []; let reels = 0; const op = g.onParried; g.onParried = () => { reels++; op() }; for (let k = 0; k < 3; k++) { g.st = 'strike'; g.t = 0; g.hitDone = true; g.pos = 0; P.st = 'move'; P.bspam = 0; P.blockRel = -9; const r0 = reels; blockThen(.08, g); sts.push(reels > r0 ? 'reel' : 'no-reel'); for (let i = 0; i < 60; i++) { __G.sim(1 / 60, 1); g.cd = 99 } } g.onParried = op; out.fatigue = { sts, adapt: g.adapt > GT.clock };
      let per = 0; for (let i = 0; i < 300; i++) { g.st = 'chase'; X.gobStartSwing ? X.gobStartSwing(g) : null; if (g.peril) per++ } out.adaptPeril = per / 300; g.adapt = 0; let per0 = 0; for (let i = 0; i < 300; i++) { X.gobStartSwing(g); if (g.peril) per0++ } out.basePeril = per0 / 300 }
    // 4) block spam shrinks the window
    reset(); { const w0 = X.parryWin(); for (let k = 0; k < 4; k++) { IN.blockHeld = true; __G.sim(1 / 60, 3); IN.blockHeld = false; __G.sim(1 / 60, 3) } IN.blockHeld = true; __G.sim(1 / 60, 2); out.spam = { w0: +w0.toFixed(3), w1: +X.parryWin().toFixed(3) }; IN.blockHeld = false; __G.sim(1 / 60, 2) }
    // 5) stance defence: stone blocks are cheaper
    const guardLoss = (st) => { reset(st); const g = gob(0, 1.4); hold([g]); IN.blockHeld = true; for (let i = 0; i < 40; i++) { __G.sim(1 / 60, 1); hold([g]) } const g0 = P.guard; __G.hitPlayer({ src: g, dmg: 7, guard: 20 }); IN.blockHeld = false; return g0 - P.guard };
    out.guard = { stone: +guardLoss('stone').toFixed(1), wind: +guardLoss('wind').toFixed(1) };
    // 6) dash i-frames are measured: protected early, open late
    const dashHit = (at, st = 'stone') => { reset(st); const g = gob(0, 3); __G.press('dodge'); __G.sim(1 / 60, 1); __G.sim(at, 1); return __G.hitPlayer({ src: g, dmg: 7, guard: 18 }) };
    out.dash = { early: dashHit(.08), late: dashHit(.27), windLate: dashHit(.22, 'wind'), stoneLate: dashHit(.22) };
    // 7) dash fatigue: the third dash in a second has no invulnerability and costs more
    reset(); { const inv = [], cost = []; for (let k = 0; k < 3; k++) { const s0 = P.sta; __G.press('dodge'); __G.sim(1 / 60, 1); inv.push(+P.inv.toFixed(2)); cost.push(+(s0 - P.sta).toFixed(1)); __G.sim(1 / 60, 20) } out.dashFat = { inv, cost } }
    // 8) perfect dodge -> counter attack
    reset(); { const g = gob(0, 3); __G.press('dodge'); __G.sim(1 / 60, 3); __G.hitPlayer({ src: g, dmg: 7, guard: 18 }); const c = P.counterT > 0; __G.sim(.3, 1); __G.press('atk'); __G.sim(1 / 60, 2); out.pdCounter = { counter: c, cnt: !!(P.atk && P.atk.cnt), st: P.st } }
    // 9) riposte after a parry: a fast thrust that hits the parried foe hard
    reset(); { const g = gob(0, 1.6); g.st = 'strike'; g.t = 0; g.hitDone = true; blockThen(.08, g); hold([g]); const p0 = g.pos || 0, h0 = g.hp; __G.press('atk'); let rip = false, pmax = 0, broke = false; for (let i = 0; i < 50; i++) { __G.sim(1 / 60, 1); hold([g]); if (P.atk && P.atk.rip) rip = true; pmax = Math.max(pmax, (g.pos || 0) - p0); if (g.broken > GT.clock) broke = true } out.riposte = { rip, dmg: h0 - g.hp, pos: +pmax.toFixed(1), broke } }
    // 10) heavy chain
    reset(); { P.charge = 0; X.startHeavy(); let chained = false; for (let i = 0; i < 90; i++) { if (P.st === 'heavy' && P.atk && P.t / P.atk.T > P.atk.a1 + .1) __G.press('hvy'); __G.sim(1 / 60, 1); if (P.atk && P.atk.chain) chained = true } out.heavyChain = chained }
    // 11) stance flow: stone 1st cut, switch to wind mid-swing, the chain continues as wind's 2nd cut with AKIŞ
    reset('stone'); { gob(0, 7); X.startLight(0); __G.sim(1 / 60, 8); X.setStance('wind'); __G.press('atk'); let got = null; for (let i = 0; i < 60 && !got; i++) { __G.sim(1 / 60, 1); if (P.st === 'attack' && P.combo === 1) got = { combo: P.combo, flow: !!(P.atk && P.atk.flow), st: P.atk && P.atk.st } } out.flow = got }
    // 12) finishers
    const finisher = (st, setup) => { reset(st); const S = X.STANCES[st]; const env = setup(); X.startLight(S.combo - 1); for (let i = 0; i < 70; i++) { __G.sim(1 / 60, 1); if (env.hold) hold(env.hold) } return env.check() };
    out.finStone = finisher('stone', () => { const g = gob(0, 2.3); g.st = 'guard'; g.t = -99; g.yaw = Math.PI; return { check: () => ({ st: g.st, hp: g.hp < g.max }) } });
    out.finWind = finisher('wind', () => { const gs = [gob(0, 2.2), gob(.2, 2.9), gob(-.2, 3.5)]; return { hold: gs, check: () => gs.filter(g => g.hp < g.max).length } });
    out.finMoon = finisher('moon', () => { const near = gob(0, 2.2), far = gob(0, 5.4); return { hold: [near, far], check: () => ({ near: near.hp < near.max, far: far.hp < far.max }) } });
    out.finWater = finisher('water', () => { const g = gob(0, 2.3); return { hold: [g], check: () => ({ bleed: g.bleedT > 0 }) } });
    // 13) 危 cannot be parried
    reset(); { const g = gob(0, 1.4); IN.blockHeld = true; __G.sim(1 / 60, 2); out.peril = __G.hitPlayer({ src: g, dmg: 9, guard: 99, unblockable: true, parryable: false }); IN.blockHeld = false }
    return out });
  log('savuşturma: Taş 0.10 sn önce = savuşturma, 0.40 = blok', R.par['stone0.1'] === 'parry' && R.par['stone0.4'] === 'block', JSON.stringify(R.par));
  log('savuşturma penceresi duruşa göre: Su 0.29 savuşturur, Ay 0.22 bloklar ama 0.10 savuşturur', R.par['water0.29'] === 'parry' && R.par['moon0.22'] === 'block' && R.par['moon0.1'] === 'parry', JSON.stringify(R.par));
  log('gerçek goblin saldırısı temas anında savuşturuluyor ve goblin sarsılıyor', R.realParry && R.realParry.r === 'parry' && R.realParry.gob === 'stagger', JSON.stringify(R.realParry));
  log('savuşturma yorgunluğu: 3. kez savuşturma sarsmaz (yalnızca denge kırılırsa), düşman uyum sağlar', R.fatigue.sts[0] === 'reel' && R.fatigue.sts[1] === 'reel' && R.fatigue.sts[2] === 'no-reel' && R.fatigue.adapt, JSON.stringify(R.fatigue));
  log('uyum sağlamış goblin daha çok 危 yapar', R.adaptPeril > R.basePeril + .15, R.basePeril.toFixed(2) + ' → ' + R.adaptPeril.toFixed(2));
  log('blok spamı savuşturma penceresini daraltır', R.spam.w1 < R.spam.w0 * .8, JSON.stringify(R.spam));
  log('Taş bloğu daha az savunma canı harcar', R.guard.stone < R.guard.wind * .8, JSON.stringify(R.guard));
  log('atılma: başta dokunulmaz, sonda açık; Rüzgâr daha uzun korur', R.dash.early === 'iframe' && R.dash.late !== 'iframe' && R.dash.windLate === 'iframe' && R.dash.stoneLate !== 'iframe', JSON.stringify(R.dash));
  log('atılma yorgunluğu: 3. atılmada dokunulmazlık yok, maliyet artar', R.dashFat.inv[0] > 0 && R.dashFat.inv[1] < R.dashFat.inv[0] && R.dashFat.inv[2] === 0 && R.dashFat.cost[2] > R.dashFat.cost[0], JSON.stringify(R.dashFat));
  log('kusursuz kaçınma → karşı saldırı', R.pdCounter.counter && R.pdCounter.cnt, JSON.stringify(R.pdCounter));
  log('savuşturma → KARŞI DARBE (hızlı saplama, yüksek denge hasarı)', R.riposte.rip && R.riposte.dmg > 0 && (R.riposte.pos >= 30 || R.riposte.broke), JSON.stringify(R.riposte));
  log('ağır zincir: △ ile ikinci ağır savuruş', R.heavyChain);
  log('duruş akışı: kombo ortasında duruş değişince yeni duruşta devam (AKIŞ)', R.flow && R.flow.combo === 1 && R.flow.flow && R.flow.st === 'wind', JSON.stringify(R.flow));
  log('Taş bitiricisi KAYA KIRAN siperi kırar', R.finStone.st === 'stagger' && R.finStone.hp, JSON.stringify(R.finStone));
  log('Rüzgâr bitiricisi sıradaki 3 düşmanı deler', R.finWind >= 3, R.finWind);
  log('Ay bitiricisi AY HİLALİ kılıcın erişmediği 5.4 m\'deki düşmana dalga ile vurur', R.finMoon.near && R.finMoon.far, JSON.stringify(R.finMoon));
  log('Su bitiricisi kanatır', R.finWater.bleed, JSON.stringify(R.finWater));
  log('危 saldırısı savuşturulamaz/bloklanamaz', R.peril === 'hit', R.peril);
};
