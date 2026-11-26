// Pelerin ikincil hareketi: duruşta aşağı sarkar, koşarken arkaya savrulur, dönüşte yana sallanır, bacaklardan geçmez.
module.exports = async ({ G, log, shot }) => {
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; for (let i = 0; i < 90; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  const probe = () => G(() => { const g = __G, H = g.HB, A = g.SK.GP[H.capeA], C = g.SK.GP[H.capeC], B = g.SK.GP[H.capeB];
    const tip = [C[0] + g.r3v(g.SK.GR[H.capeC], [0, -.4, -.04])[0], C[1] + g.r3v(g.SK.GR[H.capeC], [0, -.4, -.04])[1], C[2] + g.r3v(g.SK.GR[H.capeC], [0, -.4, -.04])[2]];
    let minGap = 9; for (const S of ['left', 'right']) for (const j of [H[S + 'LowerLeg'], H[S + 'Foot']]) { const q = g.SK.GP[j]; for (const [a, b] of [[B, C], [C, tip]]) { if (q[1] > a[1] || q[1] < b[1]) continue; const u = (a[1] - q[1]) / Math.max(a[1] - b[1], .05), cz = a[2] + (b[2] - a[2]) * u; minGap = Math.min(minGap, q[2] - cz); } }
    return { r: g.CAPE.r.slice(), z: g.CAPE.z.slice(), tipZ: tip[2] - A[2], tipY: tip[1], minGap, nan: [A, B, C, tip].flat().some((v) => !isFinite(v)) }; });
  const idle = await probe();
  log('duruşta pelerin sarkıyor (küçük salınım)', Math.abs(idle.r[2]) < .2 && !idle.nan, JSON.stringify(idle.r.map((v) => +v.toFixed(3))));
  await shot('cape-idle');
  // sprint forward
  await G(() => { const g = __G; g.IN.mz = 1; g.P.sprintHeld = true; for (let i = 0; i < 80; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  const run = await probe();
  log('koşarken pelerin arkaya savruluyor', run.r[2] > idle.r[2] + .25 && run.tipZ < idle.tipZ - .1, `r=${run.r.map((v) => v.toFixed(2))} tipZ ${idle.tipZ.toFixed(2)}→${run.tipZ.toFixed(2)}`);
  log('koşarken etek bacaklardan geçmiyor', run.minGap > .03, 'boşluk ' + run.minGap.toFixed(3));
  await G(() => { const g = __G, c = g.CAPE, d = [g.P.x - c.last[0], g.P.z - c.last[2]]; g.P.x = 30; g.P.z = 420; c.last = [30 - d[0], g.P.y, 420 - d[1]]; g.GT.time += 1 / 60; g.step(1 / 60); g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + 1.2; g.CAM.dist = 3.6; g.CAM.pitch = .12; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + 1.1; });
  await shot('cape-run');
  // hard turn while running -> sideways swing
  await G(() => { const g = __G; for (let i = 0; i < 12; i++) { g.P.yaw += .12; g.GT.time += 1 / 60; g.step(1 / 60); } });
  const turn = await probe();
  log('dönüşte pelerin yana sallanıyor', Math.abs(turn.z[2]) > .08, 'z=' + turn.z.map((v) => v.toFixed(2)));
  // stop -> settles back
  await G(() => { const g = __G; g.__lockCam = 0; g.IN.mz = 0; g.P.sprintHeld = false; for (let i = 0; i < 180; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } });
  const rest = await probe();
  log('durunca pelerin yerine oturuyor', Math.abs(rest.r[2]) < .2 && !rest.nan, rest.r.map((v) => v.toFixed(2)).join(','));
  // jump -> falling lifts the cape
  const air = await G(() => { const g = __G; let mx = -9; g.P.y += 6; g.P.air = true; g.P.vy = 0; for (let i = 0; i < 40; i++) { g.GT.time += 1 / 60; g.step(1 / 60); mx = Math.max(mx, g.CAPE.r[2]); } return mx; });
  log('düşerken pelerin havalanıyor', air > rest.r[2] + .05, 'en çok ' + air.toFixed(2));
};
