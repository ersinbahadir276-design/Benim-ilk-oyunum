// Secondary animation: cape spring dynamics and terrain foot IK (src/32-secondary.js)
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, H = g.HB, SK = g.SK, C = g.CAPE, F = g.FIK, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(i); } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (Math.hypot(a.x - x, a.z - z) < 80) { a.x += 500; a.hx = a.x; } };
    const fresh = (x, z, yaw) => { g.tp(x, z); Object.assign(P, { st: 'move', t: 0, inv: 99, alive: true, air: false, yaw: yaw || 0, vy: 0, crouch: false }); P.rag.ang = 0; IN.kx = IN.kz = IN.mx = IN.mz = 0; P.sprintHeld = false; g.CAM.yaw = 0; };
    const grad = (x, z) => [(g.hAt(x + .5, z) - g.hAt(x - .5, z)), (g.hAt(x, z + .5) - g.hAt(x, z - .5))];
    const o = {}, capeZ = () => SK.GP[H.capeC][2];
    // flat spot and a sloped spot near the start (avoid water)
    let flat = null, slope = null;
    for (let i = 0; i < 20000 && !(flat && slope); i++) { const x = -900 + Math.random() * 1800, z = -900 + Math.random() * 1800; if (g.depthAt(x, z) > 0 || g.depthAt(x + 2, z + 2) > 0) continue;
      const [gx, gz] = grad(x, z), s = Math.hypot(gx, gz), [ax, az] = grad(x + .6, z + .6), s2 = Math.hypot(ax, az);
      if (!flat && s < .03 && s2 < .03) flat = [x, z]; if (!slope && s > .3 && s < .55 && Math.abs(s2 - s) < .06) slope = [x, z, Math.atan2(gx, gz)]; }
    o.found = [!!flat, !!slope];
    // ---- cape at rest, running, stopping, turning, falling
    far(...flat); fresh(...flat); sim(1.5); o.rest = [+C.a.toFixed(3), +capeZ().toFixed(3)];
    const run = []; let maxA = 0; sim(1.6, () => { IN.kz = 1; P.sprintHeld = true; maxA = Math.max(maxA, C.a); run.push(C.c); });
    o.run = [+maxA.toFixed(3), +capeZ().toFixed(3), +P.spd.toFixed(2)];
    const flutter = run.slice(40); o.flutter = +(Math.max(...flutter) - Math.min(...flutter)).toFixed(3);
    IN.kz = 0; P.sprintHeld = false; sim(2.5); o.stop = +C.a.toFixed(3);
    let maxS = 0; sim(.5, () => { P.yaw += 6 * DT; maxS = Math.max(maxS, Math.abs(C.s)); }); o.turn = +maxS.toFixed(3); sim(1.5);
    P.y += 6; P.air = true; P.vy = 0; P.st = 'jump'; let fallA = 0; sim(.9, () => { if (P.air) fallA = Math.max(fallA, C.a); }); o.fall = +fallA.toFixed(3); sim(1);
    o.capeFinite = [C.a, C.b, C.c, C.s].every(Number.isFinite);
    // ---- foot IK: stand across the slope (one foot uphill)
    const footErr = () => ['left', 'right'].map((S) => { const w = g.mpt(g.PM, SK.GP[H[S + 'Foot']]); return w[1] - g.hAt(w[0], w[2]); });
    far(...flat); fresh(...flat); sim(1.2); const ref = footErr(); o.ref = ref.map((v) => +v.toFixed(3));
    far(slope[0], slope[1]); fresh(slope[0], slope[1], slope[2] + Math.PI / 2); sim(1.5);
    const e = footErr(), ws = ['left', 'right'].map((S) => g.mpt(g.PM, SK.GP[H[S + 'Foot']])), dh = Math.abs(g.hAt(ws[0][0], ws[0][2]) - g.hAt(ws[1][0], ws[1][2]));
    o.slope = { err: e.map((v, i) => +(v - ref[i]).toFixed(3)), dh: +dh.toFixed(3), w: +F.w.toFixed(2), l: +F.l.toFixed(3), r: +F.r.toFixed(3) };
    // facing uphill: soles pitch toe-up
    fresh(slope[0], slope[1], slope[2]); sim(1.2); o.pitch = [+F.pl.toFixed(2), +F.pr.toFixed(2)];
    o.finite = SK.GP.every((p) => p.every(Number.isFinite));
    // IK switches off in the air and while lying
    P.y += 3; P.air = true; P.vy = 0; P.st = 'jump'; sim(.4); o.airW = +F.w.toFixed(2); sim(1.5);
    g.CAM.tx = P.x; g.CAM.tz = P.z; IN.kz = 0; g.GT.paused = false;
    return o; });
  const j = JSON.stringify(r);
  log('test yerleri bulundu (düz + eğimli zemin)', r.found[0] && r.found[1], j);
  log('pelerin: dururken sırta yakın sarkıyor', r.rest[0] < 0.15, JSON.stringify(r.rest));
  log('pelerin: koşarken geriye doğru açılıyor', r.run[0] > 0.35 && r.run[1] < r.rest[1] - 0.12, JSON.stringify(r.run));
  log('pelerin: koşarken alt ucu dalgalanıyor', r.flutter > 0.03, r.flutter);
  log('pelerin: durunca yeniden sarkıyor', r.stop < 0.15, r.stop);
  log('pelerin: dönüşte yana savruluyor', r.turn > 0.12, r.turn);
  log('pelerin: düşerken havalanıyor', r.fall > 0.3, r.fall);
  log('pelerin: sayılar sonlu (yay patlamıyor)', r.capeFinite);
  log('ayak IK: eğimde iki ayak da zemine basıyor (±3 cm)', r.slope.dh > 0.08 && Math.abs(r.slope.err[0]) < 0.03 && Math.abs(r.slope.err[1]) < 0.03, JSON.stringify(r.slope));
  log('ayak IK: yokuş yukarı bakınca tabanlar eğime uyuyor (burun yukarı)', r.pitch[0] < -0.15 && r.pitch[1] < -0.15, JSON.stringify(r.pitch));
  log('ayak IK: iskelet bozulmuyor (NaN yok)', r.finite);
  log('ayak IK: havadayken kapanıyor', r.airW < 0.2, r.airW);
  await shot('anim-slope');
};
