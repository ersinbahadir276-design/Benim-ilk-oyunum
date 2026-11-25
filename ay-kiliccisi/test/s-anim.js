// node test/harness.js test/s-anim.js  -> keyframe clip layer (data/anims.js) on Kael: loads, blends, keeps feet on the ground
module.exports = async ({ page, G, log, shot }) => {
  await page.waitForTimeout(800);
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, SK = g.SK, HB = g.HB, GT = g.GT, out = {};
    GT.paused = true;
    const sim = (s) => { for (let i = 0; i < Math.round(s * 60); i++) { GT.time += 1 / 60; g.step(1 / 60); } };
    const foot = () => { const M = g.PM, l = g.mpt(M, SK.GP[HB.leftFoot]), r = g.mpt(M, SK.GP[HB.rightFoot]); return { l, r }; };
    const nanA = () => { for (const v of SK.A) if (!isFinite(v)) return true; return false; };
    const GAIT = g.GAIT; out.ready = g.CLIP.clips ? Object.keys(g.CLIP.clips).length : 0;
    g.tp(6, 60); P.yaw = 0; IN.mx = 0; IN.mz = 0; P.sprintHeld = false; P.crouch = false; sim(1.5);
    out.idleW = P.ps.clipW; out.idleWeights = JSON.stringify(GAIT.w);
    { const f = foot(), gy = g.hAt(P.x, P.z); out.idleFootGap = Math.min(f.l[1], f.r[1]) - gy - SK.rest[HB.leftFoot][1]; }
    // run forward: legs must swing (thigh rotation alternates), weights move to the jog clip
    IN.mz = 1; sim(1.2); out.runW = P.ps.clipW; out.runWeights = JSON.stringify(GAIT.w); out.runSpd = P.spd;
    let minL = 9, maxL = -9, gaps = [], ph0 = GAIT.ph, adv = 0, lastPh = GAIT.ph;
    for (let i = 0; i < 90; i++) { sim(1 / 60); const lz = SK.GP[HB.leftFoot][2] - SK.GP[HB.hips][2]; minL = Math.min(minL, lz); maxL = Math.max(maxL, lz);
      const f = foot(), gy = g.hAt(P.x, P.z); gaps.push(Math.min(f.l[1], f.r[1]) - gy - SK.rest[HB.leftFoot][1]); adv += (GAIT.ph - lastPh + 1) % 1; lastPh = GAIT.ph; }
    out.stride = maxL - minL; out.cycles = adv; gaps.sort((a, b) => a - b); out.runGapMin = gaps[0]; out.runGapMax = gaps[gaps.length - 1];
    // sprint
    P.sprintHeld = true; sim(1.0); out.sprintWeights = JSON.stringify(GAIT.w); P.sprintHeld = false;
    // crouch walk
    P.crouch = true; sim(1.0); out.crouchWeights = JSON.stringify(GAIT.w); { const f = foot(), gy = g.hAt(P.x, P.z); out.crouchHipH = g.mpt(g.PM, SK.GP[HB.hips])[1] - gy; out.crouchGap = Math.min(f.l[1], f.r[1]) - gy - SK.rest[HB.leftFoot][1]; }
    P.crouch = false; IN.mz = 0; sim(1.0);
    // attack: clip layer must fade out so the sword swing poses stay procedural
    IN.atkHeld = true; IN.atkAt = GT.clock; IN.atkEdge = true; IN.atkUsed = false; sim(.05); IN.atkHeld = false; IN.atkEdge = false; IN.atkUp = true; sim(.25);
    out.atkSt = P.st; out.atkW = P.ps.clipW;
    out.nan = nanA();
    sim(1.0); return out;
  });
  log('ANIMS yüklü (6 klip)', r.ready === 6, r.ready);
  log('dururken klip katmanı açık', r.idleW > .95 && /idle/.test(r.idleWeights), r.idleW.toFixed(2) + ' ' + r.idleWeights);
  log('dururken ayak yerde', Math.abs(r.idleFootGap) < .05, r.idleFootGap.toFixed(3));
  log('koşarken jog klibi', /jog/.test(r.runWeights) && r.runW > .95, r.runWeights + ' hız ' + r.runSpd.toFixed(2));
  log('bacaklar gerçekten adım atıyor', r.stride > .5, 'adım ' + r.stride.toFixed(2) + ' m');
  log('yürüyüş fazı ilerliyor', r.cycles > 1 && r.cycles < 4, r.cycles.toFixed(2) + ' döngü / 1.5 sn');
  log('koşarken ayak zemine gömülmüyor', r.runGapMin > -.04 && r.runGapMin < .04, r.runGapMin.toFixed(3) + '..' + r.runGapMax.toFixed(3));
  log('depar klibi', /sprint/.test(r.sprintWeights), r.sprintWeights);
  log('çömelme klibi', /cwalk/.test(r.crouchWeights) && r.crouchHipH < .85 && Math.abs(r.crouchGap) < .06, r.crouchWeights + ' kalça ' + r.crouchHipH.toFixed(2) + ' ayak ' + r.crouchGap.toFixed(3));
  log('saldırıda klip katmanı kapanıyor', r.atkSt === 'attack' && r.atkW < .6, r.atkSt + ' ' + r.atkW.toFixed(2));
  log('iskelette NaN yok', !r.nan);
  await G(() => { const g = __G; g.GT.paused = false; g.IN.mz = 1; });
  await shot('anim-run', { wait: 900 });
};
