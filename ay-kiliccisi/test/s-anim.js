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
    sim(1.0);
    // jump: take-off clip, then airborne loop; landing clip; feet stay above the ground the whole time
    IN.mz = 0; sim(.6); P.vy = 6.6; P.air = true; P.st = 'jump'; P.t = 0; P.jumpAt = GT.clock;
    sim(.12); out.jW0 = JSON.stringify(GAIT.w); out.jCw = P.ps.clipW; let jGap = 9, jLand = 0, landW = '', airT = 0;
    for (let i = 0; i < 90; i++) { sim(1 / 60); if (P.air) airT += 1 / 60; const f = foot(), gy = g.hAt(P.x, P.z); jGap = Math.min(jGap, Math.min(f.l[1], f.r[1]) - gy - SK.rest[HB.leftFoot][1]);
      if (P.st === 'jump' && P.t > .55) out.jW1 = JSON.stringify(GAIT.w);
      if (P.st === 'land' && !jLand) { jLand = 1; sim(.05); landW = JSON.stringify(GAIT.w); out.landHip = g.mpt(g.PM, SK.GP[HB.hips])[1] - gy; } }
    out.jGap = jGap; out.landW = landW; out.airT = airT; out.afterJump = JSON.stringify(GAIT.w); out.standHip = g.mpt(g.PM, SK.GP[HB.hips])[1] - g.hAt(P.x, P.z);
    // hurt: chest-hit clip owns the pose, then fades back to idle
    P.st = 'hurt'; P.t = 0; P.hurtDir = [0, 1]; sim(.12); out.hurtW = JSON.stringify(GAIT.w); out.hurtCw = P.ps.clipW; sim(.8); out.afterHurt = JSON.stringify(GAIT.w); out.afterHurtSt = P.st;
    out.nan2 = nanA();
    // forward dodge: the Roll clip flips the hips (no model-matrix spin), body stays above the ground, back to locomotion after
    sim(.6); IN.wx = 0; IN.wz = 1; P.yaw = 0; P.inv = 0; P.st = 'move'; P.sta = 100; g.startDodge(); out.dKind = P.dodgeKind;
    let maxFlip = 0, minHip = 9, maxSpin = 0, rGap = 9, rollW = '';
    for (let i = 0; i < Math.round(P.dodgeT * 60) - 1; i++) { sim(1 / 60); const M = g.PM, h = g.mpt(M, SK.GP[HB.hips]), hd = g.mpt(M, SK.GP[HB.head]), gy = g.hAt(P.x, P.z);
      maxFlip = Math.max(maxFlip, h[1] - hd[1]); minHip = Math.min(minHip, h[1] - gy); maxSpin = Math.max(maxSpin, Math.abs(P.spin || 0)); if (i === 10) rollW = JSON.stringify(GAIT.w);
      for (const b of [HB.head, HB.hips, HB.upperChest]) rGap = Math.min(rGap, g.mpt(M, SK.GP[b])[1] - gy); }
    out.maxFlip = maxFlip; out.minHip = minHip; out.maxSpin = maxSpin; out.rGap = rGap; out.rollW = rollW;
    IN.wx = 0; IN.wz = 0; sim(.8); out.afterRoll = JSON.stringify(GAIT.w); out.afterRollSt = P.st; out.afterRollHip = g.mpt(g.PM, SK.GP[HB.hips])[1] - g.hAt(P.x, P.z);
    out.nan3 = nanA();
    return out;
  });
  log('ANIMS yüklü (11 klip)', r.ready === 11, r.ready);
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
  log('zıplama: kalkış klibi', /jstart/.test(r.jW0) && r.jCw > .8, r.jW0 + ' cw ' + r.jCw.toFixed(2));
  log('zıplama: havada döngü klibi', /jloop/.test(r.jW1 || ''), r.jW1);
  log('zıplarken ayak zemine gömülmüyor', r.jGap > -.05, r.jGap.toFixed(3) + ' hava ' + r.airT.toFixed(2) + ' sn');
  log('iniş: diz büküp karşılama klibi', /jland/.test(r.landW) && r.landHip < r.standHip - .05, r.landW + ' kalça ' + (r.landHip || 0).toFixed(2) + ' / ayakta ' + r.standHip.toFixed(2));
  log('inişten sonra yürüme katmanına dönüş', /idle|walk/.test(r.afterJump) && !/jland|jstart|jloop/.test(r.afterJump), r.afterJump);
  log('darbe: göğse vuruş klibi', /hit/.test(r.hurtW) && r.hurtCw > .7, r.hurtW + ' cw ' + r.hurtCw.toFixed(2));
  log('darbeden sonra beklemeye dönüş', r.afterHurtSt === 'move' && !/hit/.test(r.afterHurt), r.afterHurtSt + ' ' + r.afterHurt);
  log('eylem kliplerinde NaN yok', !r.nan2);
  await G(() => { const g = __G; g.GT.paused = false; g.IN.mz = 1; });
  await shot('anim-run', { wait: 900 });
  log('ileri kaçınma: takla klibi', r.dKind === 'fwd' && /roll/.test(r.rollW) && r.maxSpin === 0, r.dKind + ' ' + r.rollW + ' spin ' + r.maxSpin);
  log('takla: gövde gerçekten ters dönüyor (kalça başın üstünde)', r.maxFlip > .15, (r.maxFlip * 100).toFixed(0) + ' cm');
  log('takla: kalça yere iniyor', r.minHip < .5, r.minHip.toFixed(2) + ' m');
  log('takla: baş/gövde zemine gömülmüyor', r.rGap > .02, r.rGap.toFixed(3));
  log('takladan sonra ayakta, yürüme katmanında', r.afterRollSt === 'move' && !/roll/.test(r.afterRoll) && r.afterRollHip > .8, r.afterRollSt + ' ' + r.afterRoll + ' kalça ' + r.afterRollHip.toFixed(2));
  log('takla sırasında NaN yok', !r.nan3);
};
