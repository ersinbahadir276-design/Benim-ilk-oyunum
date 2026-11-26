// Animation realism layer: foot IK on slopes, gait pelvis roll, idle weight shift, lean into turns
module.exports = async ({ G, log }) => {
  const r = await G(() => { const g = __G, P = g.P, H = g.HB, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(); } };
    for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss) { a.x += 3000; a.hx = a.x; }
    const W = (b) => g.mpt(g.PM, g.SK.GP[b]);
    const stand = (x, z, yaw) => { g.tp(x, z); Object.assign(P, { st: 'move', t: 0, air: false, yaw, spd: 0, crouch: false, sprinting: false }); P.anim = null; P.rag.ang = 0; };
    const o = {};
    // flat reference: ankle height above terrain when standing on level ground
    let flat = null; for (let i = 0; i < 4000 && !flat; i++) { const x = -900 + (i % 63) * 29, z = -900 + Math.floor(i / 63) * 29, h = g.hAt(x, z);
      if (Math.abs(g.hAt(x + .4, z) - h) + Math.abs(g.hAt(x, z + .4) - h) < .004 && g.zoneAt(x, z) !== 'lake') flat = [x, z]; }
    stand(flat[0], flat[1], 0); sim(1.5); const aL = W(H.leftFoot), ankle0 = aL[1] - g.hAt(aL[0], aL[2]);
    // a slope across the body: gradient 0.2..0.45 along x
    let sl = null; for (let i = 0; i < 6000 && !sl; i++) { const x = -1200 + (i % 77) * 31, z = -1200 + Math.floor(i / 77) * 31, gx = (g.hAt(x + .2, z) - g.hAt(x - .2, z)) / .4, gz = (g.hAt(x, z + .2) - g.hAt(x, z - .2)) / .4;
      if (Math.abs(gx) > .2 && Math.abs(gx) < .45 && Math.abs(gz) < .08) sl = [x, z, gx]; }
    o.slope = sl && +sl[2].toFixed(2);
    stand(sl[0], sl[1], 0); sim(1.5);
    const err = (b) => { const w = W(b); return w[1] - g.hAt(w[0], w[2]) - ankle0; };
    o.errL = +err(H.leftFoot).toFixed(3); o.errR = +err(H.rightFoot).toFixed(3);
    const wl = W(H.leftFoot), wr = W(H.rightFoot); o.noIK = +Math.abs(g.hAt(wl[0], wl[2]) - g.hAt(wr[0], wr[2])).toFixed(3);
    o.kneeDiff = +Math.abs(P.ps.Lkn - P.ps.Rkn).toFixed(2);
    // idle weight shift: the knee bends on the side whose hip is lower
    stand(flat[0], flat[1], 0); let agree = 0, n = 0; sim(12, () => { const hl = W(H.leftUpperLeg)[1], hr = W(H.rightUpperLeg)[1]; if (Math.abs(hl - hr) > .004) { n++; if ((hl < hr) === (P.ps.Lkn > P.ps.Rkn)) agree++; } });
    o.idleAgree = n ? +(agree / n).toFixed(2) : 0;
    // gait: the swing leg (more bent knee) has the lower hip
    stand(flat[0], flat[1], 0); agree = 0; n = 0; g.IN.mz = .7; sim(3, () => { const hl = W(H.leftUpperLeg)[1], hr = W(H.rightUpperLeg)[1]; if (Math.abs(P.ps.Lkn - P.ps.Rkn) > .3 && Math.abs(hl - hr) > .003) { n++; if ((hl < hr) === (P.ps.Lkn > P.ps.Rkn)) agree++; } });
    o.gaitAgree = n ? +(agree / n).toFixed(2) : 0; o.gaitN = n; o.walkSpd = +P.spd.toFixed(2);
    // turn lean: head shifts toward the inside of the turn (the way the velocity is turning)
    const lean = (dir) => { stand(flat[0], flat[1], 0); g.IN.mz = 1; const c0 = g.CAM.yaw; let p0, p1, p2; sim(1.6, () => { g.CAM.yaw += dir * 1.6 * DT; });
      p0 = [P.x, P.z]; sim(.05, () => { g.CAM.yaw += dir * 1.6 * DT; }); p1 = [P.x, P.z]; sim(.05, () => { g.CAM.yaw += dir * 1.6 * DT; }); p2 = [P.x, P.z];
      const cen = [(p2[0] - p1[0]) - (p1[0] - p0[0]), (p2[1] - p1[1]) - (p1[1] - p0[1])], hd = W(H.head), hp = W(H.hips), off = [hd[0] - hp[0], hd[2] - hp[2]];
      g.CAM.yaw = c0; g.IN.mz = 0; const cl = Math.hypot(...cen) || 1; return +((off[0] * cen[0] + off[1] * cen[1]) / cl).toFixed(4); };
    o.leanL = lean(1); o.leanR = lean(-1); o.leanNone = (() => { stand(flat[0], flat[1], 0); g.IN.mz = 1; sim(1.6); const hd = W(H.head), hp = W(H.hips); g.IN.mz = 0; return +P.anim.yr.toFixed(3); })();
    return o; });
  log('düz zeminde ayak bileği referansı + eğim bulundu', r.slope, JSON.stringify(r));
  log('eğimde iki ayak da zemine basıyor (IK, ±3 cm)', Math.abs(r.errL) < .03 && Math.abs(r.errR) < .03, `sol ${r.errL} sağ ${r.errR}, IK'sız fark ${r.noIK}`);
  log('eğimde yukarıdaki diz bükülüyor', r.kneeDiff > .1, r.kneeDiff);
  log('bekleme: ağırlık aktarımı, alçak kalça tarafındaki diz bükük', r.idleAgree > .8, r.idleAgree);
  log('yürüyüş: salınan bacağın kalçası düşük', r.gaitAgree > .8, r.gaitAgree);
  log('dönüşte gövde içe yatıyor (iki yön)', r.leanL > 0 && r.leanR > 0, `${r.leanL} ${r.leanR}`);
};
