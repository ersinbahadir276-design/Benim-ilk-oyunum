// Hero foot IK: on sloped ground both soles touch the terrain, pelvis drops, nothing breaks on flat ground, in the air or lying down.
module.exports = async ({ G, log, shot, page }) => {
  const r = await G(() => {
    const g = __G, P = g.P, DT = 1 / 60; g.GT.paused = true;
    const sim = (s) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (Math.hypot(a.x - x, a.z - z) < 80) { a.x += 500; a.hx = a.x; } };
    const fresh = (x, z, yaw) => { g.tp(x, z); far(x, z); Object.assign(P, { st: 'move', t: 0, spd: 0, vx: 0, vz: 0, vy: 0, air: false, yaw, inv: 99, pinBy: null, hp: 999 }); P.rag.ang = 0; P.crouch = false; for (const k in g.IN) if (typeof g.IN[k] === 'boolean') g.IN[k] = false; g.IN.mx = g.IN.mz = 0; };
    // find the steepest dry spot in a search grid, and the flattest one
    let best = null, flat = null;
    for (let x = -1300; x <= 1300; x += 23) for (let z = -1300; z <= 1300; z += 23) {
      const n = g.groundN(x, z), wet = (g.depthAt ? g.depthAt(x, z) : 0) > 0; if (wet) continue;
      const s = Math.acos(n[1]); if (s < .45 && (!best || s > best.s)) best = { x, z, s, n }; if (!flat || s < flat.s) flat = { x, z, s };
    }
    const o = { slopeDeg: +(best.s * 57.3).toFixed(1) };
    // stand across the slope (side-on: one foot uphill, one downhill)
    const across = Math.atan2(best.n[0], best.n[2]) + Math.PI / 2;
    const meas = () => { const c = g.footClear(g.PM); return [+c.left.toFixed(3), +c.right.toFixed(3)]; };
    fresh(best.x, best.z, across); g.FIK.on = false; sim(1); o.offAcross = meas();
    fresh(best.x, best.z, across); g.FIK.on = true; sim(1); o.onAcross = meas(); o.pel = +g.FIK.pel.toFixed(3);
    fresh(best.x, best.z, across + Math.PI / 2); sim(1); o.onUphill = meas();
    fresh(flat.x, flat.z, 0); sim(1); o.flat = meas(); o.flatPel = +g.FIK.pel.toFixed(3);
    // walking on the slope: every frame finite, soles never deeper than 6 cm into the ground
    const walk = (on) => { g.FIK.on = on; fresh(best.x, best.z, across); sim(.5); let worst = 0, nan = false; g.IN.mz = 1;
    for (let i = 0; i < 120; i++) { g.GT.time += DT; g.step(DT); const c = g.footClear(g.PM); worst = Math.min(worst, c.left, c.right); for (const v of g.SK.A) if (!isFinite(v)) { nan = true; break; } }
    g.IN.mz = 0; g.FIK.on = true; return [+worst.toFixed(3), nan]; };
    [o.walkOff] = walk(false); [o.walkWorst, o.nan] = walk(true);
    // jump: IK weight fades out in the air
    fresh(best.x, best.z, across); sim(.5); P.vy = 6.6; P.air = true; P.st = 'jump'; sim(.25); o.airW = +g.FIK.w.toFixed(2);
    // knocked down: IK off
    fresh(best.x, best.z, across); sim(.3); P.st = 'down'; P.t = 0; P.rag.ang = 1.2; g.GT.time += DT; g.step(DT); sim(.5); o.downW = +g.FIK.w.toFixed(2);
    g.FIK.on = true; fresh(best.x, best.z, across); sim(1); g.__lockCam = false;
    return o;
  });
  console.log(JSON.stringify(r));
  const bad = (a) => Math.max(Math.abs(a[0]), Math.abs(a[1]));
  log('eğim bulundu (>12°)', r.slopeDeg > 12, r.slopeDeg + '°');
  log('IK kapalıyken bir ayak havada/gömülü (sorun var)', bad(r.offAcross) > .06, r.offAcross);
  log('IK açıkken iki taban yerde (±4 cm, yan duruş)', bad(r.onAcross) < .04, r.onAcross);
  log('IK açıkken iki taban yerde (±4 cm, yokuş yukarı)', bad(r.onUphill) < .04, r.onUphill);
  log('kalça aşağı iniyor', r.pel < -.02, r.pel);
  log('düz zeminde dokunmuyor', bad(r.flat) < .03 && Math.abs(r.flatPel) < .01, r.flat + ' pel ' + r.flatPel);
  log('yokuşta yürürken ayak gömülmesi IK ile azaldı, NaN yok', r.walkWorst > -.03 && r.walkWorst > r.walkOff && !r.nan, 'açık ' + r.walkWorst + ' / kapalı ' + r.walkOff);
  log('havada IK sönüyor', r.airW < .2, r.airW);
  log('yerdeyken IK kapalı', r.downW < .1, r.downW);
  
  await shot('footik-slope', { wait: 400 });
};
