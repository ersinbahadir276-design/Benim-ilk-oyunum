// node test/harness.js test/s-runatkshots.js -> koşu saldırısı (Sword_Attack klibi) ekran görüntüleri: test/out/runatk-<kare>.jpg
module.exports = async ({ page, G, shot }) => {
  await page.waitForTimeout(800);
  const side = +(process.env.SIDE || 1.5);
  await G(() => { const g = __G; g.GT.paused = true; g.tp(6, 60); g.P.yaw = 0; g.IN.mx = 0; g.IN.mz = 1; g.P.sprintHeld = true; for (let i = 0; i < 70; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.P.sta = 100; g.startRunAtk(); });
  const cam = () => G((sd) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + sd; g.CAM.dist = 4.2; g.CAM.pitch = .12; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .9; }, side);
  for (const k of [1, 2, 3, 4, 5, 6]) { await G(() => { const g = __G; for (let i = 0; i < 6; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(); await shot('runatk-' + k, { wait: 200 }); }
};
