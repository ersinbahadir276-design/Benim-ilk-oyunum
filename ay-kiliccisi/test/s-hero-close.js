// Kahraman zırhı yakın çekim: bel/kalça plakaları, kollar, bacaklar (bekleme, koşu, çömelme)
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(.3, 2.1, .05, 1.0); await shot('hc-front', { wait: 500 });
  await cam(1.57, 2.1, .05, 1.0); await shot('hc-side', { wait: 400 });
  await G(() => { const g = __G; g.IN.mz = 1; g.P.sprintHeld = true; for (let i = 0; i < 47; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(1.3, 2.4, .08, 0.9); await shot('hc-run', { wait: 400 });
  await G(() => { const g = __G; g.IN.mz = 0; g.P.sprintHeld = false; g.P.crouch = true; for (let i = 0; i < 40; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } }); await cam(.9, 2.2, .1, 0.7); await shot('hc-crouch', { wait: 400 });
};
