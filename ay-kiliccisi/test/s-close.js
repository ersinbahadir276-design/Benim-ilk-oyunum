module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(600);
  await G(() => { const g = __G, P = g.P, GT = g.GT; window.__noAutoQ = 1; GT.paused = true;
    window.S = { sim(sec) { for (let i = 0; i < Math.round(sec * 60); i++) { GT.time += 1 / 60; g.step(1 / 60); } },
      cam(yaw, dist, pitch, x, y, z) { g.__lockCam = 1; g.CAM.yaw = yaw; g.CAM.dist = dist; g.CAM.pitch = pitch; g.CAM.tx = x; g.CAM.ty = g.hAt(x, z) + y; g.CAM.tz = z; },
      at(x, z, yaw) { g.tp(x, z); P.yaw = yaw; P.st = 'move'; P.hp = 500; P.alive = true; P.rag.ang = 0; P.td = null; P.pinBy = null; } };
    // a clean test spot far from everything: move a goblin, a big goblin, a croc, a villager and a guard there
    const X = 60, Z = 470; for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (Math.hypot(a.x - X, a.z - Z) < 80) { a.x += 300; a.hx = a.x; }
    const sm = g.GOBS.find((x) => !x.big), bg = g.GOBS.find((x) => x.big), cr = g.CROCS[1], v = g.NPCS.find((n) => n.kind === 'villager2'), gd = g.NPCS.find((n) => n.kind === 'guard' && !n.patrol);
    for (const [a, dx] of [[sm, -3], [bg, 0], [cr, 4.5], [v, -6.5], [gd, 8]]) { a.x = X + dx; a.z = Z + 6; a.yaw = Math.PI; a.st = 'idle'; a.t = -99; a.aware = 0; a.hx = a.x; a.hz = a.z; a.post = a.post ? [a.x, a.z, Math.PI] : null; }
    window.ACT = { sm, bg, cr, v, gd, X, Z };
    S.at(X, Z - 2, 0); S.sim(.3); });
  await G(() => { const A = ACT; S.cam(Math.PI, 9, .12, A.X + 1, 1.3, A.Z + 6); }); await shot('k1-lineup', { wait: 900 });
  await G(() => { const A = ACT; S.cam(Math.PI - .5, 2.4, .08, A.sm.x, .7, A.sm.z); }); await shot('k2-goblin', { wait: 600 });
  await G(() => { const A = ACT; S.cam(Math.PI + .5, 2.6, .1, A.v.x, 1.2, A.v.z); }); await shot('k3-villager', { wait: 600 });
  await G(() => { const A = ACT; S.cam(Math.PI - .7, 4, .3, A.cr.x, .3, A.cr.z); }); await shot('k4-croc', { wait: 600 });
  // choke on the small goblin from behind (isolated, unaware)
  await G(() => { const A = ACT, gb = A.sm; gb.yaw = 0; gb.hyaw = 0; gb.st = 'idle'; gb.aware = 0; gb.sees = false; A.bg.x += 40; A.v.x -= 40; S.at(gb.x, gb.z - 1.3, 0); __G.press('inter'); S.sim(.9); S.cam(Math.PI * .7, 2.6, .12, __G.P.x, 1.0, __G.P.z); }); await shot('k5-choke', { wait: 600 });
  await G(() => { S.sim(.75); }); await shot('k6-choke-stab', { wait: 500 });
  // block pose seen from the side and front
  await G(() => { S.sim(1); S.at(ACT.X, ACT.Z - 10, 0); __G.IN.blockHeld = true; S.sim(.6); S.cam(Math.PI * .55, 2.4, .1, __G.P.x, 1.1, __G.P.z); }); await shot('k7-block-side', { wait: 500 });
  await G(() => { S.cam(Math.PI * .9, 2.4, .1, __G.P.x, 1.1, __G.P.z); }); await shot('k8-block-front', { wait: 500 });
};
