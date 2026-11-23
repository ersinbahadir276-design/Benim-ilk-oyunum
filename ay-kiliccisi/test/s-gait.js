// node test/harness.js test/s-gait.js  -> hero locomotion: keyframed gait, idle layer, lean, terrain foot IK
module.exports = async ({ page, G, log, shot }) => {
  await page.waitForTimeout(800);
  const r = await G(() => {
    const {P,GT,GL,POSE0,heroGait,heroIdle,applyPose,strideLen,footIK,SK,HB,mpt,mtrs,hAt,waterAt,step,wolves,PI}=__G,PLD=__G.PLD(),PM_=()=>__G.PM;
    const out = [], ok = (name, pass, extra) => out.push({ name, pass: !!pass, extra: JSON.stringify(extra) });
    GT.paused = true;
    const gp = (b) => SK.GP[HB[b]].slice();
    const poseAt = (spd, sprint, u, yr) => {
      P.st = 'move'; P.crouch = false; P.air = false; P.spd = spd; P.sprinting = sprint; P.ph = u * 2 * PI; GL.yr = yr || 0; GL.acc = 0;
      const q = Object.assign({}, POSE0); heroGait(q, 0); applyPose(q); return q; };
    const toeDrop = (side) => { const f = gp(side + 'Foot'), t = gp(side + 'Toes'); return f[1] - t[1]; }; // >0: toe below ankle
    const rest = (() => { const q = Object.assign({}, POSE0); applyPose(q); return { L: toeDrop('left') }; })();
    // 1) walk, left heel strike (u=0)
    poseAt(1.4, false, 0);
    const lf = gp('leftFoot'), rf = gp('rightFoot'), lh = gp('leftUpperLeg'), rh = gp('rightUpperLeg'), lhand = gp('leftHand'), lsh = gp('leftUpperArm');
    ok('yürüme: topuk vuruşunda sol ayak önde', lf[2] > rf[2] + .3, { solZ: +lf[2].toFixed(3), sağZ: +rf[2].toFixed(3) });
    ok('yürüme: topuk vuruşunda sol ayak ucu yukarıda', toeDrop('left') < rest.L - .01, { şimdi: +toeDrop('left').toFixed(3), dinlenme: +rest.L.toFixed(3) });
    ok('yürüme: kalça dönüşü (sol kalça önde)', lh[2] > rh[2] + .01, { sol: +lh[2].toFixed(3), sağ: +rh[2].toFixed(3) });
    ok('yürüme: sol kol bacağa ters (geride)', lhand[2] < lsh[2] - .03, { el: +lhand[2].toFixed(3), omuz: +lsh[2].toFixed(3) });
    // 2) left midstance: pelvis drops on the swinging (right) side
    poseAt(1.4, false, .25);
    ok('yürüme: tek ayak desteğinde salınan taraf kalçası düşer', gp('rightUpperLeg')[1] < gp('leftUpperLeg')[1] - .004, { sağY: +gp('rightUpperLeg')[1].toFixed(3), solY: +gp('leftUpperLeg')[1].toFixed(3) });
    // 3) push-off: heel lifts, toe down
    poseAt(1.4, false, .55);
    ok('yürüme: itişte topuk kalkar', toeDrop('left') > rest.L + .01, { şimdi: +toeDrop('left').toFixed(3), dinlenme: +rest.L.toFixed(3) });
    // 4) over a whole cycle no foot sinks below the ground plane; stance foot slides back at about ground speed
    const res = {};
    for (const [name, spd, spr] of [['yürüme', 1.4, false], ['koşu', 3.7, false], ['depar', 6.6, true]]) {
      let minY = 9, slide = [];
      const stance = name === 'yürüme' ? [.08, .4] : [.03, .27];
      let prev = null;
      for (let i = 0; i <= 100; i++) {
        const u = i / 100; poseAt(spd, spr, u);
        const ly = gp('leftFoot')[1] + SK.root[1] * 0, ry = gp('rightFoot')[1];
        minY = Math.min(minY, ly, ry);
        const z = gp('leftFoot')[2] - gp('hips')[2];
        if (u >= stance[0] && u <= stance[1]) { if (prev !== null) slide.push(z - prev); prev = z; }
      }
      const dzdu = slide.reduce((a, b) => a + b, 0) / ((stance[1] - stance[0])), ideal = -strideLen(spd), ratio = dzdu / ideal;
      res[name] = { enAltAyak: +minY.toFixed(3), kaymaOranı: +ratio.toFixed(2) };
      const restAnkle = PLD.bones[HB.leftFoot].r[1];
      ok(name + ': ayak zemine gömülmüyor', minY > restAnkle - .02, { enAlt: +minY.toFixed(3), bilekDinlenme: +restAnkle.toFixed(3) });
      ok(name + ': basan ayak zeminde kaymıyor (geri gidiş ≈ adım boyu)', ratio > .55 && ratio < 1.6, res[name]);
    }
    // 5) turn lean: turning toward local +x (yaw increasing) puts the head on the +x side of the hips
    const M0 = mtrs([0, 0, 0], [0, 0, 0]), M1 = mtrs([0, 0, 0], [0, .1, 0]), f0 = mpt(M0, [0, 0, 1]), f1 = mpt(M1, [0, 0, 1]);
    const turnX = Math.sign(mpt(M0, [1, 0, 0])[0] * (f1[0] - f0[0]) + mpt(M0, [1, 0, 0])[2] * (f1[2] - f0[2]));
    poseAt(6.6, true, .2, 3); const hx = gp('head')[0] - gp('hips')[0];
    ok('dönüşte gövde merkeze doğru eğilir', Math.sign(hx) === turnX && Math.abs(hx) > .03, { başX: +hx.toFixed(3), dönüşYönü: turnX });
    // 6) speed blend is continuous (no pops between walk, jog and sprint)
    let maxJump = 0, last = null;
    for (let s = .1; s <= 6.6; s += .05) { const q = poseAt(s, true, .3); if (last) for (const k of ['LthX', 'Lkn', 'RthX', 'Rkn', 'LaX', 'spX']) maxJump = Math.max(maxJump, Math.abs(q[k] - last[k])); last = q; }
    ok('hız harmanı sürekli (0.05 m/sn adımda sıçrama yok)', maxJump < .1, { enBüyükSıçrama: +maxJump.toFixed(3) });
    // 7) idle layer moves (breathing / weight shift) but stays planted
    const a = Object.assign({}, POSE0), b = Object.assign({}, POSE0); heroIdle(a, 4); heroIdle(b, 12);
    ok('duruş: nefes ve ağırlık aktarımı', Math.abs(a.pelZ - b.pelZ) > .01 && (() => { let lo = 9, hi = -9; for (let t = 0; t < 5; t += .1) { const c = Object.assign({}, POSE0); heroIdle(c, t); lo = Math.min(lo, c.chX); hi = Math.max(hi, c.chX); } return hi - lo > .03; })(), { pelZ: [+a.pelZ.toFixed(3), +b.pelZ.toFixed(3)] });
    return { out, res };
  });
  for (const o of r.out) log(o.name, o.pass, o.extra);
  // 8) terrain foot IK in the running game: find a slope, stand still, both feet touch the ground
  const s = await G(() => {
    const {P,GT,GL,POSE0,heroGait,heroIdle,applyPose,strideLen,footIK,SK,HB,mpt,mtrs,hAt,waterAt,step,wolves,PI}=__G,PLD=__G.PLD(),PM_=()=>__G.PM;
    let best = null;
    for (let i = 0; i < 4000; i++) { const x = (Math.random() - .5) * 1600, z = (Math.random() - .5) * 1600, g = Math.hypot(hAt(x + .5, z) - hAt(x - .5, z), hAt(x, z + .5) - hAt(x, z - .5));
      if (g > .18 && g < .34 && waterAt(x, z) < hAt(x, z) - 1 && (!best || Math.abs(g - .26) < Math.abs(best.g - .26))) best = { x, z, g }; }
    if (!best) return null;
    P.x = best.x; P.z = best.z; P.y = hAt(P.x, P.z); P.st = 'move'; P.air = false; P.spd = 0; P.vx = P.vz = 0;
    const gx = hAt(P.x + .5, P.z) - hAt(P.x - .5, P.z), gz = hAt(P.x, P.z + .5) - hAt(P.x, P.z - .5); P.yaw = Math.atan2(gz, -gx); // side-on to the slope
    for (const w of wolves) w.aware = 0;
    const DT = 1 / 60; let errs = [];
    const meas = () => { const o = []; for (const b of [HB.leftFoot, HB.rightFoot]) { const w = mpt(PM_(), SK.GP[b]); o.push(w[1] - hAt(w[0], w[2])); } return o; };
    for (let i = 0; i < 90; i++) { GT.time += DT; step(DT); }
    const withIK = meas();
    applyPose(P.ps); const noIK = meas(); applyPose(footIK(P.ps, 0));
    return { g: +best.g.toFixed(2), withIK: withIK.map((v) => +v.toFixed(3)), noIK: noIK.map((v) => +v.toFixed(3)), restAnkle: PLD.bones[HB.leftFoot].r[1] };
  });
  if (!s) log('eğimli zemin bulunamadı', false);
  else {
    const spread = Math.abs(s.withIK[0] - s.withIK[1]);
    log('eğimde iki ayak da zemine basar (ayak IK)', spread < .045 && Math.abs(s.noIK[0] - s.noIK[1]) > spread + .03 && Math.min(...s.withIK) > s.restAnkle - .05, JSON.stringify(s));
  }
  await shot('gait-slope');
};
module.exports.pauseAtStart = true;
