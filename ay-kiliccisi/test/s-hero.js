module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(.35, 3.6, .12, 1.15); await shot('hr-front', { wait: 500 });
  await cam(1.5, 3.6, .12, 1.15); await shot('hr-side', { wait: 400 });
  await cam(2.8, 3.6, .2, 1.15); await shot('hr-back', { wait: 400 });
  await cam(.3, 1.4, .05, 1.85); await shot('hr-helm', { wait: 400 });
  await cam(-.9, 1.3, .25, 1.0); await shot('hr-hand', { wait: 400 }); // gauntlet fingers curled on the grip
  await G(() => { const g = __G; g.IN.mz = 1; g.P.sprintHeld = true; for (let i = 0; i < 50; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(1.4, 4, .15, 1.1); await shot('hr-run', { wait: 400 });
  await G(() => { const g = __G; g.IN.mz = 0; g.P.sprintHeld = false; for (let i = 0; i < 40; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } const IN = g.IN; IN.atkHeld = true; IN.atkAt = g.GT.clock; IN.atkUsed = false; for (let i = 0; i < 70; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(.9, 4, .1, 1.2); await shot('hr-charge', { wait: 400 });
  await G(() => { const g = __G, IN = g.IN; IN.atkHeld = false; IN.atkUp = true; for (let i = 0; i < 22; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(1.2, 4, .1, 1.1); await shot('hr-heavy', { wait: 400 });
  await G(() => { const g = __G; for (let i = 0; i < 60; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.IN.blockHeld = true; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(.6, 3.4, .1, 1.3); await shot('hr-block', { wait: 400 });
};
