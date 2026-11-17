// Canavar yakın çekimleri (kilitli kamera)
module.exports = async ({ page, shot, G }) => {
  await G(() => { __G.fastFade = 1; __G.GT.paused = false; window.__noAutoQ = 1; __G.P.hp = 1e5; __G.X.enterDungeon('temple', 0) }); await page.waitForTimeout(800);
  const kinds = ['skel', 'skelS', 'skelA', 'skmage', 'ghoul', 'knight', 'golem', 'spider', 'spiderling', 'rat', 'boneking', 'brood', 'keeper'];
  for (const k of kinds) {
    await G((k) => { const X = __G.X, P = __G.P, F = X.DUN.F, r = F.rooms.filter(r => r !== F.start).sort((a, b) => b.w * b.h - a.w * a.h)[0]; for (const m of X.MONS) { m.dead = 1; m.deadT = 99 }
      const cx = X.dCX(r.cx), cz = X.dCZ(r.cy); P.x = cx - 6; P.z = cz - 6; const m = X.spawnMon(k, cx, cz, {}); m.yaw = 2.6 + Math.PI - .5; m.st = 'idle'; m.aware = 0; m.spd = 0;
      const big = /golem|keeper|brood|boneking|knight/.test(k), s = m.sc; __G.__lockCam = 1; Object.assign(__G.CAM, { tx: cx, ty: __G.X.DUN.y + (m.T.quad ? .5 : 1.0) * s, tz: cz, yaw: 2.6, pitch: .22, dist: (m.T.quad ? 2.2 : 2.6) * Math.max(1, s * .9) + (big ? .6 : 0) });
      __G.sim(1 / 30, 4); __G.GT.paused = true }, k);
    await shot('mon-' + k, { wait: 350 }); await G(() => { __G.GT.paused = false });
  }
};
