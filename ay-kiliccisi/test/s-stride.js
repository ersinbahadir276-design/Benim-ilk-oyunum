// node test/harness.js test/s-stride.js  -> stride foot locking: a planted foot does not slide while walking/running
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const flat = await G(() => { const g = __G; let best = null;
    for (let r = 5; r < 600 && !best; r += 5) for (let a = 0; a < 6.28; a += .2) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r; let ok = g.depthAt(x, z) <= 0;
      for (let d = -12; d <= 12 && ok; d += 2) for (let e = -2; e <= 2 && ok; e += 2) if (Math.abs(g.hAt(x + d, z + e) - g.hAt(x, z)) > .25 || g.depthAt(x + d, z + e) > 0) ok = false;
      if (ok) { best = [x, z]; break; } }
    return best; });
  log('düz yürüyüş alanı bulundu', !!flat, JSON.stringify(flat));
  if (!flat) return;
  // walk/run straight for 2 s and measure how far each ankle slides horizontally while it is in contact with the ground
  const run = (lock, sprint, lin = 1) => G(([p, lock, sprint, lin]) => {
    const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.FIK.on = 1; g.FIK.lock = lock; g.GAIT.lin = lin; g.tp(p[0] - 8, p[1]); g.P.yaw = Math.PI / 2; g.P.st = 'move';
    g.IN.mx = 0; g.IN.mz = 1; g.P.sprintHeld = sprint;
    const B = g.PLD().bones, prev = {}; let slide = 0, contactT = 0, dist = 0, nan = false, maxV = 0, ox = g.P.x, oz = g.P.z, gapW = 0, reach = 0;
    for (let i = 0; i < 150; i++) { g.GT.time += 1 / 60; g.step(1 / 60);
      if (i < 30) { ox = g.P.x; oz = g.P.z; for (const S of ['left', 'right']) prev[S] = null; continue; }
      for (const S of ['left', 'right']) { const f = g.HB[S + 'Foot'], w = g.mpt(g.PM, g.SK.GP[f]); if (!w.every(isFinite)) nan = true;
        const gap = w[1] - B[f].r[1] - g.hAt(w[0], w[2]), c = gap < .03;
        if (c && prev[S]) { const d = Math.hypot(w[0] - prev[S][0], w[2] - prev[S][2]); slide += d; contactT += 1 / 60; maxV = Math.max(maxV, d * 60); }
        if (c && gap < gapW) gapW = gap;
        prev[S] = c ? w : null; }
      // leg stays within reach (knee not hyper-extended past the chain length)
      for (const S of ['left', 'right']) { const hp = g.SK.GP[g.HB[S + 'UpperLeg']], ft = g.SK.GP[g.HB[S + 'Foot']]; reach = Math.max(reach, Math.hypot(ft[0] - hp[0], ft[1] - hp[1], ft[2] - hp[2]) / (g.SK.L1 + g.SK.L2)); }
    }
    dist = Math.hypot(g.P.x - ox, g.P.z - oz); g.IN.mz = 0; g.P.sprintHeld = false;
    return { slidePerM: +(slide / Math.max(dist, .01)).toFixed(3), avgV: +(slide / Math.max(contactT, .01)).toFixed(3), maxV: +maxV.toFixed(2), contactT: +contactT.toFixed(2), dist: +dist.toFixed(2), reach: +reach.toFixed(3), nan, spd: +g.P.spd.toFixed(2) };
  }, [flat, lock, sprint, lin]);
  const w0 = await run(0, false, 0), r0 = await run(0, true, 0);// the old sine gait without locking
  const wOff = await run(0, false), wOn = await run(1, false), rOff = await run(0, true), rOn = await run(1, true);
  log('eski sinüs adım: basan ayak kayıyor (karşılaştırma)', w0.slidePerM > .5 && r0.slidePerM > .5, JSON.stringify({ walk: w0, run: r0 }));
  log('hıza eşli adım tek başına kaymayı azaltıyor', wOff.slidePerM < w0.slidePerM * .6 && rOff.slidePerM < r0.slidePerM * .6, w0.slidePerM + ' → ' + wOff.slidePerM + ' / ' + r0.slidePerM + ' → ' + rOff.slidePerM);
  log('yürüyüş: kilitle kayma < 0,1 m / yürünen m', wOn.slidePerM < .1 && !wOn.nan, JSON.stringify(wOn));
  log('yürüyüş: en hızlı kayma < 2,5 m/s (eski: 11+)', wOn.maxV < 2.5, wOff.maxV + ' → ' + wOn.maxV);
  log('koşu: kilitle kayma < 0,06 m / koşulan m ve NaN yok', rOn.slidePerM < .06 && !rOn.nan, JSON.stringify({ off: rOff, on: rOn }));
  log('bacak boyunu aşmıyor (≤ 1,0)', wOn.reach <= 1.0005 && rOn.reach <= 1.0005, wOn.reach + ' / ' + rOn.reach);
  log('yürüme hızı değişmiyor', Math.abs(wOn.dist - wOff.dist) < .05 && Math.abs(rOn.dist - rOff.dist) < .05 && Math.abs(w0.dist - wOn.dist) < .05, [w0.dist, wOff.dist, wOn.dist, rOff.dist, rOn.dist].join(' '));
  // stopping and attacking: the lock lets go (no stuck leg)
  const rel = await G((p) => { const g = __G; g.FIK.lock = 1; g.tp(p[0], p[1]); g.IN.mz = 1; for (let i = 0; i < 40; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    g.IN.mz = 0; for (let i = 0; i < 40; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } const idle = g.FIK.lockW.slice();
    g.IN.mz = 1; for (let i = 0; i < 20; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.IN.mz = 0; g.P.air = true; g.P.vy = 6; g.P.st = 'jump'; for (let i = 0; i < 12; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    return { idle: idle.map((v) => +v.toFixed(2)), air: g.FIK.lockW.map((v) => +v.toFixed(2)) }; }, flat);
  log('durunca ve havada kilit bırakılıyor', rel.idle.every((v) => v < .05) && rel.air.every((v) => v < .05), JSON.stringify(rel));
  await G((p) => { const g = __G; g.P.air = false; g.P.st = 'move'; g.tp(p[0], p[1]); g.__lockCam = 1; g.IN.mz = 1; for (let i = 0; i < 37; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.IN.mz = 0;
    g.CAM.yaw = g.P.yaw + Math.PI / 2; g.CAM.dist = 3.2; g.CAM.pitch = .05; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .7; }, flat);
  await shot('stride-lock', { wait: 400 });
};
module.exports.pauseAtStart = true;
