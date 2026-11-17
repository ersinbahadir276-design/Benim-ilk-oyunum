// node test/harness.js test/s-wolfstride.js  -> wolf paws don't skate: a planted paw stays where it touched down
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const flat = await G(() => { const g = __G; for (let r = 5; r < 600; r += 5) for (let a = 0; a < 6.28; a += .3) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = 3; if (Math.abs(g.hAt(x + e, z) - g.hAt(x - e, z)) + Math.abs(g.hAt(x, z + e) - g.hAt(x, z - e)) < .004 && g.depthAt(x, z) <= 0) return { x, z }; } return null; });
  log('düz zemin bulundu', !!flat);
  if (!flat) return;
  // walk the nearest wolf along a path: v m/s, turn rad/s, side = strafe (moves sideways while facing yaw).
  // Returns metres of planted-paw slide per metre travelled (per paw), peak planted-paw speed and max leg reach.
  const run = (o) => G(([fx, fz, o]) => {
    const g = __G; g.WFIK.lock = o.lock; const w = g.wolves[0], dt = 1 / 60, rate = g.wolfRate(o.v > 4) * (o.side && o.lock ? g.WGAIT.side : 1); g.WFIK.rel = 0;
    Object.assign(w, { x: fx, z: fz, y: g.hAt(fx, fz), yaw: .3, st: 'idle', spd: o.v, air: 0, dead: 0, roll: 0, crouch: o.crouch || 0, pitch: 0, gp: undefined, gd: undefined, tame: false, pl: undefined, ph: 0, lx: undefined, grm: o.side ? g.WGAIT.side : 1 });
    const P = { x: fx + 30, z: fz + 30 }, prev = [null, null, null, null]; let slide = 0, dist = 0, peak = 0, nan = false, grounded = 0, samples = 0, reach = 0;
    const ref = o.ref;
    for (let f = 0; f < o.frames; f++) {
      w.yaw += (o.turn || 0) * dt;
      const a = w.yaw + (o.side ? Math.PI / 2 : 0), dx = Math.sin(a) * o.v * dt, dz = Math.cos(a) * o.v * dt;
      w.x += dx; w.z += dz; w.y = g.hAt(w.x, w.z); w.ph += o.v * dt * rate; dist += o.v * dt;
      g.drawWolves(P, f * dt); const s = g.wslots.find((q) => q.w === w);
      s.legs.forEach((l, i) => {
        const p = g.mpt(l[1].M, [0, -g.W_LO - .025, 0]), h = g.mpt(l[0].M, [0, 0, 0]);
        if (p.some((v) => !isFinite(v))) nan = true;
        reach = Math.max(reach, Math.hypot(p[0] - h[0], p[1] - h[1], p[2] - h[2]) / w.sc);
        const up = p[1] - g.hAt(p[0], p[2]) - (ref || 0);
        if (f > 60) samples++;
        if (up < .015) { if (f > 60) grounded++; if (prev[i] && f > 60) { const d = Math.hypot(p[0] - prev[i][0], p[2] - prev[i][2]); slide += d; peak = Math.max(peak, d / dt); } prev[i] = p; } else prev[i] = null;
      });
      if (f === 60) { slide = 0; dist = 0; peak = 0; }
    }
    g.WFIK.lock = 1;
    return { slide: +(slide / 4 / dist).toFixed(3), peak: +peak.toFixed(2), duty: +(grounded / samples).toFixed(2), reach: +reach.toFixed(3), rel: g.WFIK.rel, nan };
  }, [flat.x, flat.z, o]);
  // rest sole height on flat ground (standing)
  const ref = await G(([x, z]) => { const g = __G, w = g.wolves[0]; Object.assign(w, { x, z, y: g.hAt(x, z), yaw: .3, st: 'idle', spd: 0, air: 0, dead: 0, roll: 0, crouch: 0, pitch: 0, pl: undefined });
    g.drawWolves({ x: x + 30, z: z + 30 }, 0); const s = g.wslots.find((q) => q.w === w); return s.legs.map((l) => { const p = g.mpt(l[1].M, [0, -g.W_LO - .025, 0]); return p[1] - g.hAt(p[0], p[2]); }).reduce((a, b) => a + b) / 4; }, [flat.x, flat.z]);
  const cases = [['yürüyüş 2 m/s', { v: 2, frames: 300 }, .12], ['koşu 6.6 m/s', { v: 6.6, frames: 300 }, .12], ['dönerek yürüyüş', { v: 2, turn: 1.2, frames: 300 }, .15], ['yan yürüyüş (çember)', { v: 3, side: 1, crouch: .2, frames: 300 }, .2]];
  for (const [name, o, lim] of cases) {
    const a = await run({ ...o, ref, lock: 0 }), b = await run({ ...o, ref, lock: 1 });
    log(`${name}: pati kayması azaldı (< ${lim} m/m)`, b.slide < lim && b.slide < a.slide * .5 && !b.nan, `kapalı ${a.slide} (tepe ${a.peak} m/s) → açık ${b.slide} (tepe ${b.peak} m/s), yerde ${b.duty}, bırakma ${b.rel}`);
    log(`${name}: bacak boyu aşılmıyor`, b.reach < 1.001 * (.32 + .3 + .03), `uzanım ${b.reach}`);
  }
  // stopping and teleporting don't leave a paw stuck behind
  const tp = await G(([x, z]) => { const g = __G, w = g.wolves[0]; w.x += 40; w.y = g.hAt(w.x, w.z); g.drawWolves({ x: w.x + 30, z: w.z + 30 }, 9); const s = g.wslots.find((q) => q.w === w);
    return Math.max(...s.legs.map((l) => { const p = g.mpt(l[1].M, [0, -g.W_LO - .025, 0]); return Math.hypot(p[0] - w.x, p[2] - w.z); })); }, [flat.x, flat.z]);
  log('ışınlanınca pati geride kalmıyor', tp < .8, tp.toFixed(2));
  // in-game screenshot of a trotting wolf
  await G((sp) => { const g = __G, w = g.wolves[0]; Object.assign(w, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: 0, st: 'idle', calm: 999, spd: 2, ph: 1 }); g.tp(sp.x + 3, sp.z + 2);
    g.__lockCam = 1; g.CAM.yaw = Math.PI / 2; g.CAM.dist = 3.2; g.CAM.pitch = .05; g.CAM.tx = w.x; g.CAM.tz = w.z; g.CAM.ty = w.y + .5; }, flat);
  await shot('wolfstride', { wait: 400 });
};
module.exports.pauseAtStart = true;
