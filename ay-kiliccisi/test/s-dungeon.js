// Zindan sistemi: girişler, kat üretimi (bağlantı), canavarlar, bilmece/kapı, tuzak, gizli oda, boss, çıkış.
module.exports = async ({ page, shot, G, log }) => {
  await G(() => { __G.fastFade = 1; __G.GT.paused = false; window.__noAutoQ = 1; });
  // 1) entrances stand on dry land, outside water, away from trees
  const ent = await G(() => Object.values(__G.X.DUNS).map(D => ({ id: D.id, h: __G.hAt(D.x, D.z), w: __G.depthAt(D.x, D.z), z: __G.zoneAt(D.x, D.z), t: __G.TREES ? __G.TREES.filter(t => Math.hypot(t.x - D.x, t.z - D.z) < 6).length : 0 })));
  for (const e of ent) log('giriş kuru zeminde: ' + e.id, e.w === 0, JSON.stringify(e));
  // 2) every floor of every dungeon: start, puzzle items and stairs connected the right way
  const gen = await G(() => { const out = []; for (const D of Object.values(__G.X.DUNS)) for (let f = 0; f < D.floors; f++) { const F = __G.X.genFloor(D, f), W = F.W, g = F.g;
      const bfs = (open) => { const seen = new Uint8Array(W * F.H), q = [F.start.cy * W + F.start.cx]; seen[q[0]] = 1; for (let h = 0; h < q.length; h++) { const c = q[h], i = c % W, j = (c - i) / W; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (j + dy) * W + i + dx, v = g[k]; if (seen[k]) continue; if (v === 1 || v === 3 || v === 5 || (open && (v === 2 || v === 4))) { seen[k] = 1; q.push(k) } } } return seen };
      const closed = bfs(false), opened = bfs(true), endIn = closed[F.end.cy * W + F.end.cx], endOpen = opened[F.end.cy * W + F.end.cx];
      const items = F.puzzle.items.every(it => closed[it.j * W + it.i]) && (!F.puzzle.hint || closed[F.puzzle.hint.j * W + F.puzzle.hint.i]);
      out.push({ id: D.id + f, door: !!F.door, sealed: !endIn, reach: !!endOpen, items, secret: !!F.secret, rooms: F.rooms.length, spawns: F.spawns.length, traps: F.traps.length, last: F.last }) } return out });
  for (const f of gen) log('kat ' + f.id + ': kapı mühürlü, bilmece ulaşılır, kapı açılınca son oda ulaşılır', f.door && f.sealed && f.reach && f.items, JSON.stringify(f));
  log('gizli odası olan kat sayısı', gen.filter(f => f.secret).length >= 5, gen.filter(f => f.secret).length + '/' + gen.length);
  // 3) enter the crypt from its overworld door
  await G(() => { const D = __G.X.DUNS.crypt; __G.tp(D.x, D.z + 2.2); __G.P.yaw = Math.PI; });
  await page.waitForTimeout(300);
  const pr = await G(() => __G.X.dbg.promptText()); log('giriş istemi görünür', /zindana gir/.test(pr), pr);
  await G(() => __G.X.interact()); await page.waitForTimeout(900);
  const st = await G(() => ({ on: __G.X.DUN.on, n: __G.X.MONS.length, solid: __G.X.dunCollide(__G.P.x, __G.P.z, .5), y: __G.P.y, lv: __G.X.DUN.lv, kinds: [...new Set(__G.X.MONS.map(m => m.type))] }));
  log('zindana girildi, canavarlar doğdu', st.on && st.n >= 8, JSON.stringify(st));
  await G(() => { __G.CAM.yaw = __G.P.yaw; }); await shot('dun-1-entry', { wait: 600 });
  // 4) a skeleton attacks; shield skeleton blocks a light hit from the front; golem shrugs off light hits
  const fight = await G(() => { const X = __G.X, P = __G.P; P.hp = 9999; const ang = P.yaw, x = P.x + Math.sin(ang) * 2.2, z = P.z + Math.cos(ang) * 2.2; const m = X.spawnMon('skel', x, z, { aware: 1 }); m.yaw = Math.atan2(P.x - m.x, P.z - m.z); m.st = 'chase';
    let wind = 0; for (let i = 0; i < 240; i++) { __G.sim(1 / 60, 1); if (m.st === 'windup' || m.st === 'strike') wind = 1; } const hp = P.hp;
    const s = X.spawnMon('skelS', P.x + 1.6, P.z, { aware: 1 }); s.yaw = Math.atan2(P.x - s.x, P.z - s.z); s.st = 'chase'; const h0 = s.hp; X.foeHurt(s, 40, 1, 0, 'light0'); const blocked = h0 - s.hp;
    const g = X.spawnMon('golem', P.x - 3, P.z, { aware: 1 }); g.st = 'chase'; const g0 = g.hp; X.foeHurt(g, 40, 1, 0, 'light0'); const gd = g0 - g.hp; g.st = 'open'; const g1 = g.hp; X.foeHurt(g, 40, 1, 0, 'light0'); const go = g1 - g.hp;
    return { wind, hpLost: 9999 - hp, blocked, gd, go } });
  log('iskelet saldırıya geçti', fight.wind === 1, JSON.stringify(fight));
  log('kalkanlı iskelet önden hafif vuruşu blokladı', fight.blocked === 0, fight.blocked);
  log('golem taş deri: hafif vuruş %40, açık çekirdek %160', fight.gd === 16 && fight.go === 64, fight.gd + ' / ' + fight.go);
  // 5) skeleton crumbles and rises unless smashed with a heavy blow
  const rise = await G(() => { const X = __G.X, P = __G.P; let r = null; for (let k = 0; k < 30 && !r; k++) { const m = X.spawnMon('skel', P.x + 5, P.z + 5, { aware: 1 }); const dead = X.foeHurt(m, 9999, 1, 0, 'light0'); if (!dead && m.st === 'crumbled') r = m; else if (dead) { m.dead = 1 } }
    if (!r) return { ok: 0 }; __G.sim(1 / 30, 150); const risen = r.st === 'rise' || r.st === 'chase'; const dead2 = X.foeHurt(r, 9999, 1, 0, 'heavy'); return { ok: 1, risen, dead2 } });
  log('iskelet dağılıp yeniden kalkıyor, ağır vuruş bitiriyor', rise.ok && rise.risen && rise.dead2, JSON.stringify(rise));
  // 6) the puzzle opens the sealed door; the secret wall breaks after three swings
  const pz = await G(() => { const X = __G.X, D = X.DUN, F = D.F; const k = D.puzzle.kind; const door0 = D.g[D.door.j * D.W + D.door.i]; X.solvePuzzle(); __G.sim(1 / 30, 45); const door1 = D.g[D.door.j * D.W + D.door.i];
    let sec = null; if (D.secret) { const s = D.secret, P = __G.P; P.x = s.x - (s.x - X.dCX(F.secret.wi - F.secret.dx)) * 0 - F.secret.dx * 2.4; P.z = s.z - F.secret.dy * 2.4; P.yaw = Math.atan2(s.x - P.x, s.z - P.z); for (let i = 0; i < 3; i++) X.dunSwing('light0'); sec = { open: s.open, cell: D.g[s.j * D.W + s.i] } }
    return { k, door0, door1, sec } });
  log('bilmece çözülünce kapı açılır', pz.door0 === 2 && pz.door1 === 3, JSON.stringify(pz));
  log('gizli duvar 3 vuruşta yıkılır', !pz.sec || (pz.sec.open === 1 && pz.sec.cell === 5), JSON.stringify(pz.sec));
  // 7) spike trap hurts the player standing on it
  const trap = await G(() => { const X = __G.X, D = X.DUN, P = __G.P, t = D.traps.find(t => t.k === 'spike'); if (!t) return { none: 1 }; P.hp = 500; P.inv = 0; P.st = 'move'; let lost = 0; for (let i = 0; i < 260; i++) { P.x = t.x; P.z = t.z; P.air = false; P.inv = 0; const h = P.hp; __G.sim(1 / 60, 1); if (P.hp < h) lost += h - P.hp; if (P.st !== 'move' && P.st !== 'block') { P.st = 'move'; P.t = 0 } } return { lost } });
  log('diken tuzağı can götürür', trap.none || trap.lost > 0, JSON.stringify(trap));
  // 8) lore tablet
  await G(() => { __G.X.readLore('crypt0'); }); await page.waitForTimeout(200);
  const tab = await G(() => { const e = document.getElementById('dtab'); const ok = e && e.style.display === 'block' && /Aldric/.test(e.textContent); e.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return { ok, lore: __G.SYS.lore } });
  log('tablet okunur, gizem kaydı tutulur', tab.ok && tab.lore.crypt0 === 1, JSON.stringify(tab.lore));
  // 9) go down to the boss floor; the arena seals; the boss falls; mythic loot and the exit portal
  await G(() => { __G.X.enterDungeon('crypt', 1); }); await page.waitForTimeout(700);
  await G(() => { const P = __G.P; P.alive = true; P.st = 'move'; P.hp = 99999 });
  const b0 = await G(() => { const X = __G.X, D = X.DUN; return { fl: D.fl, boss: !!D.boss, type: D.boss && D.boss.type, hp: D.boss && D.boss.max } });
  log('son katta boss var', b0.fl === 1 && b0.boss && b0.type === 'boneking', JSON.stringify(b0));
  const boss = await G(() => { const X = __G.X, D = X.DUN, P = __G.P; X.solvePuzzle(); __G.sim(1 / 30, 40); P.alive = true; P.st = 'move'; P.t = 0; P.x = D.arena.x; P.z = D.arena.z + 9; P.hp = 99999; __G.sim(1 / 30, 3); const sealed = D.bossOn && D.g[D.door.j * D.W + D.door.i] === 2;
    const b = D.boss; let moves = new Set(); for (let i = 0; i < 600; i++) { __G.sim(1 / 30, 1); if (b.st === 'windup') moves.add(b.mv); P.hp = 99999; if (P.st === 'dead') break }
    X.foeHurt(b, b.hp * .6, 1, 0, 'heavy'); const p2 = b.phase; const inv0 = __G.SYS.inv.length; const dead = X.foeHurt(b, 1e6, 1, 0, 'heavy'); if (dead) X.onFoeKilled(b, false); __G.sim(1 / 30, 10);
    const myth = X.LOOT.some(l => l.it.rar === 5) || __G.SYS.inv.some(i => i.rar === 5); return { sealed, moves: [...moves], p2, dead, myth, exit: D.it.some(i => i.k === 'exit'), saved: __G.SYS.dun.boss.crypt } });
  log('arena kapanır, boss saldırır', boss.sealed && boss.moves.length >= 2, JSON.stringify(boss));
  log('boss ikinci aşamaya geçer', boss.p2 === 2);
  log('boss ölür: mitik ganimet + çıkış kapısı + kayıt', boss.dead && boss.myth && boss.exit && boss.saved === 1, JSON.stringify(boss));
  await shot('dun-2-boss', { wait: 400 });
  // 10) exit through the portal back to the overworld
  const ex = await G(() => { const X = __G.X, D = X.DUN, P = __G.P, e = D.it.find(i => i.k === 'exit'); P.alive = true; P.st = 'move'; P.x = e.x + .5; P.z = e.z; P.hp = 500; const pr = X.dbg.promptText(); X.interact(); return pr });
  await page.waitForTimeout(800);
  const out = await G(() => ({ on: __G.X.DUN.on, x: __G.P.x, z: __G.P.z, foes: __G.X.foes().length, objsDun: 0 }));
  log('çıkış kapısı dünyaya döndürür', /mühür kapısından/.test(ex) && out.on === 0 && Math.hypot(out.x - (-296), out.z - 146) < 8, ex + ' ' + JSON.stringify(out));
  await shot('dun-3-back', { wait: 600 });
};
