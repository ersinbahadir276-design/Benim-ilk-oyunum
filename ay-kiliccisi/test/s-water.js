module.exports = async ({ shot, G, log }) => {
  const r = await G(() => { const g = __G; g.GT.paused = true; const LAKE = [-760, 260, 150], SW = [760, 720, 330], WL = -2.6, WS_ = -1.35; let badL = 0, badS = 0, n = 0;
    // every point on the rim of each water sheet must be under the ground (hidden)
    for (let k = 0; k < 360; k++) { const a = k / 360 * 6.283; n++; const lx = LAKE[0] + Math.cos(a) * (LAKE[2] + 52), lz = LAKE[1] + Math.sin(a) * (LAKE[2] + 52); if (Math.hypot(lx + 660, lz - 80) > 50 && g.hAt(lx, lz) < WL + 0.2) badL++; // (the river mouth is open on purpose)
      if (g.hAt(SW[0] + Math.cos(a) * (SW[2] + 31), SW[1] + Math.sin(a) * (SW[2] + 31)) < WS_ + 0.2) badS++; }
    const wet = g.wolves.filter((w) => g.depthAt(w.x, w.z) > 0).length; return { badL, badS, n, wet, wolves: g.wolves.length }; });
  log('su: göl ve bataklık yüzeyinin kenarı her yerde toprağın altında (havada asılı su yok)', r.badL === 0 && r.badS === 0, JSON.stringify(r));
  log('su: kurtlar suyun içinde doğmuyor', r.wet === 0, JSON.stringify(r));
  await G(() => { const g = __G; g.fastStream = 1; g.GT.paused = false; g.tp(-560, 250); g.P.yaw = -1.57; g.CAM.yaw = -1.57; }); await shot('water-lake', { wait: 1500 });
  await G(() => { const g = __G; g.tp(-480, -250); g.P.yaw = -1.57; g.CAM.yaw = -1.2; }); await shot('water-river', { wait: 1500 });
};
