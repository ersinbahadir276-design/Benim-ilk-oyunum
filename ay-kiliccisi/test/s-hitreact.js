// Yönlü vuruş tepkileri: kahraman ve goblin/iskelet, vuruşun geldiği yöne göre sarsılıyor
// (önden → geriye, arkadan → öne, yandan → yana eğilip o tarafa adım atıyor).
// node test/harness.js test/s-hitreact.js
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0.4; for (let i = 0; i < 90; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  // hero: head displacement relative to the hips, measured along the push direction, max over the first .3 s
  const heroHit = (ang, opts) => G(([ang, opts]) => {
    const g = __G, P = g.P, H = g.HB, step = () => { g.GT.time += 1 / 60; g.step(1 / 60); };
    P.st = 'move'; P.t = 0; P.hp = P.maxHp || 999; P.inv = 0; P.berserk = opts.berserk || 0; P.hr = null; P.vx = P.vz = 0;
    for (let i = 0; i < 60; i++) step();
    const rel = () => { const a = g.mpt(g.PM, g.SK.GP[H.head]), b = g.mpt(g.PM, g.SK.GP[H.hips]); return [a[0] - b[0], a[2] - b[2]]; };
    const r0 = rel(), a = P.yaw + ang, src = { x: P.x + Math.sin(a) * 1.5, z: P.z + Math.cos(a) * 1.5 }, d = [-Math.sin(a), -Math.cos(a)];
    const res = g.hitPlayer({ src, dmg: 10, dir: d, knock: 'flinch' }), st = P.st;
    let best = -9, worstSide = 0, nan = false, feetLo = 9, feetHi = -9;
    for (let i = 0; i < 18; i++) { step(); const r = rel(), dx = r[0] - r0[0], dz = r[1] - r0[1], along = dx * d[0] + dz * d[1];
      if (along > best) { best = along; worstSide = Math.abs(dx * -d[1] + dz * d[0]); }
      if (Object.values(P.ps).some((v) => typeof v === 'number' && !isFinite(v))) nan = true;
      for (const b of [H.leftFoot, H.rightFoot]) { const w = g.mpt(g.PM, g.SK.GP[b]); const h = w[1] - g.hAt(w[0], w[2]); feetLo = Math.min(feetLo, h); feetHi = Math.max(feetHi, h); } }
    for (let i = 0; i < 40; i++) step();
    return { res, st, along: +best.toFixed(3), side: +worstSide.toFixed(3), nan, feet: [+feetLo.toFixed(3), +feetHi.toFixed(3)], after: P.st };
  }, [ang, opts || {}]);
  const dirs = { 'önden': 0, 'arkadan': Math.PI, 'soldan': Math.PI / 2, 'sağdan': -Math.PI / 2 };
  const R = {};
  for (const [n, a] of Object.entries(dirs)) R[n] = await heroHit(a);
  log('kahraman: vuruş sarsıntı durumuna geçiriyor', Object.values(R).every((r) => r.res === 'hit' && r.st === 'hurt'), Object.values(R).map((r) => r.st));
  for (const n of Object.keys(dirs)) log(`kahraman ${n}: baş itiş yönüne gidiyor (≥ 6 cm)`, R[n].along >= .06, JSON.stringify(R[n]));
  log('kahraman: NaN yok, ayaklar zeminde (−6…+25 cm)', Object.values(R).every((r) => !r.nan && r.feet[0] > -.06 && r.feet[1] < .25), Object.values(R).map((r) => r.feet));
  log('kahraman: sonra normale dönüyor', Object.values(R).every((r) => r.after === 'move'));
  await G(() => { __G.HREACT.on = 0; });
  const old = await heroHit(Math.PI);
  await G(() => { __G.HREACT.on = 1; });
  log('eski tepki: arkadan vuruşta da geriye eğiliyordu (karşılaştırma)', old.along < R['arkadan'].along, old.along + ' → ' + R['arkadan'].along);
  const bz = await heroHit(Math.PI / 2, { berserk: 5 });
  log('öfke modunda sarsılmıyor ama gövde hafifçe irkiliyor (≥ 1,5 cm)', bz.st !== 'hurt' && bz.along >= .015, JSON.stringify(bz));
  // screenshot: hit from the left, mid-recoil
  await G(() => { const g = __G, P = g.P; P.berserk = 0; P.st = 'move'; P.inv = 0; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    const a = P.yaw + Math.PI / 2; g.hitPlayer({ src: { x: P.x + Math.sin(a), z: P.z + Math.cos(a) }, dmg: 14, dir: [-Math.sin(a), -Math.cos(a)], knock: 'flinch' });
    for (let i = 0; i < 6; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    g.__lockCam = 1; g.CAM.yaw = P.yaw + Math.PI; g.CAM.dist = 3.6; g.CAM.pitch = .1; g.CAM.tx = P.x; g.CAM.tz = P.z; g.CAM.ty = P.y + 1.1; });
  await shot('hit-left', { wait: 300 });

  // goblins: same idea on the rig pose (head relative to hips)
  const gob = await G(() => {
    const g = __G, gb = g.GOBS.find((o) => !o.big && !o.skel && !o.dead), sk = g.GOBS.find((o) => o.skel);
    const run = (o) => { const out = {}, buf = new Float32Array(o.R.def.length * 12);
      const rel = () => { const r = g.gobPose(o, 1); g.rigFK(o.R.def, r, [0, 0, 0], o.yaw, 1, buf); const W = o.R.def.WP; return [W[2][0] - W[0][0], W[2][2] - W[0][2]]; };
      for (const [n, a] of [['önden', 0], ['arkadan', Math.PI], ['soldan', Math.PI / 2], ['sağdan', -Math.PI / 2]]) {
        o.yaw = .3; o.st = 'chase'; o.t = 0; o.spd = 0; o.dead = 0; o.hp = 999; const r0 = (o.st = 'idle', rel()); o.st = 'chase';
        const b = o.yaw + a, d = [-Math.sin(b), -Math.cos(b)]; g.gobHurt(o, 1, d[0], d[1], 'light');
        let best = -9; for (let t = 0; t < .3; t += 1 / 60) { o.t = t; const r = rel(); best = Math.max(best, (r[0] - r0[0]) * d[0] + (r[1] - r0[1]) * d[1]); }
        out[n] = { st: o.st, along: +best.toFixed(3) }; o.st = 'idle'; o.t = 0; }
      return out; };
    return { gob: gb ? run(gb) : null, skel: sk ? run(sk) : null };
  });
  for (const k of ['gob', 'skel']) { const r = gob[k]; const nm = k === 'gob' ? 'goblin' : 'iskelet';
    log(`${nm}: dört yönde baş itiş yönüne gidiyor (≥ 4 cm)`, r && Object.values(r).every((v) => v.st === 'hurt' && v.along >= .04), JSON.stringify(r)); }
};
