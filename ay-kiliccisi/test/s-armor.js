// Kahraman zırhı yakın çekim: miğfer, göğüs (ay arması), omuz, arka. node test/harness.js test/s-armor.js [klasör]
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  await G(() => { for (const id of ['hud', 'touch', 'tc', 'mini', 'quest']) { const e = document.getElementById(id); if (e) e.style.visibility = 'hidden'; } document.querySelectorAll('button,.btn').forEach((b) => b.style.visibility = 'hidden'); });
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(0.25, 0.9, 0.05, 1.86); await shot('ar-helm', { wait: 500 });
  await cam(0.2, 1.3, 0.05, 1.5); await shot('ar-chest', { wait: 400 });
  await cam(1.0, 1.3, 0.15, 1.6); await shot('ar-shoulder', { wait: 400 });
  await cam(0.35, 2.6, 0.1, 1.05); await shot('ar-full', { wait: 400 });
  const r = await G(() => { const m = __G.MODEL && __G.MODEL.hero; if (!m) return null; let glow = 0, gem = 0; for (let v = 0; v < m.nv; v++) { if (m.M[v * 4 + 2] > 0.5) glow++; else if (m.M[v * 4] > 0.9 && m.M[v * 4 + 1] < 0.5) gem++; } return { nv: m.nv, glow, gem }; });
  log('kahraman heykel modeli yüklendi', r && r.nv > 5000, r && r.nv);
  // ışıma yalnızca vizörün içindeki kor yüzeyinde: az sayıda köşe (eski çıkartma zırhın dışına taşıyordu)
  log('vizör ışıması küçük bir bölgede', r && r.glow > 10 && r.glow < 400, r && r.glow);
  log('göğüste ay taşı var', r && r.gem > 5, r && r.gem);
};
