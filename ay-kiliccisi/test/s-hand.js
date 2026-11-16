module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  for (const [i, a] of [[1, 0.5], [2, 1.6], [3, -1.2]]) {
    await G((a) => { const g = __G; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = 1.5; g.CAM.pitch = 0.05; g.CAM.ty = g.P.y + 1.1; }, a);
    await shot('hand-' + i, { wait: 700 });
  }
};
