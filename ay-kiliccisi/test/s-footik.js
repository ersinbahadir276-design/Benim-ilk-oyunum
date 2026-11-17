// Terrain foot IK: on slopes both soles should touch the ground (gap ~0), compared with IK switched off.
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, DT = 1 / 60, H = g.HB; g.GT.paused = true;
    const sim = (s) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); } };
    // find a steep but dry spot near the start
    let best = null;
    for (let x = -900; x <= 900 && !best; x += 7) for (let z = -900; z <= 900; z += 7) {
      const e = .5, sl = Math.hypot(g.hAt(x + e, z) - g.hAt(x - e, z), g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e);
      if (sl > .4 && sl < .6 && g.depthAt(x, z) <= 0) { best = [x, z, sl]; break; }
    }
    if (!best) return { err: 'no slope' };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - x, a.z - z) < 80) { a.x += 500; a.hx = a.x; } };
    const gaps = (on, yaw) => {
      g.FIK.on = on; g.tp(best[0], best[2] ? best[1] : best[1]); far(best[0], best[1]);
      Object.assign(P, { st: 'move', t: 0, air: false, yaw, vx: 0, vz: 0 }); P.rag.ang = 0; sim(1.2);
      const out = [];
      for (const f of [H.leftFoot, H.rightFoot]) { const w = g.mpt(g.PM, g.SK.GP[f]); out.push(+(w[1] - .095 - g.hAt(w[0], w[2])).toFixed(3)); }
      return out;
    };
    const o = { spot: best.map((v) => +v.toFixed(2)) };
    // stand across the slope (one foot uphill, one downhill) by facing along the contour
    const e = .5, gx = g.hAt(best[0] + e, best[1]) - g.hAt(best[0] - e, best[1]), gz = g.hAt(best[0], best[1] + e) - g.hAt(best[0], best[1] - e);
    const across = Math.atan2(gz, -gx); // facing perpendicular to the gradient
    o.off = gaps(false, across); o.on = gaps(true, across); o.onUp = gaps(true, Math.atan2(gx, gz));
    o.w = +g.FIK.w.toFixed(2); g.FIK.on = true;
    // walking uphill should stay error-free and keep the IK weight up
    P.yaw = Math.atan2(gx, gz); let fin = true; for (let i = 0; i < 60; i++) { g.press && g.IN && (g.IN.mx = 0, g.IN.my = -1); g.GT.time += DT; g.step(DT); if (!g.SK.GP.every((p) => p.every(Number.isFinite))) fin = false; }
    o.finite = fin; return o;
  });
  if (r.err) { log('eğimli yer bulundu', false, r.err); return; }
  const mx = (a) => Math.max(...a.map(Math.abs));
  log('IK kapalıyken bir ayak havada/gömülü (kontrol)', mx(r.off) > 0.04, JSON.stringify(r.off) + ' @' + r.spot);
  log('IK açıkken iki ayak da zemine değiyor (enine)', mx(r.on) < 0.035, JSON.stringify(r.on));
  log('IK açıkken iki ayak da zemine değiyor (yokuş yukarı)', mx(r.onUp) < 0.035, JSON.stringify(r.onUp));
  log('IK ağırlığı yerde 1', r.w > 0.95, r.w);
  log('eğimde yürürken iskelet sayıları sonlu', r.finite);
  await shot('footik');
};
