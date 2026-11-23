// node test/harness.js test/s-cape.js -> hero cape cloth simulation (32-cape.js) + screenshots (test/out/cape-*.jpg)
module.exports = async ({ page, shot, G, log }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.tp(30, 420); g.P.yaw = 0; });
  // advance n frames; returns the cape chain in the hero's model space (+z = forward) and bone sanity
  const run = (n, set) => G(([n, set]) => {
    const g = __G; if (set) Object.assign(g.IN, set.IN || {}), Object.assign(g.P, set.P || {});
    let minZ = 9, maxTipZ = -9, bad = 0;
    for (let i = 0; i < n; i++) {
      g.GT.time += 1 / 60; g.step(1 / 60);
      const L = g.CAPE.L; if (!L) continue;
      for (const p of L) if (!isFinite(p[0] + p[1] + p[2])) bad++;
      maxTipZ = Math.max(maxTipZ, L[3][2]); minZ = Math.min(minZ, L[3][2]);
    }
    const H = g.HB, L = g.CAPE.L || [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const legZ = Math.min(g.SK.GP[H.leftLowerLeg][2], g.SK.GP[H.rightLowerLeg][2]);
    const segs = [1, 2, 3].map((i) => Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1], L[i][2] - L[i - 1][2]));
    return { tip: L[3], mid: L[2], bad, minZ, maxTipZ, legZ, segs, rest: g.CAPE.len, R: [g.HB.capeA, g.HB.capeB, g.HB.capeC].map((b) => g.SK.R[b].slice(0, 9)) };
  }, [n, set]);
  const cam = (a, d, p, ty) => G(([a, d, p, ty]) => { const g = __G; g.__lockCam = 1; g.CAM.yaw = g.P.yaw + Math.PI + a; g.CAM.dist = d; g.CAM.pitch = p; g.CAM.tx = g.P.x; g.CAM.tz = g.P.z; g.CAM.ty = g.P.y + ty; }, [a, d, p, ty]);

  const idle = await run(150);
  log('cape: bones are driven (no longer identity)', idle.R.some((m) => Math.abs(m[0] - 1) + Math.abs(m[4] - 1) + Math.abs(m[8] - 1) > 1e-4) || idle.tip[2] < -0.2, JSON.stringify(idle.tip.map((v) => +v.toFixed(3))));
  log('cape: standing → hangs down behind the legs', idle.tip[1] < 0.75 && idle.tip[2] < idle.legZ - 0.05 && idle.bad === 0, `tip y=${idle.tip[1].toFixed(2)} z=${idle.tip[2].toFixed(2)} leg z=${idle.legZ.toFixed(2)}`);
  log('cape: segment lengths kept (cloth does not stretch)', idle.segs.every((s, i) => Math.abs(s - idle.rest[i]) < 0.02), idle.segs.map((s) => s.toFixed(3)).join(' '));
  await cam(1.5, 3.6, 0.12, 1.15); await shot('cape-idle-side', { wait: 400 });

  const sprint = await run(90, { IN: { mz: 1 }, P: { sprintHeld: true } });
  log('cape: sprinting → hem lifts and trails behind', sprint.tip[1] > idle.tip[1] + 0.08 && sprint.tip[2] < idle.tip[2] - 0.08, `tip y ${idle.tip[1].toFixed(2)}→${sprint.tip[1].toFixed(2)}, z ${idle.tip[2].toFixed(2)}→${sprint.tip[2].toFixed(2)}`);
  log('cape: legs never pass through the hem while running', sprint.maxTipZ < -0.05 && sprint.bad === 0, `max tip z ${sprint.maxTipZ.toFixed(2)}`);
  await cam(1.45, 4, 0.12, 1.1); await shot('cape-sprint-side', { wait: 400 });

  // sharp turn while running: the hem swings sideways (inertia)
  const turn = await G(() => { const g = __G; let maxX = 0; for (let i = 0; i < 24; i++) { g.P.yaw += 0.09; g.GT.time += 1 / 60; g.step(1 / 60); maxX = Math.max(maxX, Math.abs(g.CAPE.L[3][0])); } return maxX; });
  log('cape: turning swings the hem sideways', turn > 0.06, `max |x| ${turn.toFixed(2)}`);

  const settle = await run(240, { IN: { mz: 0 }, P: { sprintHeld: false } });
  log('cape: settles back after stopping', Math.abs(settle.tip[1] - idle.tip[1]) < 0.06 && Math.abs(settle.tip[2] - idle.tip[2]) < 0.06, `tip y=${settle.tip[1].toFixed(2)} z=${settle.tip[2].toFixed(2)}`);

  // teleport far away: chain resets instead of stretching across the map
  const tp = await G(() => { const g = __G; g.tp(-200, 300); for (let i = 0; i < 3; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } const L = g.CAPE.L; return Math.hypot(L[3][0] - L[0][0], L[3][1] - L[0][1], L[3][2] - L[0][2]); });
  log('cape: teleport resets the chain', tp < 1.3, tp.toFixed(2));

  // heavy attack: chest leans, cape must still not cut through the body
  const atk = await G(() => { const g = __G, IN = g.IN; IN.atkHeld = true; IN.atkAt = g.GT.clock; IN.atkUsed = false; for (let i = 0; i < 60; i++) { g.GT.time += 1 / 60; g.step(1 / 60); } IN.atkHeld = false; IN.atkUp = true; let worst = -9; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); const H = g.HB, hz = g.SK.GP[H.hips][2]; worst = Math.max(worst, g.CAPE.L[2][2] - hz); } return worst; });
  log('cape: stays behind the hips during a heavy attack', atk < -0.1, `mid-hips z ${atk.toFixed(2)}`);
  await cam(0.9, 4, 0.1, 1.2); await shot('cape-heavy', { wait: 400 });
};
module.exports.pauseAtStart = true;
