// node test/harness.js test/s-crocreact.js  -> crocodiles recoil along the push of a hit (CREACT, 48-croc.js):
// front hit → head thrown up/back, jaw gapes; from behind → tail whips up, body shoved forward; from the side → body slides
// and rolls away while head and tail lag (C-bow, head stays turned toward the attacker).
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const flat = await G(() => { const g = __G; for (let r = 5; r < 900; r += 5) for (let a = 0; a < 6.28; a += .3) { const x = g.P.x + Math.cos(a) * r, z = g.P.z + Math.sin(a) * r, e = 2;
    if (Math.abs(g.hAt(x + e, z) - g.hAt(x - e, z)) + Math.abs(g.hAt(x, z + e) - g.hAt(x, z - e)) < .004 && g.waterAt(x, z) < g.hAt(x, z) - .5) return { x, z }; } return null; });
  log('düz kuru zemin bulundu', !!flat);
  if (!flat) return;
  // hit croc 0 from direction ang (0 = from the front), draw 0.6 s; track the snout tip, tail tip and root against the pre-hit pose
  const hit = (ang, opts) => G(([sp, ang, opts]) => {
    const g = __G, c = g.CROCS[0], yaw = .7; g.CREACT.on = opts.off ? 0 : 1;
    Object.assign(c, { x: sp.x, z: sp.z, y: g.crocY(sp.x, sp.z), yaw, st: opts.st || 'idle', t: 0, spd: 0, dead: 0, jaw: 0, hyaw: 0, hp: 999, max: 120, kx: 0, kz: 0, hrT: undefined, gp: undefined, gr: undefined, flash: 0 });
    g.P.x = sp.x + 4; g.P.z = sp.z + 4;
    const d = c.R.def, sc = c.sc, J = (i) => i === 2 ? g.boneW(d, 2, [0, 0, .45], sc) : d.WP[i].slice(); // 2 = snout tip
    const feet = () => [[9, 1], [11, -1], [13, 1], [15, -1]].map(([l, s]) => { const p = g.boneW(d, l, g.crocFootLocal(l, s), sc); return p[1] - g.crocY(p[0], p[2]); });
    for (let f = 0; f < 10; f++) g.drawCrocs(f / 30);
    const h0 = J(2), t0 = J(7), r0 = J(0), f0 = feet(), a = yaw + ang, dir = [-Math.sin(a), -Math.cos(a)], rx = Math.cos(yaw), rz = -Math.sin(yaw);
    c.hurt(opts.dmg || 25, dir[0], dir[1]); const st = c.st; c.kx = c.kz = 0;
    let headUp = -9, headAlong = -9, tailUp = -9, rootAlong = -9, bowHead = 0, bowTail = 0, worstFoot = 0, jaw = 0, nan = false, rebound = 9;
    for (let f = 0; f < 36; f++) { g.GT.clock += 1 / 60; g.drawCrocs(f / 60);
      const h = J(2), t = J(7), r = J(0); if ([...h, ...t, ...r].some((v) => !isFinite(v))) nan = true;
      const ra = (r[0] - r0[0]) * dir[0] + (r[2] - r0[2]) * dir[1]; if (ra > rootAlong) rootAlong = ra; if (f > 12) rebound = Math.min(rebound, ra);
      headUp = Math.max(headUp, h[1] - h0[1]); tailUp = Math.max(tailUp, t[1] - t0[1]); headAlong = Math.max(headAlong, (h[0] - h0[0]) * dir[0] + (h[2] - h0[2]) * dir[1]);
      // bow: head/tail displacement along the push minus the root's (negative = lagging behind the body)
      const hb = ((h[0] - h0[0]) - (r[0] - r0[0])) * dir[0] + ((h[2] - h0[2]) - (r[2] - r0[2])) * dir[1], tb = ((t[0] - t0[0]) - (r[0] - r0[0])) * dir[0] + ((t[2] - t0[2]) - (r[2] - r0[2])) * dir[1];
      bowHead = Math.min(bowHead, hb); bowTail = Math.min(bowTail, tb); jaw = Math.max(jaw, c.jawR || 0);
      feet().forEach((v, i) => { worstFoot = Math.max(worstFoot, Math.abs(v - f0[i])); }); }
    for (let f = 0; f < 20; f++) { g.GT.clock += 1 / 60; g.drawCrocs(f / 60); }
    const h2 = J(2), r2 = J(0); g.CREACT.on = 1;
    const R = (v) => +v.toFixed(3);
    return { st, headUp: R(headUp), headAlong: R(headAlong), tailUp: R(tailUp), rootAlong: R(rootAlong), rebound: R(rebound), bowHead: R(bowHead), bowTail: R(bowTail), foot: R(worstFoot), jaw: R(jaw),
      settle: R(Math.hypot(h2[0] - h0[0], h2[1] - h0[1], h2[2] - h0[2]) + Math.hypot(r2[0] - r0[0], r2[2] - r0[2])), nan };
  }, [flat, ang, opts || {}]);
  const dirs = { 'önden': 0, 'arkadan': Math.PI, 'soldan': Math.PI / 2, 'sağdan': -Math.PI / 2 }, R = {};
  for (const [n, a] of Object.entries(dirs)) R[n] = await hit(a);
  log('vuruş timsahı sarsıntı durumuna geçiriyor', Object.values(R).every((r) => r.st === 'hurt'), Object.values(R).map((r) => r.st));
  log('her yönde gövde itiş yönünde kayıyor (≥ 8 cm)', Object.values(R).every((r) => r.rootAlong >= .08), Object.values(R).map((r) => r.rootAlong));
  log('önden: baş yukarı ve geri savruluyor, çene açılıyor', R['önden'].headUp > .06 && R['önden'].headAlong > .1 && R['önden'].jaw > .2, JSON.stringify(R['önden']));
  log('arkadan: kuyruk havaya kalkıyor (≥ 8 cm), baş kalkmıyor', R['arkadan'].tailUp > .08 && R['arkadan'].headUp < .03, JSON.stringify(R['arkadan']));
  for (const n of ['soldan', 'sağdan']) log(`${n}: baş ve kuyruk gövdenin gerisinde kalıyor (C kavisi ≥ 6 cm)`, R[n].bowHead < -.06 && R[n].bowTail < -.06, JSON.stringify(R[n]));
  log('NaN yok, ayaklar zeminden kopmuyor (sapma < 7 cm)', Object.values(R).every((r) => !r.nan && r.foot < .07), Object.values(R).map((r) => r.foot));
  log('geri tepme küçük ve ters yönde', Object.values(R).every((r) => r.rebound < 0 && r.rebound > -r.rootAlong * .5), Object.values(R).map((r) => r.rebound));
  log('abartı yok (3,5 m timsah): burun ucu ≤ 35 cm, kuyruk ucu ≤ 35 cm oynuyor', Object.values(R).every((r) => r.headUp < .35 && r.tailUp < .35 && r.bowTail > -.35 && r.bowHead > -.35), Object.values(R).map((r) => [r.headUp, r.tailUp, r.bowHead, r.bowTail].join('/')));
  const old = await hit(Math.PI / 2, { off: 1 });
  // the idle sway keeps running while the clock advances, so compare the settle against the same croc drawn with no reaction
  log('0,9 sn sonra eski yerine oturuyor (tepkisiz çizimden < 5 mm fark)', Object.values(R).every((r) => r.settle < old.settle + .005), Object.values(R).map((r) => r.settle) + ' / tepkisiz ' + old.settle);
  log('eski tepki: vuruşta hiçbir hareket yoktu (karşılaştırma)', old.rootAlong < .005 && old.bowHead > -.005, JSON.stringify(old));
  const sh = await hit(Math.PI / 2, { st: 'open' });
  log('ağzı açıkken vurulan timsah ısırığı sürdürüyor, küçük irkilme', sh.st === 'open' && sh.rootAlong > .02 && sh.rootAlong < R['soldan'].rootAlong * .6, JSON.stringify(sh));
  // screenshot: front hit, held at the peak
  await G((sp) => { const g = __G, c = g.CROCS[0]; Object.assign(c, { x: sp.x, z: sp.z, y: g.crocY(sp.x, sp.z), yaw: .7, st: 'hurt', t: 0, spd: 0, aware: 0, hx: sp.x, hz: sp.z, hp: 999, dead: 0 }); g.tp(sp.x + 3, sp.z + 3);
    const a = c.yaw + Math.PI / 4; c.hurt(30, -Math.sin(a), -Math.cos(a)); c.kx = c.kz = 0; c.flash = 0; c.hrT = g.GT.clock - .07;
    g.__lockCam = 1; g.CAM.yaw = c.yaw + Math.PI / 2; g.CAM.dist = 4.2; g.CAM.pitch = .1; g.CAM.tx = c.x; g.CAM.tz = c.z; g.CAM.ty = c.y + .4; }, flat);
  await shot('crocreact-front', { wait: 80 });
};
module.exports.pauseAtStart = true;
