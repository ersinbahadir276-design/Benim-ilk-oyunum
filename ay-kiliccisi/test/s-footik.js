// Ayak IK testi: eğimli zeminde iki ayak da toprağa basmalı, baş kilitli düşmana dönmeli, düz zeminde poz değişmemeli.
module.exports = async ({ G, log, shot }) => {
  await G(() => { __G.GT.paused = true; window.__noAutoQ = 1; });
  const r = await G(() => {
    const g = __G, P = g.P, H = g.HB, run = (n) => { for (let i = 0; i < n; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } };
    // find a steep, dry spot near the kingdom (side-on to the slope: one foot uphill, one downhill)
    let best = null;
    for (let x = -300; x <= 600; x += 6) for (let z = -200; z <= 900; z += 6) {
      const gx = (g.hAt(x + .5, z) - g.hAt(x - .5, z)), gz = (g.hAt(x, z + .5) - g.hAt(x, z - .5)), s = Math.hypot(gx, gz);
      if (s > .7 || g.depthAt && g.depthAt(x, z) > 0) continue; if (!best || s > best.s) best = { x, z, s, gx, gz }; }
    g.tp(best.x, best.z); for (const w of g.wolves) w.x += 999; for (const b of g.GOBS) b.x += 999;
    P.yaw = Math.atan2(best.gz, -best.gx); // facing along the contour: the slope runs across the hips
    const rest = g.SK.rest[H.leftFoot][1];
    const err = () => ['leftFoot', 'rightFoot'].map((b) => { const w = g.mpt(g.PM, g.SK.GP[H[b]]); return +(w[1] - g.hAt(w[0], w[2]) - rest).toFixed(3); });
    g.FIK.on = 0; run(40); const off = err();
    g.FIK.on = 1; run(40); const on = err();
    // flat ground: IK must not change the pose
    g.tp(30, 420); run(40); const flat = err();
    return { slope: +best.s.toFixed(2), off, on, flat, pos: [best.x, best.z] };
  });
  const mx = (a) => Math.max(...a.map(Math.abs));
  log('eğimli zemin bulundu (eğim ' + r.slope + ')', r.slope > .15, JSON.stringify(r.pos));
  log('IK kapalıyken ayaklar zeminden kopuk', mx(r.off) > .04, JSON.stringify(r.off));
  log('IK açıkken iki ayak da zeminde (±3 cm)', mx(r.on) < .03, JSON.stringify(r.on));
  log('düz zeminde ayak hatası küçük', mx(r.flat) < .03, JSON.stringify(r.flat));
  await G(([x, z]) => { const g = __G; g.tp(x, z); for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + 1.45; g.CAM.dist = 3.2; g.CAM.pitch = .08; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .8; }, r.pos);
  await shot('footik-slope', { wait: 500 });
  await G(() => { const g = __G; g.CAM.yaw = g.P.yaw + Math.PI + .1; g.CAM.dist = 2.6; g.CAM.pitch = .02; g.CAM.ty = g.P.y + .5; });
  await shot('footik-front', { wait: 500 });
  // look-at: put a goblin to the hero's right, head yaw must turn towards it
  const look = await G(() => { const g = __G, P = g.P; g.tp(30, 420); const gb = g.GOBS.find((b) => !b.dead); P.yaw = 0;
    gb.x = P.x + 4; gb.z = P.z + 3; gb.y = g.hAt(gb.x, gb.z); gb.st = 'idle'; P.lock = gb;
    for (let i = 0; i < 60; i++) { g.GT.time += 1 / 60; g.step(1 / 60); gb.x = P.x + 4; gb.z = P.z + 3; } P.lock = null; return +g.FIK.look.toFixed(2); });
  log('baş kilitli düşmana dönüyor', look > .4, 'look=' + look);
};
