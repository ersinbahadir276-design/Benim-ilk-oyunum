// Side-view frames of Kael's gait on the road (no grass): walk, jog, sprint, idle.  node test/harness.js test/s-gait-shots.js
module.exports = async ({ shot, G }) => {
  await G(() => { const g = __G; g.fastStream = 1; g.GT.paused = true; window.__noAutoQ = 1; g.tp(1.5, 150); g.P.yaw = Math.PI;
    document.querySelectorAll('.btn,#notes,#quest,#hudp,#radar,#compass,#meat').forEach((e) => e.style.display = 'none'); });
  const run = (mz, spr, n) => G(([mz, spr, n]) => { const g = __G; g.IN.mx = 0; g.IN.mz = mz; g.P.sprintHeld = spr; g.P.sta = 100; for (let i = 0; i < n; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + 1.5708; g.CAM.dist = 3.6; g.CAM.pitch = .05; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + 1.0; }, [mz, spr, n]);
  await run(0, false, 60); await shot('gs-idle', { wait: 1200 });
  await run(.4, false, 40); await shot('gs-walk1', { wait: 300 }); await run(.4, false, 11); await shot('gs-walk2', { wait: 300 });
  await run(1, false, 40); await shot('gs-jog1', { wait: 300 }); await run(1, false, 7); await shot('gs-jog2', { wait: 300 });
  await run(1, true, 50); await shot('gs-sprint1', { wait: 300 }); await run(1, true, 5); await shot('gs-sprint2', { wait: 300 });
};
