// Hero locomotion: terrain-adaptive feet (leg IK) and turn/acceleration lean
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, H = g.HB, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; if (f) f(i); g.step(DT); } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - x, a.z - z) < 60) { a.x += 400; a.hx = a.x; } };
    const grad = (x, z) => { const e = .5; return [(g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e)]; };
    // find a flat spot and a steady slope (gradient 0.3–0.6, roughly planar over 1 m) on dry land near the start
    let flat = null, slope = null;
    for (let x = -1300; x <= 1300 && !(flat && slope); x += 11) for (let z = -1300; z <= 1300; z += 11) {
      if (g.depthAt(x, z) > 0) continue; const [gx, gz] = grad(x, z), m = Math.hypot(gx, gz);
      if (!flat && m < .01) flat = [x, z];
      if (!slope && m > .25 && m < .6 && g.zoneAt(x, z) !== 'mountain') { const [hx, hz] = grad(x + .5, z + .5); if (Math.hypot(hx - gx, hz - gz) < .08) slope = [x, z, Math.atan2(gx, gz)]; }
    }
    const feet = () => ['left', 'right'].map((s) => { const w = g.mpt(g.PM, g.SK.GP[H[s + 'Foot']]); return w[1] - g.hAt(w[0], w[2]); });
    const stand = (x, z, yaw, on) => { g.FIK.on = on; g.tp(x, z); far(x, z); Object.assign(P, { st: 'move', t: 0, air: false, vx: 0, vz: 0, yaw, inv: 9, hp: 999 }); P.rag.ang = 0; sim(1); return feet(); };
    const o = { flat, slope };
    const f0 = stand(flat[0], flat[1], 0, 1); o.flat = f0.map((v) => +v.toFixed(3)); const rest = (f0[0] + f0[1]) / 2;
    o.flatOff = stand(flat[0], flat[1], 0, 0).map((v) => +v.toFixed(3));
    // stand across the slope: the feet are side by side, so one foot is uphill of the other
    const yaw = slope[2] + Math.PI / 2;
    const off = stand(slope[0], slope[1], yaw, 0), on = stand(slope[0], slope[1], yaw, 1);
    o.slopeOff = off.map((v) => +(v - rest).toFixed(3)); o.slopeOn = on.map((v) => +(v - rest).toFixed(3)); o.pel = +g.FIK.pel.toFixed(3);
    // facing uphill: foot pitched to the slope
    stand(slope[0], slope[1], slope[2], 1); const Fz = g.r3v(g.SK.GR[H.leftFoot], [0, 0, 1]); o.toeUp = +Fz[1].toFixed(3);
    // walking up/down/across the slope: feet never sink more than 4 cm into the ground
    let worst = 9, nan = false; g.FIK.on = 1; g.tp(slope[0] - Math.sin(slope[2]) * 6, slope[1] - Math.cos(slope[2]) * 6); P.yaw = slope[2];
    for (const dir of [0, Math.PI, Math.PI / 2]) { P.yaw = slope[2] + dir; P.st = 'move'; sim(1.2, () => { const sp = 2.5; P.x += Math.sin(P.yaw) * sp * DT; P.z += Math.cos(P.yaw) * sp * DT; P.ph += sp * DT * 4.3; P.spd = sp;
      const f = feet(); for (const v of f) { if (!isFinite(v)) nan = true; worst = Math.min(worst, v - rest); } }); }
    o.walkWorst = +worst.toFixed(3); o.nan = nan;
    // body lean: turning towards +X (yaw increasing) tilts the spine towards +X and turns the head into the turn
    stand(flat[0], flat[1], 0, 1); let spZ = 0, hdY = 0; P.st = 'move';
    g.CAM.yaw = P.yaw; g.IN.kz = 1; sim(.5); sim(.6, () => { g.CAM.yaw += 3 * DT; spZ = P.ps.spZ; hdY = P.ps.hdY; }); g.IN.kz = 0;
    o.lean = [+spZ.toFixed(3), +hdY.toFixed(3)];
    // jumping: IK releases (no correction in the air)
    stand(slope[0], slope[1], yaw, 1); P.air = true; P.st = 'jump'; P.vy = 6; sim(.25); o.air = [+g.FIK.L.toFixed(3), +g.FIK.R.toFixed(3)];
    stand(slope[0], slope[1], yaw, 1); g.GT.paused = false;
    return o;
  });
  const j = JSON.stringify(r);
  log('ayak IK: düz zeminde etkisiz (açık/kapalı aynı)', Math.abs(r.flat[0] - r.flatOff[0]) < .01 && Math.abs(r.flat[1] - r.flatOff[1]) < .01, j);
  log('ayak IK kapalıyken yokuşta bir ayak havada (sorun gerçekten var)', Math.max(...r.slopeOff.map(Math.abs)) > .04, JSON.stringify(r.slopeOff));
  log('ayak IK: yokuşta iki ayak da yere basıyor (±4 cm)', r.slopeOn.every((v) => Math.abs(v) < .04), JSON.stringify(r.slopeOn));
  log('ayak IK: kalça alçaktaki ayağa iniyor', r.pel < -.03, r.pel);
  log('ayak IK: yokuş yukarı bakınca ayak ucu kalkıyor', r.toeUp > .15, r.toeUp);
  log('ayak IK: yokuşta yürürken ayak zemine 4 cm\'den fazla gömülmüyor, NaN yok', r.walkWorst > -.04 && !r.nan, r.walkWorst);
  log('eğilme: dönüşe doğru gövde yatıyor, baş dönüşe bakıyor', r.lean[0] < -.05 && r.lean[1] > .05, JSON.stringify(r.lean));
  log('ayak IK: havada devre dışı', Math.abs(r.air[0]) < .03 && Math.abs(r.air[1]) < .03, JSON.stringify(r.air));
  await G(() => { const g = __G; g.CAM && (g.CAM.dist = 3.2); });
  await shot('anim-slope', { wait: 1200 });
};
