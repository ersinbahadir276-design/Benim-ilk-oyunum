// node test/harness.js test/s-npcstride.js  -> villagers / guards don't skate: stride-matched gait + world-space foot lock
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const find = (lo, hi) => G(([lo, hi]) => { const g = __G;
    for (let r = 6; r < 1500; r += 4) for (let a = 0; a < 6.28; a += 4 / r) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = 3; if (Math.abs(x) > 1350 || Math.abs(z) > 1350 || g.depthAt(x, z) > 0) continue;
      const hx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), hz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e), s = Math.hypot(hx, hz);
      if (s >= lo && s <= hi) return { x, z, s, up: Math.atan2(hx, hz) }; } return null; }, [lo, hi]);
  const flat = await find(0, .002), hill = await find(.25, .4);
  log('düz zemin ve yokuş bulundu', !!flat && !!hill, hill && hill.s.toFixed(2));
  if (!flat || !hill) return;
  // walk one NPC of `kind` along a path (v m/s, turn rad/s) and measure planted-ankle slide per metre travelled.
  const run = (o) => G(([sp, o]) => {
    const g = __G, n = g.NPCS.find((q) => q.kind === o.kind), dt = 1 / 60; g.RGAIT.lin = o.lin; g.RGAIT.lock = o.lock; g.RGAIT.rel = 0;
    const save = { x: g.P.x, z: g.P.z }; g.P.x = sp.x + 8; g.P.z = sp.z + 8;
    const rest = () => { const W = n.R.def.WP; return [11, 14].map((f) => W[f][1] - g.hAt(W[f][0], W[f][2])); };
    // standing reference: rest ankle height above the ground
    Object.assign(n, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: (sp.up || 0) + (o.yaw || 0), spd: 0, ph: 0, st: 'idle', hyaw: 0, fl: undefined });
    g.drawNpcs(0); const ref = rest(), prev = [null, null]; let slide = 0, dist = 0, peak = 0, nan = false, planted = 0, samples = 0, sink = 0;
    const rate = g.rigGaitRate(n.R.def, n.sc, 4.4);
    for (let f = 0; f < o.frames; f++) {
      const t = 1 + f * dt; n.yaw += (o.turn || 0) * dt; n.spd = Math.min(o.v, f * dt * 3 * o.v);
      n.x += Math.sin(n.yaw) * n.spd * dt; n.z += Math.cos(n.yaw) * n.spd * dt; n.y = g.hAt(n.x, n.z); n.ph += n.spd * dt * rate; if (f > 60) dist += n.spd * dt;
      g.drawNpcs(t); const W = n.R.def.WP;
      [11, 14].forEach((fi, i) => { const p = W[fi]; if (p.some((v) => !isFinite(v))) nan = true; const up = p[1] - g.hAt(p[0], p[2]) - ref[i];
        if (f > 60) { samples++; sink = Math.min(sink, up); }
        if (up < .02) { if (f > 60) planted++; if (prev[i] && f > 60) { const d = Math.hypot(p[0] - prev[i][0], p[2] - prev[i][2]); slide += d; peak = Math.max(peak, d / dt); } prev[i] = p.slice(); } else prev[i] = null; });
    }
    // leg reach after the run (hip → ankle / leg length)
    const W = n.R.def.WP, L = g.NPCS && (Math.hypot(...n.R.def[10].o) + Math.hypot(...n.R.def[11].o)) * n.sc, reach = Math.max(...[[9, 11], [12, 14]].map(([h, a]) => Math.hypot(W[a][0] - W[h][0], W[a][1] - W[h][1], W[a][2] - W[h][2]) / L));
    g.RGAIT.lin = 1; g.RGAIT.lock = 1; g.P.x = save.x; g.P.z = save.z;
    return { slide: +(slide / 2 / dist).toFixed(3), peak: +peak.toFixed(2), duty: +(planted / samples).toFixed(2), sink: +sink.toFixed(3), reach: +reach.toFixed(3), rel: g.RGAIT.rel, nan };
  }, [sp(o), o]);
  const sp = (o) => (o.hill ? hill : flat);
  const cases = [
    ['köylü düz yürüyüş 1.25 m/s', { kind: 'villager', v: 1.25, frames: 360 }, .1],
    ['muhafız düz yürüyüş 1.6 m/s', { kind: 'guard', v: 1.6, frames: 360 }, .1],
    ['köylü dönerek yürüyüş', { kind: 'villager', v: 1.25, turn: .9, frames: 360 }, .12],
    ['köylü yokuş yukarı', { kind: 'villager', v: 1.25, hill: 1, yaw: 0, frames: 300 }, .12],
    ['köylü yokuş aşağı', { kind: 'villager', v: 1.25, hill: 1, yaw: Math.PI, frames: 300 }, .12],
    ['tüccar yamaçta yan', { kind: 'merchant', v: 1.25, hill: 1, yaw: Math.PI / 2, frames: 300 }, .12],
  ];
  for (const [name, o, lim] of cases) {
    const a = await run({ ...o, lin: 0, lock: 0 }), b = await run({ ...o, lin: 1, lock: 1 });
    log(`${name}: ayak kayması azaldı (< ${lim} m/m)`, b.slide < lim && b.slide < a.slide * .5 && !b.nan, `eski ${a.slide} (tepe ${a.peak} m/s) → yeni ${b.slide} (tepe ${b.peak} m/s), yerde ${b.duty}, bırakma ${b.rel}`);
    log(`${name}: ayak gömülmüyor, bacak gerilmiyor`, b.sink > -.03 && b.reach <= 1.0, `en derin ${b.sink}, uzanım ${b.reach}`);
  }
  const gait = await run({ kind: 'villager', v: 1.25, frames: 200, lin: 1, lock: 0 });
  log('kilitsiz de yürüyüş adımı hıza eşli (< 0.15 m/m)', gait.slide < .15, `${gait.slide} (tepe ${gait.peak} m/s)`);
  // standing still keeps the old pose (no stance weights, no lock)
  const still = await G(() => { const g = __G, n = g.NPCS[0], q = {}; g.gaitLin(q, 1.3, 0, n.R.def, n.sc); const o = {}; g.gaitPose(o, 1.3 + Math.PI / 2, 0, 0); return { same: ['LhX', 'RhX', 'LkX', 'RkX'].every((k) => Math.abs((q[k] || 0) - (o[k] || 0)) < 1e-9), fst: q.fst }; });
  log('dururken poz eski duruşla aynı', still.same && still.fst.every((v) => v === 0), JSON.stringify(still));
  // in-game: a villager walking normally renders without errors; screenshot side-on
  await G((sp) => { const g = __G, n = g.NPCS[0]; Object.assign(n, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), st: 'walk', tx: sp.x + 30, tz: sp.z, t: 0 }); g.tp(sp.x + 3, sp.z + 3); g.GT.paused = false; }, flat);
  await page.waitForTimeout(1500);
  await G(() => { const g = __G, n = g.NPCS[0]; g.GT.paused = true; g.__lockCam = 1; g.CAM.yaw = n.yaw + Math.PI / 2; g.CAM.dist = 3.4; g.CAM.pitch = .05; g.CAM.tx = n.x; g.CAM.tz = n.z; g.CAM.ty = n.y + .8; });
  await shot('npcstride', { wait: 500 });
};
module.exports.pauseAtStart = true;
