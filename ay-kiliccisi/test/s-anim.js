// Kahraman animasyonu: savaşa hazır bekleme duruşu (nefes, ağırlık aktarma), yürüyüş/koşu ayrıntıları (topuk-parmak, kalça, dönüşte yatma).
// node test/harness.js test/s-anim.js
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const step = (n, fn) => G(([n, fn]) => { const g = __G; for (let i = 0; i < n; i++) { if (fn) eval(fn); g.GT.time += 1 / 60; g.step(1 / 60); } }, [n, fn || '']);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; });
  await step(90);
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  // feet: lowest foot bone height above the terrain (model space -> world), both feet should be near the ground in idle
  const feet = () => G(() => { const g = __G, H = g.HB, M = g.PM; const f = [H.leftFoot, H.rightFoot].map((b) => { const w = g.mpt(M, g.SK.GP[b]); return w[1] - g.hAt(w[0], w[2]); }); return { f, ps: g.P.ps }; });
  const a = await feet();
  log('poz sayıları geçerli (NaN yok)', Object.values(a.ps).every((v) => typeof v !== 'number' || isFinite(v)));
  log('bekleme: ayaklar açık duruşta (LthZ>.1, RthZ<-.08)', a.ps.LthZ > .1 && a.ps.RthZ < -.08, a.ps.LthZ.toFixed(2) + ' ' + a.ps.RthZ.toFixed(2));
  log('bekleme: iki ayak da yere yakın', Math.abs(a.f[0] - a.f[1]) < .06 && Math.max(...a.f) < .2, a.f.map((v) => v.toFixed(3)).join(' '));
  await cam(.35, 3.4, .1, 1.1); await shot('an-idle1', { wait: 400 });
  const rng = await G(() => { const g = __G; let mn = [9, 9], mx = [-9, -9]; for (let i = 0; i < 300; i++) { g.GT.time += 1 / 60; g.step(1 / 60); const v = [g.P.ps.chX, g.P.ps.spZ]; for (let k = 0; k < 2; k++) { mn[k] = Math.min(mn[k], v[k]); mx[k] = Math.max(mx[k], v[k]); } } return [mx[0] - mn[0], mx[1] - mn[1]]; });
  log('bekleme nefes alıyor ve ağırlık aktarıyor (5 sn içinde göğüs ve gövde oynuyor)', rng[0] > .02 && rng[1] > .02, rng.map((v) => v.toFixed(3)).join(' '));
  await cam(1.4, 3.4, .1, 1.1); await shot('an-idle2', { wait: 400 });
  // walk then sprint while turning
  await step(60, 'g.IN.mz=1');
  const w = await G(() => { const g = __G; return { LfX: g.P.ps.LfX, RfX: g.P.ps.RfX, pelZ: g.P.ps.pelZ }; });
  await cam(1.5, 4, .12, 1.05); await shot('an-walk', { wait: 400 });
  let roll = 0, pz = 0; for (let i = 0; i < 30; i++) { const r = await G(() => { const g = __G; g.IN.mz = 1; g.GT.time += 1 / 60; g.step(1 / 60); return [Math.abs(g.P.ps.LfX||0) + Math.abs(g.P.ps.Lhl||0), g.P.ps.pelZ]; }); roll = Math.max(roll, Math.abs(r[0])); pz = Math.max(pz, Math.abs(r[1])); }
  log('yürüyüş: ayak yuvarlanması (topuk kalkışı) ve kalça düşmesi var', roll > .02 && pz > .005, roll.toFixed(3) + ' ' + pz.toFixed(3));
  await step(60, "g.IN.mz=1;g.P.sprintHeld=true;g.CAM.yaw+=1.6/60");
  const bank = await G(() => __G.P.ps.spZ);
  log('dönerken koşu: gövde dönüşe yatıyor', Math.abs(bank) > .03, bank.toFixed(3));
  await cam(.2, 4, .12, 1.05); await shot('an-turn', { wait: 400 });
  await step(80, "g.IN.mz=0;g.P.sprintHeld=false");
  const c = await feet();
  log('durunca bekleme duruşuna döndü', c.ps.LthZ > .1, c.ps.LthZ.toFixed(2));
};
