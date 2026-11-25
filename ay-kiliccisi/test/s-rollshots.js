// node test/harness.js test/s-rollshots.js -> ileri takla (Roll klibi) ekran görüntüleri: test/out/roll-*.jpg
module.exports = async ({ page, G, shot }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; g.tp(6, 60); g.P.yaw = 0; g.IN.mx = g.IN.mz = 0; for (let i = 0; i < 90; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.IN.wx = 0; g.IN.wz = 1; g.P.sta = 100; g.startDodge(); });
  const cam = () => G(() => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + 1.5; g.CAM.dist = 4; g.CAM.pitch = .12; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .8; });
  for (const k of [1, 2, 3, 4, 5]) { await G(() => { const g = __G; for (let i = 0; i < 6; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(); await shot('roll-' + k, { wait: 300 }); }
};
