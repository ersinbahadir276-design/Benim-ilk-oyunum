// Ekran görüntüsü: anahtar kareli saldırı klipleri (node test/harness.js test/s-clips.js)
// Her saldırının hazırlık / vuruş / takip / toparlanma karelerini yandan çeker: test/out/clip-<ad>-<u>.jpg
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  const frame = (kind, u) => G(([kind, u]) => { const g = __G, P = g.P; g.GT.paused = true; window.__noAutoQ = 1;
    g.tp(30, 420); Object.assign(P, { yaw: 0, st: 'move', t: 0, sta: 100, vx: 0, vz: 0, charge: .6 });
    for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    if (kind === 'heavy') g.startHeavy(); else { P.combo = +kind; g.startLight(+kind); }
    const T = kind === 'heavy' ? P.hvT : P.atkT, n = Math.round(u * T * 60);
    for (let i = 0; i < n; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    g.__lockCam = 1; g.CAM.yaw = P.yaw + Math.PI / 2 + .35; g.CAM.dist = 4.2; g.CAM.pitch = .12; g.CAM.tx = P.x; g.CAM.tz = P.z; g.CAM.ty = P.y + 1; }, [kind, u]);
  for (const kind of ['0', '2', 'heavy']) for (const u of [.2, .36, .5, .8]) { await frame(kind, u); await shot(`clip-${kind}-${u}`, { wait: 350 }); }
};
