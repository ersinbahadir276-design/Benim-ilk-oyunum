// Miğfer açık/kapalı: Kael'in çıplak başı (herohead) ve miğfer üçgenlerinin gizlenmesi.
// node test/harness.js test/s-helm.js  -> testler + test/out/helm-*.jpg
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  const st = () => G(() => { const L = __G.LOOKS, H = L.HERO; return { bare: !!H.bare, armorN: H.armor.geo.n, on: H.armor.nOn, off: H.armor.nOff, headN: H.head ? H.head.geo.n : -1,
    headOff: H.headSkin ? !!H.headSkin.off : null, parts: (H.parts || []).length, helmOff: __G.SYS.helmOff }; });
  log('herohead modeli açıldı', await G(() => { const m = __G.LOOKS.MODEL.herohead; return m && m.nv > 2000 && m.I.length / 3 <= 12000; }), await G(() => __G.LOOKS.MODEL.herohead && __G.LOOKS.MODEL.herohead.nv));
  const s0 = await st();
  log('varsayılan: miğfer takılı, baş çizilmiyor ve derisi hesaplanmıyor', !s0.bare && s0.armorN === s0.on && s0.headN === 0 && s0.headOff === true && s0.helmOff === 0, JSON.stringify(s0));
  log('miğfer üçgenleri ayrıldı (zırhın %3–%25\'i)', s0.off < s0.on && (s0.on - s0.off) / s0.on > 0.03 && (s0.on - s0.off) / s0.on < 0.25, ((s0.on - s0.off) / 3) + ' üçgen');
  // the split only reorders triangles: the same set, nothing lost
  log('bölme üçgen kaybetmiyor', await G(() => { const m = __G.LOOKS.MODEL.hero, J = Uint8Array.from(m.J), sp = __G.LOOKS.helmSplit(m.I, J, m.K);
    const key = (I) => { const a = []; for (let t = 0; t < I.length; t += 3) a.push([I[t], I[t + 1], I[t + 2]].join()); return a.sort().join('|'); }; return sp.I.length === m.I.length && key(sp.I) === key(m.I); }));
  // what is hidden: only vertices skinned to the Head bone, all above the shoulders
  const hid = await G(() => { const L = __G.LOOKS, H = L.HERO, s = L.skins.find((k) => k.geo === H.armor.geo), m = L.MODEL.hero, I = s ? null : null; const g = H.armor.geo;
    const sp = L.helmSplit(m.I, Uint8Array.from(m.J), m.K); let minY = 9, maxY = -9; for (let t = sp.n; t < sp.I.length; t++) { const y = m.P[sp.I[t] * 3 + 1]; minY = Math.min(minY, y); maxY = Math.max(maxY, y); } return [minY, maxY]; });
  log('gizlenen kısım yalnız baş (y > 1.68)', hid[0] > 1.68, hid.map((v) => v.toFixed(3)).join('..'));
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(0.35, 1.0, 0.02, 1.75); await shot('helm-on', { wait: 400 });
  // the settings button
  await G(() => { __G.LOOKS.openWin('ayar'); });
  const btn = await page.$('#hlm'); log('Ayar sekmesinde «Miğferi çıkar» düğmesi var', !!btn);
  if (btn) await btn.click();
  await G(() => { document.getElementById('win').style.display = 'none'; });
  const s1 = await st();
  log('düğme: miğfer çıktı, yüz göründü', s1.bare && s1.armorN === s1.off && s1.headN > 0 && s1.headOff === false && s1.helmOff === 1, JSON.stringify(s1));
  await G(() => { const g = __G; for (let i = 0; i < 4; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  // the head follows the head bone: turn the head, the face moves with it
  const follow = await G(() => { const L = __G.LOOKS, s = L.HERO.headSkin, P = __G.P; P.ps.hdY = 0; L.applyPose(P.ps); L.skinAll(); const a = Float32Array.from(s.P); P.ps.hdY = 0.6; L.applyPose(P.ps); L.skinAll();
    let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - s.P[i])); P.ps.hdY = 0; L.applyPose(P.ps); L.skinAll(); return m; });
  log('yüz baş kemiğiyle dönüyor', follow > 0.04, follow.toFixed(3));
  // the bare head sits where the helm was: its bounding box is inside the helm's (no floating head, no neck gap)
  const fit = await G(() => { const L = __G.LOOKS, hp = L.MODEL.herohead.P, m = L.MODEL.hero, sp = L.helmSplit(m.I, Uint8Array.from(m.J), m.K);
    const bb = (P, idx) => { const b = [9, 9, 9, -9, -9, -9]; const f = (v) => { for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], P[v * 3 + k]); b[k + 3] = Math.max(b[k + 3], P[v * 3 + k]); } }; if (idx) for (const v of idx) f(v); else for (let v = 0; v < P.length / 3; v++) f(v); return b; };
    return { head: bb(hp), helm: bb(m.P, sp.I.subarray(sp.n)) }; });
  const inside = fit.head[4] <= fit.helm[4] + 0.01 && Math.abs(fit.head[0]) <= Math.abs(fit.helm[0]) + 0.02 && fit.head[5] <= fit.helm[5] + 0.01;
  log('çıplak baş miğferin yerinde ve içinde', inside, 'baş ' + fit.head.map((v) => v.toFixed(2)) + ' / miğfer ' + fit.helm.map((v) => v.toFixed(2)));
  await cam(0.35, 1.0, 0.02, 1.75); await shot('helm-off', { wait: 400 });
  await cam(Math.PI / 2, 1.0, 0.02, 1.75); await shot('helm-off-side', { wait: 300 });
  // overlays: armour with helm pieces (Kül Zırh crown) and +5 crescent lose them with the helm, keep the rest
  const ov = await G(() => { const it = __G.X.makeItem('ash', 12, 2); it.up = 5; __G.SYS.inv.push(it); __G.X.equip(it); const L = __G.LOOKS;
    const a = L.skin && L.skin.o, u = L.upSkin && L.upSkin.o; return { a: a ? [a.geo.n, a.nOn, a.nOff] : null, u: u ? [u.geo.n, u.nOn, u.nOff] : null }; });
  log('Kül Zırh tacı ve +5 miğfer hilali de çıkıyor', ov.a && ov.a[0] === ov.a[2] && ov.a[2] < ov.a[1] && ov.u && ov.u[0] === ov.u[2] && ov.u[2] < ov.u[1], JSON.stringify(ov));
  await cam(0.35, 1.4, 0.05, 1.6); await shot('helm-off-ash5', { wait: 400 });
  await G(() => __G.LOOKS.setHelm(false));
  const ov2 = await G(() => { const L = __G.LOOKS, a = L.skin.o, u = L.upSkin.o; return [a.geo.n === a.nOn, u.geo.n === u.nOn]; });
  log('miğfer geri: katmanlar tam', ov2[0] && ov2[1], JSON.stringify(ov2));
  // saved setting survives a reload
  await G(() => { __G.SYS.helmOff = 1; __G.LOOKS.setHelm(true); localStorage.setItem('kf2_save', JSON.stringify(__G.SYS)); });
  await page.reload(); await page.waitForFunction('window.__G', { timeout: 120000, polling: 500 });
  await page.evaluate(() => { const b = document.getElementById('introb'); if (b && document.getElementById('intro').style.display !== 'none') b.click(); const sk = document.querySelector('#manhwa .mh-skip'); if (sk) sk.click(); });
  const s2 = await st();
  log('ayar kayıttan geri geliyor', s2.bare && s2.helmOff === 1 && s2.headN > 0, JSON.stringify(s2));
  // story: the prologue panels on the walls and in the forest show the face even with the helm setting off
  const sp = await G(() => { const L = __G.LOOKS; L.setHelm(false); __G.SYS.helmOff = 0; let during = null; const st = { eye: [2, 1.9, 2], at: [0, 1.6, 0], abs: false, hero: { x: __G.P.x, z: __G.P.z, yaw: 0, helm: 0 },
    setup: () => { during = !!L.HERO.bare && L.HERO.head.geo.n > 0; } }; const url = L.storyShot(st, 0.6); return { during, after: !!L.HERO.bare, url: url.length }; });
  log('hikâye paneli helm:0 → yüz; sonra ayara döner', sp.during === true && sp.after === false && sp.url > 1000, JSON.stringify(sp));
};
module.exports.portrait = true;
