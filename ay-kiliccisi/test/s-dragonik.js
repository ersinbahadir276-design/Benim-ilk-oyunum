// node test/harness.js test/s-dragonik.js  -> dragon on slopes: body pitches/rolls, all four limbs reach the ground, off in the air
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  // a dry slope wide enough for the ~7 m dragon (similar gradient over ±4 m)
  const find = (lo, hi, flat4 = 9) => G(([lo, hi, flat4]) => {
    const g = __G, sl = (x, z, e) => { const hx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), hz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e); return [Math.hypot(hx, hz), Math.atan2(hx, hz)]; };
    for (let r = 20; r < 1900; r += 9) for (let a = 0; a < 6.28; a += 9 / r) {
      const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r; if (Math.abs(x) > 1350 || Math.abs(z) > 1350) continue;
      const [s, up] = sl(x, z, 1.2), [s4] = sl(x, z, 4); if (s < lo || s >= hi || Math.abs(s4 - s) > .08 || s4 > flat4) continue;
      let dry = true; for (let q = -5; q <= 5; q += 1) for (let p = -5; p <= 5; p += 1) if (g.waterAt(x + p, z + q) > g.hAt(x + p, z + q) - .5) dry = false;
      if (dry) return { x, z, s, up };
    }
    return null;
  }, [lo, hi, flat4]);
  const spot = await find(.22, .36), flat = await find(0, .004, .006);
  log('eğimli ve düz zemin bulundu', !!spot && !!flat, spot && spot.s.toFixed(2));
  if (!spot || !flat) return;
  // place the dragon, pose clip `clip` at time t, run the fit for 40 frames; limb-end heights above their own ground
  const meas = (x, z, yaw, on, clip = 'stand', t = 0) => G(([x, z, yaw, on, clip, t]) => {
    const g = __G, d = g.DRAGON, D = g.DRG; g.DFIK.on = on; g.P.x = x + 12; g.P.z = z + 12;
    Object.assign(d, { x, z, y: g.hAt(x, z), yaw, dead: 0, clip, ct: t, prev: null, fade: 1, gp: undefined, gr: undefined, gs: undefined, speed: 0 });
    let nan = false;
    for (let f = 0; f < 40; f++) { g.dSample(d, 0); d.M = g.dFit(d, 1 / 30); }
    g.dSkinMats(d);
    const ends = g.dLimbs().map((L) => { const p = g.dBone(d, L.e); if (p.some((v) => !isFinite(v))) nan = true; return +(p[1] - g.hAt(p[0], p[2])).toFixed(3); });
    const pel = g.dBone(d, D.pelvis), last = g.DFIK.last; g.DFIK.on = 1;
    return { ends, nan, p: d.gp, r: d.gr, s: d.gs, pel: +(pel[1] - g.hAt(pel[0], pel[2])).toFixed(3), last };
  }, [x, z, yaw, on, clip, t]);
  const fOn = await meas(flat.x, flat.z, 0, 1), fOff = await meas(flat.x, flat.z, 0, 0);
  log('düz zeminde duruş değişmez (±1 cm)', fOn.ends.every((v, i) => Math.abs(v - fOff.ends[i]) < .01) && !fOn.nan, `${fOn.ends} / ${fOff.ends}`);
  const ref = fOff.ends, err = (m) => Math.max(...m.ends.map((v, i) => Math.abs(v - ref[i])));
  for (const [name, off] of [['yokuş yukarı', 0], ['yokuş aşağı', Math.PI], ['yan eğim', Math.PI / 2], ['çapraz', Math.PI / 4]]) {
    const yaw = spot.up + off, a = await meas(spot.x, spot.z, yaw, 0), b = await meas(spot.x, spot.z, yaw, 1);
    log(`${name}: dört uzuv zeminde (±6 cm)`, err(b) < .06 && !b.nan && err(b) < err(a), `kapalı ${err(a).toFixed(3)} → açık ${err(b).toFixed(3)} · eğim ${b.p.toFixed(3)} yatış ${b.r.toFixed(3)} çökme ${b.s.toFixed(3)} · uzanma ${b.last.reach}`);
  }
  const up = await meas(spot.x, spot.z, spot.up, 1), dn = await meas(spot.x, spot.z, spot.up + Math.PI, 1), sd = await meas(spot.x, spot.z, spot.up + Math.PI / 2, 1);
  log('gövde eğime uyar: yokuşta burun yukarı/aşağı, yan eğimde yatış', Math.abs(up.p) > .12 && Math.sign(up.p) === -Math.sign(dn.p) && Math.abs(sd.r) > .12 && Math.abs(sd.p) < .08, `${up.p.toFixed(3)} / ${dn.p.toFixed(3)} / yatış ${sd.r.toFixed(3)}`);
  log('uzuvlar aşırı gerilmiyor (≤ %99,5)', [up, dn, sd].every((m) => m.last.reach.every((v) => v <= .996)), JSON.stringify([up.last.reach, dn.last.reach]));
  // walk cycle across the slope: no limb sinks into the ground
  let worst = Infinity, nan = false;
  for (const off of [0, Math.PI, Math.PI / 2]) for (let t = 0; t < 1.75; t += .25) { const r = await meas(spot.x, spot.z, spot.up + off, 1, 'walk', t); worst = Math.min(worst, ...r.ends); nan = nan || r.nan; }
  log('eğimde yürüyüşte uzuv gömülmüyor (≥ 0,40 m bilek yüksekliği)', worst > .4 && !nan, worst.toFixed(3));
  // in the air (hover clip): fit fades out, body level
  const air = await meas(spot.x, spot.z, spot.up, 1, 'skill08', .5);
  log('havada uyum kapalı (gövde düz)', Math.abs(air.p) < 1e-3 && Math.abs(air.r) < 1e-3 && Math.abs(air.s) < 1e-3, JSON.stringify(air.last));
  // the live update path (state machine + sampling + fit) runs without NaN
  const live = await G((sp) => { const g = __G, d = g.DRAGON; Object.assign(d, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: sp.up, dead: 0, st: 'sleep', speed: 1, gp: undefined }); g.P.x = sp.x + 30; g.P.z = sp.z + 30;
    for (let i = 0; i < 60; i++) g.updateDragon(d, 1 / 30); g.drawDragon(); return d.hitPts().flat().every(isFinite); }, spot);
  log('canlı güncelleme yolu NaN üretmiyor', live);
  const ms = await G((sp) => { const g = __G, d = g.DRAGON; g.P.x = sp.x + 12; g.P.z = sp.z + 12; Object.assign(d, { x: sp.x, z: sp.z, yaw: sp.up + .5, clip: 'walk', fade: 1, prev: null, speed: 1 });
    const t = performance.now(); for (let i = 0; i < 200; i++) { g.dSample(d, 1 / 30); d.M = g.dFit(d, 1 / 30); g.dSkinMats(d); } const a = (performance.now() - t) / 200;
    g.DFIK.on = 0; const t2 = performance.now(); for (let i = 0; i < 200; i++) { g.dSample(d, 1 / 30); d.M = g.dFit(d, 1 / 30); g.dSkinMats(d); } g.DFIK.on = 1; return [a, (performance.now() - t2) / 200]; }, spot);
  log('uyum maliyeti küçük (< 0,5 ms / kare ek)', ms[0] - ms[1] < .5, `açık ${ms[0].toFixed(3)} ms · kapalı ${ms[1].toFixed(3)} ms`);
  // screenshots: side-on, on the slope, fit on / off
  await G((sp) => { const g = __G, d = g.DRAGON; Object.assign(d, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: sp.up + Math.PI / 2 * 0, st: 'sleep', clip: 'stand', ct: 0, fade: 1, prev: null, speed: 1, gp: undefined });
    g.tp(sp.x - Math.cos(sp.up) * 14, sp.z + Math.sin(sp.up) * 14); g.__lockCam = 1; g.CAM.yaw = sp.up - Math.PI / 2; g.CAM.dist = 11; g.CAM.pitch = .3; g.CAM.tx = d.x; g.CAM.tz = d.z; g.CAM.ty = d.y + 1.8; g.GT.paused = false; }, spot);
  await shot('dragonik-on', { wait: 900 });
  await G(() => { __G.DFIK.on = 0; });
  await shot('dragonik-off', { wait: 900 });
  await G(() => { __G.DFIK.on = 1; });
};
module.exports.pauseAtStart = true;
