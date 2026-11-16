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
  G.edge.dodge = true; sim(0.1); ok('oyuncu: kaçınma (sıçrama) + dokunulmazlık', P.state === 'dodge' && P.iframes > 0, P.state);
  G.edge.dodge = true; sim(0.15); ok('oyuncu: çift kaçınma = takla', P.state === 'roll' && P.cur._clip.name === 'Roll', P.state); sim(1.2);
  G.keys.w = false; sim(0.5); G.edge.crouch = true; sim(0.5); ok('oyuncu: çömelme klibi', P.crouching && P.cur._clip.name === 'Crouch_Idle_Loop', P.cur._clip.name);
  G.keys.w = true; sim(0.6); ok('oyuncu: çömelerek yürüme', P.cur._clip.name === 'Crouch_Fwd_Loop', P.cur._clip.name); G.keys.w = false; G.edge.crouch = true; sim(0.4);
  G.edge.attack = true; sim(0.15); ok('oyuncu: kılıç saldırısı', P.state === 'attack' && P.cur._clip.name === 'Sword_Regular_A', P.cur._clip.name); G.edge.attack = true; sim(0.6); ok('oyuncu: kombo 2', P.cur._clip.name === 'Sword_Regular_B', P.cur._clip.name); sim(1.5);

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
  { // 21) Tsushima tarzı dövüş
  release(); G.animals.forEach((x) => { if (!x.tamed) { x.target = null; x.calmT = 999; } });
  const duel = (kind) => { const x1 = G.animals.find((x) => x.kind === kind && !x.dead && !x.tamed); x1.hp = x1.hpMax; x1.po = 0; x1.staggerT = 0; x1.cool = 0; x1.calmT = 0; x1.cowerT = 0; x1.victimT = 0;
    P.x = x1.x + Math.sin(x1.yaw) * (x1.radius + 1.0); P.z = x1.z + Math.cos(x1.yaw) * (x1.radius + 1.0); P.y = 0; P.yaw = Math.atan2(x1.x - P.x, x1.z - P.z); P.hp = P.hpMax; P.stamina = 100; P.alive = true; P.state = 'move'; P.iframes = 0; P.crouching = false; G.keys = {};
    x1.target = P; x1.set('chase'); return x1; };
  const until = (x1, st, max = 4) => { let n = 0; sim(max, () => { n++; return x1.state !== st; }); return n; };
  let x1 = duel('wolf'); until(x1, 'windup', 2); ok('dövüş: kurt saldırmadan önce hazırlanır (parlama)', x1.state === 'windup' && x1.wuDur >= 0.5, x1.state + ' ' + x1.wuDur.toFixed(2));
  // normal blok: erken basılı tutulan savunma hasarı keser
  G.keys.block = true; let hp0 = P.hp, st0 = P.stamina; sim(1.6); G.keys.block = false;
  ok('dövüş: blok hasarı keser, dayanıklılık düşer', P.hp === hp0 && P.stamina < st0, `hp ${P.hp} st ${st0.toFixed(0)}→${P.stamina.toFixed(0)}`);
  // savuşturma: vuruştan hemen önce bas
  x1 = duel('wolf'); until(x1, 'attack', 3); let parried = false; hp0 = P.hp;
  sim(1, () => { if (!G.keys.block && x1.atkT >= x1.c.attackHit - 0.1) G.keys.block = true; if (x1.staggerT > 0) { parried = true; return false; } }); G.keys.block = false;
  ok('dövüş: doğru anda blok = savuşturma, kurt sendeler', parried && P.hp === hp0 && P.counterT > 0, `stagger ${x1.staggerT.toFixed(2)} hp ${P.hp}`);
  const hpw = x1.hp; G.edge.attack = true; sim(0.6); ok('dövüş: savuşturma sonrası karşı saldırı daha güçlü', hpw - x1.hp >= 16 * 1.6 * 1.4 - 0.5, (hpw - x1.hp).toFixed(1));
  // engellenemez (kırmızı) saldırı bloktan geçer
  x1 = duel('bear'); x1.calmT = 0; until(x1, 'windup', 3); x1.unblock = true; G.keys.block = true; hp0 = P.hp; until(x1, 'chase', 3); G.keys.block = false;
  ok('dövüş: kırmızı (engellenemez) saldırı bloktan geçer', P.hp < hp0, `hp ${hp0}→${P.hp.toFixed(0)}`);
  // kusursuz kaçınma
  x1 = duel('wolf'); until(x1, 'attack', 3); let dodged = false; sim(1, () => { if (P.state === 'move' && x1.atkT >= x1.c.attackHit - 0.12) G.edge.dodge = true; if (P.counterT > 0) { dodged = true; return false; } });
  ok('dövüş: son anda kaçınma = kusursuz kaçınma + karşı saldırı', dodged && P.hp === P.hpMax, `hp ${P.hp}`); sim(1);
  // ağır saldırı duruşu kırar
  x1 = duel('bear'); x1.cool = 99; let broke = false; for (let i = 0; i < 6 && !broke; i++) { P.state = 'move'; P.stamina = 100; G.edge.heavy = true; sim(1.4, () => { if (x1.staggerT > 0) { broke = true; return false; } }); x1.cool = 99; }
  ok('dövüş: ağır saldırılar duruşu kırar', broke, `po ${x1.po.toFixed(0)}/${x1.poMax.toFixed(0)}`);
  // savunma kırılması: dayanıklılık bitince
  x1 = duel('bear'); x1.calmT = 0; P.stamina = 5; G.keys.block = true; until(x1, 'windup', 3); x1.unblock = false; let brk = false; sim(3, () => { if (P.state === 'stagger') { brk = true; return false; } }); G.keys.block = false;
  ok('dövüş: dayanıklılık bitince savunma kırılır', brk, P.state);
  // Kararlılık ile iyileşme
  G.animals.forEach((x) => { if (!x.tamed) { x.target = null; x.calmT = 999; if (x.state === 'windup' || x.state === 'attack') x.set('idle', 5); } }); sim(2); P.state = 'move'; P.resolve = 1.2; P.hp = 40; G.edge.heal = true; sim(2); ok('dövüş: Kararlılık harcayarak iyileşme', P.hp >= 75 && P.resolve < 1, `hp ${P.hp.toFixed(0)} r ${P.resolve.toFixed(2)}`);
  // suikast: çömelip fark edilmemiş kurdun arkasından
  G.animals.forEach((x) => { if (!x.tamed) { x.target = null; x.calmT = 999; } });
  x1 = G.animals.find((x) => x.kind === 'wolf' && !x.dead && !x.tamed); freeze(x1); x1.hp = x1.hpMax; P.state = 'move'; P.hp = P.hpMax; P.crouching = true;
  P.x = x1.x - Math.sin(x1.yaw) * (x1.radius + 1.0); P.z = x1.z - Math.cos(x1.yaw) * (x1.radius + 1.0); P.y = 0;
  ok('dövüş: arkadan çömelince suikast hedefi bulunur', P.assassinTarget() === x1);
  G.edge.attack = true; sim(1.6); ok('dövüş: suikast tek hamlede öldürür', x1.dead, `hp ${x1.hp}`);
  P.crouching = true; const w2 = G.animals.find((x) => x.kind === 'wolf' && !x.dead && !x.tamed); freeze(w2); P.x = w2.x + Math.sin(w2.yaw) * (w2.radius + 1.0); P.z = w2.z + Math.cos(w2.yaw) * (w2.radius + 1.0);
  ok('dövüş: önünden suikast olmaz', P.assassinTarget() !== w2); P.crouching = false;
  }
  // Mobil performans: kalite ön ayarları, uyarlanabilir çözünürlük, animasyon LOD
  {
    const QM = await import('../src/quality.js'), Qy = G.quality, lvl0 = Qy.level;
    ok('kalite: zayıf Android = Düşük', QM.pickAutoPreset({ touch: true, ua: 'Mozilla/5.0 (Linux; Android 11)', cores: 4, memory: 2 }) === 'low');
    ok('kalite: güçlü telefon = Orta', QM.pickAutoPreset({ touch: true, ua: 'Android', cores: 8, memory: 8 }) === 'medium');
    ok('kalite: masaüstü = Yüksek', QM.pickAutoPreset({ touch: false, ua: 'X11; Linux x86_64', cores: 8 }) === 'high');
    const gv = new QM.FrameGovernor(); let acts = []; for (let i = 0; i < 25 * 3; i++) { const r = gv.push(1 / 25); if (r) acts.push(r); }
    ok('kalite: 25 FPS sürünce düşürme önerilir', acts[0] === 'down', acts.join(',') + ' fps=' + gv.fps.toFixed(0));
    acts = []; for (let i = 0; i < 60 * 10; i++) { const r = gv.push(1 / 60); if (r) acts.push(r); } ok('kalite: uzun süre 60 FPS = yükseltme önerisi', acts.includes('up'), acts.join(','));
    ok('kalite: arka plan sekmesi (uzun kare) ölçülmez', gv.push(3) === null);
    const q2 = new QM.Quality({ touch: true, ua: 'Android', cores: 8, memory: 8, dpr: 3 }); q2.choice = 'auto'; q2.level = 'medium'; q2.scale = 1;
    const steps = []; for (let i = 0; i < 40 && q2.level === 'medium'; i++) for (let k = 0; k < 20; k++) { if (q2.tick(1 / 20, null)) steps.push(q2.scale); }
    ok('kalite: önce çözünürlük adım adım düşer', steps.length >= 3 && steps[0] === 0.9 && steps.includes(0.7), steps.join(','));
    ok('kalite: alt sınırda Otomatik bir alt ön ayara geçer', q2.level === 'low' && q2.scale === 1, q2.level);
    ok('kalite: piksel oranı cihaz × ön ayar sınırıyla kısıtlı', Math.abs(q2.pixelRatio() - 1.0) < 1e-6, q2.pixelRatio());
    Qy.level = 'low'; Qy.apply(G); G.renderer.render(G.scene, G.camera);
    ok('kalite: Düşük = gölge kapalı, kısa görüş', !G.sun.castShadow && G.camera.far === 230 && G.scene.fog.far === 150 && G.renderer.getPixelRatio() <= 1, `far ${G.camera.far} pr ${G.renderer.getPixelRatio()}`);
    Qy.level = 'high'; Qy.apply(G); G.renderer.render(G.scene, G.camera);
    ok('kalite: Yüksek = 2048 gölge', G.sun.castShadow && G.sun.shadow.mapSize.x === 2048 && G.camera.far === 600);
    // animasyon LOD ve uyku mesafesi
    G.animals.forEach((x) => { if (!x.tamed) { x.target = null; x.calmT = 999; } });
    const fa = G.animals.find((x) => x.kind === 'deer' && !x.dead && !x.tamed); freeze(fa); fa.hp = fa.hpMax;
    const away = (d) => { P.x = fa.x + d; P.z = fa.z; P.y = 0; P.state = 'move'; P.hp = P.hpMax; };
    away(100); fa.animSkipped = 0; sim(1); ok('kalite: uzaktaki hayvanın iskeleti seyrek güncellenir (Yüksek)', fa.c.root.visible && fa.animSkipped >= 12 && fa.animSkipped <= 18, 'atlanan ' + fa.animSkipped + '/30');
    away(5); fa.animSkipped = 0; sim(0.5); ok('kalite: yakındaki hayvan her karede canlanır', fa.animSkipped === 0);
    Qy.level = 'low'; Qy.apply(G); away(100); sim(0.2); ok('kalite: Düşük ön ayarda 100 m ötedeki hayvan uyur', !fa.c.root.visible);
    Qy.level = lvl0; Qy.apply(G); away(5); sim(0.2);
  }
  G.running = real; return out;
};
