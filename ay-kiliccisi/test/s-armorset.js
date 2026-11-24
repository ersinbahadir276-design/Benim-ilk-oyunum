// Zırh setleri: her zırh tabanı kendi heykel katmanını giyer (heroWolf / heroBone / heroAsh), Kara Plaka katmansız.
// node test/harness.js test/s-armorset.js  → test/out/as-*.jpg
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  const base = await G(() => { const { skins, armorSkin } = __G; return ({ skins: skins.length, objs: __G.objCount(), set: armorSkin && armorSkin.k }); });
  log('Kara Plaka: katman yok', base.set == null, JSON.stringify(base));
  for (const [key, model] of [['wolfhide', 'heroWolf'], ['bone', 'heroBone'], ['ash', 'heroAsh']]) {
    const r = await G(([key]) => { const { skins, makeItem, equip, SYS, SK, HB } = __G; const it = makeItem(key, 5, 2); SYS.inv.push(it); equip(it); const g = __G; for (let i = 0; i < 4; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
      const armorSkin = g.armorSkin, s = armorSkin && armorSkin.s; let maxd = 0; if (s) { const hip = SK.GP[HB.hips]; for (let i = 0; i < s.nv; i++) maxd = Math.max(maxd, Math.hypot(s.P[i * 3] - hip[0], s.P[i * 3 + 1] - hip[1], s.P[i * 3 + 2] - hip[2])); }
      return { set: armorSkin && armorSkin.k, skins: skins.length, objs: g.objCount(), nv: s && s.nv, maxd, vis: armorSkin && armorSkin.o.vis }; }, [key]);
    log(key + ' → ' + model, r.set === model && r.skins === base.skins + 1 && r.objs === base.objs + 1, JSON.stringify(r));
    log(key + ' katmanı bedene yapışık (deri çalışıyor)', r.maxd > 0.5 && r.maxd < 1.6 && r.vis, 'en uzak köşe ' + r.maxd.toFixed(2) + ' m');
    await cam(.35, 3.4, .12, 1.15); await shot('as-' + key + '-front', { wait: 450 });
    await cam(.45, 1.7, .1, 1.6); await shot('as-' + key + '-close', { wait: 350 });
    await cam(2.8, 3.4, .2, 1.15); await shot('as-' + key + '-back', { wait: 350 });
  }
  // walking with the set on: the overlay follows the animated skeleton
  await G(() => { const g = __G; g.IN.mz = 1; g.P.sprintHeld = true; for (let i = 0; i < 40; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.IN.mz = 0; g.P.sprintHeld = false; });
  await cam(1.4, 4, .15, 1.1); await shot('as-ash-run', { wait: 400 });
  const back = await G(() => { const { SYS, equip } = __G; const a = SYS.inv.find((i) => i.base === 'plate'); equip(a); return { set: __G.armorSkin && __G.armorSkin.k, skins: __G.skins.length }; });
  log('Kara Plaka geri: katman kalktı, deri sızıntısı yok', back.set == null && back.skins === base.skins, JSON.stringify(back));
};
