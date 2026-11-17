// node test/harness.js test/s-rigfik.js  -> terrain foot IK for humanoid rigs (villagers, guards, goblins, skeletons)
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
  // measure ankle-to-ground error for one rig placed at the spot facing `yaw`, with the given pose params
  const meas = (kind, yawOff, q, on) => G(([sp, kind, yawOff, q, on]) => {
    const g = __G, src = kind === 'gob' ? g.GOBS.find((o) => !o.big && !o.skel) : kind === 'skel' ? g.GOBS.find((o) => o.skel) : kind === 'big' ? g.GOBS.find((o) => o.big) : g.NPCS.find((n) => n.kind === kind);
    if (!src) return null; const def = src.R.def, sc = src.sc, gy = g.hAt(sp.x, sp.z), yaw = sp.up + yawOff;
    const th = Math.hypot(...def[10].o), sh = Math.hypot(...def[11].o), y0 = gy + (th + sh + .06) * sc;
    const pose = () => g.humanPose(Object.assign({}, q)), tmp = new Float32Array(22 * 12);
    // rest ankle height above the ground: same pose on flat ground (FK only)
    g.rigFK(def, pose(), [0, 0, 0], yaw, sc, tmp, null); const rest = [def.WP[11][1] + (th + sh + .06) * sc, def.WP[14][1] + (th + sh + .06) * sc];
    const rot = pose(); g.RFIK.on = on; const drop = g.rigFootIK(def, rot, sp.x, y0, sp.z, yaw, sc, gy, null); g.RFIK.on = 1;
    g.rigFK(def, rot, [sp.x, y0 + drop, sp.z], yaw, sc, tmp, null);
    const err = [11, 14].map((f, i) => def.WP[f][1] - g.hAt(def.WP[f][0], def.WP[f][2]) - rest[i]);
    const thighs = [9, 12].map((t, i) => Math.hypot(...[0, 1, 2].map((k) => def.WP[t + 2][k] - def.WP[t][k])) / ((th + sh) * sc));
    const nan = def.WP.some((p) => p.some((v) => !isFinite(v)));
    return { err: err.map((v) => +v.toFixed(3)), drop: +drop.toFixed(3), reach: thighs.map((v) => +v.toFixed(3)), nan };
  }, [spot, kind, yawOff, q, on]);
  const stand = { hdP: -.05 };
  for (const kind of ['villager', 'guard', 'gob', 'skel', 'big']) {
    const off = await meas(kind, Math.PI / 2, stand, 0), on = await meas(kind, Math.PI / 2, stand, 1);
    if (!off || !on) { log(kind + ': model bulundu', false); continue; }
    const gOff = Math.max(...off.err.map(Math.abs)), gOn = Math.max(...on.err.map(Math.abs));
    log(kind + ': yan eğimde iki ayak zeminde (±3 cm)', gOn < .03 && !on.nan && gOn < gOff * .25, `kapalı ${gOff.toFixed(3)} → açık ${gOn.toFixed(3)}, kalça ${on.drop}`);
    log(kind + ': bacak aşırı gerilmiyor', Math.max(...on.reach) <= 1.0, on.reach.join(','));
  }
  // walking uphill and downhill through a full gait cycle stays planted (the swinging foot may be above the ground)
  let worst = 0, nan = false;
  for (const yo of [0, Math.PI]) for (let i = 0; i < 12; i++) {
    const q = { hdP: -.05 }; await G(([q, ph]) => __G.gaitPose(q, ph, 1, 0), [q, i / 12 * 6.283]).then((r) => Object.assign(q, r));
    const r = await meas('villager', yo, q, 1); worst = Math.min(worst, ...r.err); nan = nan || r.nan;
  }
  log('yokuş yukarı/aşağı yürüyüşte ayak zemine gömülmüyor (≥ −3 cm)', worst > -.03 && !nan, worst.toFixed(3));
  // flat ground: nothing changes
  const flat = await G(() => { const g = __G; for (let r = 5; r < 400; r += 5) for (let a = 0; a < 6.28; a += .3) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = .9; if (Math.abs(g.hAt(x + e, z) - g.hAt(x - e, z)) + Math.abs(g.hAt(x, z + e) - g.hAt(x, z - e)) < .004) {
    const n = g.NPCS[0], rot = g.humanPose({}), before = JSON.stringify(rot), d = g.rigFootIK(n.R.def, rot, x, g.hAt(x, z) + 1, z, 0, n.sc, g.hAt(x, z), null); return { d, same: before === JSON.stringify(rot) }; } } return null; });
  log('düz zeminde poz ve kalça değişmiyor', flat && Math.abs(flat.d) < .003, JSON.stringify(flat));
  // in-game: a villager walked onto the slope renders with planted feet and no errors
  await G((sp) => { const g = __G, n = g.NPCS[0]; n.x = sp.x; n.z = sp.z; n.y = g.hAt(sp.x, sp.z); n.st = 'watch'; n.t = 0; g.tp(sp.x + 2.5, sp.z + 1); g.GT.paused = false; }, spot);
  await page.waitForTimeout(600);
  const live = await G(() => __G.RFIK.last && { drop: +__G.RFIK.last.drop.toFixed(3) });
  log('oyunda çizimde IK çalışıyor', !!live, JSON.stringify(live));
  await G((sp) => { const g = __G, n = g.NPCS[0]; g.__lockCam = 1; g.CAM.yaw = n.yaw + Math.PI / 2; g.CAM.dist = 3.6; g.CAM.pitch = .05; g.CAM.tx = n.x; g.CAM.tz = n.z; g.CAM.ty = n.y + .8; }, spot);
  await shot('rigfik-villager-on', { wait: 500 });
  await G(() => { __G.RFIK.on = 0; });
  await shot('rigfik-villager-off', { wait: 500 });
  await G(() => { __G.RFIK.on = 1; });
};
module.exports.pauseAtStart = true;
