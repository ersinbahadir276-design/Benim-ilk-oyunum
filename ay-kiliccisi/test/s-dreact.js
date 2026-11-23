// Ejderhada yönlü vuruş tepkisi (DREACT): vuruş yönüne gövde eğilip kayar, boyun ve kuyruk savrulur, yerdeki ayaklar yerinde kalır.
// node test/harness.js test/s-dreact.js
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  // flat dry spot near the lair, player far enough not to trigger anything
  const spot = await G(() => {
    const g = __G, d = g.DRAGON;
    for (let r = 0; r < 400; r += 6) for (let a = 0; a < 6.28; a += .4) {
      const x = d.spawn[0] + Math.cos(a) * r, z = d.spawn[1] + Math.sin(a) * r; let ok = true;
      for (let q = -5; q <= 5; q += 1) for (let p = -5; p <= 5; p += 1) { if (g.waterAt(x + p, z + q) > g.hAt(x + p, z + q) - .5 || Math.abs(g.hAt(x + p, z + q) - g.hAt(x, z)) > .06) ok = false; }
      if (ok) return { x, z };
    }
    return null;
  });
  log('düz zemin bulundu', !!spot);
  if (!spot) return;
  // pose the dragon standing, hit it with push direction at angle `ang` (relative to its facing), sample frames
  const run = (ang, opts = {}) => G(([sp, ang, opts]) => {
    const g = __G, d = g.DRAGON, D = g.DRG, S = g.dReactSets();
    g.GT.paused = true; g.P.x = sp.x + 14; g.P.z = sp.z + 14; d.st = 'tired';
    Object.assign(d, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: .7, dead: 0, hp: 1400, st: opts.st || 'tired', ct: opts.ct || 0, clip: 'stand', prev: null, fade: 1, speed: 0, gp: undefined, gr: undefined, gs: undefined, hrT: undefined });
    const frame = () => { g.dSample(d, 0); const rk = g.dReact(d); d.M = g.dFit(d, 1 / 30); g.dSkinMats(d); return rk; };
    for (let i = 0; i < 20; i++) frame();
    const headB = D.headBone, chest = D.bones.chest, tailTip = S.tail.reduce((b, i) => { const c = g.dBone(d, S.tailB); const p = g.dBone(d, i), q = g.dBone(d, b); return Math.hypot(p[0] - c[0], p[2] - c[2]) > Math.hypot(q[0] - c[0], q[2] - c[2]) ? i : b; }, S.tailB);
    const snap = () => { const pel = g.dBone(d, D.pelvis); const rel = (b) => g.dBone(d, b);
      return { head: rel(headB), chest: rel(chest), tail: rel(tailTip), pel, ends: g.dLimbs().map((L) => { const p = g.dBone(d, L.e); return [p[0], p[1] - g.hAt(p[0], p[2]), p[2]]; }) }; };
    const s0 = snap();
    const a = d.yaw + ang, dir = [Math.sin(a), Math.cos(a)];
    d.hurt(opts.dmg || 40, dir[0], dir[1]);
    let best = { head: -9, chest: -9, tail: -9, pel: -9 }, rebound = 9, footSlide = 0, footY = 0, nan = false, headUp = -9;
    const along = (v, w) => (v[0] - w[0]) * dir[0] + (v[2] - w[2]) * dir[1];
    for (let f = 0; f < 72; f++) { g.GT.clock += 1 / 60; frame(); const s = snap();
      if ([s.head, s.chest, s.pel].flat().some((v) => !isFinite(v))) nan = true;
      for (const k of ['head', 'chest', 'tail']) best[k] = Math.max(best[k], along(s[k], s0[k]));
      best.pel = Math.max(best.pel, along(s.pel, s0.pel)); headUp = Math.max(headUp, s.head[1] - s0.head[1]);
      if (f > 12) rebound = Math.min(rebound, along(s.head, s0.head));
      s.ends.forEach((e, i) => { footSlide = Math.max(footSlide, Math.hypot(e[0] - s0.ends[i][0], e[2] - s0.ends[i][2])); footY = Math.max(footY, Math.abs(e[1] - s0.ends[i][1])); }); }
    const s1 = snap(), settle = Math.max(...['head', 'chest', 'tail'].map((k) => Math.hypot(...s1[k].map((v, i) => v - s0[k][i]))));
    g.GT.paused = false;
    const r3 = (v) => +v.toFixed(3);
    return { head: r3(best.head), chest: r3(best.chest), tail: r3(best.tail), pel: r3(best.pel), headUp: r3(headUp), rebound: r3(rebound), footSlide: r3(footSlide), footY: r3(footY), settle: r3(settle), nan, hrA: r3(d.hrA || 0) };
  }, [spot, ang, opts]);
  // push direction relative to facing: from the front → push points backward (ang = π)
  const dirs = { 'önden': Math.PI, 'arkadan': 0, 'soldan': Math.PI / 2, 'sağdan': -Math.PI / 2 };
  const R = {};
  for (const [n, a] of Object.entries(dirs)) R[n] = await run(a);
  for (const n of Object.keys(dirs)) log(`${n}: baş itiş yönüne savruluyor (≥ 40 cm), göğüs de (≥ 15 cm)`, R[n].head >= .4 && R[n].chest >= .15 && !R[n].nan, JSON.stringify(R[n]));
  log('önden vuruşta baş kalkıyor (≥ 15 cm)', R['önden'].headUp >= .15, R['önden'].headUp);
  log('kuyruk yandan vuruşta itişle savruluyor (≥ 30 cm)', R['soldan'].tail >= .3 && R['sağdan'].tail >= .3, `${R['soldan'].tail} / ${R['sağdan'].tail}`);
  log('yerdeki ayaklar yerinde kalıyor (kayma ≤ 6 cm, yükseklik ≤ 4 cm)', Object.values(R).every((r) => r.footSlide <= .06 && r.footY <= .04), Object.values(R).map((r) => `${r.footSlide}/${r.footY}`).join(' '));
  log('küçük bir geri sekme var (baş itişin tersine ≥ 1 cm)', Object.values(R).every((r) => r.rebound <= -.01), Object.values(R).map((r) => r.rebound).join(' '));
  log('1,2 sn sonra duruş eski haline dönüyor (≤ 1 cm)', Object.values(R).every((r) => r.settle <= .01), Object.values(R).map((r) => r.settle).join(' '));
  const armor = await run(Math.PI, { st: 'claw', ct: 1.2 });
  log('pençe hazırlığında süper zırh: tepki ~üçte bir', armor.head < R['önden'].head * .5 && armor.head > .05, `${armor.head} (normal ${R['önden'].head})`);
  const small = await run(Math.PI, { dmg: 8 });
  log('hafif vuruş daha küçük tepki veriyor', small.head < R['önden'].head && small.head > .1, `${small.head} < ${R['önden'].head}`);
  await G(() => { __G.DREACT.on = 0; });
  const off = await run(Math.PI);
  await G(() => { __G.DREACT.on = 1; });
  log('DREACT.on=0: eski davranış (hiç tepki yok)', Math.abs(off.head) < .005 && Math.abs(off.chest) < .005, JSON.stringify(off));
  // live path: player sword hit through foeHurt-style call while updateDragon runs
  const live = await G((sp) => { const g = __G, d = g.DRAGON; Object.assign(d, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), st: 'tired', t: 0, dead: 0, hp: 1400, speed: 1, gp: undefined }); g.P.x = sp.x + 6; g.P.z = sp.z + 6;
    d.hurt(30, -.7, -.7); let ok = true, peak = 0; for (let i = 0; i < 40; i++) { g.GT.clock += 1 / 30; g.updateDragon(d, 1 / 30); peak = Math.max(peak, d.rk || 0); if (!d.hitPts().flat().every(isFinite)) ok = false; } g.drawDragon(); return { ok, peak: +peak.toFixed(3) }; }, spot);
  log('canlı güncelleme yolunda tepki çalışıyor, NaN yok', live.ok && live.peak > .3, JSON.stringify(live));
  const ms = await G((sp) => { const g = __G, d = g.DRAGON; g.P.x = sp.x + 12; g.P.z = sp.z + 12; Object.assign(d, { x: sp.x, z: sp.z, clip: 'stand', fade: 1, prev: null, speed: 1 });
    const t = performance.now(); for (let i = 0; i < 200; i++) { d.hrT = g.GT.clock - .2; g.dSample(d, 1 / 30); g.dReact(d); d.M = g.dFit(d, 1 / 30); g.dSkinMats(d); } const a = (performance.now() - t) / 200;
    d.hrT = undefined; const t2 = performance.now(); for (let i = 0; i < 200; i++) { g.dSample(d, 1 / 30); g.dReact(d); d.M = g.dFit(d, 1 / 30); g.dSkinMats(d); } return [a, (performance.now() - t2) / 200]; }, spot);
  log('tepki maliyeti küçük (< 0,3 ms / kare ek)', ms[0] - ms[1] < .3, `tepki ${ms[0].toFixed(3)} ms · yok ${ms[1].toFixed(3)} ms`);
  // screenshot: side-on, side hit held at its peak
  await G((sp) => { const g = __G, d = g.DRAGON; Object.assign(d, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: .7, st: 'tired', clip: 'stand', ct: 0, fade: 1, prev: null, speed: 0, dead: 0, hp: 1400, gp: undefined });
    g.GT.paused = true; const a = d.yaw + Math.PI / 2; d.hurt(45, Math.sin(a), Math.cos(a)); d.hrT = g.GT.clock - .12;
    g.dSample(d, 0); g.dReact(d); d.M = g.dFit(d, 1 / 30); g.dSkinMats(d); g.drawDragon();
    g.P.x = sp.x - Math.sin(d.yaw) * 16; g.P.z = sp.z - Math.cos(d.yaw) * 16; g.__lockCam = 1; g.CAM.yaw = d.yaw; g.CAM.dist = 14; g.CAM.pitch = .25; g.CAM.tx = d.x; g.CAM.tz = d.z; g.CAM.ty = d.y + 2; }, spot);
  await shot('dreact-side', { wait: 600 });
};
