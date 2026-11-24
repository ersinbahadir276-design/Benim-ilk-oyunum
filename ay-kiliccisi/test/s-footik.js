// Terrain foot IK: on a slope both feet rest on the ground under them, the pelvis drops, it switches off in the air
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => { const g = __G, P = g.P, IN = g.IN, DT = 1 / 60; g.GT.paused = true; const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f && f() === false) break; } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (Math.hypot(a.x - x, a.z - z) < 70) { a.x += 400; a.hx = a.x; } };
    const ankle0 = g.SK.rest[g.HB.leftFoot][1];
    const fresh = (x, z, yaw) => { g.tp(x, z); Object.assign(P, { st: 'move', t: 0, sta: 100, inv: 0, pinBy: null, alive: true, air: false, yaw, vx: 0, vz: 0, spd: 0 }); P.rag.ang = 0; P.lift = 0; IN.mx = IN.mz = 0; for (const k in g.BUF) g.BUF[k] = -9; };
    const feet = () => ['leftFoot', 'rightFoot'].map((b) => { const p = g.mpt(g.PM, g.SK.GP[g.HB[b]]); return p[1] - g.hAt(p[0], p[2]) - ankle0; });
    // find a dry slope of 20-30 degrees near the start area
    let spot = null;
    for (let r = 40; r < 900 && !spot; r += 15) for (let a = 0; a < 6.28 && !spot; a += 0.2) { const x = Math.sin(a) * r, z = Math.cos(a) * r, e = 0.6, gx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), gz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e), s = Math.hypot(gx, gz);
      if (s > 0.36 && s < 0.58 && g.depthAt(x, z) <= 0) spot = { x, z, s, yaw: Math.atan2(-gz, gx) }; } // facing across the slope: one foot uphill, one downhill
    const o = { spot: spot && { s: +spot.s.toFixed(2) } }; if (!spot) return o;
    far(spot.x, spot.z);
    // with IK
    fresh(spot.x, spot.z, spot.yaw); sim(1.2); o.ik = feet().map((v) => +v.toFixed(3)); o.d = +g.FIK.d.toFixed(3); o.w = +g.FIK.w.toFixed(2);
    o.nan = g.SK.GP.some((p) => p.some((v) => !isFinite(v)));
    // without IK (old behaviour) for comparison
    g.FIK.off = true; fresh(spot.x, spot.z, spot.yaw); sim(1.2); o.off = feet().map((v) => +v.toFixed(3)); g.FIK.off = false;
    // walking across the slope keeps feet near the ground (max float/sink over 2 s)
    fresh(spot.x, spot.z, spot.yaw); sim(.5); let worst = 0; const x0 = P.x, z0 = P.z; g.CAM.yaw = spot.yaw; IN.mz = 1;
    sim(1.5, () => { const f = feet(); worst = Math.max(worst, -Math.min(...f)); }); IN.mz = 0; o.walkSink = +worst.toFixed(3); o.walked = +Math.hypot(P.x - x0, P.z - z0).toFixed(2);
    // uphill walk
    fresh(spot.x, spot.z, spot.yaw); g.CAM.yaw = spot.yaw - 1.5708; IN.mz = 1; let worstUp = 0; sim(1.5, () => { const f = feet(); worstUp = Math.max(worstUp, -Math.min(...f)); }); IN.mz = 0; o.upSink = +worstUp.toFixed(3);
    o.nan2 = g.SK.GP.some((p) => p.some((v) => !isFinite(v)));
    // jump: IK fades out in the air
    fresh(spot.x, spot.z, spot.yaw); sim(.6); g.press('jump'); sim(.25); o.air = P.air; o.wAir = +g.FIK.w.toFixed(2);
    // flat ground: nothing changes
    let flat = null; for (let r = 40; r < 900 && !flat; r += 15) for (let a = 0; a < 6.28 && !flat; a += 0.3) { const x = Math.sin(a) * r, z = Math.cos(a) * r, e = 1;
      if (Math.abs(g.hAt(x + e, z) - g.hAt(x - e, z)) + Math.abs(g.hAt(x, z + e) - g.hAt(x, z - e)) < 0.004 && g.depthAt(x, z) <= 0) flat = [x, z]; }
    if (flat) { far(...flat); fresh(flat[0], flat[1], 0); sim(1); o.flatD = +g.FIK.d.toFixed(3); o.flat = feet().map((v) => +v.toFixed(3)); }
    fresh(spot.x, spot.z, spot.yaw); sim(1); g.CAM && (g.CAM.yaw = spot.yaw + 1.57);
    return o; });
  log('eğim bulundu', r.spot, JSON.stringify(r.spot));
  if (!r.spot) return;
  log('IK açık: iki ayak da zeminde (±4 cm)', r.ik.every((v) => Math.abs(v) < 0.04), JSON.stringify(r));
  log('IK kapalı: eski hâlde bir ayak havada ya da gömülü', r.off.some((v) => Math.abs(v) > 0.06), JSON.stringify(r.off));
  log('leğen aşağı iner, ağırlık 1', r.d < -0.03 && r.w > 0.95, r.d);
  log('NaN yok', !r.nan && !r.nan2);
  log('yürürken ayak zemine 6 cm\'den fazla gömülmez (yamaç boyunca ve yokuş yukarı)', r.walked > 1.5 && r.walkSink < 0.06 && r.upSink < 0.06, JSON.stringify([r.walked, r.walkSink, r.upSink]));
  log('havada IK söner', r.air && r.wAir < 0.3, r.wAir);
  log('düz zeminde etkisiz', r.flatD !== undefined && Math.abs(r.flatD) < 0.01 && r.flat.every((v) => Math.abs(v) < 0.03), JSON.stringify([r.flatD, r.flat]));
  await shot('footik-slope', { wait: 400 });
};
