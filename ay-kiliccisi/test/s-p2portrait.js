module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(1000);
  await G(() => { const m = document.getElementById('manhwa'); m.style.display = 'none'; __G.GT.inStory = false; __G.GT.paused = false; __G.fastStream = 1; __G.P.rage = 100; });
  await shot('p2-hud-portrait', { wait: 1500 });
  await G(() => { const g = __G, X = g.X, P = g.P, a = X.BOSSES.find((b) => g.isWolf(b)); g.tp(a.x + 5, a.z + 5); P.yaw = Math.atan2(a.x - P.x, a.z - P.z); g.CAM.yaw = P.yaw; a.st = 'circle'; a.aware = 1; a.hp = a.max * .62; a.pos = 90; });
  await shot('p2-boss-portrait', { wait: 1500 });
  await G(() => { __G.GT.paused = true; __G.X.showManhwa(__G.X.PANELS.prologue(), null); });
  await page.waitForTimeout(5000); await shot('p2-manhwa-portrait-1');
  for (let k = 1; k <= 4; k++) { await G((k) => { const m = document.getElementById('manhwa'); m.scrollTop = k * 700; }, k); await shot('p2-manhwa-portrait-' + (k + 1), { wait: 300 }); }
};
module.exports.portrait = true; module.exports.keepStrip = true;
