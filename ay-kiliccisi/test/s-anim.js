// Hero animation layers (src/32-anim.js): foot IK on slopes, ready-stance idle, turn banking
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => { const g = __G, P = g.P, hAt = g.hAt, mpt = g.mpt, SK = g.SK, HB = g.HB, ANIM = g.ANIM, PLD = g.PLD, DT = 1 / 60; g.GT.paused = true; const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(); } };
    const o = {};
    // find a slope near the start: largest side-to-side height difference over 0.25 m
    let best = null; for (let x = -1300; x <= 1300; x += 10) for (let z = -1300; z <= 1300; z += 10) { const d = Math.abs(hAt(x + .125, z) - hAt(x - .125, z)); if (d < .09 && g.depthAt(x, z) <= 0 && (!best || d > best[2])) best = [x, z, d]; }
    o.slope = +best[2].toFixed(3);
    let YAW = 0; const place = () => { g.tp(best[0], best[1]); Object.assign(P, { st: 'move', t: 0, air: false, yaw: YAW, inv: 0 }); P.rag.ang = 0; g.IN.mx = 0; g.IN.mz = 0; for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (Math.hypot(a.x - P.x, a.z - P.z) < 60) { a.x += 400; a.hx = a.x; } };
    const rest = PLD.bones[HB.leftFoot].r[1];
    const err = () => { const H = HB; return [H.leftFoot, H.rightFoot].map((b) => { const w = mpt(g.PM, SK.GP[b]); return Math.abs(w[1] - hAt(w[0], w[2]) - rest); }); };
    ANIM.off = 1; place(); sim(1); const e0 = err(); ANIM.off = 0; place(); sim(1.2); const e1 = err();
    o.errOff = e0.map((v) => +v.toFixed(3)); o.errOn = e1.map((v) => +v.toFixed(3));
    YAW = Math.PI / 2; ANIM.off = 1; place(); sim(1); const f0 = err(); ANIM.off = 0; place(); sim(1.2); const f1 = err(); YAW = 0;
    o.errOff = o.errOff.concat(f0.map((v) => +v.toFixed(3))); o.errOn = o.errOn.concat(f1.map((v) => +v.toFixed(3)));
    // idle breathes and shifts weight
    const mm = { Lkn: [9, -9], chX: [9, -9] }; sim(9, () => { for (const k in mm) { mm[k][0] = Math.min(mm[k][0], P.ps[k]); mm[k][1] = Math.max(mm[k][1], P.ps[k]); } }); o.idle = { Lkn: +(mm.Lkn[1] - mm.Lkn[0]).toFixed(3), chX: +(mm.chX[1] - mm.chX[0]).toFixed(3) }; o.idleMoves = o.idle.Lkn > .05 && o.idle.chX > .03;
    // run while turning: banks into the turn, nothing goes NaN
    place(); let bank = 0, nan = false; g.IN.mz = 1; P.sprintHeld = true; sim(3, () => { P.yaw += .03; bank = Math.max(bank, Math.abs(ANIM.yr)); for (const p of SK.GP) if (!isFinite(p[0] + p[1] + p[2])) nan = true; });
    g.IN.mz = 0; P.sprintHeld = false; o.yawRate = +bank.toFixed(2); o.nan = nan; place(); sim(1); return o; });
  const X = JSON.stringify(r); const ok = (n, c) => log(n, c, X);
  ok('eğim bulundu', r.slope > .03);
  ok('ayak IK: iki ayak da zeminde (<4 cm)', Math.max(...r.errOn) < .04);
  ok('ayak IK: IK kapalıya göre daha iyi', Math.max(...r.errOn) < Math.max(...r.errOff));
  ok('bekleme duruşu canlı (nefes, ağırlık aktarımı)', r.idleMoves);
  ok('dönüşte yatma için açısal hız ölçülüyor', r.yawRate > 1);
  ok('koşarken NaN yok', !r.nan);
  await G(() => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + .25; g.CAM.dist = 2.2; g.CAM.pitch = .02; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + .45; });
  await shot('anim-slope', { wait: 500 });
};
