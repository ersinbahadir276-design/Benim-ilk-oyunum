// node test/harness.js test/s-wolfik.js  -> wolves stand on slopes: body pitches with the ground, every paw reaches it
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const spot = await G(() => {
    const g = __G; let best = null;
    for (let r = 20; r < 1900 && !best; r += 8) for (let a = 0; a < 6.28; a += 8 / r) {
      const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = .6; if (Math.abs(x) > 1350 || Math.abs(z) > 1350) continue;
      const hx = (g.hAt(x + e, z) - g.hAt(x - e, z)) / (2 * e), hz = (g.hAt(x, z + e) - g.hAt(x, z - e)) / (2 * e), s = Math.hypot(hx, hz);
      if (s > .4 && s < .65 && g.depthAt(x, z) <= 0) { best = { x, z, s, up: Math.atan2(hx, hz) }; break; }
    }
    return best;
  });
  log('eğimli zemin bulundu', !!spot, spot && spot.s.toFixed(2));
  if (!spot) return;
  // place the nearest wolf at (x,z) facing yaw in a given state, draw it a number of frames, return paw-sole heights above ground
  const meas = (x, z, yaw, on, spd = 0) => G(([x, z, yaw, on, spd]) => {
    const g = __G; g.WFIK.on = on; const w = g.wolves[0];
    Object.assign(w, { x, z, y: g.hAt(x, z), yaw, st: 'idle', spd, air: 0, dead: 0, roll: 0, crouch: 0, pitch: 0, gp: undefined, gd: undefined, tame: false });
    const P = { x: x + 3, z: z + 3 }; let s = null, worst = 0, nan = false;
    for (let f = 0; f < 30; f++) { if (spd) w.ph += .12; g.drawWolves(P, f / 30); s = g.wslots.find((q) => q.w === w); }
    const e = s.legs.map((l) => { const p = g.mpt(l[1].M, [0, -g.W_LO - .025, 0]); if (p.some((v) => !isFinite(v))) nan = true; return p[1] - g.hAt(p[0], p[2]); });
    g.WFIK.on = 1; return { e: e.map((v) => +v.toFixed(3)), gp: +(w.gp || 0).toFixed(3), gd: +(w.gd || 0).toFixed(3), nan };
  }, [x, z, yaw, on, spd]);
  // flat reference: sole height when standing on level ground
  const flatSpot = await G(() => { const g = __G; for (let r = 5; r < 600; r += 5) for (let a = 0; a < 6.28; a += .3) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = 1; if (Math.abs(g.hAt(x + e, z) - g.hAt(x - e, z)) + Math.abs(g.hAt(x, z + e) - g.hAt(x, z - e)) < .004 && g.depthAt(x, z) <= 0) return { x, z }; } return null; });
  log('düz zemin bulundu', !!flatSpot);
  const flatOn = await meas(flatSpot.x, flatSpot.z, 0, 1), flatOff = await meas(flatSpot.x, flatSpot.z, 0, 0);
  const ref = flatOn.e.reduce((a, b) => a + b) / 4;
  log('düz zeminde aynı duruş (açık = kapalı)', flatOn.e.every((v, i) => Math.abs(v - flatOff.e[i]) < .003) && Math.abs(flatOn.gp) < .02, `${flatOn.e} / ${flatOff.e}`);
  for (const [name, off] of [['yokuş yukarı', 0], ['yokuş aşağı', Math.PI], ['yan eğim', Math.PI / 2]]) {
    const yaw = spot.up + off, a = await meas(spot.x, spot.z, yaw, 0), b = await meas(spot.x, spot.z, yaw, 1);
    const ea = Math.max(...a.e.map((v) => Math.abs(v - ref))), eb = Math.max(...b.e.map((v) => Math.abs(v - ref)));
    log(`${name}: dört pati zeminde (±4 cm)`, eb < .04 && !b.nan && (eb < ea || ea < .01), `kapalı ${ea.toFixed(3)} → açık ${eb.toFixed(3)}, eğim ${b.gp}, çökme ${b.gd}`);
    log(`${name}: hiçbir pati zemine gömülmüyor`, Math.min(...b.e) - ref > -.03, b.e.join(','));
  }
  // uphill body pitch is nose-up (negative), downhill nose-down
  const up = await meas(spot.x, spot.z, spot.up, 1), dn = await meas(spot.x, spot.z, spot.up + Math.PI, 1);
  log('gövde eğime göre burun yukarı / aşağı', up.gp < -.2 && dn.gp > .2, `${up.gp} / ${dn.gp}`);
  // trotting across the slope: stance paws never sink below the ground
  let worst = 0, nan = false;
  for (const off of [0, Math.PI, Math.PI / 2]) { const r = await meas(spot.x, spot.z, spot.up + off, 1, 2); worst = Math.min(worst, ...r.e.map((v) => v - ref)); nan = nan || r.nan; }
  log('eğimde yürürken pati gömülmüyor (≥ −4 cm)', worst > -.04 && !nan, worst.toFixed(3));
  // in-game render with the wolf on the slope
  await G((sp) => { const g = __G, w = g.wolves[0]; Object.assign(w, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: sp.up + Math.PI / 2, st: 'idle', calm: 999, spd: 0 }); g.tp(sp.x + 3, sp.z + 2);
    g.__lockCam = 1; g.CAM.yaw = w.yaw + Math.PI / 2; g.CAM.dist = 3.2; g.CAM.pitch = .05; g.CAM.tx = w.x; g.CAM.tz = w.z; g.CAM.ty = w.y + .5; g.GT.paused = false; }, spot);
  await shot('wolfik-on', { wait: 600 });
  await G(() => { __G.WFIK.on = 0; });
  await shot('wolfik-off', { wait: 600 });
  await G(() => { __G.WFIK.on = 1; });
};
module.exports.pauseAtStart = true;
