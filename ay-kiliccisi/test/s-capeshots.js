// screenshots of the cape: rest (back), sprint (side), sprint (back 3/4).  node test/harness.js test/s-capeshots.js
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  const run = (n) => G((n) => { const g = __G; for (let i = 0; i < n; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }, n);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; });
  await run(60);
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(1.5, 3.6, .12, 1.15); await shot('cape-rest-side', { wait: 500 });
  await G(() => { const g = __G; g.IN.mz = 1; g.P.sprintHeld = true; }); await run(70);
  await cam(1.5, 4, .12, 1.1); await shot('cape-sprint-side', { wait: 400 });
  await run(9); await cam(2.6, 4, .2, 1.1); await shot('cape-sprint-back', { wait: 400 });
  await G(() => { const g = __G; g.IN.mz = 0; g.P.sprintHeld = false; }); await run(90); await cam(1.5, 3.6, .12, 1.15); await shot('cape-stop-side', { wait: 400 });
};
