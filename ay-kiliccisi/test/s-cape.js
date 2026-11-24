// Pelerin kumaşı: CapeA/B/C kemikleri koşuya, dönüşe, düşüşe ve duruşa tepki veriyor mu?
module.exports = async ({ G, log, shot }) => {
  await G(() => { document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  const r = await G(() => { const g = __G, P = g.P, IN = g.IN, C = g.CAPE, DT = 1 / 60; g.GT.paused = true; window.__noAutoQ = 1;
    const sim = (s) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); } };
    for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - 30, a.z - 420) < 80) { a.x += 400; a.hx = a.x; }
    g.tp(30, 420); P.yaw = 0; IN.mx = 0; IN.mz = 0; P.sprintHeld = false; sim(2);
    const hemY = () => g.SK.GP[g.HB.capeC][2]; // model-space z of the hem bone (− = behind)
    const o = { idleP: C.p[0], hemIdle: hemY() };
    IN.mz = 1; P.sprintHeld = true; sim(1.2); o.runP = C.p[0]; o.runP2 = C.p[2]; o.hemRun = hemY(); o.spr = P.sprinting;
    IN.mz = 0; P.sprintHeld = false; sim(.12); o.brakeP = C.p[0]; sim(2.5); o.restP = C.p[0];
    // turn in place quickly: the hem swings out sideways
    let maxR = 0; for (let i = 0; i < 30; i++) { P.yaw += 0.12; g.GT.time += DT; g.step(DT); maxR = Math.max(maxR, Math.abs(C.r[0])); } o.turnR = maxR;
    sim(2); o.settleR = Math.abs(C.r[0]);
    o.finite = [...C.p, ...C.r, ...C.pv, ...C.rv].every(Number.isFinite);
    // teleport must not fling the cape
    g.tp(200, 300); sim(DT); o.tpP = C.p[0];
    return o; });
  log('durunca pelerin sarkık', Math.abs(r.idleP) < 0.12, r.idleP.toFixed(3));
  log('koşuda pelerin geriye açılıyor', r.runP > 0.45 && r.hemRun < r.hemIdle - 0.2, `p=${r.runP.toFixed(2)} hem ${r.hemIdle.toFixed(2)}→${r.hemRun.toFixed(2)} sprint=${r.spr}`);
  log('alt parça ek kıvrım alıyor', r.runP2 > 0.05, r.runP2.toFixed(2));
  log('durunca geri iniyor', r.restP < 0.15 && r.brakeP < r.runP, `${r.brakeP.toFixed(2)} → ${r.restP.toFixed(2)}`);
  log('dönüşte yana savruluyor', r.turnR > 0.08, r.turnR.toFixed(2));
  log('dönüş sonrası duruluyor', r.settleR < 0.05, r.settleR.toFixed(3));
  log('sayılar sonlu', r.finite);
  log('ışınlanma pelerini fırlatmıyor', Math.abs(r.tpP) < 0.2, r.tpP.toFixed(3));
  // görsel: koşarken arkadan
  await G(() => { const g = __G; g.tp(30, 420); g.P.yaw = 0; g.IN.mz = 1; g.P.sprintHeld = true; for (let i = 0; i < 70; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + 2.3; g.CAM.dist = 3.6; g.CAM.pitch = .12; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + 1.1; });
  await shot('cape-run', { wait: 500 });
};
