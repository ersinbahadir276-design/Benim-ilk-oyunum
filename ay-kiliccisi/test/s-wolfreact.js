// node test/harness.js test/s-wolfreact.js  -> wolves recoil along the push direction of a hit (WREACT, 40-wolves.js):
// front hit → rears up, head thrown back; from behind → head dips forward; from the side → body rolls and slides away.
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const flat = await G(() => { const g = __G; for (let r = 5; r < 600; r += 5) for (let a = 0; a < 6.28; a += .3) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = 1; if (Math.abs(g.hAt(x + e, z) - g.hAt(x - e, z)) + Math.abs(g.hAt(x, z + e) - g.hAt(x, z - e)) < .004 && g.depthAt(x, z) <= 0) return { x, z }; } return null; });
  log('düz zemin bulundu', !!flat);
  if (!flat) return;
  // hit the wolf from direction ang (0 = from the front), then draw 0.6 s; track the nose relative to the wolf's ground spot
  const hit = (ang, opts) => G(([sp, ang, opts]) => {
    const g = __G, w = g.wolves[0], yaw = .7, Pp = { x: sp.x + 4, z: sp.z + 4 };
    g.WREACT.on = opts.off ? 0 : 1;
    Object.assign(w, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw, st: opts.st || 'idle', t: 0, spd: 0, air: 0, dead: 0, roll: 0, crouch: 0, pitch: 0, hyaw: 0, hpit: 0, jaw: 0, tail: 0,
      hp: 999, max: 60, tame: false, lastHit: -99, combo: 0, kx: 0, kz: 0, hrT: undefined, gp: undefined, gd: undefined, pl: null });
    const slot = () => g.wslots.find((q) => q.w === w), nose = () => { const s = slot(); return g.mpt(s.head.M, [0, 0, .3]); };
    for (let f = 0; f < 6; f++) g.drawWolves(Pp, f / 30);
    const n0 = nose(), a = yaw + ang, d = [-Math.sin(a), -Math.cos(a)];
    g.wolfHurt(w, opts.dmg || 12, d[0], d[1], g.P);
    const st = w.st; w.kx = w.kz = 0; // keep the knockback slide out of the measurement: only the drawn recoil counts
    let best = -9, worstPaw = 0, nan = false, maxRoll = 0, end = 0, rebound = 9;
    for (let f = 0; f < 36; f++) { g.GT.clock += 1 / 60; g.drawWolves(Pp, f / 60); const n = nose(), along = (n[0] - n0[0]) * d[0] + (n[2] - n0[2]) * d[1];
      if (along > best) best = along; if (f > 10) rebound = Math.min(rebound, along); end = along;
      const s = slot(); for (const l of s.legs) { const p = g.mpt(l[1].M, [0, -g.W_LO - .025, 0]); if (p.some((v) => !isFinite(v))) nan = true; worstPaw = Math.max(worstPaw, Math.abs(p[1] - g.hAt(p[0], p[2]))); } }
    for (let f = 0; f < 20; f++) { g.GT.clock += 1 / 60; g.drawWolves(Pp, f / 60); }
    const n2 = nose(); g.WREACT.on = 1;
    return { st, along: +best.toFixed(3), rebound: +rebound.toFixed(3), settle: +Math.hypot(n2[0] - n0[0], n2[2] - n0[2]).toFixed(3), paw: +worstPaw.toFixed(3), nan };
  }, [flat, ang, opts || {}]);
  const dirs = { 'önden': 0, 'arkadan': Math.PI, 'soldan': Math.PI / 2, 'sağdan': -Math.PI / 2 }, R = {};
  for (const [n, a] of Object.entries(dirs)) R[n] = await hit(a);
  log('vuruş kurdu sarsıntı durumuna geçiriyor', Object.values(R).every((r) => r.st === 'hurt'), Object.values(R).map((r) => r.st));
  for (const n of Object.keys(dirs)) log(`${n}: burun itiş yönüne gidiyor (≥ 6 cm)`, R[n].along >= .06, JSON.stringify(R[n]));
  log('NaN yok, patiler zeminde (sapma < 6 cm)', Object.values(R).every((r) => !r.nan && r.paw < .06), Object.values(R).map((r) => r.paw));
  log('0,9 sn sonra eski yerine oturuyor (< 1 cm)', Object.values(R).every((r) => r.settle < .01), Object.values(R).map((r) => r.settle));
  log('geri tepme (takip hareketi) küçük ve ters yönde', Object.values(R).every((r) => r.rebound < 0 && r.rebound > -r.along * .5), Object.values(R).map((r) => r.rebound));
  const old = await hit(Math.PI / 2, { off: 1 });
  log('eski tepki: yandan vuruşta gövde yana gitmiyordu (karşılaştırma)', old.along < R['soldan'].along * .4, old.along + ' → ' + R['soldan'].along);
  const sh = await hit(Math.PI / 2, { st: 'windup' });
  log('saldırıya hazırlanırken vurulan kurt saldırıyı sürdürüyor, küçük irkilme', sh.st === 'windup' && sh.along > .02 && sh.along < R['soldan'].along * .6, JSON.stringify(sh));
  // screenshot: side hit, mid-recoil
  await G((sp) => { const g = __G, w = g.wolves[0]; Object.assign(w, { x: sp.x, z: sp.z, y: g.hAt(sp.x, sp.z), yaw: .7, st: 'hurt', t: 0, calm: 999, spd: 0, lastHit: -99, combo: 0 }); g.tp(sp.x + 3, sp.z + 3);
    const a = w.yaw + Math.PI / 2; g.wolfHurt(w, 14, -Math.sin(a), -Math.cos(a), g.P); w.kx = w.kz = 0; w.hrT = g.GT.clock - .07; // paused: held at the peak
    g.__lockCam = 1; g.CAM.yaw = w.yaw + Math.PI; g.CAM.dist = 3.2; g.CAM.pitch = .08; g.CAM.tx = w.x; g.CAM.tz = w.z; g.CAM.ty = w.y + .5; }, flat);
  await shot('wolfreact-side', { wait: 50 });
};
module.exports.pauseAtStart = true;
