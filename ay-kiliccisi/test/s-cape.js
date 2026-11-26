// Kael's cape secondary motion (31-hero.js capeStep/capePose): hangs at rest, lifts with speed, never enters the legs,
// rolls when strafing/turning, lifts while falling, stays finite.  node test/harness.js test/s-cape.js
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, C = g.CAPE, H = g.HB, SK = g.SK, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(); } };
    const clear = () => { Object.assign(IN, { mx: 0, mz: 0, kx: 0, kz: 0, atkHeld: false, blockHeld: false }); P.sprintHeld = false; for (const k in g.BUF) g.BUF[k] = -9; };
    const T0 = [30, 420];
    for (const l of [g.wolves, g.GOBS, g.CROCS, g.NPCS]) for (const a of l) if (Math.hypot(a.x - T0[0], a.z - T0[1]) < 70) { a.x += 400; a.hx = a.x; }
    const fresh = () => { clear(); g.tp(...T0); Object.assign(P, { yaw: 0, st: 'move', t: 0, hp: 200, sta: 100, inv: 0, air: false, vx: 0, vz: 0, vy: 0, crouch: false, exhausted: false }); P.rag.ang = 0; sim(2); };
    const o = {}; const th = () => C.th.map((v) => +v.toFixed(3));
    // 1) at rest the cape hangs (no lift, no roll)
    fresh(); o.rest = th(); o.restRoll = +C.r.toFixed(3);
    // 2) walk vs sprint: lift grows with speed, the hem lifts more than the top; check legs never pass through the cloth
    let minGap = 9, nan = false;
    const gap = () => { const c = SK.GP[H.capeC][2], kn = Math.min(SK.GP[H.leftLowerLeg][2], SK.GP[H.rightLowerLeg][2]); minGap = Math.min(minGap, kn - c); if (!C.th.every(isFinite)) nan = true; };
    fresh(); IN.mz = 1; sim(1.5, gap); o.walk = th();
    fresh(); IN.mz = 1; P.sprintHeld = true; let mx = [0, 0, 0]; sim(1.5, () => { gap(); mx = mx.map((v, i) => Math.max(v, C.th[i])); }); o.sprint = th(); o.sprintMax = mx.map((v) => +v.toFixed(3)); o.minGap = +minGap.toFixed(3);
    // 3) stopping: the cloth falls back down within ~1.5 s
    clear(); sim(1.5, gap); o.stopped = th();
    // 4) strafe right (local -x): roll towards +x; turning in place also rolls
    fresh(); IN.mx = -1; let rmax = 0; sim(1, () => { rmax = Math.max(rmax, Math.abs(C.r)); }); o.strafeRoll = +rmax.toFixed(3);
    // 5) falling: lift without forward speed
    fresh(); let fallMax = 0; for (let i = 0; i < 40; i++) { P.vy = -8; P.air = true; P.vx = 0; P.vz = 0; g.GT.time += DT; g.capeStep(DT); fallMax = Math.max(fallMax, C.th[0]); } o.fall = +fallMax.toFixed(3); P.vy = 0; P.air = false;
    o.nan = nan; clear(); fresh();
    return o;
  });
  log('pelerin: dururken sarkıyor (kalkma yok, yana dönme yok)', r.rest.every((v) => Math.abs(v) < .15) && Math.abs(r.restRoll) < .05, JSON.stringify({ açılar: r.rest, yan: r.restRoll }));
  log('pelerin: yürürken hafif, koşarken çok kalkıyor; etek üst kısımdan fazla kalkıyor', r.walk[0] > .12 && r.sprint[0] > r.walk[0] + .15 && r.sprint[2] > r.sprint[0], JSON.stringify({ yürüme: r.walk, koşu: r.sprint }));
  log('pelerin: koşu sırasında bacaklar kumaşın içinden geçmiyor', r.minGap > .02, 'diz–etek en küçük aralık ' + (r.minGap * 100).toFixed(1) + ' cm');
  log('pelerin: durunca geri sarkıyor', r.stopped.every((v) => Math.abs(v) < .2), JSON.stringify(r.stopped));
  log('pelerin: yana koşarken yana savruluyor', r.strafeRoll > .1, 'en büyük yan açı ' + r.strafeRoll);
  log('pelerin: düşerken havalanıyor', r.fall > .25, 'üst açı ' + r.fall);
  log('pelerin: sayısal kararlılık (NaN yok)', !r.nan);
};
module.exports.pauseAtStart = true;
