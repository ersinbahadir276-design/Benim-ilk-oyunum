module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(1500); await shot('w-spawn');
  const info = await G(() => { const g = __G; return { trees: g.TREES ? g.TREES.length : -1, objs: g.objCount ? g.objCount() : -1 }; });
  log('dünya yüklendi', true, JSON.stringify(info));
  for (const [n, x, z, yaw] of [['village', 20, 70, Math.PI], ['lake', -600, 260, -Math.PI / 2], ['swamp', 560, 620, 0.8], ['mount', 0, -700, Math.PI], ['camp', 800, -140, Math.PI], ['ruin', -985, -95, Math.PI], ['dense', -560, 420, 0]]) {
    await G(([x, z, yaw]) => { const g = __G; g.tp(x, z); g.P.yaw = yaw; g.CAM.yaw = yaw; g.CAM.pitch = 0.18; }, [x, z, yaw]);
    await page.waitForTimeout(2500); await shot('w-' + n);
  }
};
