module.exports = async ({ page, G }) => {
  await page.waitForTimeout(800);
  const r = await G(() => { const g = __G, GT = g.GT; GT.paused = true; const res = {};
    for (const [name, x, z, yaw] of [['orman', 30, 420, 0], ['köy', 6, 72, Math.PI], ['goblin kampı', 820, -150, Math.PI], ['bataklık', 700, 650, .8], ['ejderha', 0, -1020, Math.PI]]) {
      g.tp(x, z); g.P.yaw = yaw; g.CAM.yaw = yaw; for (let i = 0; i < 30; i++) { GT.time += 1 / 60; g.step(1 / 60); }
      const t0 = performance.now(); for (let i = 0; i < 60; i++) { GT.time += 1 / 60; g.step(1 / 60); } const tStep = (performance.now() - t0) / 60;
      const t1 = performance.now(); for (let i = 0; i < 20; i++) g.render(1 / 60); const tR = (performance.now() - t1) / 20; res[name] = { mantık_ms: +tStep.toFixed(2), çizim_hazırlık_ms: +tR.toFixed(2), çizim_çağrısı: g.drawn() }; }
    if (g.DRAGON) { const t1 = performance.now(); for (let i = 0; i < 30; i++) { g.dBone(g.DRAGON, 0); } }
    return res; });
  console.log('JS mantık süresi (kare başına, bu makinenin CPU\'su):', JSON.stringify(r));
};
