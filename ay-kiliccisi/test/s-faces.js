module.exports = async ({ shot, G }) => { await G(() => { const g = __G; g.GT.paused = true; g.fastStream = 1; });
  for (const [sel, name] of [['villager', 'f-villager'], ['villager2', 'f-villager2'], ['elder', 'f-elder'], ['guard', 'f-guard'], ['hunter', 'f-hunter']]) {
    await G((sel) => { const g = __G, o = g.NPCS.find((n) => n.role === sel || (!n.role && n.kind === sel)); g.tp(o.x + Math.sin(o.yaw) * 3, o.z + Math.cos(o.yaw) * 3); o.st = 'idle'; o.t = 0; o.hyaw = 0; for (let i = 0; i < 5; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
      g.__lockCam = 1; g.CAM.yaw = o.yaw + Math.PI + 0.25; g.CAM.dist = 0.75; g.CAM.pitch = 0.02; g.CAM.tx = o.x; g.CAM.tz = o.z; g.CAM.ty = o.y + 1.52 * (o.sc || 1); }, sel); await shot(name, { wait: 500 }); } };
module.exports.pauseAtStart = true;
