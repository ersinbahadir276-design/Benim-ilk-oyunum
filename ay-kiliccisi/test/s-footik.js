// node test/harness.js test/s-footik.js  -> foot IK on slopes (feet planted, soles tilted, off in the air)
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  // find a steady slope near the spawn, away from water
  const spot = await G(() => {
    const g = __G; let best = null;
    for (let r = 20; r < 1900 && !best; r += 8) for (let a = 0; a < 6.28; a += 8 / r) {
      const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = .6; if (Math.abs(x) > 1350 || Math.abs(z) > 1350) continue;
      const hx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), hz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e), s = Math.hypot(hx, hz);
      if (s > .45 && s < .7 && g.depthAt(x, z) <= 0 && g.zoneAt(x, z) !== 'lake') { best = { x, z, s, yaw: Math.atan2(-hz, hx) }; break; }
    }
    return best;
  });
  log('eğimli zemin bulundu', !!spot, JSON.stringify(spot && { s: +spot.s.toFixed(2) }));
  if (!spot) return;
  // stand sideways on the slope (feet at different heights) and settle
  const measure = (on) => G(([sp, on]) => {
    const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.FIK.on = on; g.tp(sp.x, sp.z); g.P.yaw = sp.yaw; g.P.st = 'move'; g.IN.mx = 0; g.IN.mz = 0;
    for (let i = 0; i < 90; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    const B = g.PLD().bones, out = {};
    for (const S of ['left', 'right']) {
      const f = g.HB[S + 'Foot'], w = g.mpt(g.PM, g.SK.GP[f]);
      out[S] = +(w[1] - B[f].r[1] - g.hAt(w[0], w[2])).toFixed(3);
      const up = g.r3v(g.SK.GR[f], [0, 1, 0]), M = g.PM, wu = [M[0] * up[0] + M[4] * up[1] + M[8] * up[2], M[1] * up[0] + M[5] * up[1] + M[9] * up[2], M[2] * up[0] + M[6] * up[1] + M[10] * up[2]];
      const e = .18, x = w[0], z = w[2], hx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), hz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e), n = [-hx, 1, -hz], nl = Math.hypot(...n), ul = Math.hypot(...wu);
      out[S + 'Tilt'] = +Math.acos((wu[0] * n[0] + wu[1] * n[1] + wu[2] * n[2]) / (nl * ul)).toFixed(3);
    }
    out.off = +g.FIK.off.toFixed(3); out.w = +g.FIK.w.toFixed(2); out.nan = g.SK.GP.some((p) => p.some((v) => !isFinite(v)));
    return out;
  }, [spot, on]);
  const off = await measure(0), on = await measure(1);
  const gapOff = Math.max(Math.abs(off.left), Math.abs(off.right)), gapOn = Math.max(Math.abs(on.left), Math.abs(on.right));
  log('IK kapalıyken eğimde bir ayak boşta/gömülü (karşılaştırma)', gapOff > .025, JSON.stringify(off));
  log('IK açıkken iki ayak da zeminde (±4 cm)', gapOn < .04 && !on.nan, JSON.stringify(on));
  log('IK ayak–zemin boşluğunu azaltıyor', gapOn < gapOff * .5, gapOff.toFixed(3) + ' → ' + gapOn.toFixed(3));
  log('taban eğime göre yatıyor (≤0,2 rad sapma)', on.leftTilt < .2 && on.rightTilt < .2, JSON.stringify({ off: [off.leftTilt, off.rightTilt], on: [on.leftTilt, on.rightTilt] }));
  log('kalça alçak ayağa iniyor', on.off < -.01, on.off);
  await G((sp) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI / 2; g.CAM.dist = 3.4; g.CAM.pitch = .08; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .7; }, spot);
  await shot('fik-slope-on', { wait: 500 });
  await measure(0);
  await G(() => { const g = __G; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .7; });
  await shot('fik-slope-off', { wait: 400 });
  // walking up and across the slope: stays finite and planted feet stay close to the ground
  const walk = await G((sp) => {
    const g = __G; g.FIK.on = 1; g.tp(sp.x, sp.z); g.P.yaw = sp.yaw + .8; g.IN.mz = 1; let worst = 0, nan = false, n = 0; const B = g.PLD().bones;
    for (let i = 0; i < 150; i++) { g.GT.time += 1 / 60; g.step(1 / 60);
      for (const S of ['left', 'right']) { const f = g.HB[S + 'Foot'], w = g.mpt(g.PM, g.SK.GP[f]), gap = w[1] - B[f].r[1] - g.hAt(w[0], w[2]); if (!isFinite(gap)) nan = true; if (gap < worst) worst = gap; }
      n++; }
    g.IN.mz = 0; return { worst: +worst.toFixed(3), nan, n };
  }, spot);
  log('yürürken ayak zemine gömülmüyor (≥ −5 cm) ve NaN yok', walk.worst > -.05 && !walk.nan, JSON.stringify(walk));
  // flat ground: no pelvis offset; in the air: IK fades out
  const flat = await G(() => { const g = __G; let best = null; for (let r = 5; r < 300 && !best; r += 5) for (let a = 0; a < 6.28; a += .3) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = .8; if (Math.abs(g.hAt(x + e, z) - g.hAt(x - e, z)) + Math.abs(g.hAt(x, z + e) - g.hAt(x, z - e)) < .01 && g.depthAt(x, z) <= 0) { best = [x, z]; break; } }
    if (!best) return null; g.tp(best[0], best[1]); for (let i = 0; i < 60; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } return +g.FIK.off.toFixed(4); });
  log('düz zeminde kalça değişmiyor', flat !== null && Math.abs(flat) < .005, flat);
  const air = await G(() => { const g = __G; g.P.air = true; g.P.vy = 6; g.P.st = 'jump'; for (let i = 0; i < 20; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } return +g.FIK.w.toFixed(3); });
  log('havada ayak IK kapanıyor', air < .1, air);
};
module.exports.pauseAtStart = true;
