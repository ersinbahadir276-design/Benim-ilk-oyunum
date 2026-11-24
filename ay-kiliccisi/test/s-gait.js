// Kael's gait + terrain foot IK: feet planted on slopes, no sinking, smooth cycles, side-view screenshots.
// node test/harness.js test/s-gait.js
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  // find a hillside near the start: steepest walkable slope (12–28°) within 250 m of (30,420), away from water
  const spot = await G(() => {
    const g = __G; let best = null;
    for (let i = 0; i < 6400; i++) {
      const x = 30 + ((i % 80) / 80 - .5) * 1400, z = 420 + (Math.floor(i / 80) / 80 - .5) * 1400, e = .5;
      const hx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), hz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e), sl = Math.hypot(hx, hz);
      if (g.waterAt(x, z) > g.hAt(x, z) - 1.3) continue;
      if (sl > .15 && sl < .55 && (!best || Math.abs(sl - .35) < Math.abs(best.sl - .35))) best = { x, z, sl, yaw: Math.atan2(hx, hz) };
    }
    return best;
  });
  log('yamaç bulundu', !!spot, spot && JSON.stringify({ eğim: +spot.sl.toFixed(2) }));
  if (!spot) return;
  const measure = () => G(() => {
    const g = __G, H = g.HB, aH = g.X.dbg.PLD.bones[H.leftFoot].r[1];
    return ['left', 'right'].map((s) => { const w = g.mpt(g.PM, g.SK.GP[H[s + 'Foot']]); return w[1] - aH - g.hAt(w[0], w[2]); });
  });
  const stepN = (n) => G((n) => { const g = __G; for (let i = 0; i < n; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }, n);
  // 1) standing across the slope (feet at different heights): both feet on the ground
  await G((sp) => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(sp.x, sp.z); g.P.yaw = sp.yaw + Math.PI / 2; g.IN.mx = 0; g.IN.mz = 0; }, spot);
  await stepN(90);
  const st = await measure();
  log('ayakta, yan yamaç: iki ayak da zeminde (±3 cm)', st.every((d) => Math.abs(d) < .03), st.map((d) => (d * 100).toFixed(1) + ' cm').join(' / '));
  await G(() => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + .15; g.CAM.dist = 3.4; g.CAM.pitch = .1; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + 1.0; document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  await shot('gait-stand-slope', { wait: 400 });
  // 2) walking / jogging / sprinting uphill and across: the planted foot stays on the ground, no foot sinks
  const runs = [['yürüyüş', .45, false, 0], ['hafif koşu', 1, false, 0], ['depar', 1, true, 0], ['yan yamaçta koşu', 1, false, Math.PI / 2]];
  for (const [name, mz, spr, dy] of runs) {
    await G(([sp, mz, spr, dy]) => { const g = __G; g.tp(sp.x, sp.z); g.P.yaw = sp.yaw + dy; g.CAM.yaw = g.P.yaw + Math.PI; g.IN.mx = 0; g.IN.mz = mz; g.P.sprintHeld = spr; g.P.sta = 100; }, [spot, mz, spr, dy]);
    await stepN(20);
    let worstSink = 0, worstPlant = 0, maxKneeJump = 0, lastK = null;
    for (let i = 0; i < 70; i++) {
      await stepN(1);
      const r = await G(() => { const g = __G, H = g.HB, aH = g.X.dbg.PLD.bones[H.leftFoot].r[1];
        const d = ['left', 'right'].map((s) => { const w = g.mpt(g.PM, g.SK.GP[H[s + 'Foot']]); return w[1] - aH - g.hAt(w[0], w[2]); });
        return { d, k: [g.P.ps.Lkn, g.P.ps.Rkn], ok: Math.abs(g.P.y - g.hAt(g.P.x, g.P.z)) < .05 }; });
      if (!r.ok) continue;
      worstSink = Math.min(worstSink, ...r.d); worstPlant = Math.max(worstPlant, Math.min(...r.d.map(Math.abs)));
      if (lastK) maxKneeJump = Math.max(maxKneeJump, Math.abs(r.k[0] - lastK[0]), Math.abs(r.k[1] - lastK[1])); lastK = r.k;
    }
    log(`${name}: hiçbir ayak zemine 4 cm'den fazla gömülmüyor`, worstSink > -.04, (worstSink * 100).toFixed(1) + ' cm');
    log(`${name}: basan ayak zeminde (en kötü kare < 6 cm)`, worstPlant < .06, (worstPlant * 100).toFixed(1) + ' cm');
    log(`${name}: diz açısı kareden kareye sıçramıyor (< 0.35 rad)`, maxKneeJump < .35, maxKneeJump.toFixed(3));
  }
  await G(() => { const g = __G; g.IN.mz = 1; g.P.sprintHeld = false; });
  for (const [k, nm] of [[0, 'a'], [9, 'b'], [9, 'c']]) { await stepN(k); await G(() => { const g = __G; g.CAM.yaw = g.P.yaw + Math.PI + 1.45; g.CAM.dist = 3.8; g.CAM.pitch = .08; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + 1.0; }); await shot('gait-jog-' + nm, { wait: 300 }); }
  await G(() => { const g = __G; g.P.sprintHeld = true; }); await stepN(30);
  await G(() => { const g = __G; g.CAM.yaw = g.P.yaw + Math.PI + 1.45; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + 1.0; }); await shot('gait-sprint', { wait: 300 });
  // 3) flat ground idle: weight shift keeps both feet down
  await G(() => { const g = __G; g.IN.mz = 0; g.P.sprintHeld = false; g.tp(30, 420); }); await stepN(200);
  const fl = await measure();
  log('düz zeminde bekleme: ayaklar yerde (±2.5 cm)', fl.every((d) => Math.abs(d) < .025), fl.map((d) => (d * 100).toFixed(1) + ' cm').join(' / '));
};
