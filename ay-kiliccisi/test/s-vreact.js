// node test/harness.js test/s-vreact.js -> Veyra recoils along the push direction of an enemy blow (VREACT, 57-veyra.js):
// front → torso and head thrown back; behind → folds forward; side → bends and slides away; hair/tail lag behind.
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const setup = await G(() => { const g = __G, V = g.VEYRA; if (!V || !V.R) return false;
    V.on = true; V.st = 'follow'; V.hidden = false; V.down = false; g.tp(30, 420); V.x = g.P.x + 2; V.z = g.P.z + 2; V.y = g.hAt(V.x, V.z); return true; });
  log('Veyra hazır', setup);
  if (!setup) return;
  // hit from direction ang (0 = from the front); sample the drawn pose for 0.75 s
  const hit = (ang, opts) => G(([ang, opts]) => {
    const g = __G, V = g.VEYRA, yaw = .4, buf = new Float32Array(V.R.def.length * 12);
    g.VREACT.on = opts.off ? 0 : 1;
    Object.assign(V, { yaw, hyaw: 0, spd: 0, ph: 0, act: opts.act || null, actT: .1, hit: false, think: 0, hp: 999, max: 999, down: false, hrT: undefined, kx: 0, kz: 0, flash: 0 });
    const meas = () => { const { r } = g.veyraPose(V, 1); g.rigFK(V.R.def, r, [0, 0, 0], V.yaw, 1, buf); const W = V.R.def.WP, R = V.R.def.WR[15];
      const tip = g.r3v(R, [0, -.3, 0]); return { head: [W[2][0] - W[0][0], W[2][2] - W[0][2]], hair: [W[15][0] + tip[0] - W[2][0], W[15][2] + tip[2] - W[2][2]], nan: r.some((m) => m && m.some((v) => !isFinite(v))) }; };
    const m0 = meas(), a = yaw + ang, d = [-Math.sin(a), -Math.cos(a)], x0 = V.x, z0 = V.z;
    g.vHurt(opts.dmg || 12, d[0], d[1], opts.a || .67);
    const act = V.act;
    let best = -9, hairMin = 9, rebound = 9, nan = false, end = 0;
    for (let f = 0; f < 45; f++) { g.GT.clock += 1 / 60; const m = meas(); if (m.nan) nan = true;
      const along = (m.head[0] - m0.head[0]) * d[0] + (m.head[1] - m0.head[1]) * d[1];
      if (along > best) best = along; if (f > 12) rebound = Math.min(rebound, along); end = along;
      if (f < 10) hairMin = Math.min(hairMin, (m.hair[0] - m0.hair[0]) * d[0] + (m.hair[1] - m0.hair[1]) * d[1]); }
    // knockback slide: run her update with the fight away
    const kx = V.kx, kz = V.kz; let sl = 0; for (let f = 0; f < 30; f++) { sl += Math.hypot(V.kx, V.kz) / 60; const e = Math.exp(-9 / 60); V.kx *= e; V.kz *= e; }
    V.x = x0; V.z = z0; V.kx = V.kz = 0; g.VREACT.on = 1;
    return { act, along: +best.toFixed(3), hair: +hairMin.toFixed(3), rebound: +rebound.toFixed(3), end: +end.toFixed(3), slide: +sl.toFixed(3), slideDir: +((kx * d[0] + kz * d[1]) / (Math.hypot(kx, kz) || 1)).toFixed(2), nan };
  }, [ang, opts || {}]);
  const dirs = { 'önden': 0, 'arkadan': Math.PI, 'soldan': Math.PI / 2, 'sağdan': -Math.PI / 2 }, R = {};
  for (const [n, a] of Object.entries(dirs)) R[n] = await hit(a);
  for (const n of Object.keys(dirs)) log(`${n}: baş itiş yönüne gidiyor (≥ 6 cm)`, R[n].along >= .06, JSON.stringify(R[n]));
  log('saç vuruşun tersine geride kalıyor', Object.values(R).every((r) => r.hair < -.005), Object.values(R).map((r) => r.hair));
  log('itiş yönünde kayıyor (10–40 cm)', Object.values(R).every((r) => r.slideDir > .99 && r.slide > .1 && r.slide < .4), Object.values(R).map((r) => r.slide));
  log('NaN yok, 0,75 sn sonra eski poza dönüyor (< 5 mm)', Object.values(R).every((r) => !r.nan && Math.abs(r.end) < .005), Object.values(R).map((r) => r.end));
  log('geri tepme küçük ve ters yönde', Object.values(R).every((r) => r.rebound < 0 && r.rebound > -r.along * .5), Object.values(R).map((r) => r.rebound));
  const old = await hit(Math.PI / 2, { off: 1 });
  log('eski davranış: hiç tepki yoktu (karşılaştırma)', old.along < .005 && old.slide === 0, JSON.stringify(old));
  const sl = await hit(Math.PI / 2, { act: 'slash' });
  log('kesik sırasında hafif vuruş: hamle sürüyor, küçük irkilme', sl.act === 'slash' && sl.along > .015 && sl.along < R['soldan'].along * .6, JSON.stringify(sl));
  const hv = await hit(0, { act: 'heal', dmg: 26, a: 1 });
  log('ağır vuruş (boss/büyük goblin) iyileştirme büyüsünü kesiyor', hv.act === null && hv.along > R['önden'].along, JSON.stringify(hv));
  const hl = await hit(0, { act: 'heal' });
  log('hafif vuruş iyileştirmeyi kesmiyor', hl.act === 'heal', JSON.stringify(hl));
  // real path: a goblin swing that lands on her goes through vHurt
  const real = await G(() => { const g = __G, V = g.VEYRA, o = g.GOBS.find((x) => !x.big && !x.skel && !x.dead); if (!o) return null;
    Object.assign(V, { act: null, hp: 999, max: 999, down: false, hrT: undefined, kx: 0, kz: 0 }); o.x = V.x + 1.2; o.z = V.z; o.yaw = Math.atan2(V.x - o.x, V.z - o.z); o.st = 'windup'; o._vw = 0; o.aware = 1; V.cd.dodge = 99; V.think = 9;
    const fh = g.foeHostile ? g.foeHostile(o) : true; g.updateVeyra && g.updateVeyra(1 / 60); o.st = 'strike'; g.updateVeyra && g.updateVeyra(1 / 60);
    return { fh, hrT: V.hrT !== undefined, hp: V.hp, kx: +V.kx.toFixed(2) }; });
  log('gerçek goblin vuruşu tepkiyi tetikliyor', real && real.hrT && real.hp < 999 && real.kx < 0, JSON.stringify(real));
  // screenshot: hit from the left, held at the peak
  await G(() => { const g = __G, V = g.VEYRA, P = g.P; Object.assign(V, { act: null, spd: 0, hp: 999, kx: 0, kz: 0, yaw: P.yaw }); V.x = P.x + Math.sin(P.yaw) * 2.5; V.z = P.z + Math.cos(P.yaw) * 2.5; V.y = g.hAt(V.x, V.z);
    const a = V.yaw + Math.PI / 2; g.vHurt(14, -Math.sin(a), -Math.cos(a), 1); V.kx = V.kz = 0; V.hrT = g.GT.clock - .07; g.GT.paused = true;
    g.__lockCam = 1; g.CAM.yaw = V.yaw + Math.PI; g.CAM.dist = 3.2; g.CAM.pitch = .1; g.CAM.tx = V.x; g.CAM.tz = V.z; g.CAM.ty = V.y + 1; });
  await shot('vreact-left', { wait: 400 });
};
