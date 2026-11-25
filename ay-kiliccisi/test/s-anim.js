// node test/harness.js test/s-anim.js  -> keyframe clip layer (data/anims.js) on Kael: loads, blends, keeps feet on the ground
module.exports = async ({ page, G, log, shot }) => {
  await page.waitForTimeout(800);
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, SK = g.SK, HB = g.HB, GT = g.GT, out = {};
    GT.paused = true;
    const sim = (s) => { for (let i = 0; i < Math.round(s * 60); i++) { GT.time += 1 / 60; g.step(1 / 60); } };
    const foot = () => { const M = g.PM, l = g.mpt(M, SK.GP[HB.leftFoot]), r = g.mpt(M, SK.GP[HB.rightFoot]); return { l, r }; };
    const nanA = () => { for (const v of SK.A) if (!isFinite(v)) return true; return false; };
    const GAIT = g.CGAIT; out.ready = g.CLIP.clips ? Object.keys(g.CLIP.clips).length : 0;
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
    // attack: tapping ATTACK starts the light combo; the Sword_Regular clip of the combo pose owns legs, hips and sword arm
    IN.atkHeld = true; IN.atkAt = GT.clock; IN.atkEdge = true; IN.atkUsed = false; sim(.05); IN.atkHeld = false; IN.atkEdge = false; IN.atkUp = true; sim(.12);
    out.atkSt = P.st; out.atkW = P.ps.clipW; out.atkWeights = JSON.stringify(GAIT.w); out.armW = g.CLIP.armW;
    out.nan = nanA();
    sim(1.0);
    // every combo pose -> its clip; the hand moves fastest around the game's hit frame; feet stay on the ground; pose != idle
    const S = g.curStance(); out.combo = []; P.st = 'move'; sim(.5);
    for (let c = 0; c < 3; c++) { P.sta = 100; g.startLight(c); const n = Math.round(P.atkT * 60); let pk = 0, pkU = 0, last = null, gMin = 9, hipMin = 9, swLen = 0;
      const rh0 = SK.GP[HB.rightHand].slice();
      for (let i = 0; i < n - 1; i++) { sim(1 / 60); const h = g.mpt(g.PM, SK.GP[HB.rightHand]); if (last) { const v = Math.hypot(h[0] - last[0], h[1] - last[1], h[2] - last[2]) * 60; if (v > pk) { pk = v; pkU = P.t / P.atkT; } } last = h;
        const f = foot(), gy = g.hAt(P.x, P.z); gMin = Math.min(gMin, Math.min(f.l[1], f.r[1]) - gy - SK.rest[HB.leftFoot][1]); hipMin = Math.min(hipMin, g.mpt(g.PM, SK.GP[HB.hips])[1] - gy);
        swLen = Math.max(swLen, Math.hypot(...[0, 1, 2].map((j) => SK.GP[HB.rightHand][j] - rh0[j]))); }
      out.combo.push({ pose: S.pose[c], w: JSON.stringify(GAIT.w), pkU, pk, gMin, hipMin, swLen, nan: nanA() }); }
    P.st = 'move'; P.t = 0; sim(.8); out.afterAtk = JSON.stringify(GAIT.w); out.afterArmW = g.CLIP.armW;
    // sprint attack: Sword_Attack (lunge cut) owns body + sword arm; blade peak on the run attack's hit (u .38); feet on the ground
    { g.tp(6, 60); P.yaw = 0; IN.mx = 0; IN.mz = 1; P.sprintHeld = true; sim(1.2); out.rSpd = P.spd; out.rSprint = P.sprinting; P.sta = 100; g.startRunAtk(); out.rSt = P.st; let pk = 0, pkU = 0, last = null, gMin = 9, hipMin = 9, w = '', arm = 0, hitU = -1;
      for (let i = 0; i < 35; i++) { sim(1 / 60); const h = g.mpt(g.PM, SK.GP[HB.rightHand]); if (last && P.st === 'runatk') { const v = Math.hypot(h[0] - last[0], h[1] - last[1], h[2] - last[2]) * 60; if (v > pk) { pk = v; pkU = P.t / .6; } } last = h;
        if (P.hitDone && hitU < 0) hitU = P.t / .6; if (i === 12) { w = JSON.stringify(GAIT.w); arm = g.CLIP.armW; }
        const f = foot(), gy = g.hAt(P.x, P.z); gMin = Math.min(gMin, Math.min(f.l[1], f.r[1]) - gy - SK.rest[HB.leftFoot][1]); hipMin = Math.min(hipMin, g.mpt(g.PM, SK.GP[HB.hips])[1] - gy); }
      Object.assign(out, { rW: w, rArm: arm, rPk: pk, rPkU: pkU, rHitU: hitU, rGMin: gMin, rHipMin: hipMin, rNan: nanA() });
      IN.mz = 0; P.sprintHeld = false; sim(.8); out.rAfter = JSON.stringify(GAIT.w); out.rAfterSt = P.st; out.rAfterArm = g.CLIP.armW; }
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
    // death while standing: Death01 owns the whole body (sword arm too), no ragdoll tilt; falls on the back, lies still, respawns
    sim(.5); P.st = 'move'; P.t = 0; P.rag.ang = 0; P.yaw = 0; g.die(); out.dClip = !!P.deathClip; out.dRag0 = P.rag.ang;
    let dMaxRag = 0, dGap = 9, dHip = [], dW = '', dArm = 0;
    for (let i = 0; i < Math.round(3.3 * 60); i++) { sim(1 / 60); const M = g.PM, gy = g.hAt(P.x, P.z); dMaxRag = Math.max(dMaxRag, P.rag.ang);
      for (const b of [HB.head, HB.hips, HB.upperChest]) dGap = Math.min(dGap, g.mpt(M, SK.GP[b])[1] - gy);
      if (i % 15 === 0) dHip.push(+(g.mpt(M, SK.GP[HB.hips])[1] - gy).toFixed(2)); if (i === 30) { dW = JSON.stringify(GAIT.w); dArm = g.CLIP.armW; }
      if (i === 150) { out.dHead = g.mpt(M, SK.GP[HB.head])[1] - gy; out.dChestDz = (() => { const c = g.mpt(M, SK.GP[HB.upperChest]), h = g.mpt(M, SK.GP[HB.hips]); return (c[0] - h[0]) * Math.sin(P.yaw) + (c[2] - h[2]) * Math.cos(P.yaw); })(); } }
    out.dMaxRag = dMaxRag; out.dGap = dGap; out.dHip = dHip; out.dW = dW; out.dArm = dArm; out.dNan = nanA();
    sim(.6); out.dAfterSt = P.st; out.dAfterClip = !!P.deathClip; sim(.6); out.dAfterW = JSON.stringify(GAIT.w); out.dAfterHip = g.mpt(g.PM, SK.GP[HB.hips])[1] - g.hAt(P.x, P.z);
    // death while already knocked down keeps the procedural ragdoll (no clip on top of a lying body)
    sim(.5); P.inv = 0; g.knockDown([0, -1], 1); sim(.4); g.die(); out.dDownClip = !!P.deathClip; sim(.3); out.dDownW = P.ps.clipW; sim(3.5);
    return out;
  });
  log('ANIMS yüklü (16 klip)', r.ready === 16, r.ready);
  log('dururken klip katmanı açık', r.idleW > .95 && /idle/.test(r.idleWeights), r.idleW.toFixed(2) + ' ' + r.idleWeights);
  log('dururken ayak yerde', Math.abs(r.idleFootGap) < .05, r.idleFootGap.toFixed(3));
  log('koşarken jog klibi', /jog/.test(r.runWeights) && r.runW > .95, r.runWeights + ' hız ' + r.runSpd.toFixed(2));
  log('bacaklar gerçekten adım atıyor', r.stride > .5, 'adım ' + r.stride.toFixed(2) + ' m');
  log('yürüyüş fazı ilerliyor', r.cycles > 1 && r.cycles < 4, r.cycles.toFixed(2) + ' döngü / 1.5 sn');
  log('koşarken ayak zemine gömülmüyor', r.runGapMin > -.04 && r.runGapMin < .04, r.runGapMin.toFixed(3) + '..' + r.runGapMax.toFixed(3));
  log('depar klibi', /sprint/.test(r.sprintWeights), r.sprintWeights);
  log('çömelme klibi', /cwalk/.test(r.crouchWeights) && r.crouchHipH < .85 && Math.abs(r.crouchGap) < .06, r.crouchWeights + ' kalça ' + r.crouchHipH.toFixed(2) + ' ayak ' + r.crouchGap.toFixed(3));
  log('saldırı: kılıç klibi gövdeyi ve kılıç kolunu sürüyor', r.atkSt === 'attack' && r.atkW > .8 && /sw[ABC]/.test(r.atkWeights) && r.armW > .7, r.atkSt + ' cw ' + r.atkW.toFixed(2) + ' ' + r.atkWeights + ' kol ' + r.armW.toFixed(2));
  const SWK = ['swA', 'swB', 'swC'];
  r.combo.forEach((c, i) => {
    log(`kombo ${i + 1}: duruş pozu ${c.pose} -> ${SWK[c.pose]}`, new RegExp(SWK[c.pose]).test(c.w), c.w);
    log(`kombo ${i + 1}: kılıç en hızlı vuruş anında (u .3-.6)`, c.pkU > .28 && c.pkU < .62 && c.pk > 6, 'u ' + c.pkU.toFixed(2) + ' el ' + c.pk.toFixed(1) + ' m/s');
    log(`kombo ${i + 1}: ayak zemine gömülmüyor, gövde ileri çöküyor`, c.gMin > -.04 && c.hipMin < 1.0, 'ayak ' + c.gMin.toFixed(3) + ' kalça en alçak ' + c.hipMin.toFixed(2));
    log(`kombo ${i + 1}: NaN yok`, !c.nan); });
  log('saldırıdan sonra yürüme katmanı, kol yine prosedürel', !/sw[ABC]/.test(r.afterAtk) && r.afterArmW < .01, r.afterAtk + ' kol ' + r.afterArmW.toFixed(2));
  log('koşu saldırısı: Sword_Attack klibi gövdeyi ve kılıç kolunu sürüyor', r.rSt === 'runatk' && r.rSpd > 4 && /swR/.test(r.rW) && r.rArm > .7, r.rSt + ' hız ' + r.rSpd.toFixed(1) + ' ' + r.rW + ' kol ' + r.rArm.toFixed(2));
  log('koşu saldırısı: kılıç en hızlı vuruş anında', Math.abs(r.rPkU - r.rHitU) < .12 && r.rPk > 10, 'u ' + r.rPkU.toFixed(2) + ' vuruş u ' + r.rHitU.toFixed(2) + ' el ' + r.rPk.toFixed(1) + ' m/s');
  log('koşu saldırısı: ayak zemine gömülmüyor, hamlede kalça alçalıyor', r.rGMin > -.04 && r.rHipMin < .95, 'ayak ' + r.rGMin.toFixed(3) + ' kalça ' + r.rHipMin.toFixed(2));
  log('koşu saldırısı: NaN yok', !r.rNan);
  log('koşu saldırısından sonra yürüme katmanı', r.rAfterSt === 'move' && !/swR/.test(r.rAfter) && r.rAfterArm < .01, r.rAfterSt + ' ' + r.rAfter);
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
  log('ölüm: Death01 klibi tüm gövdeyi sürüyor (kılıç kolu dahil)', r.dClip && /death/.test(r.dW) && r.dArm > .9, r.dW + ' kol ' + r.dArm.toFixed(2));
  log('ölüm: ragdoll eğimi yok (çift dönüş yok)', r.dRag0 === 0 && r.dMaxRag === 0, r.dMaxRag.toFixed(3));
  log('ölüm: sırt üstü yere düşüyor', r.dHip[r.dHip.length - 1] < .3 && r.dHip[0] > .8 && r.dHead < .35 && r.dChestDz < -.2, 'kalça ' + r.dHip.join(' ') + ' baş ' + (r.dHead || 0).toFixed(2) + ' göğüs ' + (r.dChestDz || 0).toFixed(2));
  log('ölüm: baş/gövde zemine gömülmüyor', r.dGap > .02, r.dGap.toFixed(3));
  log('ölüm: NaN yok', !r.dNan);
  log('ölümden sonra yeniden doğuş, ayakta', r.dAfterSt === 'move' && !r.dAfterClip && !/death/.test(r.dAfterW) && r.dAfterHip > .8, r.dAfterSt + ' ' + r.dAfterW + ' kalça ' + r.dAfterHip.toFixed(2));
  log('yerdeyken ölüm: prosedürel ragdoll kalıyor', !r.dDownClip && r.dDownW < .05, 'klip ' + r.dDownClip + ' cw ' + r.dDownW.toFixed(2));
};
