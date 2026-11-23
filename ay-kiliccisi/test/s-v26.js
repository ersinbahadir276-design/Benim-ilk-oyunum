// v26 — arazi (tepeler, mesalar, kar, şelale yaylası, uçurum), Gölge Kulesi, haydut kalkanı, şövalye düellosu, yaratık çatışması,
// gece hortlakları, lonca binası + paralı asker, uçurumdan düşürme, duvara çarptırma
module.exports = async ({ page, G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; __G.fastFade = 1 });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, GT = __G.GT, out = {};
    const clear = () => { for (const w of __G.wolves) { if (w.boss) continue; w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { if (!g.dead) { g.dead = 1; g.x = 5000 + Math.random() * 100 } g.so = 0 } };
    const reset = (x = 20, z = 290) => { clear(); __G.tp(x, z); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, guard: 100, yaw: 0, vx: 0, vz: 0, atk: null, held: 0 }); P.hp = X.maxHP(); IN.mx = IN.mz = 0; IN.blockHeld = false; __G.sim(1 / 60, 3) };
    const run = (n, f) => { for (let i = 0; i < n; i++) { __G.sim(1 / 60, 1); if (f && f(i) === false) break } };
    // 1) terrain: variety of height, the snow zone, the falls plateau above the river, mesas
    { let mn = 1e9, mx = -1e9; for (let x = -1300; x <= 1300; x += 50) for (let z = -1300; z <= 1300; z += 50) { const h = __G.hAt(x, z); mn = Math.min(mn, h); mx = Math.max(mx, h) } let steep = 0; for (let x = -1200; x <= 1200; x += 20) for (let z = -1200; z <= 1200; z += 20) { const g = Math.abs(__G.hAt(x + 2, z) - __G.hAt(x - 2, z)) / 4; if (g > 1.35) steep++ }
      const a = [-180, -690], b = [-300, -520], l = Math.hypot(a[0] - b[0], a[1] - b[1]), ux = (a[0] - b[0]) / l, uz = (a[1] - b[1]) / l; const plateau = __G.hAt(a[0] + ux * 40 + uz * 20, a[1] + uz * 40 - ux * 20), below = __G.hAt(a[0] - ux * 10, a[1] - uz * 10);
      out.terrain = { range: [Math.round(mn), Math.round(mx)], steepCells: steep, snow: __G.zoneAt(-930, -1050), plateau: +plateau.toFixed(1), below: +below.toFixed(1), spawnFlat: Math.abs(__G.hAt(20, 300) - __G.hAt(40, 300)) < 2 } }
    // 2) a cliff cannot be walked up
    reset(); { let best = null; for (let x = -1100; x < 1100 && !best; x += 9) for (let z = -1100; z < 1100 && !best; z += 9) { if (Math.hypot(x, z) < 400 || __G.depthAt(x, z) > .1) continue; const h0 = __G.hAt(x, z), h1 = __G.hAt(x + 3, z); if ((h1 - h0) / 3 > 2.2) best = [x, z] } out.cliff = { found: !!best }; if (best) { __G.tp(best[0] - 1.5, best[1]); P.yaw = Math.PI / 2; __G.CAM.yaw = Math.PI / 2; const y0 = P.y; IN.mz = 1; run(90); IN.mz = 0; out.cliff.climbed = +(P.y - y0).toFixed(1) } }
    // 3) the Shadow Tower: a fifth dungeon entry with five floors, enterable
    { const D = X.DUNS.tower; out.tower = { ok: !!D, floors: D && D.floors, zone: D && __G.zoneAt(D.x, D.z) } }
    // 4) bandit shield: light hits from the front are blocked; a kick opens it
    reset(); { const g = X.mkHuman(P.x, P.z + 2, { lv: 3, shield: true, hp: 300 }); g.yaw = Math.PI; g.st = 'chase'; g.cd = 9; P.yaw = 0; const h0 = g.hp; X.foeHurt(g, 20, 0, 1, 'light0'); const blocked = g.hp === h0; X.startKick(); run(20); const open = GT.clock < g.shieldT; g.st = 'chase'; X.foeHurt(g, 20, 0, 1, 'light0'); out.shield = { blocked, open, hurtAfter: g.hp < h0, human: !!g.human } }
    // 5) events: bandits, the knight, the clash (wolves and goblins really hurt each other)
    reset(-300, 120); { const res = {}; for (const k of ['bandits', 'knight', 'clash']) { const e = { k, t: 0 }; let ok = false; try { ok = X.EVDEF[k].start(e) } catch (x) { ok = 'ERR ' + x } res[k] = { ok, n: e.ents ? e.ents.length : 0 }; if (k === 'clash' && ok === true) { X.EVT.cur = e; const hp0 = e.ents.reduce((s, f) => s + f.hp, 0); run(600, () => { P.x = e.x + 60; P.z = e.z }); res[k].hpLost = Math.round(hp0 - e.ents.reduce((s, f) => s + Math.max(0, f.hp), 0)); res[k].dead = e.ents.filter(f => f.dead).length } if (ok === true) { X.evEnd(false) } } out.ev = res }
    // 6) night: the dead rise outside the walls, and sink at dawn
    reset(-300, 120); { window.__noAutoQ = 0; X.EVT.t = 1e9; GT.tod = .9; X.HUM.nt = 0; run(30); const n = X.HUM.night.length, undead = X.HUM.night.every(g => g.undead && g.spdMul < 1); GT.tod = .3; run(5); const after = X.HUM.night.length; window.__noAutoQ = 1; out.night = { n, undead, after } }
    // 7) the guild hall: hire a mercenary, it kills a goblin
    reset(); { const c = X.HUM; const clerk = __G.NPCS.find(n => n.role === 'guild'); __G.tp(clerk.x + 1, clerk.z); __G.SYS.gold = 500; const ok = X.hireMerc(); const m = X.HUM.ally; __G.tp(20, 290); m.x = P.x + 1.5; m.z = P.z + 1.5; const g = X.mkHuman(P.x + 4, P.z + 4, { lv: 1, hp: 60 }); g.st = 'chase'; g.aware = 1; g.cd = 9; g.ally = 0; let kills = false; run(900, () => { P.hp = X.maxHP(); if (g.dead) { kills = true; return false } }); out.merc = { ok, gold: __G.SYS.gold, ally: !!(m && m.ally), notFoe: !__G.X.foes().includes(m), kills } }
    // 8) environment: kicked off a cliff, slammed into a wall
    reset(); { let edge = null; for (let x = -1100; x < 1100 && !edge; x += 7) for (let z = -1100; z < 1100 && !edge; z += 7) { if (Math.hypot(x, z) < 400 || __G.depthAt(x, z) > .1) continue; if (__G.hAt(x, z) - __G.hAt(x + 2.5, z) > 3.8) edge = [x, z] } out.env = { edge: !!edge };
      if (edge) { __G.tp(edge[0] - 2, edge[1]); const g = X.mkHuman(edge[0] - .3, edge[1], { lv: 1, hp: 200 }); g.kx = 8; g.kz = 0; X.envSlam(1 / 60); out.env.fell = !!g.dead }
      reset(); const hs = X.TOWN.houses[0]; const g2 = X.mkHuman(hs.x - 4.6, hs.z, { lv: 1, hp: 300 }); g2.kx = 8; g2.kz = 0; const h0 = g2.hp; X.envSlam(1 / 60); out.env.slam = g2.hp < h0 }
    return out });
  log('ARAZİ: geniş yükseklik farkı, dik yamaçlar var, Karlı Sırtlar bölgesi, şelalenin üstünde yayla, başlangıç düz', R.terrain.range[1] - R.terrain.range[0] > 60 && R.terrain.steepCells > 20 && R.terrain.snow === 'snow' && R.terrain.plateau - R.terrain.below > 12 && R.terrain.spawnFlat, JSON.stringify(R.terrain));
  log('UÇURUM: dik duvara yürüyerek tırmanılamıyor', R.cliff.found && R.cliff.climbed < 2, JSON.stringify(R.cliff));
  log('GÖLGE KULESİ: Karlı Sırtlar\'da 5 katlı zindan', R.tower.ok && R.tower.floors === 5 && R.tower.zone === 'snow', JSON.stringify(R.tower));
  log('HAYDUT KALKANI: önden hafif vuruş kalkanda, tekme kalkanı açar', R.shield.blocked && R.shield.open && R.shield.hurtAfter && R.shield.human, JSON.stringify(R.shield));
  log('OLAYLAR: haydut pususu, gezgin şövalye, yaratık çatışması (kurtlar ve goblinler birbirine zarar veriyor)', ['bandits', 'knight', 'clash'].every(k => R.ev[k].ok === true && R.ev[k].n > 0) && R.ev.clash.hpLost > 50, JSON.stringify(R.ev));
  log('GECE: surların dışında yavaş hortlaklar çıkıyor, şafakta çekiliyor', R.night.n >= 1 && R.night.undead && R.night.after === 0, JSON.stringify(R.night));
  log('LONCA: paralı asker 120 altın, düşman sayılmıyor, düşmanı öldürüyor', R.merc.ok && R.merc.gold >= 380 && R.merc.gold < 500 && R.merc.ally && R.merc.notFoe && R.merc.kills, JSON.stringify(R.merc));
  log('ÇEVRE: savrulan düşman uçurumdan düşüp ölüyor, duvara çarpınca hasar alıyor', (!R.env.edge || R.env.fell) && R.env.slam, JSON.stringify(R.env));
};
