// Foot IK on slopes: both feet sit on the ground under them; flat ground unchanged; walking on a slope stays planted
module.exports = async ({ G, log, shot, page }) => {
  const r = await G(() => { const g = __G, P = g.P, SK = g.SK, H = g.HB, IN = g.IN, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(); } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - x, a.z - z) < 60) { a.x += 400; a.hx = a.x; } };
    const rest = SK.rest[H.leftFoot][1];
    const grad = (x, z) => [(g.hAt(x + .5, z) - g.hAt(x - .5, z)), (g.hAt(x, z + .5) - g.hAt(x, z - .5))];
    // a steady slope (gradient 0.25..0.6) away from water, near the start area
    let spot = null; for (let R = 20; R < 700 && !spot; R += 6) for (let a = 0; a < 6.28 && !spot; a += .19) { const x = 30 + Math.cos(a) * R, z = 420 + Math.sin(a) * R, [gx, gz] = grad(x, z), s = Math.hypot(gx, gz);
      if (s > .25 && s < .6 && g.depthAt(x, z) <= 0) { const [hx, hz] = grad(x + 1, z + 1); if (Math.abs(Math.hypot(hx, hz) - s) < .08) spot = [x, z, Math.atan2(gx, gz), s]; } }
    if (!spot) return { spot: null };
    const [x, z, dir, slope] = spot; far(x, z);
    const place = (yaw, noIK) => { g.tp(x, z); Object.assign(P, { st: 'move', t: 0, air: false, yaw, noIK, pinBy: null, alive: true, hp: 999 }); P.rag.ang = 0; P.ikW = 0; P.ikDrop = 0; IN.mx = 0; IN.mz = 0; sim(.8); };
    const err = () => { const PM = g.PM; return ['leftFoot', 'rightFoot'].map((b) => { const w = g.mpt(PM, SK.GP[H[b]]); return +(w[1] - g.hAt(w[0], w[2]) - rest).toFixed(3); }); };
    // side-on to the slope: one foot uphill, the other downhill
    const side = dir + Math.PI / 2, o = { spot: [+x.toFixed(1), +z.toFixed(1), +slope.toFixed(2)] };
    place(side, true); o.off = err(); place(side, false); o.on = err(); o.info = P.ikInfo;
    // facing uphill / downhill
    place(dir, false); o.up = err(); place(dir + Math.PI, false); o.down = err();
    // flat ground: IK changes nothing
    let flat = null; for (let R = 0; R < 400 && !flat; R += 5) for (let a = 0; a < 6.28 && !flat; a += .3) { const fx = 30 + Math.cos(a) * R, fz = 420 + Math.sin(a) * R, [gx, gz] = grad(fx, fz); if (Math.hypot(gx, gz) < .01 && g.depthAt(fx, fz) <= 0) flat = [fx, fz]; }
    if (flat) { g.tp(...flat); Object.assign(P, { st: 'move', air: false, yaw: 0, noIK: false }); sim(.5); o.flat = [err(), +(P.ikInfo ? P.ikInfo.drop : 0).toFixed(3)]; }
    // walk along the slope (side-on) for 2 s: feet never sink deep into the ground, toe-off tilts the trailing foot
    place(side, false); let worst = 0, toe = 0; IN.mz = 1; IN.mx = 0;
    sim(2, () => { const e = err(); worst = Math.min(worst, e[0], e[1]); toe = Math.max(toe, Math.abs(P.ps.LftX), Math.abs(P.ps.RftX)); });
    IN.mz = 0; o.walk = [+worst.toFixed(3), +toe.toFixed(2), P.st, +P.spd.toFixed(2)];
    // dodge roll on the slope: IK fades out (no fight with the roll)
    place(side, false); g.press('dodge'); sim(.15); o.dodge = [P.st, +(P.ikW || 0).toFixed(2)];
    place(side, false); return o; });
  const j = JSON.stringify(r);
  if (!r.spot) { log('ayak IK: eğimli yer bulundu', false, j); return; }
  const mx = (a) => Math.max(Math.abs(a[0]), Math.abs(a[1]));
  log('ayak IK: eğimli yer bulundu', true, JSON.stringify(r.spot));
  log('ayak IK kapalıyken bir ayak havada / gömülü (karşılaştırma)', mx(r.off) > 0.06, JSON.stringify(r.off));
  log('ayak IK: yan dururken iki ayak da yerde (±4 cm)', mx(r.on) < 0.04, JSON.stringify([r.on, r.info]));
  log('ayak IK: yokuş yukarı / aşağı bakarken de yerde (±5 cm)', mx(r.up) < 0.05 && mx(r.down) < 0.05, JSON.stringify([r.up, r.down]));
  log('ayak IK: düz zeminde gövde inmiyor', r.flat && Math.abs(r.flat[1]) < 0.005 && mx(r.flat[0]) < 0.03, JSON.stringify(r.flat));
  log('yürüyüş: yokuşta ayak 6 cm\'den fazla gömülmüyor, parmak itişi var', r.walk[0] > -0.06 && r.walk[1] > 0.1, JSON.stringify(r.walk));
  log('kaçınma: IK sönüyor', r.dodge[0] === 'dodge' && r.dodge[1] < 0.95, JSON.stringify(r.dodge));
  await shot('footik-slope', { wait: 400 });
};
