// Kael locomotion layer (33-anim.js): feet planted on slopes, pelvis motion while walking, lean into turns, idle breathing, no NaN
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, SK = g.SK, HB = g.HB, LIK = g.LIK, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(); } };
    const fresh = (x, z, yaw) => { g.tp(x, z); Object.assign(P, { st: 'move', t: 0, hp: g.X.maxHP(), sta: 100, inv: 99, alive: true, air: false, yaw: yaw || 0, crouch: false }); P.rag.ang = 0; IN.mx = IN.mz = IN.kx = IN.kz = 0; for (const k in g.BUF) g.BUF[k] = -9; };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (Math.hypot(a.x - x, a.z - z) < 70) { a.x += 500; a.hx = a.x; } };
    const foot = (b) => g.mpt(g.PM, SK.GP[b]);
    const gap = (b) => { const w = foot(b); return w[1] - g.hAt(w[0], w[2]); };
    const nan = () => SK.GP.some((p) => p.some((v) => !isFinite(v)));
    const o = {};
    // flat reference spot near the village gate, and a steep dry slope found by scanning
    let flat = null, steep = null, best = 0;
    for (let x = -700; x <= 700 && !(flat && best > .5); x += 7) for (let z = -700; z <= 700; z += 7) {
      if (g.depthAt(x, z) > 0 || g.depthAt(x + 2, z) > 0 || g.depthAt(x - 2, z) > 0) continue;
      const sx = (g.hAt(x + .5, z) - g.hAt(x - .5, z)), sz = (g.hAt(x, z + .5) - g.hAt(x, z - .5)), s = Math.hypot(sx, sz);
      if (!flat && s < .01) flat = [x, z];
      if (s > best && s < .9) { best = s; steep = [x, z, Math.atan2(sx, sz)]; } }
    o.slope = +best.toFixed(2);
    // ankle height above ground standing on flat ground = reference
    far(...flat); fresh(flat[0], flat[1]); sim(1); const ref = (gap(HB.leftFoot) + gap(HB.rightFoot)) / 2; o.ref = +ref.toFixed(3);
    // stand side-on to the slope (uphill to the left): with the layer off one foot floats, with it on both are planted
    const stand = (off) => { far(steep[0], steep[1]); fresh(steep[0], steep[1], steep[2] - Math.PI / 2); LIK.off = off; sim(1.2); const a = gap(HB.leftFoot) - ref, b = gap(HB.rightFoot) - ref; LIK.off = false; return [+a.toFixed(3), +b.toFixed(3)]; };
    o.offSide = stand(true); o.onSide = stand(false);
    // walk across the slope: worst sink / float of the lower foot each frame
    far(steep[0], steep[1]); fresh(steep[0], steep[1], steep[2] - Math.PI / 2); g.CAM.yaw = steep[2] - Math.PI / 2; IN.mz = .55; let sink = 0, pz = [], nn = false;
    sim(2.5, () => { if (P.st !== 'move' || P.air) return; const a = gap(HB.leftFoot) - ref, b = gap(HB.rightFoot) - ref; sink = Math.min(sink, a, b); pz.push(P.ps.pelZ); nn = nn || nan(); }); IN.mz = 0;
    o.walkSink = +sink.toFixed(3); o.pelZ = [+Math.min(...pz).toFixed(3), +Math.max(...pz).toFixed(3)]; o.nanWalk = nn;
    // sprint in a circle on flat ground: the body leans into the turn
    far(...flat); fresh(flat[0], flat[1]); g.CAM.yaw = 0; IN.mz = 1; IN.sprintHeld = true; P.sprintHeld = true; let lean = 0;
    sim(2.5, () => { g.CAM.yaw += 2.2 * DT; P.sprintHeld = true; lean = Math.max(lean, Math.abs(LIK.lean)); }); IN.mz = 0; IN.sprintHeld = false; P.sprintHeld = false; sim(1.5);
    o.lean = +lean.toFixed(3); o.leanAfter = +Math.abs(LIK.lean).toFixed(3);
    // idle breathing: chest moves, deeper when stamina is low
    const breath = (sta) => { fresh(flat[0], flat[1]); let lo = 9, hi = -9; sim(4, () => { P.sta = sta; lo = Math.min(lo, P.ps.chX); hi = Math.max(hi, P.ps.chX); }); return +(hi - lo).toFixed(3); };
    o.breathRested = breath(100); o.breathTired = breath(5);
    // cut-scene style teleport: stale terrain state must not bend the legs
    fresh(flat[0] + 40, flat[1]); g.dPlay && 0; o.stale = !!(Math.abs(LIK.x - P.x) > .6);
    o.nan = nan(); return o; });
  log('yer IK: eğimde yan durunca katman kapalıyken bir ayak havada kalıyor', Math.max(...r.offSide.map(Math.abs)) > .05, JSON.stringify(r));
  log('yer IK: katman açıkken iki ayak da zemine basıyor (±4 cm)', r.onSide.every((v) => Math.abs(v) < .04), JSON.stringify(r.onSide));
  log('yer IK: eğimde yürürken ayak zemine 4 cm’den fazla gömülmüyor', r.walkSink > -.04, r.walkSink);
  log('yürüyüş: leğen salınıyor (iki yöne)', r.pelZ[0] < -.015 && r.pelZ[1] > .015, JSON.stringify(r.pelZ));
  log('dönüş: koşarken gövde dönüşe yatıyor, durunca düzeliyor', r.lean > .05 && r.leanAfter < .02, r.lean + ' / ' + r.leanAfter);
  log('nefes: yorgunken göğüs daha derin inip kalkıyor', r.breathTired > r.breathRested * 1.8 && r.breathRested > .01, r.breathRested + ' / ' + r.breathTired);
  log('NaN yok', !r.nan && !r.nanWalk);
  await shot('anim-slope', { wait: 400 });
};
