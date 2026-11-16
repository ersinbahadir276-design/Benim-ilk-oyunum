module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(.45, 2.4, .08, 1.15); await shot('hz-front', { wait: 500 });
  await cam(2.5, 2.4, .1, 1.1); await shot('hz-back', { wait: 400 });
};
module.exports.portrait = true;
