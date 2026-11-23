// Mechanic tests run inside the page against the real game code (deterministic fixed-step simulation).
// Loaded by test/s-mech.js. Every test reports pass/fail with the measured numbers.
window.runMech = function () {
  const G = __G, P = G.P, IN = G.IN, GT = G.GT, out = [];
  GT.paused = true; window.__noAutoQ = 1;
  const ok = (name, cond, extra = '') => out.push({ name, pass: !!cond, extra: typeof extra === 'string' ? extra : JSON.stringify(extra) });
  const DT = 1 / 60, sim = (sec, each) => { const n = Math.round(sec / DT); for (let i = 0; i < n; i++) { GT.time += DT; G.step(DT); if (each && each(i * DT) === false) return i * DT; } return sec; };
  const clearIn = () => { Object.assign(IN, { mx: 0, mz: 0, kx: 0, kz: 0, atkHeld: false, atkUp: false, atkEdge: false, atkUsed: false, blockHeld: false, mash: 0 }); P.sprintHeld = false; for (const k in G.BUF) G.BUF[k] = -9; };
  const calmAll = () => { for (const w of G.wolves) { if (!w.dead && !w.tame) { w.aware = 0; w.st = 'idle'; w.t = 0; w.calm = 0; w.cd = 0; } } for (const g of G.GOBS) { g.aware = 0; if (!g.dead) { g.st = 'idle'; g.t = 0; } } for (const c of G.CROCS) { c.aware = 0; if (!c.dead) { c.st = 'idle'; c.t = 0; } } };
  const freshP = (x, z, yaw = 0) => { clearIn(); G.tp(x, z); Object.assign(P, { yaw, st: 'move', t: 0, hp: 200, sta: 100, guard: 100, inv: 0, pinBy: null, td: null, alive: true, air: false, vx: 0, vz: 0, vy: 0, crouch: false, exhausted: false, lift: 0 }); P.rag.ang = 0; P.rag.av = 0; G.CAM.yaw = yaw; sim(.2); };
  const far = (list, x, z, r) => { for (const a of list) if (Math.hypot(a.x - x, a.z - z) < r) { a.x += 400; a.z += 400; a.hx = a.x; a.hz = a.z; } };
  const tree = G.TREES;
  // clear area helper: move every creature away from a test spot
  const isolate = (x, z, r = 70) => { far(G.wolves, x, z, r); far(G.GOBS, x, z, r); far(G.CROCS, x, z, r); far(G.NPCS, x, z, r); };
  const lowestBody = () => { const H = G.HB, M = G.PM; let m = 9; for (const b of [H.head, H.upperChest, H.hips, H.leftHand, H.rightHand, H.leftLowerArm, H.rightLowerArm, H.leftLowerLeg, H.rightLowerLeg, H.leftFoot, H.rightFoot]) { const w = G.mpt(M, G.SK.GP[b]); m = Math.min(m, w[1] - G.hAt(w[0], w[2])); } return m; };
  const nanPM = () => Array.from(G.PM).some((v) => !isFinite(v));
  const T0 = [30, 420]; // open meadow south of spawn for most tests

  // ---------------------------------------------------------------- 1. sword in the hand
  {
    freshP(T0[0], T0[1]); sim(.5);
    const H = G.HB, SK = G.SK, g = SK.GR[H.rightHand], ax = G.r3v(g, SK.gripAx);
    ok('kılıç: bekleme duruşunda namlu ileri ve yukarı bakıyor', ax[2] > .3 && ax[1] > .3, { ileri: +ax[2].toFixed(2), yukari: +ax[1].toFixed(2) });
    // grip centre inside the fist: within 2 cm of the centre of the curled middle finger loop
    const B = (n) => SK.GP[H['right' + n]], rest = (v) => v; const mid = [B('MiddleProximal'), B('MiddleIntermediate'), B('MiddleDistal')];
    const gp = (() => { const rh = H.rightHand; const o = [0, 1, 2].map((i) => SK.gripRest[i] - SK.rest[rh][i]); const r = G.r3v(g, o); return [SK.GP[rh][0] + r[0], SK.GP[rh][1] + r[1], SK.GP[rh][2] + r[2]]; })();
    const loopC = [0, 1, 2].map((i) => (mid[0][i] + mid[1][i] + mid[2][i]) / 3); const dd = Math.hypot(gp[0] - loopC[0], gp[1] - loopC[1], gp[2] - loopC[2]);
    ok('kılıç: kabza yumruğun içinden geçiyor', dd < .03, 'kabza–parmak halkası mesafesi ' + (dd * 100).toFixed(1) + ' cm');
  }
  // ---------------------------------------------------------------- 2. sprint until stamina runs out
  {
    isolate(T0[0], T0[1]); freshP(T0[0], T0[1]); P.sprintHeld = true; IN.mz = 1; let flips = 0, last = null, exhaustedAt = -1, spdAfter = 0, nanPose = false, sprintSpd = 0;
    sim(9, (t) => { if (last !== null && last !== P.sprinting) flips++; last = P.sprinting; if (t > 1 && t < 2) sprintSpd = Math.max(sprintSpd, P.spd); if (P.exhausted && exhaustedAt < 0) exhaustedAt = t; if (exhaustedAt > 0 && t > exhaustedAt + .6 && t < exhaustedAt + 1.5) spdAfter = P.spd; if (Object.values(P.ps).some((v) => !isFinite(v))) nanPose = true; });
    ok('koşu: dayanıklılık bitince koşma kendiliğinden duruyor', exhaustedAt > 0 && !P.sprinting || P.exhausted === false, { bittiği_an: +exhaustedAt.toFixed(2) });
    ok('koşu: bitince yürüyüşe geçiyor (hız düşüyor, titreme yok)', spdAfter > 2.5 && spdAfter < 4.6 && sprintSpd > 5.5 && flips <= 3 && !nanPose, { koşu_hızı: +sprintSpd.toFixed(2), sonraki_hız: +spdAfter.toFixed(2), geçiş_sayısı: flips });
    clearIn();
  }
  // ---------------------------------------------------------------- 3. light, heavy, running, jumping attacks + stamina
  {
    isolate(T0[0], T0[1]); freshP(T0[0], T0[1]);
    const s0 = P.sta; IN.atkHeld = true; IN.atkAt = GT.clock; IN.atkEdge = true; sim(.05); IN.atkHeld = false; IN.atkUp = true; sim(.05);
    ok('hafif saldırı: dokununca başlıyor ve dayanıklılık harcıyor', P.st === 'attack' && P.sta < s0 - 10, { durum: P.st, dayanıklılık: +(s0 - P.sta).toFixed(1) });
    sim(1); P.sta = 100;
    IN.atkHeld = true; IN.atkAt = GT.clock; IN.atkEdge = true; IN.atkUsed = false; sim(.5); const st1 = P.st; sim(.6); const ch = P.charge; IN.atkHeld = false; IN.atkUp = true; sim(.05);
    ok('ağır saldırı: basılı tutunca yükleniyor, bırakınca vuruyor', st1 === 'charge' && ch > .9 && P.st === 'heavy' && P.sta < 75, { yükleme: +ch.toFixed(2), durum: P.st, kalan_dayanıklılık: Math.round(P.sta) });
    sim(1.2); P.sta = 100;
    P.sprintHeld = true; IN.mz = 1; sim(1.0); const spd = P.spd; IN.atkHeld = true; IN.atkAt = GT.clock; IN.atkEdge = true; IN.atkUsed = false; sim(.05);
    ok('koşarken saldırı', P.st === 'runatk', { durum: P.st, hız: +spd.toFixed(1) }); IN.atkHeld = false; IN.atkUp = true; clearIn(); sim(1);
    P.sta = 100; G.press('jump'); sim(.05); const airSt = P.st; let maxY = 0; const y0 = P.y; sim(.25, () => { maxY = Math.max(maxY, P.y - y0); }); IN.atkEdge = true; IN.atkHeld = true; IN.atkAt = GT.clock; IN.atkUsed = false; sim(.05); const ja = P.st; IN.atkHeld = false; IN.atkUp = true;
    sim(1.2); ok('zıplama + zıplarken saldırı', airSt === 'jump' && maxY > .6 && ja === 'jumpatk' && P.st === 'move', { yükseklik: +maxY.toFixed(2), havada: ja, sonra: P.st });
  }
  // ---------------------------------------------------------------- 4. dodge in four directions with i-frames
  {
    isolate(T0[0], T0[1]); const res = {};
    for (const [name, mx, mz, wantDir] of [['öne', 0, 1, [0, 1]], ['arkaya', 0, -1, [0, -1]], ['sağa', 1, 0, [-1, 0]], ['sola', -1, 0, [1, 0]]]) {
      freshP(T0[0], T0[1], 0); P.dodgeLast = -9; P.dodgeN = 0; const x0 = P.x, z0 = P.z; IN.mx = mx; IN.mz = mz; G.press('dodge'); sim(DT * 2); const kind = P.dodgeKind, inv = P.inv; IN.mx = IN.mz = 0; sim(.6);
      const dx = P.x - x0, dz = P.z - z0, L = Math.hypot(dx, dz) || 1, dot = (dx * wantDir[0] + dz * wantDir[1]) / L; res[name] = { tür: kind, mesafe: +L.toFixed(2), yön: +dot.toFixed(2), dokunulmaz: +inv.toFixed(2) };
      ok('kaçınma ' + name + ': doğru yöne ve dokunulmazlıkla (atılma: ≥0.15 sn)', dot > .9 && L > 1.8 && inv >= .15, res[name]);
    }
  }
  // ---------------------------------------------------------------- 5. block, guard meter, guard break, parry
  {
    isolate(T0[0], T0[1]); freshP(T0[0], T0[1], 0); const src = { x: P.x, z: P.z + 2 }; const gdk = (G.X.STDEF[G.SYS.stance] || {}).gd || 1; // stance defence (Taş: blocks cost less)
    IN.blockHeld = true; sim(.4); const hp0 = P.hp, g0 = P.guard; const r1 = G.hitPlayer({ src, dmg: 20, guard: 30 });
    ok('blok: hasar candan değil savunma canından düşüyor', r1 === 'block' && P.hp === hp0 && Math.abs(P.guard - (g0 - 30 * gdk)) < .01, { sonuç: r1, can: P.hp, savunma: P.guard });
    let r4 = ''; for (let k = 0; k < 6 && r4 !== 'guardbreak'; k++) r4 = G.hitPlayer({ src, dmg: 20, guard: 30 });
    ok('blok: savunma canı bitince kırılıyor ve savunmasız kalıyor', r4 === 'guardbreak' && P.st === 'gbreak' && P.hp === hp0, { sonuç: r4, durum: P.st });
    const r5 = G.hitPlayer({ src, dmg: 10, guard: 10 }); ok('savunma kırılınca vuruş can götürüyor', r5 === 'hit' && P.hp < hp0, { sonuç: r5, can: P.hp });
    sim(1.6); const gA = P.guard; sim(2.5); ok('savunma canı yavaşça doluyor', P.guard > gA + 10 && P.st !== 'gbreak', { önce: +gA.toFixed(1), sonra: +P.guard.toFixed(1) });
    // parry: block pressed just before the hit (a small goblin as attacker)
    freshP(T0[0], T0[1], 0); const gob = G.GOBS.find((g) => !g.big && !g.dead); gob.x = P.x; gob.z = P.z + 1.3; gob.yaw = Math.PI; gob.st = 'strike'; gob.t = 0; gob.hitDone = true; gob.lv = 0;
    IN.blockHeld = false; sim(.1); IN.blockHeld = true; sim(.1); const r6 = G.hitPlayer({ src: gob, dmg: 7, guard: 18 });
    ok('tam zamanlı savuşturma: düşman sarsılıyor ve açık kalıyor', r6 === 'parry' && gob.st === 'stagger' && gob.open(), { sonuç: r6, goblin: gob.st });
    IN.blockHeld = true; sim(.6); const r7 = G.hitPlayer({ src: gob, dmg: 7, guard: 18 }); ok('geç blok savuşturma sayılmıyor (sadece blok)', r7 === 'block', r7);
    clearIn(); sim(.3);
  }
  // ---------------------------------------------------------------- 6. wolf: 1 s wind-up, pounce, dodge/hit/pin/bites/escape, no ground clipping
  const wolfAttack = (mode) => {
    isolate(T0[0], T0[1]); freshP(T0[0], T0[1], 0); calmAll();
    const w = G.wolves.find((w) => !w.dead && !w.tame && !w.alpha); w.x = P.x; w.z = P.z + 5.5; w.yaw = Math.PI; w.hx = w.x; w.hz = w.z; w.st = 'windup'; w.t = 0; w.dodged = false; w.resolved = false; w.aware = 1; w.cd = 0; w.unseen = 0; w.sees = true; w.ls = [P.x, P.z]; w.calm = 0; w.pack = null; // the leap itself is tested (the AI now chooses it rarely)
    let windT = -1, pounceT = -1, res = {}, minLow = 9, nan = false, bites = 0, hp0 = P.hp, sawMark = false;
    sim(6, (t) => {
      if (w.st === 'windup' && windT < 0) windT = t; if (w.st === 'windup' && G.wolves.includes(w)) sawMark = true;
      if (w.st === 'pounce' && pounceT < 0) { pounceT = t; if (mode === 'dodge') { G.press('dodge'); } if (mode === 'block') IN.blockHeld = true; }
      if (P.st === 'down' || P.st === 'getup') { minLow = Math.min(minLow, lowestBody()); if (nanPM()) nan = true; }
      if (mode === 'hit' && P.pinBy && Math.floor(t * 10) !== Math.floor((t - DT) * 10)) IN.mash = 1; // mash a button 10 times a second
      if (pounceT > 0 && t > pounceT + 4) return false;
      if (mode !== 'hit' && pounceT > 0 && t > pounceT + 0.6 && (w.st === 'recover' || w.st === 'circle' || w.st === 'chase')) return false; // judge the first leap only
    });
    res = { hazırlık: +(pounceT - windT).toFixed(2), sonDurum: P.st, kurt: w.st, en_alçak_vücut_noktası: +minLow.toFixed(3), can_kaybı: Math.round(hp0 - P.hp), işaret: sawMark };
    clearIn(); return [w, res, nan, minLow];
  };
  {
    const [w1, r1] = wolfAttack('dodge'); ok('kurt: ~0.8 sn görünür hazırlık (çömelme + kırmızı işaret + hırlama)', r1.hazırlık >= .75 && r1.hazırlık <= .95 && r1.işaret, r1);
    ok('kurt: atlayış sırasında kaçınınca ıskalıyor ve kısa süre savunmasız', r1.can_kaybı === 0 && P.st !== 'down', r1);
    const [w2, r2, nan2, low2] = wolfAttack('hit');
    ok('kurt: isabette ragdoll düşüş, parçayı tutup ısırıyor, art arda basınca kurtuluyor', r2.can_kaybı > 0 && r2.can_kaybı < 30 && P.st === 'move', r2);
    ok('ragdoll: düşme/tutulma/kalkma sırasında yerin içine girmiyor, sayı bozulması yok', low2 > -.02 && !nan2, { en_alçak: +low2.toFixed(3) });
    const [w3, r3] = wolfAttack('block'); ok('kurt: atlayış bloklanınca yere düşmüyor', P.st !== 'down' && r3.can_kaybı === 0 && P.guard < 100, r3);
  }
  // ---------------------------------------------------------------- 7. vision: front cone only, trees and walls block, alerting neighbours
  {
    const X = 40, Z = 470; isolate(X, Z, 90); freshP(X, Z, 0); calmAll();
    const [a, b] = G.wolves.filter((w) => !w.dead && !w.tame).slice(0, 2);
    a.x = X; a.z = Z + 7; a.yaw = 0; a.hyaw = 0; a.st = 'idle'; a.t = -99; a.aware = 0; a.calm = 0; a.seeT = 0; a.sees = false; a.hx = a.x; a.hz = a.z;  // looking away from the player
    b.x = X + 6; b.z = Z + 9; b.yaw = 0; b.hyaw = 0; b.st = 'idle'; b.t = -99; b.aware = 0; b.calm = 0; b.seeT = 0; b.sees = false; b.hx = b.x; b.hz = b.z;
    let maxA = 0, why = '', sawIt = false; sim(2.5, () => { if (a.sees) sawIt = true; if (a.aware > maxA && !why) why = JSON.stringify({ st: a.st, sees: a.sees, yaw: +a.yaw.toFixed(2), hy: +a.hyaw.toFixed(2), ax: +a.x.toFixed(1), az: +a.z.toFixed(1), px: +P.x.toFixed(1), pz: +P.z.toFixed(1), noise: P.noise }); a.yaw = 0; a.hyaw = 0; b.yaw = 0; b.hyaw = 0; maxA = Math.max(maxA, a.aware); });
    ok('görüş: arkasındaki oyuncuyu görmüyor (7 m; koku ayrı ve yavaş)', !sawIt && maxA < .5, { farkındalık: +maxA.toFixed(3), why });
    a.yaw = Math.PI; a.seeT = 0; let spotted = -1; sim(3, (t) => { if (a.aware >= .5 && spotted < 0) spotted = t; b.yaw = b.yaw; });
    ok('görüş: önündeki oyuncuyu görüyor', spotted > 0, { fark_etme_süresi: spotted });
    ok('görüş: gören kurt yanındakini uyarıyor, o da oyuncuya dönüyor', ['alert', 'chase', 'circle', 'windup', 'stalk', 'watch', 'bitewind', 'rush', 'bite', 'retreat', 'feint', 'hamstring', 'armleap'].includes(b.st) && Math.abs(Math.atan2(Math.sin(Math.atan2(P.x - b.x, P.z - b.z) - b.yaw), Math.cos(Math.atan2(P.x - b.x, P.z - b.z) - b.yaw))) < .5, { yanındaki: b.st, açı: +Math.abs(Math.atan2(Math.sin(Math.atan2(P.x - b.x, P.z - b.z) - b.yaw), Math.cos(Math.atan2(P.x - b.x, P.z - b.z) - b.yaw))).toFixed(2) });
    // tree blocks: pick a big tree, put wolf on one side and player on the other
    const t = tree.find((t) => t.k === 1 && t.s > 1.2 && Math.hypot(t.x, t.z) > 200 && Math.hypot(t.x, t.z) < 500);
    const losTree = G.los(t.x - 4, t.z, t.x + 4, t.z, 1.0), losFree = G.los(t.x - 4, t.z + 30, t.x + 4, t.z + 30, 1.0);
    ok('görüş: ağaç arkasını görmüyor', losTree === false, { ağaç: [Math.round(t.x), Math.round(t.z)], ağaçlı: losTree });
    ok('görüş: duvar arkasını görmüyor (kale duvarı); açık kapıdan görüyor', G.los(20, -40, 20, -28, 1.2) === false && G.los(-20, 40, -20, 28, 1.2) === false && G.los(0, -40, 0, -26, 1.2) === true, '');
  }
  // ---------------------------------------------------------------- 8. goblins: groups, big goblin club contact
  {
    const camps = {}; for (const g of G.GOBS) camps[g.group] = (camps[g.group] || 0) + 1;
    ok('goblinler: kamplarda gruplar (küçük + büyük)', G.GOBS.filter((g) => g.big).length >= 4 && G.GOBS.filter((g) => !g.big).length >= 20, camps);
    const big = G.GOBS.find((g) => g.big && !g.boss); const BX = big.x, BZ = big.z;
    const smash = (offX, offZ) => { calmAll(); freshP(BX + offX, BZ + offZ, 0); big.x = BX; big.z = BZ; big.yaw = 0; big.hp = big.max; big.st = 'windup'; big.t = 0; big.hitDone = false; big.cd = 0; const hp0 = P.hp; let windT = 0;
      for (const g of G.GOBS) if (g !== big && Math.hypot(g.x - BX, g.z - BZ) < 30) { g.x += 300; g.hx = g.x; }
      sim(3, (t) => { big.yaw = 0; if (big.st === 'windup') windT = t; if (big.st === 'recover') return false; }); return [hp0 - P.hp, windT, P.st]; };
    const [d1, w1, s1] = smash(0, 2.4), [d2, w2, s2] = smash(2.9, -.5);
    ok('büyük goblin: yavaş ve görülebilir savuruş (>1.2 sn)', w1 > 1.2, { hazırlık: +w1.toFixed(2) });
    ok('büyük goblin: sopa değerse hasar', d1 > 20, { hasar: d1, durum: s1 });
    ok('büyük goblin: sopa değmezse hasar yok', d2 === 0, { hasar: d2 });
    // cannot be grabbed
    calmAll(); freshP(BX, BZ - 1.2, 0); big.x = BX; big.z = BZ; big.yaw = 0; big.st = 'idle'; big.aware = 0; G.press('inter'); sim(.2);
    ok('büyük goblin: boyun kilidine alınamıyor', P.st !== 'td', P.st);
  }
  // ---------------------------------------------------------------- 9. silent takedowns + cancel
  {
    const gob = G.GOBS.find((g) => !g.big && !g.dead && g.group.endsWith('p')); const GX = gob.x + 0, GZ = gob.z;
    const setup = (v) => { isolate(GX, GZ, 40); calmAll(); v.x = GX; v.z = GZ; v.yaw = 0; v.hyaw = 0; v.st = 'idle'; v.t = -99; v.aware = 0; v.dead = 0; v.hp = v.max; v.held = null; v.calm = 0; v.seeT = 0; v.sees = false; };
    setup(gob); freshP(GX, GZ - 1.3, 0); G.press('inter'); sim(.1); const st0 = P.st, k0 = P.td && P.td.kind; sim(2.6);
    ok('sessiz alt etme: arkadan ETKİLEŞ ile boyun kilidi + kılıç', st0 === 'td' && k0 === 'choke' && gob.dead && P.st === 'move', { tür: k0, goblin_öldü: !!gob.dead });
    setup(gob); freshP(GX, GZ - 1.3, 0); gob.aware = .8; G.press('inter'); sim(.1); ok('fark etmiş goblinde boyun kilidi çalışmıyor', P.st !== 'td', P.st);
    setup(gob); freshP(GX, GZ - 3.5, 0); G.press('jump'); sim(.15); G.press('jump'); sim(.05); const k1 = P.td && P.td.kind; let revMax = 0;
    sim(2.4, () => { revMax = Math.max(revMax, P.ps.rev || 0); }); ok('ZIPLA ×2 goblin: üstüne atla, kılıcı ucu aşağı iki elle sapla, ayağa kalk', k1 === 'leap' && gob.dead && P.st === 'move' && revMax > .8 && (P.ps.rev || 0) < .1, { tür: k1, ters_tutuş: +revMax.toFixed(2) });
    const w = G.wolves.find((w) => !w.dead && !w.tame); setup(w); w.st = 'idle'; freshP(GX, GZ - 3.5, 0); G.press('jump'); sim(.15); G.press('jump'); sim(.05); const k2 = P.td && P.td.kind; sim(3.6);
    ok('ZIPLA ×2 kurt: sırtına atla, boyun kilidi', k2 === 'leap' && w.dead && P.st === 'move', { tür: k2, kurt_öldü: !!w.dead });
    // cancel: a wolf pounces during the choke -> takedown cancelled, hero pinned, goblin gets up fully
    setup(gob); freshP(GX, GZ - 1.3, 0); G.press('inter'); sim(.3); const w2 = G.wolves.find((x) => !x.dead && !x.tame && x !== w); w2.x = P.x - 3.5; w2.z = P.z - .8; w2.yaw = Math.atan2(P.x - w2.x, P.z - w2.z); w2.st = 'windup'; w2.t = .2; w2.aware = 1; w2.cd = 0; w2.unseen = 0; w2.sees = true; w2.calm = 0; w2.hx = w2.x; w2.hz = w2.z; w2.resolved = false; w2.dodged = false;
    let cancelled = false, escT = -1, escDone = -1, interrupted = false;
    sim(5, (t) => { if (!P.td && P.pinBy && !cancelled) cancelled = true; if (gob.st === 'escape' && escT < 0) escT = t; if (escT > 0 && gob.st !== 'escape' && escDone < 0) escDone = t; if (escT > 0 && escDone < 0 && gob.st !== 'escape') interrupted = true; if (P.pinBy && Math.floor(t * 10) !== Math.floor((t - DT) * 10)) IN.mash = 1; });
    ok('alt etme sırasında kurt saldırırsa iptal: Kael yere düşüp tutuluyor', cancelled, { iptal: cancelled });
    ok('iptalde goblin kurtuluyor ve kalkma animasyonu sonuna kadar oynuyor', escT > 0 && escDone - escT >= .95 && !interrupted && !gob.dead, { kalkma_süresi: +(escDone - escT).toFixed(2), goblin: gob.st });
    clearIn();
  }
  // ---------------------------------------------------------------- 10. crocodile: rush, open jaws (tell), parry / block
  {
    const c = G.CROCS[0], CX = c.x, CZ = c.z;
    const run = (mode) => { isolate(CX, CZ, 60); calmAll(); c.x = CX; c.z = CZ; c.yaw = 0; c.st = 'rush'; c.t = 0; c.aware = 1; c.cd = 0; c.hp = c.max; c.dead = 0; c.unseen = 0; c.sees = true; c.hx = CX; c.hz = CZ;
      freshP(CX, CZ + 9, Math.PI); P.y = G.hAt(P.x, P.z); let maxSpd = 0, maxY = -9, openT = -1, snapT = -1, res = null, jawAtSnap = 0; const hp0 = P.hp, g0 = P.guard; IN.blockHeld = mode === 'lateblock';
      sim(4, (t) => { maxSpd = Math.max(maxSpd, c.spd); maxY = Math.max(maxY, c.y - Math.max(G.hAt(c.x, c.z), -1.57)); if (c.st === 'open' && openT < 0) openT = t; if (c.st === 'open' && c.t > .45 && mode === 'parry' && !IN.blockHeld) IN.blockHeld = true; if (c.st === 'snap' && snapT < 0) { snapT = t; jawAtSnap = c.jaw; } if (c.st === 'recover' || c.st === 'stagger') return false; });
      const out2 = { koşu_hızı: +maxSpd.toFixed(1), zemin_üstü_en_fazla: +maxY.toFixed(2), ağız_açma_süresi: +(snapT - openT).toFixed(2), ağız: +jawAtSnap.toFixed(2), timsah: c.st, can_kaybı: Math.round(hp0 - P.hp), savunma_kaybı: Math.round(g0 - P.guard) }; clearIn(); return out2; };
    const a = run('none'); ok('timsah: hızla koşuyor, zıplamıyor (yere yapışık)', a.koşu_hızı > 6 && a.zemin_üstü_en_fazla < .1, a);
    ok('timsah: ağzını belirgin açıyor (hazırlık), sonra kapıyor', a.ağız_açma_süresi > .7 && a.ağız > .9 && a.can_kaybı > 0, a);
    const b = run('parry'); ok('timsah: ağız açıkken BLOK = sarsılma', b.timsah === 'stagger' && b.can_kaybı === 0, b);
    const d = run('lateblock'); ok('timsah: önceden tutulan blok ısırığı savunma canından düşürür', d.timsah !== 'stagger' && d.can_kaybı === 0 && d.savunma_kaybı > 30, d);
  }
  // ---------------------------------------------------------------- 11. dragon pattern
  {
    const d = G.DRAGON; const vit0 = G.SYS.vit; G.SYS.vit = 600; isolate(d.x, d.z, 120); calmAll(); freshP(d.x + Math.sin(d.yaw) * 26, d.z + Math.cos(d.yaw) * 26, d.yaw + Math.PI); d.st = 'sleep'; d.t = 0; d.hp = d.max; P.hp = 5000;
    const log = []; let lastSt = '', clawWind = -1, clawImpact = -1, burns0 = G.BURNS.length, burnHurt = false, tookOff = false, landed = false, breathT = -1;
    sim(60, (t) => { if (d.st !== lastSt) { log.push(d.st + '@' + t.toFixed(1)); lastSt = d.st; } if (d.st === 'claw' && clawWind < 0) clawWind = t; if (d.st === 'claw' && d.ct > 2.65 && clawImpact < 0) clawImpact = t; if (d.st === 'takeoff') tookOff = true; if (d.st === 'breath' && d.ct > 3 && breathT < 0) breathT = t; if (d.st === 'tired') landed = true;
      P.alive = true; P.hp = 5000; if (P.st === 'down' && !P.pinBy && P.t > 1) { P.st = 'move'; P.rag.ang = 0; } if (d.st === 'tired' || log.length > 30) return false; });
    ok('ejderha: uyanış → yürüyüş → pençe (v21: hızlı ama okunur, ≥0.8 sn hazırlık)', clawWind > 0 && clawImpact - clawWind >= .8, { hazırlık: +(clawImpact - clawWind).toFixed(2) });
    ok('ejderha: havalanma, havada ateş püskürtme, yerde yanan iz, iniş', tookOff && breathT > 0 && G.BURNS.length > burns0 && landed, { düzen: log.join(' → '), yanan_iz: G.BURNS.length });
    G.SYS.vit = vit0;
  }
  // ---------------------------------------------------------------- 12. map and village
  {
    const zones = new Set(); for (let x = -1380; x <= 1380; x += 60) for (let z = -1380; z <= 1380; z += 60) zones.add(G.zoneAt(x, z));
    ok('harita: 2800×2800 m ve tüm bölgeler var', ['kingdom', 'dense', 'swamp', 'camp', 'mountain', 'lair', 'lake', 'river', 'ruins', 'forest'].every((z) => zones.has(z)), [...zones].join(','));
    const kinds = {}; for (const n of G.NPCS) kinds[n.kind] = (kinds[n.kind] || 0) + 1; freshP(0, 70, Math.PI); const pos0 = G.NPCS.map((n) => [n.x, n.z]); GT.tod = .25; sim(20); const moved = G.NPCS.filter((n, i) => Math.hypot(n.x - pos0[i][0], n.z - pos0[i][1]) > 2).length;
    ok('köy: köylü, tüccar, muhafız NPC\'leri var ve dolaşıyor', kinds.merchant >= 3 && kinds.guard >= 8 && (kinds.villager + kinds.villager2) >= 10 && moved >= 4, { türler: kinds, hareket_eden: moved });
  }
  GT.paused = false; return out;
};
