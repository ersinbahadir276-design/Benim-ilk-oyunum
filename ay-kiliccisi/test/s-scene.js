module.exports = async ({ shot, G }) => {
  const go = (x, z, yaw, pitch, dist) => G(([x, z, yaw, pitch, dist]) => { const g = __G; g.fastStream = 1; g.GT.paused = false; g.tp(x, z); g.P.yaw = yaw; g.CAM.yaw = yaw; g.CAM.pitch = pitch; g.CAM.dist = dist || 5; }, [x, z, yaw, pitch, dist]);
  await go(14, 318, Math.PI, 0.02); await shot('sc-spawn', { wait: 1800 });
  await go(140, 40, 1.57, 0.12, 7); await shot('sc-farm', { wait: 1800 });
  await go(240, 80, 0.6, 0.1, 7); await shot('sc-mill', { wait: 1800 });
  await go(-225, -640, -0.6, 0.05, 6); await shot('sc-falls', { wait: 1800 });
  await go(-300, 420, 0.5, 0.05, 5); await shot('sc-rocks', { wait: 1800 });
};
