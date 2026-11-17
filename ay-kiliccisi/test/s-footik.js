// Kael terrain foot IK: on a slope both feet must rest on the ground (ankle height above terrain ≈ rest ankle height).
module.exports = async ({ G, log, shot }) => {
  await G(() => { __G.GT.paused = true; window.__noAutoQ = 1; });
  // find a steep but walkable spot near the spawn (land, not water)
  const spot = await G(() => { const g = __G; let best = null;
    for (let x = -400; x <= 400; x += 6) for (let z = -400; z <= 600; z += 6) { if (g.depthAt && g.depthAt(x, z) > 0) continue;
      const sx = (g.hAt(x + 1, z) - g.hAt(x - 1, z)) / 2, sz = (g.hAt(x, z + 1) - g.hAt(x, z - 1)) / 2, s = Math.hypot(sx, sz);
      if (s > .22 && s < .5 && (!best || Math.abs(s - .35) < Math.abs(best.s - .35))) best = { x, z, s, yaw: Math.atan2(sx, sz) }; }
    return best; });
  log('eğimli nokta bulundu', !!spot, JSON.stringify(spot));
  if (!spot) return;
  const measure = (on, yaw) => G(([sp, on, yaw]) => { const g = __G, P = g.P; g.FIK.on = on; g.tp(sp.x, sp.z); P.yaw = yaw; P.st = 'move'; P.air = false;
    for (let i = 0; i < 40; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    const H = g.HB, rest = g.SK.rest[H.leftFoot][1], out = {};
    for (const [n, b] of [['L', H.leftFoot], ['R', H.rightFoot]]) { const w = g.mpt(g.PM, g.SK.GP[b]); out[n] = +(w[1] - g.hAt(w[0], w[2]) - rest).toFixed(3); }
    out.st = P.st; return out; }, [spot, on, yaw]);
  // stand sideways to the slope: one foot uphill, one downhill (worst case for flat-ground poses)
  const side = spot.yaw + Math.PI / 2;
  const off = await measure(0, side), on = await measure(1, side);
  log('IK kapalı: bir ayak havada/gömülü', Math.max(Math.abs(off.L), Math.abs(off.R)) > .05, JSON.stringify(off));
  log('IK açık: iki ayak yerde (±3 cm)', Math.abs(on.L) < .03 && Math.abs(on.R) < .03, JSON.stringify(on));
  const up = await measure(1, spot.yaw); // facing uphill
  log('yokuş yukarı bakarken ayaklar yerde (±4 cm)', Math.abs(up.L) < .04 && Math.abs(up.R) < .04, JSON.stringify(up));
  await G(() => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + 1.2; g.CAM.dist = 3.2; g.CAM.pitch = .05; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .7; });
  await shot('fik-on', { wait: 500 });
  const flat = await G(() => { const g = __G; g.FIK.on = 1; g.tp(30, 420); for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } return g.FIK.dbg; });
  log('düz zeminde pelvis inmiyor', flat && Math.abs(flat.drop) < .02, JSON.stringify(flat));
};
