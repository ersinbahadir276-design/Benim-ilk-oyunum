// Aşama 2 görüntüleri: savuşturma, karşı darbe, Ay Hilali, Rüzgâr Delişi
module.exports = async ({ G, shot }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.tod = .3; __G.SYS.stances = { stone: 1, wind: 1, moon: 1, water: 1 }; });
  const setup = async (st) => G((st) => { const P = __G.P; for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = 9000 } for (const g of __G.GOBS) { g.dead = 1; g.x = g.hx = 5000 } __G.SYS.stance = st; __G.tp(6, 250); Object.assign(P, { st: 'move', yaw: 0, sta: 100, atk: null }); __G.GT.paused = false; __G.sim(1 / 60, 10);
    const mk = (dx, dz) => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead); g.dead = 0; g.x = g.hx = P.x + dx; g.z = g.hz = P.z + dz; g.hp = g.max = 9999; g.st = 'stagger'; g.t = -99; g.cd = 99; g.yaw = Math.atan2(P.x - g.x, P.z - g.z); return g }; window.__mk = mk; __G.CAM.yaw = .7; __G.CAM.pitch = .22; __G.CAM.dist = 5.2 }, st);
  await setup('stone'); await G(() => { const P = __G.P, g = __mk(0, 1.5); g.st = 'strike'; g.t = 0; g.hitDone = true; __G.IN.blockHeld = true; __G.sim(1 / 60, 5); __G.hitPlayer({ src: g, dmg: 7, guard: 18 }); __G.IN.blockHeld = false; __G.sim(1 / 60, 3); __G.GT.paused = true }); await shot('d-parry', { wait: 200 });
  await G(() => { __G.GT.paused = false; __G.press('atk'); for (let i = 0; i < 14; i++) __G.sim(1 / 60, 1); __G.GT.paused = true }); await shot('d-riposte', { wait: 200 });
  await setup('moon'); await G(() => { __mk(0, 2.2); __mk(0, 5.2); __G.X.startLight(1); for (let i = 0; i < 70; i++) { __G.sim(1 / 60, 1); if (__G.P.atk && __G.P.atk.wave) break } __G.sim(1 / 60, 2); __G.GT.paused = true }); await shot('d-moonwave', { wait: 200 });
  await setup('wind'); await G(() => { __mk(0, 2.2); __mk(.2, 3); __mk(-.2, 3.7); __G.X.startLight(2); for (let i = 0; i < 70; i++) { __G.sim(1 / 60, 1); if (__G.P.atk && __G.P.atk.pierce) break } __G.sim(1 / 60, 2); __G.GT.paused = true }); await shot('d-windpierce', { wait: 200 });
};
