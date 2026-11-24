// v29 — shift lock (karakter kameraya bakar, yana yürür, yana/geri atılır), kilit yok + odak, yay nişangâhı
const run = async ({ G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, CAM = __G.CAM, out = {};
    for (const g of __G.GOBS) { if (!g.dead) { g.dead = 1; g.x = 5000 } } for (const w of __G.wolves) { if (!w.boss) { w.dead = 300; w.st = 'dead'; w.x = 9000 } }
    const reset = () => { __G.tp(20, 290); Object.assign(P, { st: 'move', t: 0, yaw: 0, vx: 0, vz: 0, sta: 100, inv: 0, alive: true }); IN.mx = IN.mz = 0; CAM.yaw = 0; __G.sim(1 / 60, 5) };
    reset(); { const x0 = P.x, z0 = P.z; IN.mx = 1; for (let i = 0; i < 60; i++) { CAM.yaw = 0; __G.sim(1 / 60, 1) } IN.mx = 0; out.strafe = { yaw: +P.yaw.toFixed(2), dx: +(P.x - x0).toFixed(1), dz: +(P.z - z0).toFixed(1) } }
    reset(); { IN.mx = 1; __G.sim(1 / 60, 3); __G.press('dodge'); __G.sim(1 / 60, 2); out.dashSide = { kind: P.dodgeKind, yaw: +P.yaw.toFixed(2) }; IN.mx = 0; __G.sim(1 / 60, 30) }
    reset(); { IN.mz = -1; __G.sim(1 / 60, 3); __G.press('dodge'); __G.sim(1 / 60, 2); out.dashBack = { kind: P.dodgeKind, yaw: +P.yaw.toFixed(2) }; IN.mz = 0 }
    reset(); { const g = X.mkHuman(P.x + 2.5, P.z + 2.5, { lv: 1, hp: 999 }); g.st = 'chase'; g.cd = 9; CAM.yaw = .3; P.lock = null; __G.press('atk'); __G.sim(1 / 60, 4); out.atk = { yaw: +P.yaw.toFixed(2), want: +Math.atan2(2.5, 2.5).toFixed(2), lock: !!P.lock }; g.dead = 1; g.x = 5000 }
    return out });
  log('SHIFT LOCK: sağa yürürken karakter öne (kameraya) bakıyor, yana kayıyor', Math.abs(R.strafe.yaw) < .15 && Math.abs(R.strafe.dx) > 2 && Math.abs(R.strafe.dz) < 1, JSON.stringify(R.strafe));
  log('SHIFT LOCK: yana atılma — yüz önde, gövde yana', /left|right/.test(R.dashSide.kind) && Math.abs(R.dashSide.yaw) < .15, JSON.stringify(R.dashSide));
  log('SHIFT LOCK: geri atılma — yüz önde', R.dashBack.kind === 'back' && Math.abs(R.dashBack.yaw) < .15, JSON.stringify(R.dashBack));
  log('KİLİT YOK: saldırı kameranın baktığı yöndeki düşmana döner, kilit kurulmaz', !R.atk.lock && Math.abs(R.atk.yaw - R.atk.want) < .3, JSON.stringify(R.atk));
};

run.shiftLock = 1; module.exports = run;
