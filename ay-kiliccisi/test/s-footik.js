// node test/harness.js test/s-footik.js -> hero terrain foot IK: feet planted on slopes, no sinking, unchanged on flat ground
module.exports = async ({ G, log, shot, page }) => {
  const r = await G(() => { const g = __G, P = g.P, IN = g.IN, SK = g.SK, H = g.HB, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(); } };
    const slope = (x, z) => Math.hypot(g.hAt(x + 1, z) - g.hAt(x - 1, z), g.hAt(x, z + 1) - g.hAt(x, z - 1)) / 2;
    // a dry spot with a 15-30 degree slope, and a flat one, away from foes
    let S = null, F = null;
    for (let i = 0; i < 40000 && (!S || !F); i++) { const x = (Math.random() - .5) * 1600, z = (Math.random() - .5) * 1600, s = slope(x, z);
      if (g.depthAt(x, z) > 0 || Math.abs(slope(x + 1.5, z) - s) > .08 || Math.abs(slope(x, z + 1.5) - s) > .08) continue;
      if (!S && s > .27 && s < .55) S = [x, z, s]; if (!F && s < .01) F = [x, z, s]; }
    const clear = () => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - P.x, a.z - P.z) < 60) { a.x += 400; a.hx = a.x; } };
    const rest = SK.rest[H.leftFoot][1];
    const err = () => ['leftFoot', 'rightFoot'].map((b) => { const w = g.mpt(g.PM, SK.GP[H[b]]); return w[1] - g.hAt(w[0], w[2]) - rest; });
    const place = (p, yaw, ik) => { g.tp(p[0], p[1]); Object.assign(P, { st: 'move', t: 0, yaw, air: false, vx: 0, vz: 0 }); P.rag.ang = 0; IN.wx = IN.wz = 0; g.noFootIK = !ik; clear(); sim(1.2); return err(); };
    const o = { slope: S && +S[2].toFixed(2), flat: !!F, idle: [], idleOff: [] };
    for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { o.idle.push(place(S, yaw, 1).map((v) => +v.toFixed(3))); o.idleOff.push(place(S, yaw, 0).map((v) => +v.toFixed(3))); }
    o.flatOn = place(F, 0, 1).map((v) => +v.toFixed(3)); o.flatOff = place(F, 0, 0).map((v) => +v.toFixed(3));
    // walk across the slope: worst sinking of an ankle below the ground (with and without IK)
    const walk = (ik) => { place(S, 0, ik); let worst = 0; const p0 = [P.x, P.z]; sim(2, () => { IN.wx = 1; IN.wz = 0.2; const e = err(); worst = Math.min(worst, e[0], e[1]); }); IN.wx = IN.wz = 0; g.tp(p0[0], p0[1]); return +worst.toFixed(3); };
    o.walkOn = walk(1); o.walkOff = walk(0); g.noFootIK = false; place(S, Math.PI / 2, 1); g.__lockCam = false;
    return o; });
  const mx = (a) => Math.max(...a.flat().map(Math.abs));
  log('eğimli yer bulundu', r.slope && r.flat, JSON.stringify({ eğim: r.slope }));
  log('bekleme: iki ayak da eğimde zemine basıyor (±3 cm)', mx(r.idle) < 0.03, JSON.stringify({ ik: mx(r.idle), ik_yok: mx(r.idleOff) }));
  log('IK, IK yokken olan hatayı en az yarıya indiriyor', mx(r.idle) < mx(r.idleOff) * 0.5, '');
  log('düz zeminde poz değişmiyor', mx([r.flatOn]) - mx([r.flatOff]) < 0.006 && mx([r.flatOn]) < 0.02, JSON.stringify([r.flatOn, r.flatOff]));
  log('yürürken ayak zemine gömülmüyor (en fazla 4 cm)', r.walkOn > -0.04 && r.walkOn > r.walkOff, JSON.stringify({ ik: r.walkOn, ik_yok: r.walkOff }));
  await G(() => { const c = __G.CAM; c.dist = 2.6; c.pitch = 0.05; });
  await shot('footik-slope', { wait: 800 });
};
