// Pelerin fiziği (32-cape.js): durunca sarkar, koşunca geriye savrulur, bacak/gövde içine girmez, ışınlanmada patlamaz.
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  const run = (n, f) => G(([n, f]) => { const g = __G; for (let i = 0; i < n; i++) { if (f) eval(f); g.GT.time += 1 / 60; g.step(1 / 60); } }, [n, f || '']);
  const st = () => G(() => { const g = __G, M = g.PM || PM, pts = g.CAPE.pts.map((p) => g.capeM(g.PM, p)); let pen = 0;
    for (const p of pts.slice(1)) for (const s of ['left', 'right']) { const lz = g.legZAt(s, p[1]); if (lz != null) pen = Math.max(pen, p[2] - (lz - .15)); }
    const fin = g.CAPE.pts.every((p) => p.every(Number.isFinite));
    return { swing: +g.capeSwing().toFixed(3), pen: +pen.toFixed(3), fin, hemY: +pts[3][1].toFixed(2) }; });
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; });
  await run(150);
  const s0 = await st(); log('durunca pelerin aşağı sarkar', s0.fin && Math.abs(s0.swing) < 0.2, JSON.stringify(s0));
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);
  await cam(1.5, 4, .12, 1.1); await shot('cape-stand', { wait: 300 });
  let maxPen = 0, maxSw = 0;
  for (let k = 0; k < 6; k++) { await run(15, 'g.IN.mz=1;g.P.sprintHeld=true;'); const s = await st(); maxPen = Math.max(maxPen, s.pen); maxSw = Math.max(maxSw, s.swing); }
  const s1 = await st();
  log('koşarken pelerin geriye savrulur (başın üstüne çıkmaz)', s1.fin && maxSw > 0.35 && maxSw < 1.35, JSON.stringify({ ...s1, maxSw }));
  log('pelerin bacakların içine girmez', maxPen < 0.02, 'en çok ' + maxPen);
  await cam(1.5, 4, .12, 1.1); await shot('cape-run', { wait: 300 });
  // sharp turn while running: the hem swings sideways (x) for a moment
  await run(1, 'g.P.yaw+=1.4;');
  await run(8, 'g.IN.mz=1;g.P.sprintHeld=true;');
  const side = await G(() => { const g = __G, a = g.capeM(g.PM, g.CAPE.pts[0]), b = g.capeM(g.PM, g.CAPE.pts[3]); return +(b[0] - a[0]).toFixed(3); });
  log('dönüşte pelerin yana savrulur (atalet)', Math.abs(side) > 0.05, 'yanal ' + side);
  await run(200, 'g.IN.mz=0;g.P.sprintHeld=false;');
  const s2 = await st(); log('durunca yeniden sarkar', s2.fin && Math.abs(s2.swing) < 0.2, JSON.stringify(s2));
  // jump: the cape lifts while falling
  await run(1, "g.P.vy=6.6;g.P.air=true;g.P.st='jump';g.P.t=0;");
  let up = -9; for (let k = 0; k < 16; k++) { await run(3); const s = await st(); up = Math.max(up, s.hemY); }
  log('zıplayınca pelerin havalanır', up > s2.hemY + 0.03, 'etek yüksekliği ' + s2.hemY + ' → ' + up);
  await run(1, 'g.tp(600,600);'); await run(3);
  const s3 = await st(); log('ışınlanmada pelerin patlamaz', s3.fin && Math.abs(s3.swing) < 0.4, JSON.stringify(s3));
};
