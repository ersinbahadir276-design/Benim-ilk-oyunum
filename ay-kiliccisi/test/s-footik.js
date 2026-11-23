// Terrain foot IK: planted feet touch sloped ground, pelvis drops, nothing breaks while walking/dodging
module.exports = async ({ G, log, shot }) => {
  const r = await G(() => {
    const g = __G, P = g.P, DT = 1 / 60; g.GT.paused = true;
    const sim = (s) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - x, a.z - z) < 80) { a.x += 500; a.hx = a.x; } };
    const stand = (x, z, yaw) => { g.tp(x, z); far(x, z); Object.assign(P, { st: 'move', t: 0, air: false, yaw, vx: 0, vz: 0, pinBy: null, inv: 9 }); P.rag.ang = 0; g.IN.mx = 0; g.IN.my = 0; sim(1.2); };
    const feet = () => ['leftFoot', 'rightFoot'].map((n) => { const a = g.mpt(g.PM, g.SK.GP[g.HB[n]]); return a[1] - g.hAt(a[0], a[2]); });
    const o = {};
    // flat reference: ankle height above ground on the flattest dry spot near the village
    let flat = null, slope = null;
    for (let i = 0; i < 40000 && (!flat || !slope); i++) {
      const x = -1300 + (i % 200) * 13, z = -1300 + Math.floor(i / 200) * 13; if (g.depthAt(x, z) > 0) continue;
      const gx = (g.hAt(x + .5, z) - g.hAt(x - .5, z)), gz = (g.hAt(x, z + .5) - g.hAt(x, z - .5)), s = Math.hypot(gx, gz);
      if (!flat && s < .01) flat = [x, z];
      if (!slope && s > .4 && s < .7) slope = [x, z, Math.atan2(gx, gz)];
    }
    o.flat = flat; o.slope = slope;
    stand(flat[0], flat[1], 0); const ref = feet(); o.ref = ref.map((v) => +v.toFixed(3));
    const h0 = (ref[0] + ref[1]) / 2;
    // slope, standing across it (one foot uphill) — with IK on and off
    const across = slope[2] + Math.PI / 2;
    g.FIK.on = 0; stand(slope[0], slope[1], across); const off = feet(); o.offErr = +Math.max(...off.map((v) => Math.abs(v - h0))).toFixed(3);
    g.FIK.on = 1; stand(slope[0], slope[1], across); const on = feet(); o.onErr = +Math.max(...on.map((v) => Math.abs(v - h0))).toFixed(3);
    o.pel = +g.FIK.pel.toFixed(3); o.w = +g.FIK.w.toFixed(2);
    // facing up the slope
    stand(slope[0], slope[1], slope[2]); o.upErr = +Math.max(...feet().map((v) => Math.abs(v - h0))).toFixed(3);
    // walk across slope for 3 s, dodge, jump: no NaN, IK fades in air
    stand(slope[0], slope[1], across); g.IN.my = 1; sim(3); g.IN.my = 0;
    o.nan = g.SK.GP.some((p) => p.some((v) => !isFinite(v))) || !isFinite(g.PM[13]);
    g.press('jump'); sim(.25); o.airW = +g.FIK.w.toFixed(2); sim(1.5); o.landW = +g.FIK.w.toFixed(2);
    return o;
  });
  log('düz zemin referansı ve eğim bulundu', r.flat && r.slope, JSON.stringify({ flat: r.flat, slope: r.slope, ref: r.ref }));
  log('IK açık: eğimde iki ayak da zemine değiyor (<4 cm)', r.onErr < .04, 'açık ' + r.onErr + ' m · kapalı ' + r.offErr + ' m');
  log('IK hatayı en az yarıya indiriyor', r.onErr < r.offErr * .5, r.onErr + ' < ' + r.offErr + '/2');
  log('pelvis alçak ayağa iner', r.pel < -.01 && r.w > .9, 'pel ' + r.pel + ' w ' + r.w);
  log('yokuş yukarı bakarken ayaklar zeminde (<6 cm)', r.upErr < .06, r.upErr);
  log('yürüyüşte NaN yok', !r.nan);
  log('havada IK kapanır, inince geri gelir', r.airW < .5 && r.landW > .9, 'hava ' + r.airW + ' iniş ' + r.landW);
  await shot('footik-slope');
};
