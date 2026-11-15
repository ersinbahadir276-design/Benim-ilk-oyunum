module.exports = async ({ page, shot, G }) => { await page.waitForTimeout(800);
  await G(() => { const g = __G, K = g.X.KING; g.GT.paused = true; const set = () => { K.vis = true; K.x = 0; K.z = 12; K.yaw = 0; }, td = () => { K.vis = false; };
    g.X.showManhwa([{ h: 1.0, st: { eye: [0.25, 1.62, 13.0], at: [0, 1.62, 12], fov: 38, setup: set, teardown: td, noHero: true } }, { h: 1.2, st: { eye: [2.2, 1.2, 9.6], at: [0, 1.0, 12], fov: 50, setup: set, teardown: td, noHero: true } }], null); });
  await page.waitForTimeout(5000); await shot('qhead'); await G(() => { document.getElementById('manhwa').scrollTop = 800; }); await shot('qbody', { wait: 300 }); };
module.exports.portrait = true;
