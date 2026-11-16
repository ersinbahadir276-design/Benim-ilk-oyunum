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

  // 1d2) kahraman yürüme döngüsü: klip yer hızları ölçülür, hız–adım eşlemesi, faz senkronlu karışım, basan ayak kilidi
  {
    const L = P.loco, IK = P.ik, R = P.hero.root;
    const sp = L.g.map((x) => x.speed), st = L.g.map((x) => [x.stride, ...(x.next || [])]);
    ok('yürüme döngüsü: klip yer hızları ölçüldü (yürüme < koşu)', sp.every((v) => v > 0.3 && v < 12) && sp[0] < sp[1] && P.crouchLoco.g[0].speed > 0.3, L.g.map((x) => `${x.name}=${x.speed.toFixed(2)} m/sn`).join(' '));
    // hizalı karışımda adım boyu iki klibin arasında, çökme yok
    const mono = [0, 1].every((i) => { const a = [L.g[i].stride, ...L.g[i].next, L.g[i + 1].stride]; return a.every((v, k) => k === 0 || v > a[k - 1] * 0.9); });
    ok('yürüme döngüsü: faz hizalı karışımda adım boyu çökmez', mono, st.map((a) => a.map((v) => v.toFixed(2)).join('/')).join(' | '));
    const moved = G.animals.filter((x) => Math.hypot(x.x, x.z - 20) < 40).map((x) => [x, x.x, x.z]); moved.forEach(([x]) => { x.x += 300; });
    const V = THREE_V;
    // kayma yalnızca art arda iki karede de kilitli (basışta) olan ayak için ölçülür; karşılaştırma için aynı basış
    // tespiti kilit uygulanmadan (lockApply=false) çalıştırılır: o zaman ayak klipteki gibi kayar
    const walk = (mz, run, crouch, apply) => {
      IK.lockApply = apply; G.keys = {}; G.edge = {}; P.x = 0; P.z = 2; P.yaw = 0; G.camYaw = 0; P.speed = 0; P.stamina = 100; P.hp = P.hpMax; P.state = 'move'; P.crouching = crouch; P.iframes = 99;
      G.touch.mz = mz; G.keys.run = run; sim(1.5);
      IK.stats = { locks: 0, releases: 0 }; const prev = IK.legs.map((l) => l.foot.getWorldPosition(new V())), was = IK.legs.map(() => false);
      let slip = 0, n = 0, bad = false;
      sim(5, () => { IK.legs.forEach((l, k) => { const v = l.foot.getWorldPosition(new V()), on = l.locked && l.lockW > 0.95;
        if (!Number.isFinite(v.x)) bad = true;
        if (on && was[k]) { slip += Math.hypot(v.x - prev[k].x, v.z - prev[k].z); n++; } prev[k].copy(v); was[k] = on; }); });
      const r = { v: P.speed, clip: P.cur?._clip.name, slip: slip / Math.max(1, n), n, st: IK.stats, bad };
      G.touch.mz = 0; G.keys.run = false; P.crouching = false; IK.lockApply = true; return r;
    };
    for (const [name, mz, run, cr] of [['yürüme', 0.5, false, false], ['koşu', 1, false, false], ['depar', 1, true, false], ['çömelerek', 1, false, true]]) {
      const off = walk(mz, run, cr, false), on = walk(mz, run, cr, true);
      ok(`ayak kilidi (${name}): basan ayak kaymaz, basışlar erken bırakılmaz`, !on.bad && on.n > 20 && on.st.locks >= 6 && on.slip < 0.0005 && off.slip > 0.002 && (on.st.early || 0) <= on.st.locks * 0.1,
        `hız=${on.v.toFixed(1)} ${on.clip} basışta kayma: kilitsiz=${(off.slip * 1000).toFixed(1)} kilitli=${(on.slip * 1000).toFixed(2)} mm/kare (${on.n} kare), basış=${on.st.locks} erken bırakma=${on.st.early || 0}`);
    }
    // durunca karışım söner, bekleme klibine geçilir; kilit kalkar
    G.touch.mz = 0.5; sim(1); G.touch.mz = 0; sim(1.2);
    const lingering = L.g.filter((x) => x.act.isRunning() && x.act.getEffectiveWeight() > 0.01).map((x) => x.name);
    ok('yürüme döngüsü: durunca karışım söner, bekleme klibi oynar', P.cur._clip.name === 'Idle_Loop' && !L.on && lingering.length === 0 && IK.legs.every((l) => l.lockW < 0.05), P.cur._clip.name + ' ' + lingering.join(','));
    // yürürken saldırı: karışım söner, kılıç klibi oynar; sonra yürüme döngüsüne dönülür
    G.touch.mz = 0.5; sim(0.8); G.edge.attack = true; sim(0.2); const atk = P.cur._clip.name; sim(1.6);
    ok('yürüme döngüsü: saldırıya geçiş ve geri dönüş', atk === 'Sword_Regular_A' && P.state === 'move' && L.on && /Walk|Jog/.test(P.cur._clip.name), atk + ' → ' + P.cur._clip.name);
    G.touch.mz = 0; sim(1); G.keys = {}; G.edge = {};
    moved.forEach(([x, ox, oz]) => { x.x = ox; x.z = oz; });
    P.x = 0; P.z = 6; P.y = 0; P.yaw = Math.PI; P.hp = P.hpMax; P.iframes = 0;
  }

  // 1d-3) yerinde dönüş ve duruşa yerleşme: dururken ayaklar dünyada sabit; gövde dönünce adım atarak yerleşir
  {
    const IK = P.ik, V = THREE_V, gnd = IK.ground;
    const moved = []; G.animals.forEach((a) => { if (!a.tamed && Math.hypot(a.x, a.z - 6) < 14) { moved.push([a, a.x, a.z]); a.x += 40; } a.target = null; a.calmT = 999; });
    const reset = () => { G.keys = {}; G.edge = {}; G.touch.mx = G.touch.mz = 0; G.camYaw = 0; P.x = 0; P.z = 6; P.y = gnd(0, 6); P.yaw = 0; P.speed = 0; P.state = 'move'; P.crouching = false; P.hp = P.hpMax; P.iframes = 99; P.kbx = P.kbz = 0; sim(1.5); IK.stepStats = { steps: 0, snaps: 0 }; };
    const err = () => IK.legs.map((l) => Math.hypot(l.P.x - l.want.x, l.P.z - l.want.z));
    // betikli 90° dönüş (1 sn): basan ayak kaymaz, adım atılır, sonunda ayaklar duruşa ve gövde yönüne oturur
    reset(); { const y0 = P.yaw; let prev = null, slip = 0, n = 0, maxLift = 0;
      sim(2.2, (i) => { if (i < 30) P.yaw = y0 + (Math.PI / 2) * (i + 1) / 30;
        const cur = IK.legs.map((l) => ({ p: l.foot.getWorldPosition(new V()), pl: l.pw > 0.95 && !l.step })); maxLift = Math.max(maxLift, ...IK.legs.map((l) => l.lift));
        if (prev) cur.forEach((c, k) => { if (c.pl && prev[k].pl) { slip += Math.hypot(c.p.x - prev[k].p.x, c.p.z - prev[k].p.z); n++; } }); prev = cur; });
      const e = err(), h = IK.legs.map((l) => Math.abs(Math.atan2(Math.sin(l.H - P.yaw), Math.cos(l.H - P.yaw))));
      ok('yerinde dönüş: 90° dönerken adım atılır, basan ayak kaymaz', IK.stepStats.steps >= 2 && n > 30 && slip / n < 0.002 && maxLift > 0.03,
        `adım=${IK.stepStats.steps} kayma=${(slip / n * 1000).toFixed(2)} mm/kare (${n} kare) ayak kalkışı=${(maxLift * 100).toFixed(1)} cm`);
      ok('yerinde dönüş: sonunda ayaklar duruşa ve gövde yönüne oturur', e.every((x) => x < IK.plantDist) && h.every((x) => x < IK.plantAng), `uzaklık=${e.map((x) => x.toFixed(3))} yön=${h.map((x) => x.toFixed(2))}`); }
    // oyuncu girişiyle geri dönüş: önce yerinde döner (hız ~0), sonra yürür
    reset(); { G.keys.s = true; let piv = 0, spd = 0; sim(0.6, () => { if (P.pivot) { piv++; spd = Math.max(spd, P.speed); } }); const yawOk = Math.abs(Math.cos(P.yaw) + 1) < 0.1, st = IK.stepStats.steps; G.keys = {}; sim(1);
      ok('yerinde dönüş: geri yön verilince önce olduğu yerde döner, sonra yürür', piv >= 5 && spd < 0.3 && st >= 1 && yawOk, `dönüş=${(piv / 30).toFixed(2)} sn maks hız=${spd.toFixed(2)} adım=${st} yön=${P.yaw.toFixed(2)}`); }
    // koşudan durunca ayaklar bekleme duruşuna adımla yerleşir; ışınlanmada adım atmadan yeniden yerleşir
    reset(); { G.keys.w = true; sim(1.5); G.keys = {}; IK.stepStats = { steps: 0, snaps: 0 }; sim(2); const e = err();
      ok('duruşa yerleşme: koşudan durunca ayaklar bekleme duruşuna oturur', P.cur._clip.name === 'Idle_Loop' && e.every((x) => x < IK.plantDist) && IK.stepStats.snaps === 0, `adım=${IK.stepStats.steps} uzaklık=${e.map((x) => x.toFixed(3))}`);
      P.x += 5; sim(0.2); const fin = IK.legs.every((l) => Number.isFinite(l.knee.quaternion.x) && Number.isFinite(l.P.x));
      ok('duruşa yerleşme: ışınlanmada ayaklar yeniden yerleşir, NaN yok', fin && IK.stepStats.snaps >= 1 && err().every((x) => x < 0.05), `yeniden yerleşme=${IK.stepStats.snaps} uzaklık=${err().map((x) => x.toFixed(3))}`); }
    moved.forEach(([a, ox, oz]) => { a.x = ox; a.z = oz; });
    reset(); calmAll(); P.yaw = Math.PI; P.iframes = 0;
  }

  // 1e) dört ayaklı ayak IK'si: düzde pozu bozmaz, yan eğimde dört ayak zemine oturur, yürürken basan ayak kaymaz
  {
    const gnd = P.ik.ground;
    let bx = 0, bz = 0, bg = 0;
    for (let x = -60; x <= 60; x += 3) for (let z = -120; z <= -40; z += 3) { const s = Math.hypot(gnd(x + 0.5, z) - gnd(x - 0.5, z), gnd(x, z + 0.5) - gnd(x, z - 0.5)); if (s > bg && s < 0.6) { bg = s; bx = x; bz = z; } }
    const side = Math.atan2(gnd(bx + 0.5, bz) - gnd(bx - 0.5, bz), gnd(bx, bz + 0.5) - gnd(bx, bz - 0.5)) + Math.PI / 2;
    const moved = G.animals.filter((x) => Math.hypot(x.x - bx, x.z - bz) < 30 || Math.hypot(x.x, x.z) < 20).map((x) => [x, x.x, x.z]); moved.forEach(([x]) => { x.x += 300; });
    const ankle = (l) => l.ft.getWorldPosition(new THREE_V());
    const clr = (a) => a.c.legs.map((l) => { const v = ankle(l); return v.y - gnd(v.x, v.z) - l.restH; });
    const stand = (a, x, z, yaw, en) => { a.c.ikEnabled = en; P.x = x + 8; P.z = z + 8; P.state = 'move'; P.hp = P.hpMax; sim(1.5, () => { a.x = x; a.z = z; a.yaw = yaw; freeze(a); a.hp = a.hpMax; a.dead = false; }); };
    for (const kind of ['wolf', 'horse', 'crocodile']) {
      const a = find(kind), keep = [a.x, a.z, a.yaw];
      stand(a, 2, 1, 0.7, true);
      const dev = Math.max(...a.c.legs.map((l) => Math.abs(l.up.rotation.x - l.au) + Math.abs(l.lo.rotation.x - l.al) + Math.abs(l.ft.rotation.x - l.af)));
      ok(`hayvan IK (${kind}): düz zeminde animasyon pozu değişmez`, dev < 0.02 && a.c.ikW > 0.9, 'açı farkı=' + dev.toFixed(4));
      stand(a, bx, bz, side, false); const off = clr(a);
      stand(a, bx, bz, side, true); const on = clr(a);
      const mo = Math.max(...off.map(Math.abs)), mn = Math.max(...on.map(Math.abs));
      ok(`hayvan IK (${kind}): yan eğimde dört ayak zemine oturur`, mn < 0.025 && mn < mo * 0.5,
        `eğim=${(Math.atan(bg) * 57.3).toFixed(0)}° IK yok=${off.map((c) => c.toFixed(3))} IK=${on.map((c) => c.toFixed(3))}`);
      const finite = a.c.legs.every((l) => [l.up, l.lo, l.ft].every((j) => Number.isFinite(j.rotation.x)));
      const lens = a.c.legs.map((l) => l.lo.getWorldPosition(new THREE_V()).distanceTo(ankle(l)) / l.L1);
      ok(`hayvan IK (${kind}): NaN yok, kemik boyları korunur`, finite && lens.every((r) => Math.abs(r - 1) < 1e-3), lens.map((r) => r.toFixed(4)).join('/'));
      // yürüyüş: basan ayağın dünyadaki kayması (animasyon pozu ile IK sonrası karşılaştırılır)
      a.c.ikEnabled = true; a.x = 2; a.z = 1; a.yaw = 0; freeze(a); a.home = { x: a.x + 60, z: a.z + 5 }; a.set('return', 99);
      let prev = null, slipIK = 0, slipAnim = 0, n = 0, replant = 0, steps = 0; const rel0 = a.c.ikReleases;
      sim(4, () => {
        a.calmT = 999; a.target = null; if (a.state !== 'return') a.set('return', 99);
        P.x = a.x - 6; P.z = a.z; const cur = a.c.legs.map((l) => ({ p: ankle(l), q: l.anim.clone(), lk: l.locked && l.lockW > 0.95, lp: l.lockP.clone() }));
        if (prev) cur.forEach((c, i) => { const o = prev[i]; if (c.lk && !o.lk) steps++; if (c.lk && o.lk) { if (c.lp.distanceToSquared(o.lp) > 1e-8) { replant++; return; } slipIK += Math.hypot(c.p.x - o.p.x, c.p.z - o.p.z); slipAnim += Math.hypot(c.q.x - o.q.x, c.q.z - o.q.z); n++; } });
        prev = cur;
      });
      const rel = a.c.ikReleases - rel0;
      ok(`hayvan IK (${kind}): yürürken basan ayak kaymaz (ayak kilidi)`, n > 30 && replant === 0 && slipIK / n < 0.003 && slipAnim / n > slipIK / n * 3 && rel <= steps * 0.15,
        `kare=${n} kayma IK=${(slipIK / n * 1000).toFixed(1)} mm/kare, animasyon=${(slipAnim / n * 1000).toFixed(1)} mm/kare, yeniden basma=${replant}, basış=${steps}, erken bırakma=${rel}, hız=${a.speed.toFixed(1)}`);
      a.dead = true; a.deadT = 0; sim(0.1); ok(`hayvan IK (${kind}): ölünce devre dışı`, a.c.ikW === 0); a.dead = false; a.hp = a.hpMax; a.c.reset();
      a.x = keep[0]; a.z = keep[1]; a.yaw = keep[2]; a.home = { x: keep[0], z: keep[1] }; freeze(a); a.calmT = 0; a.stT = 0;
    }
    moved.forEach(([x, ox, oz]) => { x.x = ox; x.z = oz; });
    P.x = 0; P.z = 6; P.y = 0; P.yaw = Math.PI; P.hp = P.hpMax;
  }

  // 1e2) dört ayaklı koşu (görev oranlı dörtnal): basan ayak kaymaz, basışlar erken bırakılmaz, gövde çökmez
  {
    const moved = G.animals.filter((x) => Math.hypot(x.x, x.z + 40) < 60).map((x) => [x, x.x, x.z]); moved.forEach(([x]) => { x.x += 400; });
    for (const kind of ['wolf', 'horse', 'deer', 'lion', 'bear', 'crocodile']) {
      const a = find(kind), keep = [a.x, a.z, a.yaw], spd = a.spec.run;
      a.x = 0; a.z = -60; a.yaw = 0; a.c.reset(); a.calmT = 999; a.c.ikEnabled = true;
      a.updateWild = function (dt) { this.steer(this.x, this.z + 50, spd, dt, 6); return 'run'; };
      sim(1.5, () => { P.x = a.x - 6; P.z = a.z; });
      let prev = null, sIK = 0, n = 0, steps = 0, drop = 0, fr = 0, bad = false; const r0 = a.c.ikReleases;
      sim(4, () => { P.x = a.x - 6; P.z = a.z; drop += a.c.ikDrop; fr++;
        const cur = a.c.legs.map((l) => ({ p: l.ft.getWorldPosition(new THREE_V()), lk: l.locked && l.lockW > 0.95, lp: l.lockP.clone() }));
        if (cur.some((c) => !Number.isFinite(c.p.x + c.p.y))) bad = true;
        if (prev) cur.forEach((c, i) => { const o = prev[i]; if (c.lk && !o.lk) steps++; if (c.lk && o.lk && c.lp.distanceToSquared(o.lp) < 1e-8) { sIK += Math.hypot(c.p.x - o.p.x, c.p.z - o.p.z); n++; } });
        prev = cur; });
      const rel = a.c.ikReleases - r0, dr = drop / fr / a.spec.h;
      ok(`hayvan koşusu (${kind}): basan ayak kaymaz, erken bırakma yok, gövde çökmez`, !bad && a.c.dutyOn && a.speed > spd * 0.9 && steps >= 20 && n >= 20 && sIK / n < 0.001 && rel <= steps * 0.1 && dr < 0.05,
        `hız=${a.speed.toFixed(1)} görev oranı=${a.c.dutyK.toFixed(2)} kadans×${a.c.cadK.toFixed(2)} basış=${steps} erken bırakma=${rel} kayma=${(sIK / Math.max(1, n) * 1000).toFixed(2)} mm/kare (${n} kare) gövde alçalması=%${(dr * 100).toFixed(1)}`);
      delete a.updateWild; a.c.reset(); a.x = keep[0]; a.z = keep[1]; a.yaw = keep[2]; freeze(a); a.calmT = 0; a.stT = 0;
    }
    // geri dönüş: yürüyüşe geçince sinüs döngüsü ve yarım basış geri gelir
    const a = find('wolf'); a.x = 0; a.z = -60; a.calmT = 999;
    a.updateWild = function (dt) { this.steer(this.x, this.z + 50, this.spec.walk * 1.6, dt, 6); return 'walk'; };
    sim(1.5, () => { P.x = a.x - 6; P.z = a.z; });
    ok('hayvan koşusu: yürüyüşe dönünce normal döngü', !a.c.dutyOn && Math.abs(a.c.dutyK - 0.5) < 0.02, 'görev oranı=' + a.c.dutyK.toFixed(3));
    delete a.updateWild; a.c.reset(); freeze(a); a.calmT = 0; a.stT = 0;
    moved.forEach(([x, ox, oz]) => { x.x = ox; x.z = oz; });
    P.x = 0; P.z = 6; P.y = 0; P.yaw = Math.PI; P.hp = P.hpMax;
  }

  // 1f) iskeletli (GLB: tilki, ejderha) ve iki ayaklı (Mağara Devi) ayak IK'si: düzde poz değişmez, yan eğimde bacak uçları zemine oturur
  {
    const gnd = P.ik.ground;
    let bx = 0, bz = 0, bg = 0;
    for (let x = -60; x <= 60; x += 3) for (let z = -120; z <= -40; z += 3) { const s = Math.hypot(gnd(x + 0.5, z) - gnd(x - 0.5, z), gnd(x, z + 0.5) - gnd(x, z - 0.5)); if (s > bg && s < 0.6) { bg = s; bx = x; bz = z; } }
    const side = Math.atan2(gnd(bx + 0.5, bz) - gnd(bx - 0.5, bz), gnd(bx, bz + 0.5) - gnd(bx, bz - 0.5)) + Math.PI / 2;
    const moved = G.animals.filter((x) => Math.hypot(x.x - bx, x.z - bz) < 40 || Math.hypot(x.x, x.z) < 25).map((x) => [x, x.x, x.z]); moved.forEach(([x]) => { x.x += 300; });
    const tip = (a, l) => (l.C ? l.C.getWorldPosition(new THREE_V()) : l.kn.localToWorld(l.ank.clone()));
    const clr = (a) => a.c.legs.map((l) => { const v = tip(a, l); return v.y - a._gfn(v.x, v.z); });
    const stand = (a, x, z, yaw, en) => { a.c.ikEnabled = en; P.x = x + 9; P.z = z + 9; P.state = 'move'; P.hp = P.hpMax; P.iframes = 99; sim(1.5, () => { a.x = x; a.z = z; a.yaw = yaw; freeze(a); a.hp = a.hpMax; a.dead = false; }); };
    for (const [kind, tol] of [['fox', 0.02], ['ogre', 0.03], ['dragon', 0.08]]) {
      const a = find(kind), keep = [a.x, a.z, a.yaw];
      stand(a, 2, 1, 0.7, false); if (a.c.mixer) a.c.mixer.timeScale = 0; // klip zamanı dondurulur: tüm ölçümler aynı pozda
      sim(0.6, () => { a.x = 2; a.z = 1; freeze(a); }); const c0 = clr(a);
      stand(a, 2, 1, 0.7, true); const cf = clr(a);
      stand(a, bx, bz, side, false); const off = clr(a);
      stand(a, bx, bz, side, true); const on = clr(a);
      const dev = (c) => Math.max(...c.map((v, i) => Math.abs(v - c0[i])));
      ok(`yaratık IK (${kind}): düz zeminde poz değişmez`, dev(cf) < 0.01 && a.c.ikW > 0.9, 'fark=' + dev(cf).toFixed(4));
      ok(`yaratık IK (${kind}): yan eğimde bacak uçları zemine oturur`, dev(on) < tol && dev(on) < dev(off) * 0.5,
        `eğim=${(Math.atan(bg) * 57.3).toFixed(0)}° IK yok=${dev(off).toFixed(3)} IK=${dev(on).toFixed(3)} m (bacak başına: ${on.map((v, i) => (v - c0[i]).toFixed(3))})`);
      const fin = a.c.legs.every((l) => (l.A ? [l.A, l.B, l.C].every((j) => [j.quaternion.x, j.quaternion.w].every(Number.isFinite)) : Number.isFinite(l.th.rotation.x + l.kn.rotation.x)));
      ok(`yaratık IK (${kind}): NaN yok`, fin);
      if (a.c.mixer) a.c.mixer.timeScale = 1;
      // yürüyüş: basma kilidi — kilitli ayak dünyada kaymaz, animasyon tek başına kayardı; basışlar erken bırakılmaz
      a.c.ikEnabled = true; a.x = 2; a.z = 1; a.yaw = 0; freeze(a); a.c.reset(); a.home = { x: a.x + 80, z: a.z }; a.set('return', 99);
      let prev = null, sIK = 0, sA = 0, n = 0, rep = 0; const st0 = { ...a.c.ikStats };
      sim(4, () => {
        a.calmT = 999; a.target = null; if (a.state !== 'return') a.set('return', 99); P.x = a.x - 9; P.z = a.z;
        const cur = a.c.legs.map((l) => ({ p: tip(a, l), q: l.p.clone(), lk: l.locked && l.lockW > 0.95, lp: l.lockP.clone() }));
        if (prev) cur.forEach((c, i) => { const o = prev[i]; if (c.lk && o.lk) { if (c.lp.distanceToSquared(o.lp) > 1e-8) { rep++; return; } sIK += Math.hypot(c.p.x - o.p.x, c.p.z - o.p.z); sA += Math.hypot(c.q.x - o.q.x, c.q.z - o.q.z); n++; } });
        prev = cur;
      });
      const st = a.c.ikStats, locks = st.locks - st0.locks, rel = st.releases - st0.releases;
      ok(`yaratık IK (${kind}): yürürken basan ayak kaymaz (basma kilidi)`, n > 40 && rep === 0 && sIK / n < 0.002 && sA / n > (sIK / n) * 5 && locks >= 6 && rel <= locks * 0.25,
        `hız=${a.speed.toFixed(1)} kare=${n} kayma IK=${(sIK / n * 1000).toFixed(2)} animasyon=${(sA / n * 1000).toFixed(1)} mm/kare, basış=${locks}, erken bırakma=${rel}` + (a.c.groundSpeed ? ' klip yer hızı=' + JSON.stringify(a.c.groundSpeed, (k, v) => (typeof v === 'number' ? +v.toFixed(2) : v)) : ` adım açısı=${a.c.stride.toFixed(2)} kadans=${a.c.omega.toFixed(1)}`));
      a.dead = true; a.deadT = 0; sim(0.1); ok(`yaratık IK (${kind}): ölünce devre dışı`, a.c.ikW === 0); a.dead = false; a.hp = a.hpMax; a.c.reset();
      a.x = keep[0]; a.z = keep[1]; a.yaw = keep[2]; a.home = { x: keep[0], z: keep[1] }; freeze(a); a.calmT = 0; a.stT = 0;
    }
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
  // 21) ilerleme: XP, seviye, yoldaş seviyesi, kayıt/yükleme
  const PR = G.prog; release(); P.x = 0; P.z = 6; P.state = 'move'; P.alive = true; calmAll();
  PR.level = 1; PR.xp = 0; PR.applyPlayer(true);
  a = find('rabbit'); const xpK = Math.max(4, Math.round(a.spec.hp * 0.35)); a.damage(999, P); ok('XP: av öldürünce XP kazanılır', PR.xp === xpK, `xp=${PR.xp} beklenen=${xpK}`);
  PR.gain(500); ok('seviye atlama: can ve saldırı artar, can dolar', PR.level > 1 && P.hpMax === 100 + 12 * (PR.level - 1) && P.hp === P.hpMax && P.dmgMul > 1, `sv=${PR.level} hpMax=${P.hpMax}`);
  a = find('wolf'); a.hp = a.hpMax; put(a, 1.6); const hpW = a.hp; P.state = 'attack'; P.combo = 0; P.yaw = Math.atan2(a.x - P.x, a.z - P.z); P.swing(); P.state = 'move'; ok('seviye bonusu: kılıç hasarı artar', Math.abs((hpW - a.hp) - 18 * P.dmgMul) < 0.01, `hasar=${(hpW - a.hp).toFixed(1)}`); a.calmT = 999; a.target = null;
  const lv0 = PR.level, x0 = PR.xp; a = find('deer'); freeze(a); put(a, 1.5); P.crouching = true; a.tryTame(); a.tryTame(); a.tryTame(); P.crouching = false;
  ok('evcilleştirme XP verir, yoldaş Sv 1 başlar', a.tamed && (PR.level > lv0 || PR.xp > x0) && a.level === 1 && a.hpMax === a.spec.hp);
  const pet1 = a; PR.petGain(pet1, 200); ok('yoldaş seviye atlar: can ve hasar çarpanı artar', pet1.level > 1 && pet1.hpMax > pet1.spec.hp && pet1.dmgMul > 1 && pet1.hp === pet1.hpMax, `sv=${pet1.level} hpMax=${pet1.hpMax}`);
  const pxp = pet1.xp, plv = pet1.level, vic = find('rabbit'); vic.damage(999, pet1); ok('yoldaşın öldürdüğü avdan yoldaş ve oyuncu XP alır', pet1.level > plv || pet1.xp > pxp);
  const snap = JSON.parse(JSON.stringify(PR.snapshot())); const savedLv = PR.level, savedPetLv = pet1.level, nAnim = G.animals.length;
  ok('kayıt anlık görüntüsü', snap.v === 1 && snap.player.level === savedLv && snap.pets.length === 1 && snap.pets[0].kind === 'deer' && snap.inv.items.meat > 0);
  release(); PR.level = 1; PR.xp = 0; PR.applyPlayer(true); G.inv.items = { flute: 1 };
  PR.restore(snap, (kind, x, z) => { const n = new window.GAME.animals[0].constructor(G, kind, x, z); G.animals.push(n); return n; });
  ok('kayıt yükleme: seviye, envanter ve yoldaş geri gelir', PR.level === savedLv && G.inv.count('meat') === snap.inv.items.meat && G.pets.length === 1 && G.pets[0].level === savedPetLv && G.pets[0].tamed && G.animals.length === nAnim, `sv=${PR.level} pets=${G.pets.length} hayvan ${nAnim}->${G.animals.length}`);
  sim(3); ok('yüklenen yoldaş takip eder', G.pets[0].dist(P) < 10 && !G.pets[0].dead);
  const en = PR.enabled; PR.enabled = true; const wrote = PR.save(); const back = PR.constructor.read(); PR.constructor.clear(); PR.enabled = en;
  ok('localStorage kayıt/okuma', wrote && back && back.player.level === savedLv && !PR.constructor.read());
  const rp = G.pets[0]; release(); ok('serbest bırakılan yoldaşın seviyesi sıfırlanır', G.pets.length === 0 && rp.level === 1 && rp.hpMax === rp.spec.hp && rp.dmgMul === 1, `sv=${rp.level}`);
  // 22) görevler
  { const QS = PR.quests; QS.reset(); release(); PR.level = 1; PR.xp = 0; PR.applyPlayer(true); calmAll();
    ok('görev: başlangıçta 3 etkin görev', QS.active.map((q) => q.id).join() === 'rabbit,berries,deer', QS.active.map((q) => q.id).join());
    const c0 = G.inv.count('carrot'); let r = find('rabbit'); freeze(r); put(r, 1.5); P.crouching = true; r.tryTame(); P.crouching = false;
    ok('görev: tavşan evcilleştirince tamamlanır, ödül verilir', r.tamed && QS.done.has('rabbit') && G.inv.count('carrot') >= c0 - 1 + 3 && QS.active.map((q) => q.id).join() === 'berries,deer,wolves', `aktif=${QS.active.map((q) => q.id).join()} havuç ${c0}->${G.inv.count('carrot')}`);
    const n = G.world.nodes.find((x) => x.type === 'berry' && x.ready); P.x = n.x + 0.8; P.z = n.z; P.state = 'move'; sim(0.1); G.edge.interact = true; sim(0.2);
    ok('görev: toplama sayılır (E ile böğürtlen)', QS.progress(QS.active[0]) === 2, `ilerleme=${QS.progress(QS.active[0])}`);
    PR.onGather(null, 'berry', 2); const ap0 = G.inv.count('apple'); PR.onGather(null, 'berry', 2); ok('görev: 6 böğürtlenle tamamlanır, elma ödülü', QS.done.has('berries') && G.inv.count('apple') === ap0 + 2);
    PR.onGather(null, 'carrot', 5); ok('görev: ilgisiz toplama sayılmaz', !Object.keys(QS.count).some((k) => k !== 'deer' && k !== 'wolves' && QS.count[k]));
    const pet = G.pets[0]; let w = find('wolf'); w.damage(999, pet); w = find('wolf'); w.damage(999, P);
    ok('görev: yoldaşın ve oyuncunun öldürdüğü kurtlar sayılır', QS.done.has('wolves'), `sayaç=${QS.count.wolves || 0}`);
    ['deer', 'pack', 'honey', 'horse'].forEach((id) => QS.done.add(id)); QS.dirty = true; const lv = PR.level; PR.gain(5000); sim(1);
    ok('görev: seviye görevi kendiliğinden tamamlanır', QS.done.has('lvl5') && PR.level > lv, `sv=${PR.level} aktif=${QS.active.map((q) => q.id).join()}`);
    sim(0.3); const items = [...document.querySelectorAll('#questlist .quest b')].map((b) => b.textContent);
    ok('görev paneli etkin görevleri gösterir', items.length === 3 && items[0] === QS.active[0].title && document.getElementById('questcount').textContent.startsWith(QS.done.size + '/'), items.join(','));
    QS.count.croc = 0; PR.onGather(null, 'moonstone', 1); const snap = JSON.parse(JSON.stringify(PR.snapshot())); const doneN = QS.done.size;
    QS.reset(); PR.quests.restore(snap.quests); ok('görev: kayıt/yükleme', QS.done.size === doneN && QS.count.moon === 1 && QS.done.has('lvl5'), `done=${QS.done.size}/${doneN} moon=${QS.count.moon}`);
    QS.restore({ done: ['yok', 'rabbit'], count: { rabbit: 5, berries: 99, x: 3 } }); ok('görev: bozuk kayıt temizlenir', QS.done.size === 1 && QS.count.berries === 6 && !('x' in QS.count));
    QS.reset(); release(); }
  G.running = real; return out;
};
