// Foot planting (footIK): on a slope both soles touch the ground, pelvis drops, uphill sole tilts toe-up; walking stays finite.
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, DT = 1 / 60; g.GT.paused = true;
    const sim = (s) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); } };
    for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss) { a.x += 900; a.hx = a.x; }
    // find a steep but walkable spot
    let best = null;
    for (let x = -1200; x < 1200 && !best; x += 7) for (let z = -1200; z < 1200; z += 7) {
      const gx = (g.hAt(x + .5, z) - g.hAt(x - .5, z)), gz = (g.hAt(x, z + .5) - g.hAt(x, z - .5)), s = Math.hypot(gx, gz);
      if (s > .3 && s < .5 && g.depthAt(x, z) <= 0 && g.zoneAt(x, z) !== 'village') { best = { x, z, gx, gz, s }; break; }
    }
    if (!best) return { err: 'no slope' };
    const up = Math.atan2(best.gx, best.gz); // yaw facing uphill
    const place = (yaw) => { g.tp(best.x, best.z); Object.assign(P, { st: 'move', t: 0, air: false, yaw, inv: 99, hp: 999 }); P.rag.ang = 0; P.y = g.hAt(P.x, P.z); };
    const feet = () => { const M = g.PM; return ['leftFoot', 'rightFoot'].map(b => { const w = g.mpt(M, g.SK.GP[g.HB[b]]); return w[1] - g.hAt(w[0], w[2]); }); };
    const toe = (b) => { const f = g.HB[b], v = g.r3v(g.SK.GR[f], [0, 0, 1]); return v[1]; };
    const o = { slope: best.s };
    // across the slope: feet sit at different terrain heights
    place(up + Math.PI / 2); sim(1.2); P.y = g.hAt(P.x, P.z); sim(.5);
    o.across = feet(); o.hip = P.fik ? P.fik.hip : null;
    P.fikOff = true; sim(1); o.acrossOff = feet(); P.fikOff = false; sim(1);
    // reference: same pose without IK
    const save = g.footIK; P.fik.w = 0; P.fik.hip = 0; P.fik.L = P.fik.R = 0;
    // facing uphill: toes up
    place(up); sim(1.5); o.uphillToe = [toe('leftFoot'), toe('rightFoot')]; o.fik = JSON.stringify(P.fik) + ' st=' + P.st + ' air=' + P.air + ' dy=' + (P.y - g.hAt(P.x, P.z)); o.uphill = feet();
    // walk up and across for a few seconds: everything must stay finite
    place(up + .7); g.IN.mx = 0; g.IN.my = -1; let bad = 0;
    for (let i = 0; i < 240; i++) { g.IN.joy = { x: .6, y: -1 }; g.GT.time += DT; g.step(DT); for (const v of g.SK.A) if (!isFinite(v)) bad++; }
    o.nanWalk = bad; o.st = P.st;
    // flat ground: IK must be a no-op (hip offset ~0)
    g.tp(0, 60); Object.assign(P, { st: 'move', t: 0, air: false }); P.y = g.hAt(0, 60); sim(1); o.flatHip = P.fik.hip; o.flatFeet = feet();
    return o;
  });
  if (r.err) { log('slope found', false, r.err); return; }
  const [l, rr] = r.across;
  log('across slope: left sole on ground', Math.abs(l) < .13, l.toFixed(3));
  log('across slope: right sole on ground', Math.abs(rr) < .13, rr.toFixed(3));
  log('without IK one foot floats or sinks (control)', Math.abs(r.acrossOff[0] - r.acrossOff[1]) > .04, r.acrossOff.map(v => v.toFixed(3)).join(','));
  log('with IK soles level with their ground', Math.abs(l - rr) < .02, (l - rr).toFixed(3));
  log('pelvis drops on slope', r.hip < -.02, r.hip && r.hip.toFixed(3));
  log('uphill: toes tilt up', r.uphillToe[0] > .05 && r.uphillToe[1] > .05, r.uphillToe.map(v => v.toFixed(2)).join(','));
  log('uphill: soles on ground', r.uphill.every(v => Math.abs(v) < .14), r.uphill.map(v => v.toFixed(3)).join(','));
  log('walking on slope stays finite', r.nanWalk === 0, r.nanWalk);
  log('flat ground: no pelvis offset', Math.abs(r.flatHip) < .02, r.flatHip.toFixed(4));
  log('slope steepness', true, r.slope.toFixed(2));
};
