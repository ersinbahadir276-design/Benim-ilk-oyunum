// Oynanış testleri: tarayıcıda gerçek oyun döngüsünü hızlandırarak çalıştırır.
// Kullanım: test/run-tests.mjs (Playwright) ya da konsolda:  await runGameplayTests()
window.runGameplayTests = async function () {
  const G = window.GAME, P = G.player, out = [];
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

  // 1b) saç/ceket fiziği (VRM yay kemikleri)
  const SB = P.hero.springs; ok('yay kemikleri yüklendi (saç + ceket)', SB && SB.joints.length >= 20 && SB.joints.some((j) => j.j.bone.name.startsWith('HairJoint')) && SB.joints.some((j) => j.j.bone.name.includes('CoatSkirt')), SB ? SB.joints.length : 'yok');
  { // koşup aniden durunca eteğin ucu geride kalır, sonra salınıp dinlenme durumuna döner; uzunluk korunur, NaN yok
    const sk = SB.joints.find((j) => j.j.bone.name === 'J_Sec_L_CoatSkirtBack').j, hj = SB.joints.find((j) => j.j.bone.name.startsWith('HairJoint')).j;
    const V = P.hero.root.position.constructor, tail = () => P.hero.root.worldToLocal(sk.curTail.clone()), hw = new V();
    P.x = 0; P.z = 6; P.yaw = Math.PI; G.keys = {}; sim(2); const rest = tail();
    G.keys.w = true; G.keys.run = true; sim(1.5); G.keys.w = false; G.keys.run = false;
    let maxDev = 0; sim(0.5, () => { maxDev = Math.max(maxDev, tail().distanceTo(rest)); });
    ok('ceket eteği koşu/durmada salınır', maxDev > 0.02, 'sapma=' + maxDev.toFixed(3));
    sim(3); const back = tail().distanceTo(rest);
    const len = sk.curTail.distanceTo(sk.bone.getWorldPosition(hw));
    ok('ceket eteği dinlenmeye döner, boy korunur', back < 0.03 && Math.abs(len - sk.length) < 1e-3, 'kalan=' + back.toFixed(3) + ' boy=' + len.toFixed(3) + '/' + sk.length.toFixed(3));
    ok('yay kemiklerinde NaN yok', SB.joints.every(({ j }) => Number.isFinite(j.curTail.x + j.curTail.y + j.curTail.z) && Number.isFinite(j.bone.quaternion.w)) && Number.isFinite(hj.curTail.y));
    // saç ucu baş çarpıştırıcısının içine girmez
    const headC = SB.colliderGroups.find((c) => c.obj.name === 'J_Bip_C_Head').spheres[0];
    const inside = SB.joints.filter(({ j, settings }) => j.bone.name.startsWith('HairJoint') && j.curTail.distanceTo(headC.p) < headC.r + settings.hitRadius - 1e-3).length;
    ok('saç uçları kafanın içine girmez', inside === 0, inside + ' uç içeride');
    // ışınlanınca (yeniden doğma) saç uçmaz: uçlar kemik başına yakın kalır
    P.x = 40; P.z = 40; sim(1 / 30); const far = Math.max(...SB.joints.map(({ j }) => j.curTail.distanceTo(j.bone.getWorldPosition(hw)) - j.length));
    ok('ışınlanmada yay kemikleri sıfırlanır', far < 1e-3, far.toExponential(1)); P.x = 0; P.z = 6; sim(0.2);
  }

  // 2) tavşan: çömelmeden kaçar, çömelince havuçla evcilleşir
  let a = find('rabbit'); put(a, 3); P.crouching = false; sim(0.5); ok('tavşan: ayakta yaklaşınca kaçar', a.state === 'flee', a.state);
  a = find('rabbit'); freeze(a); put(a, 1.2); P.crouching = false; ok('tavşan: çömelmeden evcilleşmez', a.tryTame() === false);
  P.crouching = true; ok('tavşan: çömelip havuçla evcilleşir', a.tryTame() && a.tamed && G.pets.length === 1); P.crouching = false;
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
  ok('kartal: yere iner, 2 yemle evcilleşir', a.tamed, 'trust=' + a.trust + ' alt=' + a.alt.toFixed(1)); sim(5); ok('kartal yoldaş: oyuncunun üstünde uçar', a.alt > 2 && a.dist(P) < 12, 'alt=' + a.alt.toFixed(1) + ' d=' + a.dist(P).toFixed(1));
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
