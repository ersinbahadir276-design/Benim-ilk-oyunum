// Hero locomotion (src/32-gait.js): keyframed walk/run/sprint, idle, leaning.
// Checks: spline is periodic and continuous, legs alternate, the stance foot stays on the ground,
// no foot sinks, the pose has no NaN and no frame-to-frame pops, sprint strides are bigger than walk,
// turning banks the spine into the turn, idle breathes and shifts weight. Saves side-view frames.
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, H = g.HB, DT = 1 / 60, o = {};
    g.GT.paused = true; window.__noAutoQ = 1;
    for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - 30, a.z - 420) < 90) { a.x += 400; a.hx = a.x; }
    const step = (n) => { for (let i = 0; i < n; i++) { g.GT.time += DT; g.step(DT); } };
    const ankle = (b) => { const w = g.mpt(g.PM, g.SK.GP[b]); return w[1] - g.hAt(w[0], w[2]); };
    const reset = () => { g.tp(30, 420); Object.assign(P, { st: 'move', t: 0, yaw: 0, hp: 200, sta: 100 }); IN.mx = 0; IN.mz = 0; P.sprintHeld = false; step(60); };
    // spline: periodic, passes through keys
    const K = [[0, 1], [.3, -1], [.6, .5], [.85, 0]];
    o.splineKeys = [0, .3, .6, .85].map((t) => +g.hgKey(K, t).toFixed(4));
    o.splineWrap = +Math.abs(g.hgKey(K, .9999) - g.hgKey(K, 0)).toFixed(4);
    let mx = 0; for (let i = 0; i < 1000; i++) mx = Math.max(mx, Math.abs(g.hgKey(K, (i + 1) / 1000) - g.hgKey(K, i / 1000))); o.splineStep = +mx.toFixed(4);
    // idle
    reset(); const rest = (ankle(H.leftFoot) + ankle(H.rightFoot)) / 2; o.rest = +rest.toFixed(3);
    let kmin = 9, kmax = -9, cmin = 9, cmax = -9; for (let i = 0; i < 600; i++) { step(1); kmin = Math.min(kmin, P.ps.Lkn); kmax = Math.max(kmax, P.ps.Lkn); cmin = Math.min(cmin, P.ps.chX); cmax = Math.max(cmax, P.ps.chX); }
    o.idle = { kneeRange: +(kmax - kmin).toFixed(3), breath: +(cmax - cmin).toFixed(3) };
    // locomotion at three speeds
    const run = (mz, sprint, frames) => {
      reset(); IN.mz = mz; P.sprintHeld = sprint; step(60);
      let nan = false, sinkMin = 9, groundErr = 0, alt = 0, n = 0, pop = 0, thMin = 9, thMax = -9, spd = 0; let prev = Object.assign({}, P.ps);
      for (let i = 0; i < frames; i++) {
        step(1); const q = P.ps; for (const k in q) { if (!isFinite(q[k])) nan = true; if (k !== 'two' && k !== 'rev' && k !== 'choke') pop = Math.max(pop, Math.abs(q[k] - prev[k])); } prev = Object.assign({}, q);
        const a = ankle(H.leftFoot), b = ankle(H.rightFoot); sinkMin = Math.min(sinkMin, a, b); groundErr = Math.max(groundErr, Math.min(a, b) - rest);
        if (q.LthX * q.RthX < 0) alt++; n++; thMin = Math.min(thMin, q.LthX); thMax = Math.max(thMax, q.LthX); spd += P.spd;
      }
      IN.mz = 0; P.sprintHeld = false;
      return { nan, sink: +(rest - sinkMin).toFixed(3), lift: +groundErr.toFixed(3), alt: +(alt / n).toFixed(2), pop: +pop.toFixed(3), stride: +(thMax - thMin).toFixed(2), spd: +(spd / n).toFixed(2) };
    };
    o.walk = run(.35, false, 180); o.run = run(1, false, 180); o.sprint = run(1, true, 180);
    // turning: spin the facing while running -> spine banks into the turn (left turn = yaw increasing = spZ < 0)
    reset(); IN.mz = 1; step(40); const y0 = P.yaw; let bank = 0, bmax = 0, yrs = []; for (let i = 0; i < 40; i++) { IN.mx = 1; step(1); bank = Math.min(bank, P.ps.spZ); bmax = Math.max(bmax, P.ps.spZ); if (i % 4 == 0) yrs.push(+P.gait.yr.toFixed(2) + '/' + P.yaw.toFixed(2)); }
    const yawGain = g.angd ? g.angd(P.yaw, y0) : P.yaw - y0; IN.mx = 0; IN.mz = 0; step(30);
    o.turn = { bank: +bank.toFixed(3), bmax: +bmax.toFixed(3), yrs: yrs.join(' '), yaw: +yawGain.toFixed(2), yr: +(P.gait ? P.gait.yr : 0).toFixed(2) };
    reset();
    return o;
  });
  log('Eğri: anahtar karelerden geçer', r.splineKeys.join(',') === '1,-1,0.5,0', r.splineKeys.join(','));
  log('Eğri: döngü dikişsiz ve sürekli', r.splineWrap < .02 && r.splineStep < .03, `dikiş ${r.splineWrap}, adım ${r.splineStep}`);
  log('Bekleme: nefes ve ağırlık aktarma', r.idle.breath > .02 && r.idle.kneeRange > .08, JSON.stringify(r.idle));
  for (const k of ['walk', 'run', 'sprint']) {
    const m = r[k];
    log(`${k}: NaN yok, sıçrama yok`, !m.nan && m.pop < .08 * m.spd + .05, `kare başına en büyük açı değişimi ${m.pop} (hız ${m.spd} m/s)`);
    log(`${k}: bacaklar karşılıklı`, m.alt > .6, `oran ${m.alt}`);
    log(`${k}: ayak zemine gömülmüyor`, m.sink < .05, `gömülme ${m.sink} m (dinlenme ${r.rest})`);
    log(`${k}: basan ayak yerde`, m.lift < (k === 'walk' ? .05 : .1), `en alçak ayak +${m.lift} m, hız ${m.spd}`);
  }
  log('Adım boyu: yürü < koş < depar', r.walk.stride < r.run.stride && r.run.stride < r.sprint.stride, `${r.walk.stride} / ${r.run.stride} / ${r.sprint.stride}`);
  // yaw decreasing = right turn -> lean right (spZ > 0); increasing = left turn -> spZ < 0
  log('Dönüşte gövde içe yatar', r.turn.yaw < 0 ? r.turn.bmax > .05 && r.turn.bmax > -r.turn.bank * 3 : r.turn.bank < -.05 && -r.turn.bank > r.turn.bmax * 3, JSON.stringify(r.turn));
  // side-view frames of a run cycle for eyeballing
  await G(() => { const g = __G; g.tp(30, 420); g.P.yaw = 0; g.IN.mz = 1; for (let i = 0; i < 60; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  for (let f = 0; f < 4; f++) {
    await G(() => { const g = __G; for (let i = 0; i < 5; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + 1.5; g.CAM.dist = 4; g.CAM.pitch = .1; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + 1.0; });
    await shot('gait-run-' + f, { wait: 300 });
  }
  await G(() => { const g = __G; g.IN.mz = 0; });
};
