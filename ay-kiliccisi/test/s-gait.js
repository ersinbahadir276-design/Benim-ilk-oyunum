// Hero locomotion realism: foot slip of the planted foot, pelvis motion, turn banking, idle weight shift.
// node test/harness.js test/s-gait.js
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, SK = g.SK, H = g.HB, DT = 1 / 60; g.GT.paused = true; window.__noAutoQ = 1;
    const step = () => { g.GT.time += DT; g.step(DT); };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - x, a.z - z) < 80) { a.x += 400; a.hx = a.x; } };
    const foot = (b) => { const w = g.mpt(g.PM, SK.GP[b]); return [w[0], w[1] - g.hAt(w[0], w[2]), w[2]]; };
    // walk/sprint straight: the lower foot is planted; measure how fast it slides over the ground relative to the body
    const gait = (sprint) => {
      g.tp(30, 420); far(30, 420); P.yaw = 0; P.st = 'move'; P.sta = 100; P.exhausted = false; IN.mz = 0; IN.mx = 0; P.sprintHeld = false; for (let i = 0; i < 30; i++) step();
      IN.mz = 1; P.sprintHeld = sprint; for (let i = 0; i < 70; i++) { P.sta = 100; step(); }
      let slip = 0, n = 0, body = 0, bx = P.x, bz = P.z, hipYs = [], swingMax = 0, fr = [];
      for (let i = 0; i < 150; i++) { P.sta = 100; step();
        const L = foot(H.leftFoot), R = foot(H.rightFoot); fr.push([L, R]); swingMax = Math.max(swingMax, Math.abs(L[1] - R[1]));
        const hp = g.mpt(g.PM, SK.GP[H.hips]); hipYs.push(hp[1] - g.hAt(hp[0], hp[2])); }
      // a foot is planted while its ankle is within 1.5 cm of the lowest ankle height seen; sum its ground travel per frame
      const minY = Math.min(...fr.map((f) => Math.min(f[0][1], f[1][1])));
      for (let i = 1; i < fr.length; i++) for (const k of [0, 1]) { const a = fr[i - 1][k], c = fr[i][k]; if (a[1] < minY + 0.015 && c[1] < minY + 0.015) { slip += Math.hypot(c[0] - a[0], c[2] - a[2]); n++; } }
      body = Math.hypot(P.x - bx, P.z - bz) / 150; const hy = hipYs.sort((a, b) => a - b);
      IN.mz = 0; P.sprintHeld = false;
      return { slipRatio: +(slip / Math.max(1, n) / body).toFixed(3), bob: +(hy[hy.length - 3] - hy[2]).toFixed(3), lift: +swingMax.toFixed(3), spd: +(body / DT).toFixed(2) };
    };
    const o = { walk: gait(false), sprint: gait(true) };
    // turning: the hero banks into the turn (spine roll opposes yaw rate)
    g.tp(30, 420); far(30, 420); P.yaw = 0; IN.mz = 1; for (let i = 0; i < 40; i++) step();
    // steer in a steady circle: the input direction rotates 1.6 rad/s
    let roll = 0, yr = 0; for (let i = 0; i < 120; i++) { const a = i / 60 * 1.6; IN.mx = Math.sin(a); IN.mz = Math.cos(a); step(); if (i > 40) { roll += P.ps.spZ || 0; yr += P.yawRate || 0; } }
    o.bankLeftOrRight = +(roll / 79).toFixed(3); o.yawRate = +(yr / 79).toFixed(2);
    IN.mx = 0; IN.mz = 0; for (let i = 0; i < 90; i++) step();
    // idle: weight shifts between the feet (hips sway sideways) and the chest breathes
    let xs = [], ch = []; for (let i = 0; i < 400; i++) { step(); xs.push(SK.root[0]); ch.push(P.ps.chX); }
    o.idleSway = +(Math.max(...xs) - Math.min(...xs)).toFixed(3); o.breath = +(Math.max(...ch) - Math.min(...ch)).toFixed(3); o.idleSt = P.st;
    return o;
  });
  log('yürüyüş: basan ayak kayması < %15 gövde hızı', r.walk.slipRatio < 0.15, JSON.stringify(r.walk));
  log('koşu: basan ayak kayması < %15 gövde hızı', r.sprint.slipRatio < 0.15, JSON.stringify(r.sprint));
  log('yürüyüş: kalça iniş-çıkışı 1.5–7 cm', r.walk.bob > 0.015 && r.walk.bob < 0.07, r.walk.bob);
  log('yürüyüş: salınan ayak yerden kalkıyor (> 8 cm)', r.walk.lift > 0.08, r.walk.lift);
  log('dönüşte gövde içe yatıyor', Math.abs(r.bankLeftOrRight) > 0.03 && Math.sign(r.bankLeftOrRight) === -Math.sign(r.yawRate), JSON.stringify({ roll: r.bankLeftOrRight, yawRate: r.yawRate }));
  log('beklerken ağırlık ayaklar arasında kayıyor (> 1 cm)', r.idleSway > 0.01, r.idleSway);
  log('beklerken göğüs nefes alıyor', r.breath > 0.015, r.breath);
};
