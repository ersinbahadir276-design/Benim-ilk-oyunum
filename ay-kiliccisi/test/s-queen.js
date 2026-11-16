module.exports = async ({ page, shot, G }) => { await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; g.X.showManhwa(g.X.PANELS.prologue().slice(1, 3), null); }); await page.waitForTimeout(5000); await shot('queen-panel');
  await G(() => { document.getElementById('manhwa').scrollTop = 600; }); await shot('queen-panel2', { wait: 300 }); };
module.exports.portrait = true;
