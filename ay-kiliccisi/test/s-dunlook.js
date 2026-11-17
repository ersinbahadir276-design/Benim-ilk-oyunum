// Zindan görünümü: her zindanda bir oda ve canavar yakın çekimleri
module.exports = async ({ page, shot, G }) => {
  await G(() => { __G.fastFade = 1; __G.GT.paused = false; window.__noAutoQ = 1; __G.P.hp = 1e5; });
  for (const id of ['crypt', 'cave', 'temple']) {
    await G((id) => __G.X.enterDungeon(id, 0), id); await page.waitForTimeout(700);
    await G(() => { const X = __G.X, D = X.DUN, F = D.F, r = F.rooms.filter(r => r !== F.start).sort((a, b) => b.w * b.h - a.w * a.h)[0]; __G.P.x = X.dCX(r.x) + 1; __G.P.z = X.dCZ(r.y) + 1; __G.P.yaw = Math.atan2(X.dCX(r.cx) - __G.P.x, X.dCZ(r.cy) - __G.P.z); __G.CAM.yaw = __G.P.yaw; __G.CAM.pitch = .32; for (const m of X.MONS) { m.aware = 0; m.st = m.st === 'sleep' ? 'sleep' : 'idle' } __G.GT.paused = true; });
    await shot('look-' + id + '-room', { wait: 500 });
    await G(() => { __G.GT.paused = false; });
  }
  await G(() => __G.X.leaveDungeon(true)); await G(() => __G.X.enterDungeon('crypt', 0)); await page.waitForTimeout(700);
  const kinds = ['skel', 'skelS', 'skelA', 'skmage', 'ghoul', 'knight', 'golem', 'spider', 'spiderling', 'rat', 'boneking', 'brood', 'keeper'];
  await G(() => { const X = __G.X; for (const m of X.MONS) { m.dead = 1; m.deadT = 99 } __G.sim(1 / 30, 2) });
  for (const k of kinds) {
    await G((k) => { const X = __G.X, P = __G.P, F = X.DUN.F, s = F.start; for (const m of X.MONS) { m.dead = 1; m.deadT = 99 } P.x = X.dCX(s.cx) + 3; P.z = X.dCZ(s.cy) + 3; const big = /golem|keeper|brood|boneking/.test(k), d = big ? 5.2 : 3; const m = X.spawnMon(k, P.x, P.z + d, {}); m.yaw = Math.PI + .5; m.st = 'idle'; m.aware = 0; P.yaw = 0; __G.CAM.yaw = .35; __G.CAM.pitch = big ? .2 : .15; __G.CAM.dist = big ? 7.5 : 4.8; __G.sim(1 / 30, 3); __G.GT.paused = true; }, k);
    await shot('mon-' + k, { wait: 350 }); await G(() => { __G.GT.paused = false; __G.CAM.dist = 4.8; });
  }
  // an attack pose: knight thrust wind-up and golem slam
  await G(() => { const X = __G.X, P = __G.P; for (const m of X.MONS) { m.dead = 1; m.deadT = 99 } const k = X.spawnMon('knight', P.x, P.z + 3, { aware: 1 }); k.yaw = Math.PI; k.st = 'windup'; k.mv = 'thrust'; k.peril = 1; k.cn = 0; k.t = .7; __G.CAM.yaw = .5; __G.sim(1 / 60, 1); __G.GT.paused = true });
  await shot('mon-knight-thrust', { wait: 350 });
};
