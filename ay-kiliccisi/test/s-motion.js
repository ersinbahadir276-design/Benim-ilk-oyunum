// Motion layer (src/32-secondary.js): stride hips, acceleration lean, turn banking, directional hit flinch.
// Every check reads the skinned skeleton (model space SK.GP), so it measures what is drawn, not the pose numbers.
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, IN = g.IN, H = g.HB, SK = g.SK, M = g.ML, DT = 1 / 60; g.GT.paused = true;
    const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f) f(i); } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (Math.hypot(a.x - x, a.z - z) < 90) { a.x += 500; a.hx = a.x; } };
    const fresh = (x, z, yaw) => { g.tp(x, z); Object.assign(P, { st: 'move', t: 0, inv: 0, alive: true, air: false, yaw: yaw || 0, vy: 0, crouch: false, vx: 0, vz: 0, berserk: 0, hp: 9999 }); P.rag.ang = 0; IN.kx = IN.kz = IN.mx = IN.mz = 0; P.sprintHeld = false; g.CAM.yaw = 0; };
    let flat = null;
    for (let i = 0; i < 20000 && !flat; i++) { const x = -900 + Math.random() * 1800, z = -900 + Math.random() * 1800; if (g.depthAt(x, z) > 0) continue;
      let ok = true; for (let a = 0; a < 8 && ok; a++) for (const d of [4, 9, 14]) { const px = x + Math.sin(a) * d, pz = z + Math.cos(a) * d; if (g.depthAt(px, pz) > 0 || Math.abs(g.hAt(px, pz) - g.hAt(x, z)) > .25) ok = false; }
      if (ok) flat = [x, z]; }
    const o = { found: !!flat }; if (!flat) return o;
    const GP = SK.GP, hd = () => GP[H.head], hip = () => GP[H.hips];
    far(...flat); fresh(...flat); sim(1.2);
    const rest = { hz: hd()[2] - hip()[2], hx: hd()[0] - hip()[0] };
    // ---- stride: pelvis yaw follows the forward leg, hip drops on the swing side
    const yawC = [], dropC = []; let accLean = 0, steady = [];
    sim(2.4, (i) => { IN.kz = 1; const lz = GP[H.leftUpperLeg][2] - GP[H.rightUpperLeg][2], ly = GP[H.leftUpperLeg][1] - GP[H.rightUpperLeg][1];
      if (i < 20) accLean = Math.max(accLean, hd()[2] - hip()[2]); if (i > 90) { yawC.push([Math.sin(P.ph), lz]); dropC.push([Math.cos(P.ph), ly]); steady.push(hd()[2] - hip()[2]); } });
    const corr = (a) => { let s = 0, n = 0, m = 0; for (const [x, y] of a) { s += x * y; n += x * x; m += y * y; } return s / Math.sqrt(n * m + 1e-12); };
    const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
    o.stride = { yawCorr: +corr(yawC).toFixed(2), yawAmp: +Math.max(...yawC.map((v) => Math.abs(v[1]))).toFixed(3), dropCorr: +corr(dropC).toFixed(2), dropAmp: +Math.max(...dropC.map((v) => Math.abs(v[1]))).toFixed(3) };
    o.lean = { rest: +rest.hz.toFixed(3), acc: +accLean.toFixed(3), steady: +avg(steady).toFixed(3) };
    // ---- braking: torso goes back relative to steady running
    let brake = 9; IN.kz = 0; sim(.35, () => { brake = Math.min(brake, hd()[2] - hip()[2]); }); o.lean.brake = +brake.toFixed(3); sim(1.2);
    // ---- turning while running: head offset toward the turn centre (+x side when yaw increases)
    IN.kz = 1; sim(1.2); let bankX = 0; const bx = []; sim(1, () => { g.CAM.yaw += 2.2 * DT; bx.push(hd()[0] - hip()[0]); }); bankX = avg(bx.slice(20));
    const bx2 = []; sim(1, () => { g.CAM.yaw -= 2.2 * DT; bx2.push(hd()[0] - hip()[0]); }); o.bank = [+(bankX - rest.hx).toFixed(3), +(avg(bx2.slice(20)) - rest.hx).toFixed(3)];
    IN.kz = 0; sim(1.5);
    // ---- hits from front, back and left side (push direction = away from the attacker)
    const hitFrom = (ang) => { fresh(...flat); sim(1); const h0 = hd().slice(), hp0 = hip().slice(); const yaw = P.yaw, ax = P.x + Math.sin(yaw + ang) * 1.5, az = P.z + Math.cos(yaw + ang) * 1.5;
      const d = [P.x - ax, P.z - az], L = Math.hypot(...d); g.hitPlayer({ dmg: 1, dir: [d[0] / L, d[1] / L], src: { x: ax, z: az }, noPush: true });
      let mz = 0, mx = 0; sim(.3, () => { const dz = (hd()[2] - hip()[2]) - (h0[2] - hp0[2]), dx = (hd()[0] - hip()[0]) - (h0[0] - hp0[0]); if (Math.abs(dz) > Math.abs(mz)) mz = dz; if (Math.abs(dx) > Math.abs(mx)) mx = dx; });
      sim(1.2); const settle = Math.hypot(hd()[2] - hip()[2] - (h0[2] - hp0[2]), hd()[0] - hip()[0] - (h0[0] - hp0[0])); return [+mz.toFixed(3), +mx.toFixed(3), +settle.toFixed(3)]; };
    o.front = hitFrom(0); o.back = hitFrom(Math.PI); o.left = hitFrom(Math.PI / 2); o.right = hitFrom(-Math.PI / 2);
    // hit during an attack (no state change) still flinches
    fresh(...flat); sim(.5); P.st = 'attack'; P.t = 0; P.combo = 0; P.atkT = .46; const h0 = hd()[2] - hip()[2]; P.berserk = 5;
    g.hitPlayer({ dmg: 1, dir: [-Math.sin(P.yaw), -Math.cos(P.yaw)], src: { x: P.x + Math.sin(P.yaw), z: P.z + Math.cos(P.yaw) }, noPush: true }); let mz = 0; sim(.15, () => { mz = Math.min(mz, (hd()[2] - hip()[2]) - h0); });
    o.atkFlinch = +mz.toFixed(3); P.berserk = 0;
    o.finite = SK.GP.every((p) => p.every(Number.isFinite)) && [M.hf, M.hs, M.ht, M.acc, M.turn].every(Number.isFinite);
    sim(1.5); g.CAM.tx = P.x; g.CAM.tz = P.z; IN.kz = 0; P.hp = 100; g.GT.paused = false; return o; });
  const j = (v) => JSON.stringify(v);
  log('düz test yeri bulundu', r.found);
  if (!r.found) return;
  log('adım: leğen öndeki bacakla birlikte dönüyor', r.stride.yawCorr > 0.6 && r.stride.yawAmp > 0.015, j(r.stride));
  log('adım: salınan bacağın kalçası düşüyor', Math.abs(r.stride.dropCorr) > 0.6 && r.stride.dropAmp > 0.008, j(r.stride));
  log('ivme: hızlanırken gövde öne eğiliyor', r.lean.acc > r.lean.steady + 0.02, j(r.lean));
  log('fren: dururken gövde geriye yaslanıyor', r.lean.brake < r.lean.steady - 0.03, j(r.lean));
  log('dönüş: gövde dönüşün içine yatıyor (iki yön)', r.bank[0] > 0.02 && r.bank[1] < -0.02, j(r.bank));
  log('vuruş önden: baş geriye savruluyor', r.front[0] < -0.04, j(r.front));
  log('vuruş arkadan: baş öne savruluyor', r.back[0] > 0.03, j(r.back));
  log('vuruş yandan: baş vuruştan uzağa savruluyor (sol/sağ ters)', r.left[1] * r.right[1] < 0 && Math.abs(r.left[1]) > 0.03 && Math.abs(r.right[1]) > 0.03, j([r.left, r.right]));
  log('vuruş sonrası duruş eski hâline dönüyor', [r.front, r.back, r.left, r.right].every((v) => v[2] < 0.03), j([r.front[2], r.back[2], r.left[2], r.right[2]]));
  log('öfkede saldırırken vurulunca da sarsılıyor (durum değişmeden)', r.atkFlinch < -0.03, r.atkFlinch);
  log('iskelet ve yaylar sonlu (NaN yok)', r.finite);
  await shot('motion');
};
