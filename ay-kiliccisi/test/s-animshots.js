// node test/harness.js test/s-animshots.js  -> screenshots of the animation layer: slope stance, sprinting cape, turn lean
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  const run = (n) => G((n) => { const g = __G; for (let i = 0; i < n; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }, n);
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(374, 536); g.P.yaw = 0; });
  await run(40); await cam(0.15, 3.2, .05, .7); await shot('an-slope-ik', { wait: 500 });
  await G(() => { __G.ANIM.on = false; }); await run(30); await shot('an-slope-noik', { wait: 400 }); await G(() => { __G.ANIM.on = true; });
  await G(() => { const g = __G; g.tp(30, 420); g.P.yaw = 0; }); await run(30);
  await G(() => { const g = __G; g.IN.mz = 1; g.P.sprintHeld = true; }); await run(60); await cam(1.45, 4, .12, 1.1); await shot('an-sprint-cape', { wait: 400 });
  await G(() => { const g = __G; g.IN.mx = 1; g.IN.mz = .4; }); await run(14); await cam(2.9, 4, .12, 1.1); await shot('an-turn-lean', { wait: 400 });
  await G(() => { const g = __G; g.IN.mx = 0; g.IN.mz = 0; g.P.sprintHeld = false; }); await run(90); await cam(1.45, 4, .12, 1.1); await shot('an-idle-cape', { wait: 400 });
};
