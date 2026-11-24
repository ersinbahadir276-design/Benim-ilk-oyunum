// Kahramanın miğferi yakın plan (önden / yarım profil) — göz yarığı ışıması kontrolü.
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(0, 0.75, 0.02, 1.88); await shot('helm-front', { wait: 500 });
  await cam(0.6, 0.8, 0.05, 1.88); await shot('helm-34', { wait: 400 });
  await G(() => { const g = __G; g.setNight && g.setNight(1); });
};
