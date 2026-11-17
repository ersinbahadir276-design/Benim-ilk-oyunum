// AŞAMA 5 — zorluk ve denge: saldırı yönetmeni, alışkanlığa uyum, elit düello (senaryo 6), duruş karşılaştırması (senaryo 7), seviye adaleti
module.exports = async ({ G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, GT = __G.GT, SYS = __G.SYS, out = {};
    SYS.stances = { stone: 1, wind: 1, moon: 1, water: 1 };
    const clear = () => { for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { if (!g.dead) { g.dead = 1; g.x = g.hx = 5000 } g.so = 0 } };
    const resetHab = () => { for (const k of ['light', 'heavy', 'block', 'parry', 'dodge', 'bow']) X.HAB[k] = 0; X.HAB.t = GT.clock };
    const reset = (st = 'stone') => { clear(); SYS.stance = st; __G.tp(20, 290); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, guard: 100, yaw: 0, vx: 0, vz: 0, atk: null, lock: null }); P.hp = X.maxHP(); IN.mx = IN.mz = 0; IN.blockHeld = false; resetHab(); __G.sim(1 / 60, 5) };
    const gob = (dx, dz, o = {}) => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead && !g.lookout && !g.champ); g.dead = 0; g.x = g.hx = P.x + dx; g.z = g.hz = P.z + dz; g.hp = g.max = o.hp || 9999; g.lv = o.lv || 3; g.st = 'chase'; g.aware = 1; g.unseen = 0; g.cd = .2; g.archer = false; g.elite = !!o.elite; g.pk = o.elite ? 'elite' : undefined; g.group = 'tb'; g.camp = null; g.helped = 1; g.fellBack = 1; g.adapt = 0; g.parN = 0; g.pos = 0; g.yaw = Math.atan2(P.x - g.x, P.z - g.z); g.ls = [P.x, P.z]; return g };
    const wolf = (dx, dz) => { const w = __G.mkWolf(P.x + dx, P.z + dz); w.hp = w.max = 9999; w.aware = 1; w.st = 'circle'; w.ls = [P.x, P.z]; w.unseen = 0; w.cd = .3; w.pack = null; w.bold = 3; return w };
    const keep = () => { P.hp = X.maxHP(); P.alive = true; P.guard = 100; if (P.pinBy) { const w = P.pinBy; P.pinBy = null; w.st = 'recover'; w.t = 0 } if (/^(hurt|down|getup|gbreak)$/.test(P.st)) { P.st = 'move'; P.t = 0; P.rag.ang = 0 } };
    // 1) director: 4 goblins + 2 wolves, 20 s — never more than two attacks at once, starts at least 0.35 s apart
    reset(); { const fs = [gob(-3, 4), gob(3, 4), gob(-4, -3), gob(4, -3), wolf(0, 7), wolf(0, -7)]; let maxW = 0, minGap = 99, last = -9, prev = fs.map(() => false);
      for (let i = 0; i < 1200; i++) { __G.sim(1 / 60, 1); keep(); let w = 0; fs.forEach((f, k) => { const a = X.attackOK ? (__G.isWolf(f) ? /^(windup|pounce|pin|bitewind|rush|bite)$/.test(f.st) : f.st === 'windup' || f.st === 'strike') : false; if (a) w++; if (a && !prev[k] && (f.st === 'windup' || f.st === 'bitewind')) { if (last > 0) minGap = Math.min(minGap, GT.clock - last); last = GT.clock } prev[k] = a }); maxW = Math.max(maxW, w) }
      out.director = { maxW, minGap: +minGap.toFixed(2) } }
    // 2) habits: a turtle draws 危 and delays; a dash spammer draws held wolf tells; light spam draws deflects
    reset(); { const g = gob(0, 3); const sample = () => { let p = 0, d = 0; for (let i = 0; i < 400; i++) { X.gobStartSwing(g); if (g.peril) p++; if (g.delay) d++ } g.st = 'chase'; return [p / 400, d / 400] }; const base = sample(); for (let k = 0; k < 8; k++) X.habitAdd('block'); const turtle = sample(); resetHab(); for (let k = 0; k < 8; k++) X.habitAdd('dodge'); const w = wolf(0, 6); let tells = []; for (let k = 0; k < 40; k++) { w.st = 'circle'; w.cd = 0; w.t = 9; X.DIR.last = -9; for (let i = 0; i < 30 && w.st !== 'bitewind'; i++) { w.brT = 0; __G.sim(1 / 60, 1); keep() } if (w.st === 'bitewind') tells.push(w.bwT) } const held = tells.filter(t => t > .45).length / Math.max(1, tells.length);
      resetHab(); let dfl0 = 0; for (let i = 0; i < 300; i++) { g.st = 'chase'; g.blockedAt = -1; X.foeHurt(g, 1, 0, 1, 'light0'); if (g.blockedAt === GT.clock) dfl0++ } for (let k = 0; k < 12; k++) X.habitAdd('light'); let dfl1 = 0; for (let i = 0; i < 300; i++) { g.st = 'chase'; g.blockedAt = -1; X.foeHurt(g, 1, 0, 1, 'light0'); if (g.blockedAt === GT.clock) dfl1++ }
      out.habit = { base, turtle, held: +held.toFixed(2), tells: tells.length, dfl0: dfl0 / 300, dfl1: dfl1 / 300 }; w.dead = 300; w.st = 'dead' }
    // 3) elite duel: a champion deflects light-button spam; heavy blows open it; it chains three hits
    const duel = (style) => { reset(); const e = gob(0, 2.3, { elite: true, hp: 99999, lv: 3 }); e.cd = 99; let dmg = 0, deflect = 0, broke = false;
      for (let k = 0; k < 14; k++) { e.st = 'chase'; e.cd = 99; e.yaw = Math.atan2(P.x - e.x, P.z - e.z); const h = e.hp, bl = e.blockedAt; P.st = 'move'; P.sta = 100; if (style === 'light') X.startLight(0); else { P.charge = .5; X.startHeavy() } for (let i = 0; i < 60 && (P.st === 'attack' || P.st === 'heavy'); i++) { __G.sim(1 / 60, 1); keep(); if (e.st === 'windup' || e.st === 'strike') { e.st = 'chase'; e.cd = 99 } } dmg += h - e.hp; if (e.blockedAt !== bl) deflect++; if (e.st === 'stagger' || e.broken > GT.clock) broke = true; e.pos = 0; e.broken = 0; for (let i = 0; i < 10; i++) { __G.sim(1 / 60, 1); keep() } e.x = P.x; e.z = P.z + 2.3 } return { dmg: Math.round(dmg), deflect, broke } };
    out.eliteLight = duel('light'); out.eliteHeavy = duel('heavy');
    reset(); { const e = gob(0, 3, { elite: true }); let three = 0; for (let i = 0; i < 300; i++) { X.gobStartSwing(e); if (e.cn === 2) three++ } out.eliteThree = three / 300 }
    // 4) four stances compared on the same goblin and the same wolf (damage, posture, hits, time) — target posture never breaks so it can be measured
    X.POSMAX.test = 1e9; out.stances = {}; for (const st of ['stone', 'wind', 'moon', 'water']) { const S = X.STANCES[st]; const run = (mk) => { reset(st); const f = mk(); f.pk = 'test'; let dmg = 0, pos = 0, time = 0, hits = 0;
      for (let k = 0; k < S.combo; k++) { const h = f.hp, p0 = f.pos || 0; P.st = 'move'; P.sta = 100; X.startLight(k); time += P.atkT; for (let i = 0; i < 70 && P.st === 'attack'; i++) { __G.sim(1 / 60, 1); keep(); if (__G.isWolf(f)) { f.st = 'recover'; f.t = -99 } else { f.st = 'stagger'; f.t = -99 } f.x = P.x + Math.sin(P.yaw) * 2; f.z = P.z + Math.cos(P.yaw) * 2 } if (f.hp < h) hits++; dmg += h - f.hp; pos += Math.max(0, (f.pos || 0) - p0); f.pos = 0; f.posT = 0 }
      if (__G.isWolf(f)) { f.dead = 300; f.st = 'dead' } return { dmg: Math.round(dmg), pos: Math.round(pos), hits, time: +time.toFixed(2), hps: +(hits / time).toFixed(2), dph: +(dmg / Math.max(1, hits)).toFixed(1), pph: +(pos / Math.max(1, hits)).toFixed(1) } };
      out.stances[st] = { gob: run(() => gob(0, 2.2)), wolf: run(() => wolf(0, 2.2)) } }
    // 5) levels: the same goblin hits a level-1 hero harder than a level-10 hero; the hero cuts a higher-level goblin less
    reset(); { const g = gob(0, 2, { lv: 10 }); SYS.lv = 1; const a = X.lvGapIn(g); SYS.lv = 10; const b = X.lvGapIn(g); SYS.lv = 1; const c = X.lvGapOut(g); g.lv = 1; const d = X.lvGapOut(g); out.levels = { in1: +a.toFixed(2), in10: +b.toFixed(2), outHigh: +c.toFixed(2), outEven: +d.toFixed(2) } }
    // 6) a clean parry steadies the hero (guard back)
    reset(); { const g = gob(0, 1.4); g.st = 'strike'; g.t = 0; g.hitDone = true; g.cd = 99; P.guard = 50; IN.blockHeld = true; __G.sim(1 / 60, 3); const r = __G.hitPlayer({ src: g, dmg: 7, guard: 18 }); IN.blockHeld = false; out.parryGuard = { r, guard: Math.round(P.guard) } }
    return out });
  log('yönetmen: 6 düşman (4 goblin + 2 kurt) varken aynı anda en çok 2 saldırı', R.director.maxW <= 2, JSON.stringify(R.director));
  log('yönetmen: saldırı başlangıçları arasında en az 0.35 sn ritim', R.director.minGap >= .34, JSON.stringify(R.director));
  log('alışkanlık: blokta bekleyene karşı daha çok 危 ve gecikme', R.habit.turtle[0] > R.habit.base[0] + .12 && R.habit.turtle[1] >= R.habit.base[1], JSON.stringify(R.habit));
  log('alışkanlık: atılma spamına karşı kurt hazırlığını tutar (düzensiz)', R.habit.tells >= 5 && R.habit.held >= .4, JSON.stringify(R.habit));
  log('alışkanlık: hafif vuruş spamına karşı goblin saptırmaya başlar', R.habit.dfl0 === 0 && R.habit.dfl1 > .1, JSON.stringify(R.habit));
  log('elit düello: şampiyon hafif vuruşları sık saptırır', R.eliteLight.deflect >= 3, JSON.stringify(R.eliteLight));
  log('elit düello: ağır vuruşlar daha çok iş görür ve siperini/dengesini kırar', R.eliteHeavy.dmg > R.eliteLight.dmg && R.eliteHeavy.deflect === 0, JSON.stringify([R.eliteLight, R.eliteHeavy]));
  log('elit: üçlü zincir yapar', R.eliteThree > .2, R.eliteThree);
  const S = R.stances, all = ['stone', 'wind', 'moon', 'water'];
  log('Su: saniyede en çok vuruş', all.every(k => S.water.gob.hps >= S[k].gob.hps), JSON.stringify(all.map(k => [k, S[k].gob.hps])));
  log('Ay: vuruş başına en çok hasar ve denge (hedefe karşı avantajlı duruş hariç: goblinde Taş, kurtta Rüzgâr)', all.every(k => S.moon.gob.dph >= S[k].gob.dph * .95) && all.filter(k => k !== 'stone').every(k => S.moon.gob.pph >= S[k].gob.pph * .95) && all.filter(k => k !== 'wind').every(k => S.moon.wolf.pph >= S[k].wolf.pph * .95), JSON.stringify(all.map(k => [k, S[k].gob.dph, S[k].gob.pph, S[k].wolf.pph])));
  log('duruş avantajı: Taş goblinde Rüzgâr\'dan güçlü, Rüzgâr kurtta Taş\'tan güçlü', S.stone.gob.pos > S.wind.gob.pos && S.stone.gob.dmg > S.wind.gob.dmg && S.wind.wolf.pos > S.stone.wolf.pos, JSON.stringify(S));
  log('seviye adaleti: yüksek seviyeli düşman alçak kahramana daha sert, kahraman ona daha az işler', R.levels.in1 > R.levels.in10 && R.levels.outHigh < R.levels.outEven, JSON.stringify(R.levels));
  log('tam savuşturma savunma canını geri verir', R.parryGuard.r === 'parry' && R.parryGuard.guard >= 60, JSON.stringify(R.parryGuard));
};
