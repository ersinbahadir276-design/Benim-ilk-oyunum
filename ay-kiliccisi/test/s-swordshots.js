// node test/harness.js test/s-swordshots.js -> hafif kombo (Sword_Regular A/B/C klipleri) ekran görüntüleri: test/out/sword-<vuruş>-<kare>.jpg
module.exports = async ({ page, G, shot }) => {
  await page.waitForTimeout(800);
  const side = +(process.env.SIDE || 1.5);
  await G(() => { const g = __G; g.GT.paused = true; g.tp(6, 60); g.P.yaw = 0; g.IN.mx = g.IN.mz = 0; for (let i = 0; i < 90; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.P.sta = 100; });
  const cam = () => G((sd) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + sd; g.CAM.dist = 4.2; g.CAM.pitch = .12; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .9; }, side);
  for (const c of [0, 1, 2]) {
    await G((c) => { const g = __G; g.P.sta = 100; g.startLight(c); }, c);
    const n = await G(() => Math.round((__G.P.atkT || .46) * 60));
    for (const k of [1, 2, 3, 4]) { await G((f) => { const g = __G; for (let i = 0; i < f; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }, Math.max(1, Math.round(n / 4) - (k === 4 ? 1 : 0))); await cam(); await shot('sword-' + c + '-' + k, { wait: 200 }); }
  }
};
