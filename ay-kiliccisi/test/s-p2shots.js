// Phase-2 screenshots (landscape): HUD, loot, bosses, Veyra, system window
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(1000);
  const closeStrip = () => G(() => { const m = document.getElementById('manhwa'); const s = m.querySelector('.mh-next') || m.querySelector('.mh-skip'); if (s && m.style.display === 'block') s.click(); });
  await page.waitForTimeout(4000); await shot('p2-prologue-top');
  await G(() => { document.getElementById('manhwa').scrollTop = 99999; }); await shot('p2-prologue-end');
  await closeStrip(); await page.waitForTimeout(500);
  await G(() => { __G.fastStream = 1; __G.GT.paused = false; }); await shot('p2-hud', { wait: 1500 });
  // loot beams of each rarity
  await G(() => { const g = __G, X = g.X, P = g.P; g.tp(30, 420); P.yaw = 0; g.CAM.yaw = 0; g.CAM.dist = 5; for (let r = 0; r < 5; r++) X.dropLoot(P.x - 3 + r * 1.5, P.z + 6, [X.makeItem('iron', 3, r)], 0); });
  await shot('p2-loot', { wait: 1200 });
  // Kül Yele with the boss bar
  await G(() => { const g = __G, X = g.X, P = g.P, a = X.BOSSES.find((b) => g.isWolf(b)); g.tp(a.x + 5, a.z + 5); P.yaw = Math.atan2(a.x - P.x, a.z - P.z); g.CAM.yaw = P.yaw; a.st = 'circle'; a.aware = 1; a.hp = a.max * .62; a.pos = 90; });
  await shot('p2-ashmane', { wait: 1500 });
  // Kırık Diş stomp ring
  await G(() => { const g = __G, X = g.X, P = g.P, c = X.BOSSES.find((b) => b.chief); c.x = c.hx; c.z = c.hz; g.tp(c.x + 4, c.z + 4); P.yaw = Math.atan2(c.x - P.x, c.z - P.z); g.CAM.yaw = P.yaw; c.phase = 2; c.st = 'chase'; c.aware = 1; c.cd = 0; });
  for (let i = 0; i < 30; i++) { const st = await G(() => { const c = __G.X.BOSSES.find((b) => b.chief); if (c.st === 'windup' && c.move !== 'stomp') { c.move = 'stomp'; } if (c.st === 'windup' && c.t > .5) return 1; return 0; }); if (st) break; await page.waitForTimeout(150); }
  await shot('p2-chief-stomp', { wait: 50 });
  // Veyra freed and fighting next to the hero
  await G(() => { const g = __G, X = g.X, P = g.P; g.SYS.main = 8; X.chooseFate(true); g.tp(40, 430); P.yaw = 0; g.CAM.yaw = Math.PI * .85; g.CAM.dist = 4.2; const V = X.VEYRA; V.x = P.x + 1.6; V.z = P.z + .6; V.yaw = 0; g.SYS.lv = 6; });
  await shot('p2-veyra', { wait: 1500 });
  await G(() => { const g = __G, V = g.X.VEYRA, P = g.P; g.CAM.yaw = Math.atan2(V.x - P.x, V.z - P.z) + Math.PI; g.CAM.dist = 2.4; g.CAM.pitch = .05; });
  await shot('p2-veyra-close', { wait: 900 });
  // system window tabs
  await G(() => { __G.X.giveItem(__G.X.makeItem(null, 4, 4, 'ashmane')); __G.X.openWin('envanter'); });
  await shot('p2-win-inv', { wait: 400 });
  await G(() => { const it = document.querySelector('#win .item'); if (it) it.click(); });
  await shot('p2-win-item', { wait: 300 });
  await G(() => __G.X.openWin('yetenek')); await shot('p2-win-skill', { wait: 300 });
  await G(() => __G.X.openWin('gorev')); await shot('p2-win-quest', { wait: 300 });
};
