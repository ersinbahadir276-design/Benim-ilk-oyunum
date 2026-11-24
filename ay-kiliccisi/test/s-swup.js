// Kılıç demirci süsleri: +3 namluda gümüş rünler + kabzada gümüş tel (swup3), +5 ay ışığı şeritleri, altın hilal,
// ay taşlı topuz (swup5). node test/harness.js test/s-swup.js  -> testler + test/out/swup-*.jpg
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  const st = () => G(() => { const L = __G.LOOKS, u = L.sword && L.sword.up; return { up: u ? u.key : null, nv: u ? u.s.nv : 0, skins: L.skins.length, pobjs: L.pObjs.length, objs: __G.objCount(), em: u ? u.o.em.slice() : null }; });
  // every ornament vertex must sit on the sword: distance to the nearest triangle of the skinned base sword (world space)
  const onBlade = () => G(() => { const L = __G.LOOKS; L.skinAll(); const a = L.sword.s.P, I = L.MODEL.sword.I, b = L.sword.up.s.P; let worst = 0;
    const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]], dot = (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
    const tri = (p, A, B, C) => { // closest point on triangle (Ericson, Real-Time Collision Detection 5.1.5)
      const ab = sub(B, A), ac = sub(C, A), ap = sub(p, A), d1 = dot(ab, ap), d2 = dot(ac, ap); if (d1 <= 0 && d2 <= 0) return A;
      const bp = sub(p, B), d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return B;
      const vc = d1 * d4 - d3 * d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return [A[0] + ab[0] * v, A[1] + ab[1] * v, A[2] + ab[2] * v]; }
      const cp = sub(p, C), d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return C;
      const vb = d5 * d2 - d1 * d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return [A[0] + ac[0] * w, A[1] + ac[1] * w, A[2] + ac[2] * w]; }
      const va = d3 * d6 - d5 * d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return [B[0] + (C[0] - B[0]) * w, B[1] + (C[1] - B[1]) * w, B[2] + (C[2] - B[2]) * w]; }
      const dn = 1 / (va + vb + vc), v = vb * dn, w = vc * dn; return [A[0] + ab[0] * v + ac[0] * w, A[1] + ab[1] * v + ac[1] * w, A[2] + ab[2] * v + ac[2] * w]; };
    const V = (k) => [a[k * 3], a[k * 3 + 1], a[k * 3 + 2]], T = []; for (let t = 0; t < I.length; t += 3) T.push([V(I[t]), V(I[t + 1]), V(I[t + 2])]);
    for (let i = 0; i < b.length; i += 9) { const p = [b[i], b[i + 1], b[i + 2]]; let m = 1e9;
      for (const [A, B, C] of T) { const q = tri(p, A, B, C), d = dot(sub(p, q), sub(p, q)); if (d < m) m = d; }
      worst = Math.max(worst, Math.sqrt(m)); }
    return worst; });
  await G(() => { const it = __G.X.makeItem('iron', 12, 2); it.up = 0; __G.SYS.inv.push(it); __G.X.equip(it); });
  const s0 = await st();
  log('başlangıç (+0): kılıç süsü yok', s0.up === null, JSON.stringify(s0));
  log('modeller açıldı (swup3/swup5)', await G(() => ['swup3', 'swup5'].every((k) => __G.LOOKS.MODEL[k] && __G.LOOKS.MODEL[k].nv > 800)));
  const up = () => G(() => { const g = __G, it = g.SYS.inv.find((i) => i.id === g.SYS.eq.weapon); g.SYS.gold = 99999; g.SYS.shards = 9999; const ok = g.X.upgrade(it); return [ok, it.up]; });
  for (let n = 1; n <= 2; n++) await up();
  log('+2: henüz süs yok', (await st()).up === null);
  const [ok3, lv3] = await up(); const s3 = await st();
  log('+3: gümüş rün ve tel (swup3) takıldı', ok3 && lv3 === 3 && s3.up === 'swup3' && s3.skins === s0.skins + 1 && s3.objs === s0.objs + 1, JSON.stringify(s3));
  const w3 = await onBlade(); log('+3 süsleri kılığın üstünde (en uzak köşe < 1 cm)', w3 < 0.01, (w3 * 100).toFixed(2) + ' cm');
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(1.2, 1.9, .1, 1.0); await shot('swup-3', { wait: 400 });
  await up(); log('+4: hâlâ yalnızca +3 süsü', (await st()).up === 'swup3');
  const [ok5, lv5] = await up(); const s5 = await st();
  log('+5: ay işçiliği (swup3+swup5) tek katman', ok5 && lv5 === 5 && s5.up === 'swup3+swup5' && s5.skins === s0.skins + 1 && s5.objs === s0.objs + 1, JSON.stringify(s5));
  const nv35 = await G(() => __G.LOOKS.MODEL.swup3.nv + __G.LOOKS.MODEL.swup5.nv);
  log('+5 katmanı iki modelin toplamı', s5.nv === nv35, s5.nv + ' / ' + nv35);
  log('ay taşları soluk mavi ışık', s5.em && s5.em[2] > s5.em[0], JSON.stringify(s5.em));
  await cam(1.2, 1.9, .1, 1.0); await shot('swup-5', { wait: 400 });
  // close-up on the sword: aim the camera at the blade's centre, looking at its flat (normal = blade thickness axis)
  const blade = async (name, d, ya = Math.PI / 2) => { await G(([d, ya]) => { const g = __G, L = g.LOOKS; L.skinAll(); const P = L.sword.s.P, n = P.length / 3; let c = [0, 0, 0];
      for (let i = 0; i < P.length; i += 3) { c[0] += P[i] / n; c[1] += P[i + 1] / n; c[2] += P[i + 2] / n; }
      const M = g.PM, w = [0, 1, 2].map((k) => M[k] * c[0] + M[4 + k] * c[1] + M[8 + k] * c[2] + M[12 + k]); // hero-local → world
      g.__lockCam = 1; g.CAM.tx = w[0]; g.CAM.ty = w[1]; g.CAM.tz = w[2]; g.CAM.dist = d; g.CAM.pitch = 0.15; g.CAM.yaw = g.P.yaw + ya; }, [d, ya]); await shot(name, { wait: 400 }); };
  await blade('swup-5-blade', 1.1); await blade('swup-5-flat', 0.8, 0); await blade('swup-5-flat2', 0.8, Math.PI);
  const moved = await G(() => { const { applyPose, skinAll } = __G.LOOKS, s = __G.LOOKS.sword.up.s, a = Float32Array.from(s.P); __G.P.ps.RaZ = -0.6; __G.P.ps.RaX = 0.5; applyPose(__G.P.ps); skinAll(); let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - s.P[i])); return m; });
  log('süsler elle birlikte hareket ediyor', moved > 0.05, moved.toFixed(3));
  const w5 = await onBlade(); log('+5 süsleri kılığın üstünde', w5 < 0.01, (w5 * 100).toFixed(2) + ' cm');
  // a longer, narrower legendary blade (Gölge Kesen, 1.62 m) at +5: ornaments stretch with it and keep their glow
  await G(() => { const it = __G.X.makeItem('shadow', 12, 2); it.up = 5; __G.SYS.inv.push(it); __G.X.equip(it); });
  const ss = await st(), ws = await onBlade();
  log('Gölge Kesen +5: süs katmanı yeniden kuruldu, sızıntı yok', ss.up === 'swup3+swup5' && ss.skins === s5.skins + 1 && ss.objs === s5.objs + 1, JSON.stringify(ss) + ' (+1 = ışıma şeridi)');
  log('Gölge Kesen +5: süsler uzun namluya oturuyor', ws < 0.01, (ws * 100).toFixed(2) + ' cm');
  await cam(1.2, 1.9, .1, 1.0); await shot('swup-shadow5', { wait: 400 });
  // a wide cleaver (0.1 m blade) at +3
  await G(() => { const it = __G.X.makeItem('cleaver', 12, 2); it.up = 3; __G.SYS.inv.push(it); __G.X.equip(it); });
  const wc = await onBlade(); log('Kasap Satırı +3: süsler geniş namluya oturuyor', wc < 0.01, (wc * 100).toFixed(2) + ' cm');
  await G(() => { const it = __G.X.makeItem('iron', 12, 2); __G.SYS.inv.push(it); __G.X.equip(it); });
  const s1 = await st();
  log('Demir Dev Kılıç +0: süs kaldırıldı, sızıntı yok', s1.up === null && s1.skins === s0.skins && s1.objs === s0.objs, JSON.stringify(s1));
};
module.exports.portrait = true;
