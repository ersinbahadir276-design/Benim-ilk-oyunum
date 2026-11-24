// Hero animation layer tests (src/32-anim.js): foot IK on slopes, cape physics, lean, look-at. Loaded by test/s-anim.js.
window.runAnim = function () {
  const G = __G, P = G.P, IN = G.IN, GT = G.GT, SK = G.SK, H = G.HB, out = [];
  GT.paused = true; window.__noAutoQ = 1;
  const ok = (name, cond, extra = '') => out.push({ name, pass: !!cond, extra: typeof extra === 'string' ? extra : JSON.stringify(extra) });
  const DT = 1 / 60, sim = (sec) => { const n = Math.round(sec / DT); for (let i = 0; i < n; i++) { GT.time += DT; G.step(DT); } };
  const clearIn = () => { Object.assign(IN, { mx: 0, mz: 0, kx: 0, kz: 0, atkHeld: false, atkUp: false, atkEdge: false, atkUsed: false, blockHeld: false, mash: 0 }); P.sprintHeld = false; for (const k in G.BUF) G.BUF[k] = -9; };
  const far = (list, x, z, r) => { for (const a of list) if (Math.hypot(a.x - x, a.z - z) < r) { a.x += 400; a.z += 400; a.hx = a.x; a.hz = a.z; } };
  const isolate = (x, z, r = 70) => { far(G.wolves, x, z, r); far(G.GOBS, x, z, r); far(G.CROCS, x, z, r); far(G.NPCS, x, z, r); };
  const freshP = (x, z, yaw = 0) => { clearIn(); isolate(x, z); G.tp(x, z); Object.assign(P, { yaw, st: 'move', t: 0, hp: 200, sta: 100, guard: 100, inv: 0, pinBy: null, td: null, alive: true, air: false, vx: 0, vz: 0, vy: 0, crouch: false, exhausted: false, lift: 0, lock: null }); P.rag.ang = 0; P.rag.av = 0; G.CAM.yaw = yaw; sim(.6); };
  const restAnkle = SK.rest[H.leftFoot][1];
  // gap between each ankle and the terrain under it (0 = foot planted)
  const gaps = () => [H.leftFoot, H.rightFoot].map((b) => { const w = G.mpt(G.PM, SK.GP[b]); return w[1] - G.hAt(w[0], w[2]) - restAnkle; });
  const nan = () => Array.from(G.PM).some((v) => !isFinite(v)) || SK.GP.some((p) => p.some((v) => !isFinite(v)));
  // find a steep spot (side slope across the facing) near the meadow
  let best = null;
  for (let x = -1300; x <= 1300; x += 9) for (let z = -1300; z <= 1300; z += 9) { const sx = (G.hAt(x + .2, z) - G.hAt(x - .2, z)) / .4, sz = Math.abs(G.hAt(x, z + .2) - G.hAt(x, z - .2)) / .4;
    const s = Math.abs(sx); if (s > .2 && s < .45 && sz < .1 && G.depthAt(x, z) <= 0 && (!best || Math.hypot(x - 30, z - 420) < Math.hypot(best.x - 30, best.z - 420))) best = { x, z, s }; }
  ok('test alanı: yan eğimli zemin bulundu', !!best, best || {});
  if (best) {
    // facing +z so the slope runs across the feet (left foot at +x)
    G.ANIM.on = false; freshP(best.x, best.z, 0); sim(.4); const off = gaps(); const offMax = Math.max(...off.map(Math.abs));
    G.ANIM.on = true; freshP(best.x, best.z, 0); sim(.6); const on = gaps(); const onMax = Math.max(...on.map(Math.abs));
    ok('ayak IK: eğimde iki ayak da yere basıyor (≤4 cm)', onMax < .04 && !nan(), { ik_açık_cm: on.map((v) => +(v * 100).toFixed(1)), ik_kapalı_cm: off.map((v) => +(v * 100).toFixed(1)), eğim: +best.s.toFixed(2) });
    ok('ayak IK: kapalıyken olan boşluğu kapatıyor', onMax < offMax * .5, { önce: +(offMax * 100).toFixed(1), sonra: +(onMax * 100).toFixed(1) });
    const kn = [P.ps.Lkn, P.ps.Rkn]; const up = best.s > 0 ? 0 : 1; // the leg on the higher ground bends more
    ok('ayak IK: yokuş yukarıdaki diz daha çok bükülüyor', SK.R && Math.abs(Math.acos(Math.max(-1, Math.min(1, SK.R[up ? H.rightLowerLeg : H.leftLowerLeg][4])))) > Math.abs(Math.acos(Math.max(-1, Math.min(1, SK.R[up ? H.leftLowerLeg : H.rightLowerLeg][4])))) + .05, { poz_diz: kn.map((v) => +v.toFixed(2)) });
  }
  // flat ground: the old stance is unchanged (both feet down, no extra knee bend)
  { freshP(30, 420, 0); sim(.5); const g = gaps(); ok('düz zemin: ayaklar yerde, IK duruşu bozmuyor', Math.max(...g.map(Math.abs)) < .03 && !nan(), g.map((v) => +(v * 100).toFixed(1))); }
  // cape: hangs at rest, flies back when sprinting, settles again
  {
    freshP(30, 420, 0); sim(1.0); const rest = P.cape.a.slice();
    P.sprintHeld = true; IN.mz = 1; sim(1.2); const run = P.cape.a.slice(); const nanRun = nan();
    clearIn(); sim(2.0); const back = P.cape.a.slice();
    const tot = (a) => a[0] + a[1] + a[2];
    ok('pelerin: koşarken arkaya kalkıyor', tot(run) > tot(rest) + .5 && !nanRun, { durgun: +tot(rest).toFixed(2), koşu: +tot(run).toFixed(2) });
    ok('pelerin: durunca yeniden sarkıyor', Math.abs(tot(back) - tot(rest)) < .2, { durunca: +tot(back).toFixed(2) });
    const H2 = H, cB = SK.GP[H2.capeC], hips = SK.GP[H2.hips];
    ok('pelerin: kemikler sonlu ve gövdenin arkasında', isFinite(cB[2]) && cB[2] < hips[2] + .05, { capeC_z: +cB[2].toFixed(2), kalça_z: +hips[2].toFixed(2) });
  }
  // lean into a turn while running
  {
    freshP(30, 420, 0); P.sprintHeld = true; IN.mz = 1; sim(.8); let maxRoll = 0;
    for (let i = 0; i < 40; i++) { IN.mx = 1; IN.mz = .4; GT.time += DT; G.step(DT); maxRoll = Math.max(maxRoll, Math.abs(P.ps.spZ)); }
    clearIn(); sim(.5);
    ok('dönüş: koşarken gövde dönüşe doğru yatıyor', maxRoll > .04 && !nan(), { yatış: +maxRoll.toFixed(3) });
  }
  // head turns towards the locked target
  {
    freshP(30, 420, 0); const w = G.wolves.find((v) => !v.dead && !v.tame); if (w) { w.x = P.x + 4; w.z = P.z + 3; w.st = 'idle'; w.aware = 0; P.lock = w; P.yaw = 0; sim(.4); const hd = P.ps.hdY; P.lock = null; w.x += 400; w.z += 400;
      ok('bakış: kilitli hedefe başını çeviriyor', hd > .3, { baş: +hd.toFixed(2) }); }
  }
  return out;
};
