module.exports = async ({ shot, G }) => {
  const go = (x, z, yaw, pitch, dist) => G(([x, z, yaw, pitch, dist]) => { const g = __G; g.fastStream = 1; g.GT.paused = false; g.tp(x, z); g.P.yaw = yaw; g.CAM.yaw = yaw; g.CAM.pitch = pitch; g.CAM.dist = dist || 5; }, [x, z, yaw, pitch, dist]);
  await go(-206, -653, 2.53, 0.0, 7); await shot('sc-falls', { wait: 1800 });
};
