// node test/harness.js test/s-crocik.js  -> crocodiles on slopes: body pitches/rolls, head + tail follow the ground, all four feet reach it
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const find = (lo, hi) => G(([lo, hi]) => {
    const g = __G;
    for (let r = 20; r < 1900; r += 8) for (let a = 0; a < 6.28; a += 8 / r) {
      const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = 1.2; if (Math.abs(x) > 1350 || Math.abs(z) > 1350) continue;
      const hx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), hz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e), s = Math.hypot(hx, hz);
      let dry = true; for (let q = -2.5; q <= 2.5; q += .5) for (let p = -2.5; p <= 2.5; p += .5) if (g.waterAt(x + p, z + q) > g.hAt(x + p, z + q) - .5) dry = false;
      if (s >= lo && s < hi && dry) return { x, z, s, up: Math.atan2(hx, hz) };
    }
    return null;
  }, [lo, hi]);
  const spot = await find(.3, .5), flat = await find(0, .002);
  log('eğimli ve düz zemin bulundu', !!spot && !!flat, spot && spot.s.toFixed(2));
  if (!spot || !flat) return;
  // place crocodile 0 at (x,z) facing yaw, draw it a number of frames; return foot / head / tail heights above ground
  const meas = (x, z, yaw, on, spd = 0) => G(([x, z, yaw, on, spd]) => {
    const g = __G, c = g.CROCS[0]; g.CFIK.on = on;
    Object.assign(c, { x, z, y: g.crocY(x, z), yaw, st: spd ? 'drift' : 'idle', spd, dead: 0, jaw: 0, hyaw: 0, gp: undefined, gr: undefined });
    g.P.x = x + 4; g.P.z = z + 4; let nan = false;
    for (let f = 0; f < 30; f++) { if (spd) c.ph += .15; g.drawCrocs(f / 30); }
    const d = c.R.def, sc = c.sc, h = (p) => { if (p.some((v) => !isFinite(v))) nan = true; return +(p[1] - g.crocY(p[0], p[2])).toFixed(3); };
    const feet = [[9, 1], [11, -1], [13, 1], [15, -1]].map(([l, s]) => h(g.boneW(d, l, g.crocFootLocal(l, s), sc)));
    const joints = [2, 5, 6, 7].map((i) => h(d.WP[i]));
    g.CFIK.on = 1; return { feet, joints, p: +(c.gp || 0).toFixed(3), r: +(c.gr || 0).toFixed(3), nan, last: g.CFIK.last };
  }, [x, z, yaw, on, spd]);
  const fOn = await meas(flat.x, flat.z, 0, 1), fOff = await meas(flat.x, flat.z, 0, 0);
  log('düz zeminde neredeyse aynı duruş (açık ≈ kapalı, ±8 mm)', fOn.feet.every((v, i) => Math.abs(v - fOff.feet[i]) < .008) && fOn.joints.every((v, i) => Math.abs(v - fOff.joints[i]) < .008), `${fOn.feet} / ${fOff.feet}`);
  const refF = fOn.feet, refJ = fOn.joints;
  for (const [name, off] of [['yokuş yukarı', 0], ['yokuş aşağı', Math.PI], ['yan eğim', Math.PI / 2], ['çapraz', Math.PI / 4]]) {
    const yaw = spot.up + off, a = await meas(spot.x, spot.z, yaw, 0), b = await meas(spot.x, spot.z, yaw, 1);
    const ef = (m) => Math.max(...m.feet.map((v, i) => Math.abs(v - refF[i]))), ej = (m) => Math.max(...m.joints.map((v, i) => Math.abs(v - refJ[i])));
    log(`${name}: dört ayak zeminde (±4 cm)`, ef(b) < .04 && !b.nan && ef(b) <= ef(a) + .005, `kapalı ${ef(a).toFixed(3)} → açık ${ef(b).toFixed(3)}, eğim ${b.p}, yatış ${b.r}`);
    log(`${name}: baş ve kuyruk zemine gömülmüyor`, Math.min(...b.joints) > .05 && ej(b) < Math.max(.08, ej(a) * .5), `kapalı ${a.joints} → açık ${b.joints}`);
  }
  const up = await meas(spot.x, spot.z, spot.up, 1), dn = await meas(spot.x, spot.z, spot.up + Math.PI, 1), sd = await meas(spot.x, spot.z, spot.up + Math.PI / 2, 1);
  log('gövde eğime göre burun yukarı / aşağı, yan eğimde yatış', up.p < -.15 && dn.p > .15 && Math.abs(sd.r) > .15, `${up.p} / ${dn.p} / yatış ${sd.r}`);
  // crawling across the slope: feet never sink
  let worst = 0, nan = false;
  for (const off of [0, Math.PI, Math.PI / 2]) { const r = await meas(spot.x, spot.z, spot.up + off, 1, 2); worst = Math.min(worst, ...r.feet.map((v, i) => v - refF[i])); nan = nan || r.nan; }
  log('eğimde yürürken ayak gömülmüyor (≥ −4 cm)', worst > -.04 && !nan, worst.toFixed(3));
  // floating in the swamp: fit is off (level body)
  const wet = await G(() => { const g = __G, c = g.CROCS.find((q) => g.waterAt(q.hx, q.hz) - .22 > g.hAt(q.hx, q.hz) + .05); if (!c) return null; const i = g.CROCS.indexOf(c);
    Object.assign(c, { x: c.hx, z: c.hz, y: g.crocY(c.hx, c.hz), gp: undefined, gr: undefined, dead: 0 }); g.P.x = c.x + 4; g.P.z = c.z + 4; for (let f = 0; f < 10; f++) g.drawCrocs(f / 30); return { p: c.gp, r: c.gr, i }; });
  log('suda yüzerken gövde düz kalır', wet && wet.p === 0 && wet.r === 0, JSON.stringify(wet));
  // cost: one fit (4 chain + up to 12 leg FK passes)
  const ms = await G((sp) => { const g = __G, c = g.CROCS[0]; Object.assign(c, { x: sp.x, z: sp.z, y: g.crocY(sp.x, sp.z), yaw: sp.up + .7, dead: 0 }); g.P.x = sp.x + 4; g.P.z = sp.z + 4;
    const t = performance.now(); for (let i = 0; i < 300; i++) g.drawCrocs(i / 30); return (performance.now() - t) / 300; }, spot);
  log('çizim maliyeti makul (< 1 ms / kare, 7 timsah)', ms < 1, ms.toFixed(3) + ' ms');
  // in-game render with the croc on the slope
  await G((sp) => { const g = __G, c = g.CROCS[0]; Object.assign(c, { x: sp.x, z: sp.z, y: g.crocY(sp.x, sp.z), yaw: sp.up + .6, st: 'idle', spd: 0, aware: 0, t: 0, hx: sp.x, hz: sp.z });
    g.tp(sp.x + 3.5, sp.z + 2.5); g.__lockCam = 1; g.CAM.yaw = c.yaw + Math.PI / 2; g.CAM.dist = 4.5; g.CAM.pitch = .12; g.CAM.tx = c.x; g.CAM.tz = c.z; g.CAM.ty = c.y + .4; g.GT.paused = false; }, spot);
  await shot('crocik-on', { wait: 600 });
  await G(() => { __G.CFIK.on = 0; });
  await shot('crocik-off', { wait: 600 });
  await G(() => { __G.CFIK.on = 1; });
};
module.exports.pauseAtStart = true;
