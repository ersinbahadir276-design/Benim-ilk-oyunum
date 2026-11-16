module.exports = async ({ page, shot, G }) => { await page.waitForTimeout(800); await G(() => { const K = __G.X.KING; K.R.ob.tex = __G.X.dbg.faceTex('king'); });
  await G(() => { const g = __G, K = g.X.KING; g.GT.paused = true; const set = () => { K.vis = true; K.x = 0; K.z = 12; K.yaw = 0; }, td = () => { K.vis = false; };
    g.X.showManhwa([{ h: 1.0, st: { eye: [0.12, 1.66, 12.7], at: [0, 1.64, 12], fov: 34, setup: set, teardown: td, noHero: true } }, { h: 1.4, st: { eye: [0.4, 1.0, 14.8], at: [0, 0.92, 12], fov: 46, setup: set, teardown: td, noHero: true } }], null); });
  await page.waitForTimeout(5000); await shot('qhead'); await G(() => { document.getElementById('manhwa').scrollTop = 800; }); await shot('qbody', { wait: 300 }); };
module.exports.portrait = true;
