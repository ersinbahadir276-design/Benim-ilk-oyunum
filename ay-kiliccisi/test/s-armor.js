// Zırh katmanları: her zırh türü kahramanın üstüne kendi heykel parçalarını ekler (kurt postu, kemik, kül).
// node test/harness.js test/s-armor.js  -> testler + test/out/armor-*.jpg
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  const st = () => G(() => { const { skin: armorSkin, skins, pObjs, HERO } = __G.LOOKS; return { key: armorSkin && armorSkin.key, skins: skins.length, pobjs: pObjs.length, objs: __G.objCount(), em: HERO.overlay ? HERO.overlay.em.slice() : null, nv: armorSkin ? armorSkin.s.nv : 0 }; });
  const s0 = await st();
  log('başlangıç: Kara Plaka, katman yok', s0.key === null && s0.nv === 0, JSON.stringify(s0));
  log('modeller açıldı (armwolf/armbone/armash)', await G(() => ['armwolf', 'armbone', 'armash'].every((k) => __G.LOOKS.MODEL[k] && __G.LOOKS.MODEL[k].nv > 1000)));
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  for (const [base, key] of [['wolfhide', 'armwolf'], ['bone', 'armbone'], ['ash', 'armash']]) {
    await G((b) => { const it = __G.X.makeItem(b, 12, 2); __G.SYS.inv.push(it); __G.X.equip(it); for (let i = 0; i < 4; i++) { __G.GT.time += 1 / 60; __G.step(1 / 60); } }, base);
    const s = await st();
    log(base + ': ' + key + ' katmanı takıldı, eski kaldırıldı', s.key === key && s.skins === s0.skins + 1 && s.pobjs === s0.pobjs + 1 && s.objs === s0.objs + 1, JSON.stringify(s));
    // the overlay follows the skeleton: its skinned positions move when the hero raises the sword arm
    const moved = await G(() => { const { applyPose, skinAll } = __G.LOOKS, s = __G.LOOKS.skin.s, a = Float32Array.from(s.P); __G.P.ps.RaZ = -0.4; __G.P.ps.LaZ = -0.4; applyPose(__G.P.ps); skinAll(); let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - s.P[i])); return m; });
    log(base + ': katman iskeletle birlikte hareket ediyor', moved > 0.1, moved.toFixed(3));
    await cam(.45, 2.6, .08, 1.15); await shot('armor-' + base, { wait: 400 }); await cam(2.6, 2.6, .12, 1.2); await shot('armor-' + base + '-back', { wait: 300 });
  }
  // rage glow reaches the overlay's ember seams
  const em = await G(() => { const { HERO } = __G.LOOKS; HERO.glow.col = [2, .5, .3]; return HERO.overlay.em.slice(); });
  log('öfke parıltısı kül katmanına geçiyor', em[0] === 2, JSON.stringify(em));
  // back to the plate: overlay removed, nothing leaks
  await G(() => { const it = __G.SYS.inv.find((i) => i.base === 'plate'); __G.X.equip(it); });
  const s1 = await st();
  log('Kara Plaka geri: katman kaldırıldı, sızıntı yok', s1.key === null && s1.skins === s0.skins && s1.pobjs === s0.pobjs && s1.objs === s0.objs, JSON.stringify(s1));
};
module.exports.portrait = true;
