// Demirci yükseltme süsleri: +3 gümüş kakma/perçin/burgulu bantlar (armup3), +5 altın hilal ve ay taşları (armup5).
// node test/harness.js test/s-armup.js  -> testler + test/out/armup-*.jpg
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  const st = () => G(() => { const L = __G.LOOKS, u = L.upSkin; return { up: u && u.key, nv: u ? u.s.nv : 0, skins: L.skins.length, pobjs: L.pObjs.length, objs: __G.objCount(), em: u ? u.o.em.slice() : null, armor: L.skin && L.skin.key }; });
  const s0 = await st();
  log('başlangıç (+0): süs katmanı yok', s0.up === null, JSON.stringify(s0));
  log('modeller açıldı (armup3/armup5)', await G(() => ['armup3', 'armup5'].every((k) => __G.LOOKS.MODEL[k] && __G.LOOKS.MODEL[k].nv > 800)));
  // smith upgrades on the worn Kara Plaka, standing at the smith with enough gold and iron
  const up = () => G(() => { const g = __G, it = g.SYS.inv.find((i) => i.slot === 'armor' && i.eq) || g.SYS.inv.find((i) => i.base === 'plate'); g.SYS.gold = 99999; g.SYS.shards = 9999; const ok = g.X.upgrade(it); return [ok, it.up]; });
  for (let n = 1; n <= 2; n++) await up();
  log('+2: henüz süs yok', (await st()).up === null);
  const [ok3, lv3] = await up(); const s3 = await st();
  log('+3: gümüş işçilik (armup3) takıldı', ok3 && lv3 === 3 && s3.up === 'armup3' && s3.skins === s0.skins + 1 && s3.objs === s0.objs + 1, JSON.stringify(s3));
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(.35, 2.2, .06, 1.2); await shot('armup-3', { wait: 400 });
  await up(); log('+4: hâlâ yalnızca +3 süsü', (await st()).up === 'armup3');
  const [ok5, lv5] = await up(); const s5 = await st();
  log('+5: ay işçiliği (armup3+armup5) tek katman', ok5 && lv5 === 5 && s5.up === 'armup3+armup5' && s5.skins === s0.skins + 1 && s5.objs === s0.objs + 1, JSON.stringify(s5));
  const nv35 = await G(() => __G.LOOKS.MODEL.armup3.nv + __G.LOOKS.MODEL.armup5.nv);
  log('+5 katmanı iki modelin toplamı', s5.nv === nv35, s5.nv + ' / ' + nv35);
  await cam(.35, 2.2, .06, 1.2); await shot('armup-5', { wait: 400 }); await cam(0, 1.1, .02, 1.45); await shot('armup-5-chest', { wait: 300 });
  // moonstones keep their own pale light while rage turns the armour red
  const em = await G(() => { const L = __G.LOOKS; L.HERO.glow.col = [2, .5, .3]; return L.upSkin.o.em.slice(); });
  log('ay taşı ışığı öfkeden bağımsız', em[2] > em[0], JSON.stringify(em));
  const moved = await G(() => { const { applyPose, skinAll } = __G.LOOKS, s = __G.LOOKS.upSkin.s, a = Float32Array.from(s.P); __G.P.ps.RaZ = -0.4; __G.P.ps.LaZ = -0.4; __G.P.ps.LlX = 0.6; applyPose(__G.P.ps); skinAll(); let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - s.P[i])); return m; });
  log('süsler iskeletle hareket ediyor', moved > 0.05, moved.toFixed(3));
  // a different armour type keeps its own overlay and the upgrade trim; an unupgraded one drops the trim
  await G(() => { const it = __G.X.makeItem('wolfhide', 12, 2); it.up = 5; __G.SYS.inv.push(it); __G.X.equip(it); });
  const sw = await st();
  log('Kurt Postlu +5: kurt katmanı ve ay süsü birlikte', sw.armor === 'armwolf' && sw.up === 'armup3+armup5' && sw.skins === s0.skins + 2, JSON.stringify(sw));
  await cam(.35, 2.2, .06, 1.2); await shot('armup-wolf5', { wait: 400 });
  await G(() => { const it = __G.X.makeItem('bone', 12, 2); __G.SYS.inv.push(it); __G.X.equip(it); });
  const sb = await st();
  log('Kemik +0: süs kaldırıldı, sızıntı yok', sb.armor === 'armbone' && sb.up === null && sb.skins === s0.skins + 1 && sb.objs === s0.objs + 1, JSON.stringify(sb));
  await G(() => { const it = __G.SYS.inv.find((i) => i.base === 'plate'); __G.X.equip(it); });
  const s1 = await st();
  log('Kara Plaka +5 geri: yalnız süs katmanı', s1.armor === null && s1.up === 'armup3+armup5' && s1.skins === s0.skins + 1, JSON.stringify(s1));
};
module.exports.portrait = true;
