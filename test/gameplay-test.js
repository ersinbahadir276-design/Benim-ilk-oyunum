// Oynanış testleri: tarayıcıda gerçek oyun döngüsünü hızlandırarak çalıştırır.
// Kullanım: test/run-tests.mjs (Playwright) ya da konsolda:  await runGameplayTests()
window.runGameplayTests = async function () {
  const G = window.GAME, P = G.player, out = [];
  const THREE_V = P.hero.root.position.constructor; // three.js Vector3 (modül dışından erişim)
  const real = G.running; G.running = false; // gerçek zamanlı döngüyü durdur, elle ilerlet
  const sim = (sec, each) => { const n = Math.round(sec * 30); for (let i = 0; i < n; i++) { if (each && each(i) === false) break; G.update(1 / 30); } };
  const ok = (name, cond, extra = '') => out.push({ name, pass: !!cond, extra: String(extra) });
  const find = (kind) => G.animals.find((a) => a.kind === kind && !a.dead && !a.tamed);
  const calmAll = () => G.animals.forEach((a) => { if (!a.tamed) { a.target = null; a.calmT = 0; } });
  const put = (a, dist, behind = false) => { const s = behind ? -1 : 1; P.x = a.x + Math.sin(a.yaw) * dist * s; P.z = a.z + Math.cos(a.yaw) * dist * s; P.y = 0; P.speed = 0; P.hp = P.hpMax; P.alive = true; P.state = 'move'; };
  const freeze = (a) => { a.calmT = 999; a.state = 'idle'; a.stT = 999; a.target = null; };
  const release = () => { [...G.pets].forEach((p) => G.removePet(p, false)); };
  const give = (o) => Object.entries(o).forEach(([k, v]) => G.inv.add(k, v));
  give({ carrot: 9, berry: 9, apple: 9, meat: 30, fish: 9, honey: 9, moonstone: 3, dragongem: 3 });
  G.keys = {}; G.edge = {};

  // 1) oyuncu animasyon durumları
  P.x = 0; P.z = 6; sim(0.5); ok('oyuncu: bekleme klibi', P.cur._clip.name === 'Idle_Loop', P.cur._clip.name);
  G.keys.w = true; sim(1); ok('oyuncu: koşu (jog) klibi', P.cur._clip.name === 'Jog_Fwd_Loop' && P.speed > 3, P.cur._clip.name + ' ' + P.speed.toFixed(1));
  G.keys.run = true; sim(1); ok('oyuncu: depar klibi', P.cur._clip.name === 'Sprint_Loop', P.cur._clip.name); G.keys.run = false;
  G.edge.jump = true; sim(0.4); ok('oyuncu: zıplama', P.state === 'jump' && P.y > 0.5, P.state + ' y=' + P.y.toFixed(2)); sim(1.5); ok('oyuncu: yere iniş', P.state === 'move', P.state);
  G.edge.roll = true; sim(0.2); ok('oyuncu: takla/kaçınma + dokunulmazlık', P.state === 'roll' && P.iframes > 0 && P.cur._clip.name === 'Roll', P.state); sim(1.2);
  G.keys.w = false; sim(0.5); G.edge.crouch = true; sim(0.5); ok('oyuncu: çömelme klibi', P.crouching && P.cur._clip.name === 'Crouch_Idle_Loop', P.cur._clip.name);
  G.keys.w = true; sim(0.6); ok('oyuncu: çömelerek yürüme', P.cur._clip.name === 'Crouch_Fwd_Loop', P.cur._clip.name); G.keys.w = false; G.edge.crouch = true; sim(0.4);
  G.edge.attack = true; sim(0.15); ok('oyuncu: kılıç saldırısı', P.state === 'attack' && P.cur._clip.name === 'Sword_Regular_A', P.cur._clip.name); G.edge.attack = true; sim(0.6); ok('oyuncu: kombo 2', P.cur._clip.name === 'Sword_Regular_B', P.cur._clip.name); sim(1.5);

  // 1b) yay kemikleri: saç ve ceket eteği harekete tepki verir, NaN üretmez, durunca yatışır
  {
    const S = P.hero.spring, J = S ? S.joints : [];
    ok('kahraman: yay kemikleri yüklendi (saç + ceket)', J.length >= 20 && J.some((j) => /Hair/.test(j.bone.name)) && J.some((j) => /Coat/.test(j.bone.name)), J.length);
    const dev = () => J.reduce((m, j) => Math.max(m, j.bone.quaternion.angleTo(j.initLocalQ)), 0);
    const finite = () => J.every((j) => Number.isFinite(j.bone.quaternion.x) && Number.isFinite(j.curTail.x));
    P.x = 0; P.z = 6; S.reset(); G.keys.w = true; G.keys.run = true; let mx = 0; sim(1.2, () => { mx = Math.max(mx, dev()); });
    G.keys.w = false; G.keys.run = false;
    ok('kahraman: koşarken saç/etek sallanır', mx > 0.05 && finite(), 'maks açı=' + mx.toFixed(3));
    sim(4); const rest = dev();
    ok('kahraman: durunca yay kemikleri yatışır', rest < mx * 0.6 && finite(), 'açı=' + rest.toFixed(3));
    const lens = J.map((j) => S.tailWorld(j).distanceTo(new THREE_V().setFromMatrixPosition(j.bone.matrixWorld)) / j.length);
    ok('kahraman: kemik uzunlukları korunur', lens.every((r) => Math.abs(r - 1) < 0.02), Math.max(...lens.map((r) => Math.abs(r - 1))).toFixed(4));
    P.x = 0; P.z = 6;
  }

  // 1c) yüz: blendshape ifadeleri, göz kırpma, baş/göz bakışı
  {
    const F = P.hero.face, sh = F ? F.shapes : {};
    const inf = (n) => (sh[n] ? Math.max(...sh[n].map((b) => b.m.morphTargetInfluences[b.i])) : -1);
    ok('kahraman: yüz blendshape grupları yüklendi', ['blink', 'joy', 'angry', 'sorrow', 'surprised', 'a', 'o'].every((n) => sh[n]?.length), Object.keys(sh).join(','));
    calmAll(); P.x = 0; P.z = 6; P.yaw = Math.PI; P.hp = P.hpMax; G.keys = {}; G.edge = {}; let mb = 0; sim(9, () => { mb = Math.max(mb, inf('blink')); });
    ok('kahraman: kendiliğinden göz kırpar', mb > 0.8, 'maks=' + mb.toFixed(2));
    G.edge.attack = true; let ma = 0, mo = 0; sim(0.7, () => { ma = Math.max(ma, inf('angry')); mo = Math.max(mo, inf('a')); });
    ok('kahraman: saldırırken öfkeli ifade + bağırış', ma > 0.5 && mo > 0.2, `öfke=${ma.toFixed(2)} ağız=${mo.toFixed(2)}`); sim(1.5);
    P.iframes = 0; P.damage(5, null); sim(0.15); ok('kahraman: hasar alınca acı ifadesi', inf('sorrow') > 0.4, inf('sorrow').toFixed(2)); sim(1);
    // bakış: önündeki hayvana baş ve gözler döner
    const a = G.animals.find((x) => !x.dead && !x.tamed && x.alt === 0 && x.spec.kind !== 'bird');
    const keep = { x: a.x, z: a.z }; freeze(a); P.x = 0; P.z = 6; P.yaw = 0; sim(1.5);
    const head = P.hero.head, q0 = head.getWorldQuaternion(new head.quaternion.constructor());
    const fwd = () => new THREE_V(0, 0, 1).applyQuaternion(head.getWorldQuaternion(new head.quaternion.constructor()).multiply(q0.clone().invert()));
    a.x = P.x + 3.5 * Math.sin(1.0); a.z = P.z + 3.5 * Math.cos(1.0); P._lookT = 0; sim(1.5, () => { a.x = P.x + 3.5 * Math.sin(1.0); a.z = P.z + 3.5 * Math.cos(1.0); P.yaw = 0; });
    const dir = new THREE_V(a.x - P.x, 0, a.z - P.z).normalize(), f = fwd(); f.y = 0; f.normalize();
    ok('kahraman: ilgi çeken hayvana başını çevirir', P._lookA === a && F.lookW > 0.8 && f.angleTo(dir) < 0.65, `açı=${f.angleTo(dir).toFixed(2)} yaw=${F.yaw.toFixed(2)} w=${F.lookW.toFixed(2)}`);
    ok('kahraman: gözler de hedefe döner', Math.abs(F.eyeYaw) > 0.02 && Math.sign(F.eyeYaw) === Math.sign(F.yaw), F.eyeYaw.toFixed(3));
    // göz kemikleri animasyonsuz: ek dönüş karelerce birikmemeli (göz bebeği kaybolmaz)
    const eyeRest = F.eyes.map((e) => e.quaternion.clone()); sim(3, () => { a.x = P.x + 3.5 * Math.sin(1.0); a.z = P.z + 3.5 * Math.cos(1.0); P.yaw = 0; });
    const drift = Math.max(...F.eyes.map((e, i) => e.quaternion.angleTo(eyeRest[i])));
    ok('kahraman: göz dönüşü birikmez', F.eyes.length === 2 && drift < 0.05 && F.eyes.every((e) => e.quaternion.angleTo(new head.quaternion.constructor()) < 0.4), 'kayma=' + drift.toFixed(3));
    a.x = keep.x; a.z = keep.z; a.calmT = 0; a.stT = 0; P.x = 0; P.z = 6; P.yaw = Math.PI; P._lookT = 0;
    const away = G.animals.filter((x) => Math.hypot(x.x - P.x, x.z - P.z) < 12).map((x) => [x, x.x, x.z]); away.forEach(([x]) => { x.x += 200; });
    sim(2); ok('kahraman: hedef yokken bakış sıfırlanır', F.lookW < 0.2, F.lookW.toFixed(2) + ' ' + (P._lookA?.kind || '-'));
    away.forEach(([x, ox, oz]) => { x.x = ox; x.z = oz; });
    const finite = ['J_Bip_C_Neck', 'J_Bip_C_Head'].every((n) => Number.isFinite(P.hero.root.getObjectByName(n).quaternion.w));
    ok('kahraman: bakış NaN üretmez', finite);
    P.x = 0; P.z = 6; P.yaw = Math.PI; P.hp = P.hpMax;
  }

  // 1d) ayak IK'si: eğimde ayaklar zemine oturur; darbe tepkisi: katmanlı klip + yönlü savrulma + geri itilme
  {
    const R = P.hero.root, IK = P.ik, gnd = IK.ground, feet = ['J_Bip_L_Foot', 'J_Bip_R_Foot'].map((n) => R.getObjectByName(n));
    const clear = () => feet.map((f) => { const v = f.getWorldPosition(new THREE_V()); return v.y - gnd(v.x, v.z); });
    let bx = 0, bz = 0, bg = 0; // test için ~30° eğimli bir yer bul
    for (let x = -60; x <= 60; x += 3) for (let z = -120; z <= -40; z += 3) { const s = Math.hypot(gnd(x + 0.5, z) - gnd(x - 0.5, z), gnd(x, z + 0.5) - gnd(x, z - 0.5)); if (s > bg && s < 0.6) { bg = s; bx = x; bz = z; } }
    const yaw = Math.atan2(gnd(bx + 0.5, bz) - gnd(bx - 0.5, bz), gnd(bx, bz + 0.5) - gnd(bx, bz - 0.5)) + Math.PI / 2; // eğime yan dur
    const moved = G.animals.filter((x) => Math.hypot(x.x - bx, x.z - bz) < 30 || Math.hypot(x.x, x.z - 6) < 15).map((x) => [x, x.x, x.z]); moved.forEach(([x]) => { x.x += 300; });
    const stand = (x, z, y, en) => { IK.enabled = en; IK.reset(); P.x = x; P.z = z; P.y = gnd(x, z); P.state = 'move'; P.speed = 0; P.hp = P.hpMax; G.keys = {}; G.edge = {}; sim(1.5, () => { P.yaw = y; }); return clear(); };
    const flat = stand(0, 6, 0, true), off = stand(bx, bz, yaw, false), on = stand(bx, bz, yaw, true);
    const ref = (flat[0] + flat[1]) / 2;
    ok('ayak IK: eğimde iki ayak da zemine oturur', on.every((c) => Math.abs(c - ref) < 0.03) && Math.abs(off[0] - off[1]) > 0.08,
      `eğim=${(Math.atan(bg) * 57.3).toFixed(0)}° IK yok=${off.map((c) => c.toFixed(2))} IK=${on.map((c) => c.toFixed(2))} düz=${ref.toFixed(2)}`);
    ok('ayak IK: kalça aşağıdaki ayağa göre alçalır', IK.debug.pelvis < -0.03 && IK.debug.pelvis > -0.41, IK.debug.pelvis.toFixed(3));
    const leg = (S) => R.getObjectByName(`J_Bip_${S}_LowerLeg`).getWorldPosition(new THREE_V()).distanceTo(R.getObjectByName(`J_Bip_${S}_Foot`).getWorldPosition(new THREE_V()));
    const finite = ['L', 'R'].every((S) => ['UpperLeg', 'LowerLeg', 'Foot'].every((b) => Number.isFinite(R.getObjectByName(`J_Bip_${S}_${b}`).quaternion.w)));
    ok('ayak IK: NaN yok, baldır boyu korunur', finite && Math.abs(leg('L') - leg('R')) < 0.005, leg('L').toFixed(3) + '/' + leg('R').toFixed(3));
    P.x = 0; P.z = 6; P.y = gnd(0, 6); sim(0.5); let mw = 1, my = 0; G.edge.jump = true; sim(1.2, () => { my = Math.max(my, P.y - gnd(P.x, P.z)); if (P.y > gnd(P.x, P.z) + 0.5) mw = Math.min(mw, IK.weight); });
    ok('ayak IK: havadayken devre dışı', my > 0.5 && mw < 0.3, 'ağırlık=' + mw.toFixed(2) + ' y=' + my.toFixed(2)); sim(1.5);
    IK.enabled = true; P.x = 0; P.z = 6; P.y = gnd(0, 6); P.yaw = 0; P.state = 'move'; P.speed = 0; sim(1);

    // darbe: önden gelen saldırgan (sahte), oyuncu geriye itilir, göğüs saldırganın tersine eğilir
    const chest = R.getObjectByName('J_Bip_C_Head'), hipsB = R.getObjectByName('J_Bip_C_Hips');
    const lean = () => { const a = chest.getWorldPosition(new THREE_V()), b = hipsB.getWorldPosition(new THREE_V()); return a.sub(b).setY(0); };
    const l0 = lean(), z0 = P.z, clip0 = P.cur._clip.name;
    P.iframes = 0; P.damage(12, { x: P.x, z: P.z + 2 });
    let maxBack = 0, addOn = false; sim(0.25, () => { maxBack = Math.max(maxBack, -(lean().z - l0.z)); addOn = addOn || (P.hitAct?.isRunning() && P.hitAct.getEffectiveWeight() > 0.3); });
    ok('darbe tepkisi: katmanlı Hit_Chest oynar, yürüme klibi bozulmaz', addOn && P.hero.clips.Hit_Chest_Add?.blendMode === 2501 && P.cur._clip.name === clip0, clip0 + ' → ' + P.cur._clip.name);
    ok('darbe tepkisi: gövde saldırganın tersine savrulur', maxBack > 0.03, 'geri eğilme=' + maxBack.toFixed(3) + ' m');
    ok('darbe tepkisi: hafif geri itilme', z0 - P.z > 0.1 && z0 - P.z < 1, 'itilme=' + (z0 - P.z).toFixed(2) + ' m');
    sim(1.2); const l1 = lean();
    ok('darbe tepkisi: gövde toparlanır (birikme yok)', l1.distanceTo(l0) < 0.03 && Math.abs(P.kbx) + Math.abs(P.kbz) < 0.01, 'fark=' + l1.distanceTo(l0).toFixed(3));
    moved.forEach(([x, ox, oz]) => { x.x = ox; x.z = oz; });
    P.x = 0; P.z = 6; P.y = 0; P.yaw = Math.PI; P.hp = P.hpMax; P.iframes = 0;
  }

  // 2) tavşan: çömelmeden kaçar, çömelince havuçla evcilleşir
  let a = find('rabbit'); put(a, 3); P.crouching = false; sim(0.5); ok('tavşan: ayakta yaklaşınca kaçar', a.state === 'flee', a.state);
  a = find('rabbit'); freeze(a); put(a, 1.2); P.crouching = false; ok('tavşan: çömelmeden evcilleşmez', a.tryTame() === false);
  P.crouching = true; ok('tavşan: çömelip havuçla evcilleşir', a.tryTame() && a.tamed && G.pets.length === 1); P.crouching = false;
  sim(0.1); ok('kahraman: evcilleştirince sevinç ifadesi', P.hero.face.joyT > 0 && P.hero.face.w.joy > 0.1, P.hero.face.joyT.toFixed(2));
  // 3) geyik: 3 adım
  a = find('deer'); freeze(a); put(a, 1.5); P.crouching = true; a.tryTame(); a.tryTame(); ok('geyik: 2 adımda henüz evcil değil', !a.tamed && a.trust === 2); a.tryTame(); ok('geyik: 3. böğürtlenle evcilleşir', a.tamed); P.crouching = false;
  // 4) at: elma + basılı tutarak sakinleştirme
  a = find('horse'); freeze(a); put(a, 1.8); a.tryTame(); ok('at: elmayı yer', a.fed && !a.tamed);
  G.keys.interact = true; sim(3); ok('at: sakinleştirme ilerliyor', a.holdP > 0.3 && !a.tamed, a.holdP.toFixed(2)); sim(3); G.keys.interact = false; ok('at: sakinleşince evcilleşir', a.tamed);
  // 5) tilki: yem bırak + geri çekil (2 kez)
  a = find('fox'); a.calmT = 0; a.state = 'idle'; a.stT = 5; put(a, 5); G.inv.sel = 'meat'; G.dropBait(); put(a, 16); P.x += 3; sim(25, () => a.trust < 1); ok('tilki: yemi yer (güven 1)', a.trust === 1, 'trust=' + a.trust + ' state=' + a.state);
  put(a, 5); G.dropBait(); put(a, 16); sim(25, () => !a.tamed); ok('tilki: ikinci yemle evcilleşir', a.tamed);
  // 6) kurt: zayıflat + et
  a = find('wolf'); put(a, 1.6); ok('kurt: güçlüyken evcilleşmez', a.tryTame() === false);
  let guard = 0; while (a.frac > 0.35 && guard++ < 20) a.damage(12, P); ok('kurt: zayıflayınca siner', a.cowerT > 0 && a.state === 'cower', a.state); ok('kurt: etle evcilleşir', a.tryTame() && a.tamed);
  ok('yoldaş sayısı 5', G.pets.length === 5, G.pets.length);
  // 7) en fazla 5
  a = find('bear'); freeze(a); put(a, 2.2); ok('6. yoldaş reddedilir (en fazla 5)', a.tryTame() === false && G.pets.length === 5, G.lastMsg);
  // 8) takip
  P.x = 0; P.z = 30; P.yaw = 0; calmAll(); sim(14); const dmax = Math.max(...G.pets.map((p) => p.dist(P))); ok('yoldaşlar oyuncuyu takip eder', dmax < 9, 'en uzak=' + dmax.toFixed(1));
  // 9) koruma: oyuncuya saldıran kurda yoldaşlar saldırır
  const w = find('wolf'); w.x = P.x + 9; w.z = P.z; w.home = { x: w.x, z: w.z }; w.calmT = 0; w.target = P; w.state = 'chase'; const hp0 = w.hp; P.iframes = 99;
  sim(8); ok('yoldaşlar düşmanı algılar ve savaşır', w.hp < hp0 || w.dead || w.cowerT > 0, `kurt can ${hp0}->${w.hp.toFixed(0)}`); P.iframes = 0; w.target = null; w.calmT = 99;
  // 10) açlık
  const pet = G.pets[0]; const h0 = pet.hunger; sim(20); ok('açlık zamanla azalır', pet.hunger < h0, `${h0.toFixed(0)}->${pet.hunger.toFixed(0)}`);
  pet.hunger = 0; const php = pet.hp; sim(4); ok('aç yoldaş can kaybeder', pet.hp < php); const before = pet.hunger; pet.feedPet(); ok('besleyince açlık/can düzelir', pet.hunger > before + 30, pet.hunger.toFixed(0));
  G.edge.stay = true; sim(0.2); ok('T: bekle komutu', G.pets.every((p) => p.stay)); G.edge.stay = true; sim(0.2);
  release(); ok('serbest bırakma', G.pets.length === 0);
  // 11) ayı: 2 bal
  a = find('bear'); freeze(a); put(a, 2.2); a.tryTame(); ok('ayı: 1. bal', a.trust === 1 && !a.tamed); a.tryTame(); ok('ayı: 2. balla evcilleşir', a.tamed);
  // 12) kaplan: önden fark eder, arkadan çömelerek
  a = find('tiger'); freeze(a); put(a, 2.4, false); P.crouching = true; ok('kaplan: önden yaklaşınca saldırır', a.tryTame() === false && a.target === P); freeze(a); put(a, 2.4, true); a.tryTame(); a.tryTame(); ok('kaplan: arkadan 2 etle evcilleşir', a.tamed); P.crouching = false;
  // 13) yılan: kaval
  a = find('snake'); freeze(a); put(a, 1.6); G.keys.interact = true; sim(2); ok('yılan: büyülenme animasyonu', a.c.anim === 'charm', a.c.anim); sim(4.5); G.keys.interact = false; ok('yılan: kavalla evcilleşir', a.tamed);
  // 14) aslan
  a = find('lion'); put(a, 2); guard = 0; while (a.frac > 0.25 && guard++ < 40) a.damage(10, P); a.tryTame(); ok('aslan: 1. et (güven 1/2)', a.trust === 1 && !a.tamed); a.tryTame(); ok('aslan: evcilleşir', a.tamed);
  // 15) timsah: 3 balık yemi
  a = find('crocodile'); a.calmT = 0; a.target = null; for (let i = 0; i < 3; i++) { a.target = null; a.state = 'idle'; put(a, 4); G.inv.sel = 'fish'; G.dropBait(); put(a, 15); const t0 = a.trust; sim(30, () => a.trust === t0 && !a.tamed); }
  ok('timsah: 3 balıkla evcilleşir', a.tamed, 'trust=' + a.trust);
  release();
  // 16) kartal: yem bırak, iner ve yer
  a = find('eagle'); const ex = a.x, ez = a.z; for (let i = 0; i < 2; i++) { P.x = a.x + 6; P.z = a.z; G.inv.sel = 'meat'; P.yaw = 0; G.dropBait(); P.x += 12; const t0 = a.trust; sim(60, () => a.trust === t0 && !a.tamed); }
  ok('kartal: yere iner, 2 yemle evcilleşir', a.tamed, 'trust=' + a.trust + ' alt=' + a.alt.toFixed(1));
  // Bu test yalnızca takip uçuşunu ölçer: 120 sn'lik yem beklemesi sırasında yaklaşan vahşi avcıların
  // kartalı savaşa çekip öldürmesi (önceki kararsızlığın nedeni) burada sahneden uzaklaştırılarak ayıklanır.
  let lastHit = '-'; const origDmg = a.damage.bind(a); a.damage = (n, f) => { lastHit = f ? f.kind || 'oyuncu' : '?'; return origDmg(n, f); };
  calmAll(); const moved = G.animals.filter((x) => !x.tamed && x.spec.temper !== 'prey' && Math.hypot(x.x - P.x, x.z - P.z) < 30).map((x) => [x, x.x]); moved.forEach(([x]) => { x.x += 300; });
  P.hp = P.hpMax; sim(5); ok('kartal yoldaş: oyuncunun üstünde uçar', a.alt > 2 && a.dist(P) < 12, 'alt=' + a.alt.toFixed(1) + ' d=' + a.dist(P).toFixed(1) + ' st=' + a.state + ' tamed=' + a.tamed + ' dead=' + a.dead + ' stay=' + a.stay + ' hedef=' + (a.target ? a.target.kind || 'oyuncu' : '-') + ' son vuran=' + lastHit);
  moved.forEach(([x, ox]) => { x.x = ox; }); delete a.damage;
  // 17) gölge pençe + ejderha
  a = find('shadowbeast'); put(a, 2.4); guard = 0; while (a.frac > 0.3 && guard++ < 60) a.damage(10, P); ok('gölge pençe: ay taşıyla evcilleşir', a.tryTame() && a.tamed);
  a = find('dragon'); put(a, 5); guard = 0; while (a.frac > 0.2 && guard++ < 200) a.damage(10, P); ok('ejderha: mücevherle evcilleşir', a.tryTame() && a.tamed, a.frac.toFixed(2));
  P.x = 20; P.z = 20; calmAll(); sim(20); ok('ejderha yoldaş: takip eder (yürüme klibi)', a.dist(P) < 14, a.dist(P).toFixed(1));
  // 18) dev evcilleştirilemez + ölüm/yeniden doğma
  a = find('ogre'); put(a, 3); ok('dev: evcilleştirilemez', a.tryTame() === false);
  a.calmT = 0; P.hp = 20; a.target = P; a.state = 'chase'; G.pets.forEach((p) => { p.stay = true; p.x += 60; }); sim(8, () => P.alive); ok('oyuncu: ölüm animasyonu', !P.alive && P.cur._clip.name === 'Death01', P.state + ' hp=' + P.hp); sim(6); ok('oyuncu: kampta yeniden doğar', P.alive && Math.hypot(P.x, P.z) < 8);
  // 19) av: ölüm animasyonu + ganimet
  a = find('deer'); const m0 = G.inv.count('meat'); a.damage(999, P); sim(1.5); ok('av ölünce ganimet ve ölüm animasyonu', a.dead && a.c.anim === 'die' && G.inv.count('meat') > m0);
  // 20) kaynak toplama
  const n = G.world.nodes.find((x) => x.type === 'berry'); P.x = n.x + 0.8; P.z = n.z; P.state = 'move'; const b0 = G.inv.count('berry'); sim(0.1); G.edge.interact = true; sim(0.2); ok('kaynak toplama (böğürtlen)', G.inv.count('berry') === b0 + 2 && !n.ready);
  G.running = real; return out;
};
