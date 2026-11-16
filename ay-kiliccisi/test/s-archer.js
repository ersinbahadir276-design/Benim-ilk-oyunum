module.exports = async ({ shot, G }) => { await G(() => { const g = __G, a = g.GOBS.find((x) => x.archer && String(x.group).startsWith('road')); g.fastStream = 1; g.tp(a.x + 9, a.z + 3); a.st = 'aim'; a.t = 0.5; a.aware = 1; a.yaw = Math.atan2(g.P.x - a.x, g.P.z - a.z);
  g.__lockCam = 1; g.CAM.yaw = a.yaw + Math.PI + 0.6; g.CAM.dist = 3.2; g.CAM.pitch = 0.1; g.CAM.tx = a.x; g.CAM.tz = a.z; g.CAM.ty = a.y + 0.8; }); await shot('archer', { wait: 900 }); };
module.exports.pauseAtStart = true;
