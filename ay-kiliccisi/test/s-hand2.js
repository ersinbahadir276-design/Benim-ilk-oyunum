module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(500);
  const cam = (a, d = 0.9) => G(([a, d]) => { const g = __G, H = g.HB, w = g.mpt(g.PM, g.SK.GP[H.rightHand]); g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = 0.15; g.CAM.tx = w[0]; g.CAM.tz = w[2]; g.CAM.ty = w[1]; g.__lockCam = 1; }, [a, d]);
  await G(() => { __G.GT.paused = true; });
  for (const [n, a] of [['front', 0.4], ['side', 1.5], ['back', 2.6]]) { await cam(a); await shot('h-idle-' + n, { wait: 400 }); }
  await G(() => { const g = __G; g.GT.paused = false; g.IN.mz = 1; g.P.sprint = true; }); await page.waitForTimeout(900);
  await G(() => { __G.GT.paused = true; }); await cam(1.5, 1.6); await shot('h-run-side', { wait: 400 });
  await G(() => { const g = __G; g.IN.mz = 0; g.P.sprint = false; g.GT.paused = false; }); await page.waitForTimeout(800);
  await G(() => { const g = __G; g.IN.atk = true; }); await page.waitForTimeout(160);
  await G(() => { __G.GT.paused = true; }); await cam(1.0, 1.8); await shot('h-atk', { wait: 400 });
};
