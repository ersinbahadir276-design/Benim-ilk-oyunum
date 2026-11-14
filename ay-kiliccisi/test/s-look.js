module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(1500); await shot('look-1');
  await G(() => { const g = __G; g.CAM.yaw = g.P.yaw + Math.PI * 0.75; g.CAM.dist = 2.6; g.CAM.pitch = 0.1; });
  await shot('look-2', { wait: 800 });
  await G(() => { const g = __G; g.CAM.yaw = g.P.yaw - Math.PI * 0.5; });
  await shot('look-3', { wait: 800 });
};
