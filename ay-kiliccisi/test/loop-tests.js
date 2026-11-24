// Phase-2 loop tests: explore -> danger -> fight -> reward -> grow. Run inside the real page (deterministic steps).
// Loaded by test/s-loop.js.
window.runLoop = async function () {
  const G = __G, P = G.P, IN = G.IN, GT = G.GT, SYS = G.SYS, X = G.X, out = [];
  GT.paused = true; window.__noAutoQ = 1;
  const ok = (name, cond, extra = '') => out.push({ name, pass: !!cond, extra: typeof extra === 'string' ? extra : JSON.stringify(extra) });
  const DT = 1 / 60, sim = (sec, each) => { const n = Math.round(sec / DT); for (let i = 0; i < n; i++) { GT.time += DT; G.step(DT); if (each && each(i * DT) === false) return i * DT; } return sec; };
  const clearIn = () => { Object.assign(IN, { mx: 0, mz: 0, kx: 0, kz: 0, atkHeld: false, atkUp: false, atkEdge: false, atkUsed: false, blockHeld: false, mash: 0 }); P.sprintHeld = false; for (const k in G.BUF) G.BUF[k] = -9; };
  const calmAll = () => { for (const w of G.wolves) { if (!w.dead && !w.tame) { w.aware = 0; w.st = 'idle'; w.t = 0; w.calm = 0; w.cd = 0; } } for (const g of G.GOBS) { g.aware = 0; if (!g.dead) { g.st = 'idle'; g.t = 0; } } for (const c of G.CROCS) { c.aware = 0; if (!c.dead) { c.st = 'idle'; c.t = 0; } } };
  const freshP = (x, z, yaw = 0) => { clearIn(); G.tp(x, z); Object.assign(P, { yaw, st: 'move', t: 0, hp: X.maxHP(), sta: 100, guard: 100, inv: 0, pinBy: null, td: null, alive: true, air: false, vx: 0, vz: 0, vy: 0, crouch: false, exhausted: false, lift: 0, berserk: 0, rage: 0, lock: null }); P.rag.ang = 0; P.rag.av = 0; G.CAM.yaw = yaw; sim(.2); };
  const far = (list, x, z, r) => { for (const a of list) if (Math.hypot(a.x - x, a.z - z) < r && !a.role) { a.x += 400; a.z += 400; a.hx = a.x; a.hz = a.z; } };
  const isolate = (x, z, r = 70) => { far(G.wolves.filter((w) => !w.boss), x, z, r); far(G.GOBS.filter((g) => !g.boss), x, z, r); far(G.CROCS, x, z, r); far(G.X.SLIMES, x, z, r); };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitPanels = async () => { for (let i = 0; i < 100; i++) { const m = document.getElementById('manhwa'); if (m.style.display !== 'block' || m.querySelector('.mh-next,.mh-ch')) return; await wait(100); } };
  const sec = async (name, fn) => { try { await fn(); } catch (e) { ok(name + ' (çalıştı)', false, String(e.stack || e).slice(0, 300)); } };
  const closeUI = async () => { await waitPanels(); const m = document.getElementById('manhwa'); if (m.style.display === 'block') { for (let k = 0; k < 40 && X.CINE.on && !X.CINE.choice; k++) X.cineEnd(); if (X.CINE.on) X.cineEnd(true); } GT.inStory = false; GT.paused = true; document.getElementById('travel').style.display = 'none'; };
  const smallGob = () => G.GOBS.find((g) => !g.dead && !g.big && !g.boss && !g.archer);
  const T0 = [30, 420];
  SYS.gold = 0; SYS.shards = 0;

  // ---------------------------------------------------------------- 1. loot: drop, beam, auto pick-up, auto-equip, looks
  await sec('ganimet', async () => {
    freshP(T0[0], T0[1]); isolate(T0[0], T0[1]);
    const inv0 = SYS.inv.length, w0 = X.weaponDmg(), blade0 = G.SK.bladeLen;
    const it = X.makeItem('fang', 2, 3); X.dropLoot(P.x + 3, P.z, [it], 25);
    ok('ganimet: yere düşen eşya ışık sütunu olarak görünüyor, altın hemen ekleniyor', X.LOOT.length >= 1 && SYS.gold >= 25, { yerde: X.LOOT.length, altın: SYS.gold });
    G.tp(P.x + 3, P.z); sim(.2);
    ok('ganimet: üstüne yürüyünce kendiliğinden alınıyor', SYS.inv.length === inv0 + 1 && !X.LOOT.some((l) => l.it === it), { envanter: SYS.inv.length });
    ok('ganimet: daha iyi silah kendiliğinden kuşanılıyor ve hasar artıyor', SYS.eq.weapon === it.id && X.weaponDmg() > w0, { önce: w0, sonra: Math.round(X.weaponDmg()) });
    ok('ganimet: kılıcın görünüşü değişiyor (boy)', Math.abs(G.SK.bladeLen - blade0) > .05, { önce: blade0, sonra: G.SK.bladeLen });
    // a goblin kill rolls loot with the region's level
    const g = smallGob(); g.x = P.x + 1.5; g.z = P.z; const n0 = X.LOOT.length; let rolls = 0, sumLv = 0;
    for (let i = 0; i < 30; i++) { const before = X.LOOT.length; X.lootFor({ x: P.x + 40, z: P.z, lv: 9 }, 2, 10); for (const l of X.LOOT.slice(before)) { rolls++; sumLv += l.it.lv; } }
    ok('ganimet: mini boss her zaman eşya düşürüyor, seviyesi bölgeyle aynı', rolls >= 30 && sumLv / rolls === 9, { eşya: rolls });
    for (const l of X.LOOT.slice(n0)) l.t = 9999; sim(.05);
    // rarity weights: tier 0 mostly common, tier 3 never below its tier
    const c0 = [0, 0, 0, 0, 0], c3 = [0, 0, 0, 0, 0]; for (let i = 0; i < 2000; i++) { c0[X.randomDrop(5, 0).rar]++; c3[X.randomDrop(5, 3).rar]++; }
    ok('ganimet: nadirlik dağılımı (sıradan çok, efsanevi çok az; boss ganimeti asla düşük değil)', c0[0] > 900 && c0[4] < 60 && c3[0] + c3[1] + c3[2] === 0, { normal: c0, boss: c3 });
  });

  // ---------------------------------------------------------------- 2. blacksmith: salvage + upgrade
  await sec('demirci', async () => {
    const junk = X.makeItem('iron', 3, 1); X.giveItem(junk, true); if (SYS.eq.weapon === junk.id) X.equip(SYS.inv.find((i) => i.slot === 'weapon' && i.id !== junk.id));
    const s0 = SYS.shards; X.salvage(junk);
    ok('demirci: parçalama demir parçası veriyor, eşya gidiyor', SYS.shards === s0 + 3 && !SYS.inv.includes(junk), { parça: SYS.shards });
    const w = SYS.inv.find((i) => i.id === SYS.eq.weapon), d0 = X.weaponDmg(), c = X.upgradeCost(w); SYS.gold = c.gold; SYS.shards = c.shards;
    const r = X.upgrade(w);
    ok('demirci: geliştirme +1, hasar %8 artıyor, bedel düşüyor', r && w.up === 1 && X.weaponDmg() > d0 * 1.07 && SYS.gold === 0 && SYS.shards === 0, { hasar: [Math.round(d0), Math.round(X.weaponDmg())] });
    ok('demirci: parası yoksa geliştirmiyor', X.upgrade(w) === false && w.up === 1);
  });

  // ---------------------------------------------------------------- 3. flask
  await sec('iksir', async () => {
    freshP(T0[0], T0[1]); SYS.flasks = 2; P.hp = 30; X.drinkFlask(); const st = P.st; sim(1.3);
    ok('iksir: içme animasyonu, can %45 doluyor, şişe azalıyor, sonra hareket', st === 'drink' && P.hp > 30 + X.maxHP() * .4 && SYS.flasks === 1 && P.st === 'move', { can: Math.round(P.hp), şişe: SYS.flasks });
    SYS.flasks = 0; X.drinkFlask(); ok('iksir: şişe yoksa içilmiyor', P.st === 'move');
  });

  // ---------------------------------------------------------------- 4. altars: rest, respawn, checkpoint, fast travel
  await sec('sunak', async () => {
    const A = X.ALTARS[2]; freshP(A.x + 1.2, A.z + 1.2); P.hp = 10; SYS.flasks = 0;
    const dead = smallGob(); dead.dead = 1; dead.deadT = 50; const dx = dead.x;
    G.press('inter'); sim(.1);
    ok('sunak: ETKİLEŞ ile dinlenme: can ve iksir doluyor, kontrol noktası', P.hp === X.maxHP() && SYS.flasks === SYS.flaskMax && SYS.altarAt === 2, { can: P.hp, şişe: SYS.flasks });
    ok('sunak: dinlenince ölen düşmanlar geri geliyor', !dead.dead && dead.x === dead.hx, { x: [dx, dead.x] });
    await closeUI(); X.restAt(1); const box = document.getElementById('travel'), btns = box.querySelectorAll('button');
    ok('sunak: iki sunak yanınca hızlı yolculuk penceresi açılıyor', box.style.display === 'flex' && btns.length >= 2, { düğme: btns.length });
    const b = Array.from(btns).find((x) => x.dataset.i === '2'); b.click();
    ok('sunak: hızlı yolculuk diğer sunağa götürüyor', Math.hypot(P.x - A.x, P.z - A.z) < 3 && SYS.altarAt === 2, { uzaklık: +Math.hypot(P.x - A.x, P.z - A.z).toFixed(1) });
  });

  // ---------------------------------------------------------------- 5. death drops the gold bag; respawn at altar; pick it back up
  await sec('ölüm', async () => {
    freshP(T0[0], T0[1]); isolate(T0[0], T0[1]); SYS.gold = 140; SYS.altarAt = 2; const at = [P.x, P.z];
    G.hitPlayer({ dmg: 99999, knock: 'down' });
    ok('ölüm: altın kesesi öldüğün yerde kalıyor, altın 0', SYS.bag && SYS.bag.gold === 140 && SYS.gold === 0 && Math.hypot(SYS.bag.x - at[0], SYS.bag.z - at[1]) < .5, SYS.bag);
    sim(6, () => P.alive ? false : undefined);
    const A = X.ALTARS[2];
    ok('ölüm: son dinlenilen sunakta yeniden doğuyor', P.alive && Math.hypot(P.x - A.x, P.z - A.z) < 4, { uzaklık: +Math.hypot(P.x - A.x, P.z - A.z).toFixed(1) });
    G.tp(at[0], at[1]); sim(.1);
    ok('ölüm: keseye dönünce altın geri geliyor', SYS.gold === 140 && !SYS.bag, { altın: SYS.gold });
  });

  // ---------------------------------------------------------------- 6. chest
  await sec('sandık', async () => {
    const i = X.CHESTS.findIndex((c, k) => !(SYS.chests && SYS.chests[k]) && c.tier >= 2), c = X.CHESTS[i];
    freshP(c.x + Math.sin(c.yaw) * 1.4, c.z + Math.cos(c.yaw) * 1.4); isolate(c.x, c.z, 30); const l0 = X.LOOT.length + SYS.inv.length, n0 = SYS.chestsOpened || 0;
    G.press('inter'); sim(.4);
    ok('sandık: ETKİLEŞ ile açılıyor, en az 2 eşya + altın, kapak açılıyor', SYS.chests[i] && X.LOOT.length + SYS.inv.length - l0 >= 2 && (SYS.chestsOpened || 0) === n0 + 1, { yeni_ganimet: X.LOOT.length + SYS.inv.length - l0, sandık: c.name });
    G.press('inter'); sim(.1); ok('sandık: ikinci kez açılmıyor', (SYS.chestsOpened || 0) === n0 + 1);
    ok('sandık: haritada en az 30 sandık (tasarlanmış + gizli)', X.CHESTS.length >= 30, X.CHESTS.length);
  });

  // ---------------------------------------------------------------- 7. region levels scale enemies
  await sec('seviye', async () => {
    const k = G.GOBS.filter((g) => !g.big && !g.boss), lvs = {}; for (const g of k) lvs[g.camp && g.camp.id !== undefined ? g.camp.id : g.group] = g.lv;
    const lo = k.reduce((a, g) => Math.min(a, g.lv), 99), hi = k.reduce((a, g) => Math.max(a, g.lv), 0), glo = k.find((g) => g.lv === lo), ghi = k.find((g) => g.lv === hi);
    ok('bölge seviyesi: kamplar farklı seviyede, yüksek seviyede can daha fazla', hi > lo && ghi.max > glo.max, { en_düşük: [lo, glo.max], en_yüksek: [hi, ghi.max] });
    ok('bölge seviyesi: krallık 1, ejder yuvası 18', X.regionLevel(0, 0) === 1 && X.regionLevel(0, -1000) >= 14, [X.regionLevel(0, 0), X.regionLevel(0, -1000)]);
    // same hit hurts more from a high level enemy (behaviour stays the same; numbers grow gently)
    freshP(T0[0], T0[1]); const h0 = P.hp; G.hitPlayer({ dmg: 20, src: { x: P.x, z: P.z + 2, lv: 1 }, knock: 'none' }); const d1 = h0 - P.hp; P.hp = h0;
    G.hitPlayer({ dmg: 20, src: { x: P.x, z: P.z + 2, lv: 12 }, knock: 'none' }); const d12 = h0 - P.hp; P.hp = h0;
    ok('bölge seviyesi: Sv.12 düşmanın aynı vuruşu daha çok acıtıyor', d12 > d1 * 1.8, { sv1: +d1.toFixed(1), sv12: +d12.toFixed(1) });
  });

  // ---------------------------------------------------------------- 8. posture break -> execution
  await sec('infaz', async () => {
    freshP(T0[0], T0[1]); isolate(T0[0], T0[1]); calmAll();
    const g = smallGob(); g.x = P.x; g.z = P.z + 1.6; g.yaw = Math.PI; g.hp = g.max = 400; g.st = 'chase'; g.aware = 1; g.pos = 0;
    let broke = false; for (let i = 0; i < 12 && !broke; i++) { X.addPosture(g, 12); broke = X.isBroken(g); }
    ok('duruş: vuruşlar dengeyi dolduruyor, dolunca düşman sarsılıyor', broke && g.st === 'stagger', { durum: g.st });
    sim(.05); X.uiTick(1); ok('duruş: kırılınca "SALDIR: İNFAZ" çıkıyor ve hedef seçiliyor', X.execTarget() === g && document.getElementById('prompt').textContent.includes('İNFAZ'), JSON.stringify({ p: document.getElementById('prompt').textContent, et: !!X.execTarget(), same: X.execTarget() === g, br: X.isBroken(g), st: g.st, d: Math.hypot(g.x - P.x, g.z - P.z).toFixed(2), pst: P.st }));
    const hp0 = g.hp; IN.atkEdge = true; IN.atkHeld = true; sim(.05); IN.atkHeld = false; IN.atkUp = true; const st = P.st; sim(2, () => P.st === 'move' ? false : undefined);
    ok('infaz: SALDIR ile infaz animasyonu, silah hasarının ~4 katı', st === 'exec' && hp0 - g.hp > X.weaponDmg() * 3.5, { hasar: hp0 - g.hp, silah: Math.round(X.weaponDmg()) });
    // a big goblin needs many hits; a parry pushes posture a lot (posture also drains if you stop)
    const b = G.GOBS.find((x) => x.big && !x.boss && !x.dead); b.pos = 0; X.addPosture(b, 30); const p1 = b.pos; b.posT = 0; for (let i = 0; i < 120; i++) G.step(DT);
    ok('duruş: saldırmazsan denge yavaş yavaş geri geliyor', b.pos < p1, { önce: p1, sonra: +b.pos.toFixed(1) });
  });

  // ---------------------------------------------------------------- 9. rage
  await sec('öfke', async () => {
    freshP(T0[0], T0[1]); isolate(T0[0], T0[1]); P.rage = 0;
    for (let i = 0; i < 40; i++) X.gainRage(5);
    ok('öfke: dövüşürken doluyor (100)', P.rage === 100);
    X.startRage(); ok('öfke: ÖFKE düğmesi Kara Zırh\'ı kızıla boyuyor (12 sn)', P.berserk > 11.5 && P.rage === 0);
    const r = G.hitPlayer({ dmg: 10, knock: 'flinch', src: { x: P.x, z: P.z + 2 } }); ok('öfke: öfkedeyken küçük vuruşlar sendeletmiyor', P.st === 'move', P.st);
    sim(12.5); ok('öfke: bitince 3 sn nefes nefese (bedeli var)', !(P.berserk > 0) && P.exhaustT > 0, { yorgun: P.exhaustT });
    ok('öfke: düğme görünürlüğü dolunca açılıyor', (() => { P.rage = 100; sim(.05); X.uiTick(1); const v = getComputedStyle(document.getElementById('bRage')).display !== 'none'; P.rage = 0; sim(.05); return v; })());
  });

  // ---------------------------------------------------------------- 10. skills (new moves)
  await sec('yetenek', async () => {
    freshP(T0[0], T0[1]); isolate(T0[0], T0[1]); calmAll(); SYS.skills = {}; SYS.skill = null;
    X.useSkill(); ok('yetenek: açılmadan kullanılamıyor', P.st === 'move');
    X.unlockSkill('spin'); const gs = G.GOBS.filter((g) => !g.big && !g.boss && !g.dead).slice(0, 3);
    gs.forEach((g, i) => { const a = i * 2.1; g.x = P.x + Math.cos(a) * 2; g.z = P.z + Math.sin(a) * 2; g.hp = g.max = 500; g.st = 'idle'; g.aware = 0; });
    X.useSkill(); const st = P.st; sim(1.1);
    const hit = gs.filter((g) => g.hp < 500).length;
    ok('Dönen Kesik: etraftaki 3 düşmanın hepsine iki kez vuruyor', st === 'skill' && hit === 3 && gs.every((g) => g.hp <= 500 - 2 * X.weaponDmg() * .8), { vurulan: hit, canlar: gs.map((g) => g.hp) });
    X.useSkill(); ok('yetenek: bekleme süresi var', P.st === 'move');
    gs.forEach((g) => { g.x += 400; g.hx = g.x; g.st = 'idle'; g.aware = 0; }); freshP(T0[0], T0[1]); X.unlockSkill('dash'); SYS.skill = 'dash'; P.yaw = 0; const z0 = P.z; X.useSkill(); sim(.6);
    ok('Gölge Adımı: 5 m+ ileri atılıyor, sırasında dokunulmaz', P.z - z0 > 5, { mesafe: +(P.z - z0).toFixed(2) });
    X.unlockSkill('roar'); SYS.skill = 'roar'; freshP(T0[0], T0[1]); const g = gs[0]; g.x = P.x + 2; g.z = P.z; g.st = 'chase'; g.aware = 1; g.dead = 0; X.useSkill(); sim(.6);
    ok('Savaş Kükremesi: küçük düşmanı korkutup kaçırıyor', g.fear > GT.clock && Math.hypot(g.x - P.x, g.z - P.z) > 2, { uzaklık: +Math.hypot(g.x - P.x, g.z - P.z).toFixed(1) });
  });

  // ---------------------------------------------------------------- 11. lock-on
  await sec('hedef', async () => {
    freshP(T0[0], T0[1]); isolate(T0[0], T0[1]); calmAll();
    const g = smallGob(); g.x = P.x + 6; g.z = P.z + 6; g.st = 'chase'; g.aware = 1; G.CAM.yaw = 0.5;
    X.toggleLock(); ok('hedef kilidi: önündeki düşmanı seçiyor', P.lock === g);
    G.CAM.yaw = -1.2; for (let i = 0; i < 90; i++) { GT.time += DT; G.step(DT); G.render(DT); }
    const want = Math.atan2(g.x - P.x, g.z - P.z), err = Math.abs(Math.atan2(Math.sin(want - G.CAM.yaw), Math.cos(want - G.CAM.yaw)));
    ok('hedef kilidi: kamera hedefe dönüyor', err < .25, { sapma: +err.toFixed(2) });
    X.toggleLock(); ok('hedef kilidi: tekrar basınca bırakıyor', !P.lock);
  });

  // ---------------------------------------------------------------- 12. mini boss: Kül Yele (alpha wolf)
  await sec('Kül Yele', async () => {
    const a = X.BOSSES.find((b) => G.isWolf(b)); freshP(a.x + 6, a.z + 6); calmAll();
    a.st = 'circle'; a.aware = 1; a.t = 0; a.hp = a.max; a.phase = 1;
    ok('Kül Yele: güçlü ama makul (Sv.4, 520+ can)', a.lv === 4 && a.max >= 520 && a.max < 1500, { sv: a.lv, can: a.max });
    a.hp = a.max * .45; const near0 = G.wolves.filter((w) => !w.dead && !w.tame && w !== a && G.hostileSt(w)).length; let howled = false;
    sim(2.5, () => { if (a.st === 'howl') howled = true; });
    const near1 = G.wolves.filter((w) => !w.dead && !w.tame && w !== a && G.hostileSt(w)).length;
    ok('Kül Yele: canı yarıya inince uluyor (1.4 sn görünür) ve sürüyü çağırıyor (2. aşama)', howled && a.phase === 2 && near1 >= near0 + 3, { önce: near0, sonra: near1 });
    for (const w of G.wolves) if (w !== a && (w.summoned || w.den)) { w.dead = 1; }
    let s = null; a.hp = 1; X.foeHurt(a, 50, 0, 1); if (a.dead || a.hp <= 0) { X.onFoeKilled(a, false); }
    sim(.2); await wait(1100); await closeUI();
    ok('Kül Yele: yenilince efsanevi «Kül Yele\'nin Dişi» + Dönen Kesik', SYS.ashmane && SYS.inv.some((i) => i.uniq === 'ashmane') && SYS.skills.spin, { ashmane: SYS.ashmane });
  });

  // ---------------------------------------------------------------- 13. mini boss: Kırık Diş (goblin chief)
  await sec('Kırık Diş', async () => {
    const c = X.BOSSES.find((b) => b.chief); c.x = c.hx; c.z = c.hz; freshP(c.x, c.z + 3, Math.PI); calmAll(); c.hp = c.max; c.phase = 1;
    ok('Kırık Diş: Sv.7, 720+ can, büyük', c.lv === 7 && c.max >= 720, { sv: c.lv, can: c.max });
    // every move type shows up when fighting at range 2.5 m
    const seen = {}; c.st = 'chase'; c.aware = 1; c.ls = [P.x, P.z]; c.phase = 2;
    sim(40, () => { P.hp = 999; P.st = 'move'; P.alive = true; P.x = c.x; P.z = c.z + 2.6; if (c.st === 'horn') c.st = 'chase'; if (c.st === 'windup') seen[c.move || 'smash'] = Math.max(seen[c.move || 'smash'] || 0, c.t); });
    ok('Kırık Diş: üç farklı saldırı (ezme, savurma, yere vurma) ve hepsinin hazırlığı görülüyor (>0.8 sn)', Object.keys(seen).length >= 3 && Object.values(seen).every((t) => t > .8), seen);
    // stomp shockwave: jumping avoids it
    const stomp = (jump) => { isolate(c.x, c.z, 40); freshP(c.x, c.z + 3.5, Math.PI); c.st = 'windup'; c.move = 'stomp'; c.t = 0; c.hitDone = false; const h0 = P.hp; let air = false;
      sim(2.2, (t) => { c.yaw = 0; if (jump && c.t > .82 && !P.air && !air) { G.press('jump'); air = true; } if (c.st === 'recover') return false; }); return h0 - P.hp; };
    const dGround = stomp(false), dJump = stomp(true);
    ok('Kırık Diş: yere vurma dalgası yerdeyken vuruyor, zamanında ZIPLA ile atlanıyor', dGround > 10 && dJump === 0, { yerde: Math.round(dGround), zıplayınca: Math.round(dJump) });
    // phase 2: horn calls camp goblins
    freshP(c.x, c.z + 6, Math.PI); c.hp = c.max * .45; c.phase = 1; c.st = 'chase'; c.t = 0;
    sim(2.5); const called = G.GOBS.filter((g) => g.called && !g.dead).length;
    ok('Kırık Diş: canı yarıya inince boru çalıyor, kamptakiler koşuyor (2. aşama)', c.phase === 2 && called >= 3, { çağrılan: called });
    c.hp = 1; if (X.foeHurt(c, 50, 0, 1)) X.onFoeKilled(c, false); sim(.1); await closeUI();
    ok('Kırık Diş: yenilince «Kırık Diş\'in Halkası» + Savaş Kükremesi', SYS.chief && SYS.inv.some((i) => i.uniq === 'brokenfang') && SYS.skills.roar);
  });

  // ---------------------------------------------------------------- 14. main quest chain + manhwa + Veyra's choice
  await sec('hikâye', async () => {
    SYS.main = 0; SYS.walked = 40; sim(.05);
    ok('görev: Uyanış biter, sıradaki «Ay Köyü» ve pusula hedefi gösteriyor', SYS.main === 1 && !!X.questTarget(), { ana: SYS.main, hedef: X.questTarget() });
    const el = G.NPCS.find((n) => n.role === 'elder'); freshP(el.x, el.z + 1.5, Math.PI); el.x = el.post ? el.post[0] : el.x;
    G.press('inter'); sim(.05);
    const m = document.getElementById('manhwa'); await waitPanels();
    ok('görev: İhtiyar Doran ile konuşunca manhwa bölümü açılıyor, oyun duruyor', m.style.display === 'block' && GT.inStory === true);
    const shots = X.CINE.shots.length, i0 = X.CINE.i; await wait(1500); const txt = m.querySelector('.cn-txt').textContent, who = m.querySelector('.cn-who').textContent; m.querySelector('.mh-next').click(); m.querySelector('.mh-next').click(); const i1 = X.CINE.i;
    ok('manhwa: hareketli sahne oynuyor — yazı kendiliğinden yazılıyor, ▶ sonraki panele geçiyor', X.CINE.on && shots >= 2 && txt.length > 2 && who.length > 2 && i1 === i0 + 1, { sahne: shots, konusan: who, yazi: txt.slice(0, 30), gecis: [i0, i1] });
    await closeUI(); ok('görev: «Kurt Sürüsü» başladı', SYS.main === 2 && GT.inStory === false, SYS.main);
    for (let i = 0; i < 5; i++) X.questEvent('kill', G.wolves.find((w) => !w.boss)); sim(.05);
    ok('görev: 5 kurt → «Kül Yele» (Kül Yele zaten yenildiyse hemen «Köye Dönüş»)', SYS.main >= 3, SYS.main);
    sim(.05); ok('görev: Kül Yele yenildi → «Köye Dönüş»', SYS.main === 4, SYS.main);
    G.press('inter'); sim(.05); await closeUI(); sim(.05);
    ok('görev: Doran 2. bölüm → «Kırık Diş», şef zaten yenildi → «Kayıp Köylüler»', SYS.main === 6, SYS.main);
    const cage = { x: X.questTarget()[0], z: X.questTarget()[1] }; freshP(cage.x + 1, cage.z + 1); G.press('inter'); sim(.05);
    ok('görev: kafes açılınca bölüm paneli, sonra «Zincirli Prenses»', SYS.cagesOpen && m.style.display === 'block');
    await closeUI(); sim(.05); ok('görev: «Zincirli Prenses»', SYS.main === 7, SYS.main);
    const sh = X.questTarget(); freshP(sh[0] + 3, sh[1] + 3); sim(.1); await waitPanels();
    m.querySelector('.mh-skip').click(); const atChoice = X.CINE.on && X.CINE.shots[X.CINE.i].choice; for (let k = 0; k < 3; k++) m.querySelector('.mh-next').click();
    ok('Veyra: tapınağa yaklaşınca prenses bölümü; ATLA seçim paneline götürür, seçim zorunlu', m.style.display === 'block' && atChoice && X.CINE.on && getComputedStyle(m.querySelector('.mh-ch')).display === 'flex');
    ok('Veyra: seçim varken ATLA yok', getComputedStyle(m.querySelector('.mh-skip')).display === 'none');
    document.getElementById('mhFree').click(); sim(.05); await waitPanels();
    ok('Veyra: «Zincirlerini kır» → yoldaş oluyor', SYS.veyraFate === 'freed' && X.VEYRA.on);
    await closeUI(); sim(.1); ok('görev: «Kül Kanat» (ejderha) başladı', SYS.main === 8, SYS.main);
  });

  // ---------------------------------------------------------------- 15. Veyra's own mind
  await sec('Veyra yapay zekâ', async () => {
    const V = X.VEYRA; freshP(T0[0], T0[1]); isolate(T0[0], T0[1]); calmAll(); V.x = P.x - 2; V.z = P.z - 2; V.hp = V.max; V.down = false; V.act = null; V.cd = {};
    const gs = G.GOBS.filter((g) => !g.big && !g.boss && !g.dead).slice(0, 3); gs.forEach((g, i) => { g.x = P.x + 6 + i; g.z = P.z + 5; g.hx = g.x; g.hz = g.z; g.hp = g.max = 300; g.st = 'chase'; g.aware = 1; g.ls = [P.x, P.z]; g.yaw = Math.PI; });
    const acts = {}; sim(8, () => { P.hp = X.maxHP(); if (V.act) acts[V.act] = 1; });
    const dmg = gs.reduce((a, g) => a + (300 - Math.max(0, g.hp)), 0);
    ok('Veyra: düşmana kendi başına saldırıyor (yakın/uzak seçiyor)', dmg > 60 && Object.keys(acts).length >= 2, { hasar: dmg, eylemler: Object.keys(acts) });
    for (const g of gs) { g.dead = 1; } V.act = null; V.cd = {}; P.hp = X.maxHP() * .2; sim(2, () => { if (V.act) acts[V.act] = 1; });
    ok('Veyra: canın azalınca seni iyileştiriyor', acts.heal && P.hp > X.maxHP() * .25, { can: Math.round(P.hp) });
    // a goblin winding up right in front of her: she dodges
    const g = gs[0]; g.dead = 0; g.hp = 300; V.act = null; V.cd = {}; V.think = 0; g.x = V.x; g.z = V.z + 1.8; g.yaw = Math.PI; g.st = 'windup'; g.t = 0; g.aware = 1; let dodged = false;
    sim(.6, () => { g.st = 'windup'; g.t = Math.min(g.t, .2); if (V.act === 'dodge') dodged = true; });
    ok('Veyra: önündeki düşman saldırıya hazırlanınca kaçınıyor', dodged);
    V.hp = 0; sim(.1); ok('Veyra: canı biterse yere düşüyor (✚)', V.down);
    freshP(V.x + 1, V.z); G.press('inter'); sim(.1); ok('Veyra: yanına gidip ETKİLEŞ ile kaldırılıyor', !V.down && V.hp > 0);
  });

  // ---------------------------------------------------------------- 16. system window tabs render
  await sec('arayüz', async () => {
    const bad = []; for (const t of ['durum', 'envanter', 'yetenek', 'gorev', 'harita', 'demirci', 'ayar']) { try { X.openWin(t); const w = document.getElementById('win'); if (w.innerText.length < 40) bad.push(t + ':boş'); } catch (e) { bad.push(t + ':' + e.message); } }
    for (let k = 0; k < 3; k++) X.giveItem(X.makeItem('charm', 1, 0), true); X.openWin('envanter'); const items = document.querySelectorAll('#win .item').length;
    ok('arayüz: Sistem penceresinin 7 sekmesi de açılıyor', bad.length === 0, bad.join(','));
    ok('arayüz: envanter eşyaları listeliyor', items >= 3, items);
    const w = document.getElementById('win'); ok('arayüz: lisans/kaynak bilgisi ayarlar sekmesinde', (X.openWin('ayar'), /lisans|CC/i.test(w.innerText)));
    document.getElementById('bSys') && (document.getElementById('win').style.display = 'none');
    X.openWin('durum'); const closeBtn = document.querySelector('#win #wclose,#win .close,#wclose'); if (closeBtn) closeBtn.click(); else document.getElementById('win').style.display = 'none';
  });

  // ---------------------------------------------------------------- 17. save / load round trip
  await sec('kayıt', async () => {
    X.save(P); const raw = JSON.parse(localStorage.getItem('kf2_save'));
    ok('kayıt: envanter, kuşanılanlar, sunaklar, sandıklar, görev, Veyra kararı kaydediliyor', raw.inv.length === SYS.inv.length && raw.eq.weapon === SYS.eq.weapon && raw.altars && raw.chests && raw.main === SYS.main && raw.veyraFate === 'freed', { eşya: raw.inv.length, ana: raw.main });
  });
  return out;
};
