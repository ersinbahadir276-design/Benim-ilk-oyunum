// v30 — eğilip üstüne atlama (sessiz alt etme) her düşmanı öldürür: yüksek canlı kurt lideri, kalkanlı haydut, elit goblin
module.exports = async ({ page, G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; __G.GT.tod = .35 });
  const res = [];
  for (const kind of ['elite', 'alpha', 'human']) {
    const r = await G((kind) => { const P = __G.P, X = __G.X, IN = __G.IN; for (const g of __G.GOBS) { if (!g.dead) { g.dead = 1; g.x = 5000 } } for (const w of __G.wolves) { if (!w.boss) { w.dead = 300; w.st = 'dead'; w.x = 9000 } }
      __G.tp(20, 290); Object.assign(P, { st: 'move', t: 0, yaw: 0, vx: 0, vz: 0, crouch: true, alive: true, td: null, air: false }); P.hp = X.maxHP();
      let v; if (kind === 'alpha') { v = __G.mkWolf(P.x, P.z + 2.2, { alpha: true }); X.scaleFoe(v, 18, 300); v.yaw = 0; v.st = 'idle'; v.aware = 0; v.calm = 0 } else { v = X.mkHuman(P.x, P.z + 2.2, { lv: 19, hp: 520, shield: kind === 'human', elite: kind === 'elite' }); v.yaw = 0; v.st = 'idle'; v.aware = 0; v.seeT = 9 }
      const hp0 = v.max; v.aware = 0; v.st = 'idle'; __G.press('jump'); for (let i = 0; i < 5; i++) { __G.sim(1 / 60, 1); v.aware = 0; v.st = 'idle' } __G.press('jump'); for (let i = 0; i < 260 && !v.dead; i++) { __G.sim(1 / 60, 1); v.aware = 0 } return { kind, hp0, td: P.td ? P.td.kind : 'none', dead: !!v.dead, hp: Math.round(Math.max(0, v.hp)), inFoes: X.foes().includes(v) } }, kind);
    res.push(r) }
  for (const r of res) log('sessiz alt etme öldürür: ' + r.kind + ' (can ' + r.hp0 + ')', r.dead && !r.inFoes, JSON.stringify(r));
};
