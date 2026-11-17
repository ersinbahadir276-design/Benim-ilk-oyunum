// Savaş görüntüleri: atılma pozu, 危 hamlesi, siper, KAFA KAFAYA
module.exports = async ({ page, shot, G }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.tod = .3; const P = __G.P; for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { g.dead = 1; g.x = g.hx = 5000 } __G.tp(20, 290); P.yaw = 0; __G.CAM.yaw = 1.57; __G.CAM.pitch = .15; __G.CAM.dist = 5; __G.press('dodge'); __G.sim(1 / 60, 8); __G.GT.paused = true });
  await shot('c-dash', { wait: 300 });
  await G(() => { __G.GT.paused = false; const P = __G.P, X = __G.X; P.st = 'move'; const g = __G.GOBS.find(g => !g.big && !g.boss); g.dead = 0; g.x = g.hx = P.x; g.z = g.hz = P.z + 3; g.hp = g.max; g.aware = 1; g.yaw = Math.PI; g.st = 'windup'; g.t = .3; g.peril = 1; g.cn = 0; __G.CAM.yaw = .8; __G.sim(1 / 60, 2); __G.GT.paused = true });
  await shot('c-peril', { wait: 300 });
  await G(() => { __G.GT.paused = false; const P = __G.P, X = __G.X; for (const g of __G.GOBS) { g.dead = 1; g.x = g.hx = 5000 } const gs = __G.GOBS.filter(g => !g.big && !g.boss).slice(0, 3); gs.forEach((g, i) => { g.dead = 0; g.x = g.hx = P.x + (i - 1) * 2; g.z = g.hz = P.z + 12 + i; g.hp = g.max; g.st = 'idle'; g.aware = 0; g.group = 'soS' }); X.startStandoff(); __G.sim(1 / 60, 200); __G.GT.paused = true });
  await shot('c-standoff', { wait: 300 });
};
