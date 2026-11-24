// Ekran görüntüsü: eğimde ayak IK kapalı / açık (node test/harness.js test/s-footik.js)
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  const spot = await G(() => { const g = __G; let best = null;
    for (let r = 20; r <= 1300 && !best; r += 8) for (let a = 0; a < 6.28 && !best; a += 4 / r) { const x = 30 + Math.sin(a) * r, z = 420 + Math.cos(a) * r;
      const gx = (g.hAt(x + 1, z) - g.hAt(x - 1, z)) / 2, gz = (g.hAt(x, z + 1) - g.hAt(x, z - 1)) / 2, m = Math.hypot(gx, gz);
      if (m > .3 && m < .45 && g.depthAt(x, z) <= 0) best = { x, z, yaw: Math.atan2(-gz, gx) }; } return best; });
  const pose = (on) => G(([s, on]) => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.ANIM.on = on; g.tp(s.x, s.z); g.P.yaw = s.yaw + Math.PI / 2; g.P.st = 'move';
    for (let i = 0; i < 90; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + .25; g.CAM.dist = 2.6; g.CAM.pitch = .05; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .5; }, [spot, on]);
  await pose(false); await shot('fik-off', { wait: 500 });
  await pose(true); await shot('fik-on', { wait: 500 });
};
