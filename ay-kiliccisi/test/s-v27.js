// v27 — büyük harita, goblin köyü + savaş kurtları, yol soyguncuları, başkent ve dükkânlar, büyü, slime
module.exports = async ({ G, log }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = true; });
  const R = await G(() => { const P = __G.P, X = __G.X, IN = __G.IN, GT = __G.GT, SYS = __G.SYS, out = {};
    const reset = (x = 20, z = 290) => { __G.tp(x, z); Object.assign(P, { st: 'move', t: 0, alive: true, inv: 0, sta: 100, guard: 100, yaw: 0, vx: 0, vz: 0, atk: null, held: 0, mana: 100, wardT: 0 }); P.hp = X.maxHP(); __G.sim(1 / 60, 3) };
    const run = (n, f) => { for (let i = 0; i < n; i++) { __G.sim(1 / 60, 1); if (f && f(i) === false) break } };
    // 1) world size; goblins only far away; the goblin village with war wolves
    out.world = { edge: __G.zoneAt(2300, 2300), gobNear: __G.GOBS.filter(g => !g.dead && !g.human && !g.free && Math.hypot(g.x, g.z) < 1200).length, vil: __G.GOBS.filter(g => g.vil).length, wargs: __G.wolves.filter(w => w.warg).length, vzone: __G.zoneAt(1850, -1500), czone: __G.zoneAt(0, 1700) };
    { const g = __G.GOBS.find(g => g.vil && !g.big && !g.archer); const w = __G.wolves.find(w => w.warg); w.x = g.x + 10; w.z = g.z; w.st = 'idle'; w.aware = 0; reset(g.x + 25, g.z); g.aware = 1; g.st = 'chase'; X.wargTick ? 0 : 0; run(2); out.world.wargAnswers = w.aware >= 1 }
    // 2) road robbers: they stop you and demand a toll; pay = they go; refuse = fight
    reset(0, 700); { SYS.gold = 400; const e = { k: 'robbers', t: 0 }; const ok = X.EVDEF.robbers.start(e); X.EVT.cur = e; const L = e.ents[0]; __G.tp(L.x, L.z - 6); run(30); const asked = e.ask === 1, frozen = e.ents.every(g => g.so); const paid = X.robPay(); out.rob = { ok, asked, frozen, paid, gold: SYS.gold, gone: !X.EVT.cur };
      const e2 = { k: 'robbers', t: 0 }; X.EVDEF.robbers.start(e2); X.EVT.cur = e2; __G.tp(e2.ents[0].x, e2.ents[0].z - 6); run(30); e2.askT = 0; run(5); out.rob.fight = e2.ents.every(g => !g.so && g.st === 'chase'); X.evEnd(false) }
    // 3) the capital: size, shops, buying
    { const C = X.CAP; out.cap = { houses: C.houses, shops: C.shops.map(s => s.shop).join(','), folk: C.folk.length };
      const at = k => { const s = C.shops.find(s => s.shop === k); __G.tp(s.x + .5, s.z); return s };
      SYS.gold = 5000; SYS.shards = 99; const inv0 = SYS.inv.length; at('weapons'); X.capInteract(); out.cap.sword = SYS.inv.length === inv0 + 1 && SYS.inv[SYS.inv.length - 1].slot === 'weapon';
      const w = SYS.inv.find(i => i.id === SYS.eq.weapon); const up0 = w ? w.up || 0 : -1; at('smith'); X.capInteract(); out.cap.smith = w && (w.up || 0) === up0 + 1;
      SYS.flasks = 0; at('alch'); X.capInteract(); out.cap.refill = SYS.flasks === SYS.flaskMax; const fm = SYS.flaskMax; X.capInteract(); out.cap.flask = SYS.flaskMax === fm + 1;
      SYS.spells = {}; SYS.spell = null; SYS.academy = 0; at('academy'); X.capInteract(); out.cap.academy = !!SYS.spells.fire; at('books'); X.capInteract(); X.capInteract(); X.capInteract(); out.cap.books = Object.keys(SYS.spells).length }
    // 4) magic: a fire ball hits, the bolt chains, the ward halves damage, mana is spent
    reset(); { for (const g of __G.GOBS) if (!g.dead && Math.hypot(g.x - P.x, g.z - P.z) < 40) { g.dead = 1; g.x = 5000 } const a = X.mkHuman(P.x, P.z + 7, { lv: 1, hp: 900 }), b = X.mkHuman(P.x + 3, P.z + 9, { lv: 1, hp: 900 }); a.st = b.st = 'chase'; a.cd = b.cd = 99; a.aware = b.aware = 1; P.yaw = 0; P.lock = a;
      SYS.spell = 'fire'; X.castSpell(); const m0 = P.mana; run(60); const fire = a.hp < 900; SYS.spell = 'bolt'; P.st = 'move'; P.mana = 100; const hb = b.hp; X.castSpell(); run(40); const bolt = b.hp < hb;
      SYS.spell = 'ward'; P.st = 'move'; P.mana = 100; X.castSpell(); run(40); const h0 = P.hp; __G.hitPlayer({ src: a, dmg: 20, knock: 'none' }); const warded = h0 - P.hp; P.wardT = 0; const h1 = P.hp; __G.hitPlayer({ src: a, dmg: 20, knock: 'none' }); const plain = h1 - P.hp;
      out.magic = { mana: Math.round(m0), fire, bolt, warded: Math.round(warded), plain: Math.round(plain) }; a.dead = b.dead = 1; a.x = b.x = 5000 }
    // 5) slimes: hop at you, hurt you, split when they die
    reset(); { const s = X.mkSlime(P.x, P.z + 5, 1.4, 'green', 2); const h0 = P.hp; run(300, () => { if (P.hp < h0) return false }); const hit = P.hp < h0; const n0 = X.SLIMES.length; X.foeHurt(s, 9999, 0, 1, 'heavy'); const n1 = X.SLIMES.length; out.slime = { hit, split: n1 - n0, inFoes: X.foes().some(f => f.slime) } }
    return out });
  log('HARİTA 4.9 km; krallık çevresinde goblin yok; goblin köyü (10+ goblin, 6 savaş kurdu); başkent bölgesi', R.world.gobNear === 0 && R.world.vil >= 10 && R.world.wargs === 6 && R.world.vzone === 'gvil' && R.world.czone === 'capital', JSON.stringify(R.world));
  log('SAVAŞ KURTLARI köy alarmına koşuyor', R.world.wargAnswers, JSON.stringify(R.world));
  log('YOL SOYGUNCULARI: yolu kesip para istiyor; ödersen gidiyor, ödemezsen saldırıyor', R.rob.ok && R.rob.asked && R.rob.frozen && R.rob.paid && R.rob.gold < 400 && R.rob.gone && R.rob.fight, JSON.stringify(R.rob));
  log('BAŞKENT: 150+ ev, 5 dükkân (kılıççı, demirci, simyacı, kitapçı, akademi), halk ve muhafızlar', R.cap.houses > 150 && R.cap.shops.split(',').length === 5 && R.cap.folk >= 25, JSON.stringify(R.cap));
  log('DÜKKÂNLAR: kılıç satın al, demirci güçlendirir, simyacı doldurur + yeni şişe, akademi ilk büyü, kitapçı 4 büyü', R.cap.sword && R.cap.smith && R.cap.refill && R.cap.flask && R.cap.academy && R.cap.books === 4, JSON.stringify(R.cap));
  log('BÜYÜ: ateş topu vurur, şimşek sıçrar, mühür hasarı yarıya indirir, mana harcanır', R.magic.mana < 100 && R.magic.fire && R.magic.bolt && R.magic.warded < R.magic.plain * .7, JSON.stringify(R.magic));
  log('SLIME: zıplayıp vurur, ölünce ikiye bölünür, hedeflenebilir', R.slime.hit && R.slime.split === 2 && R.slime.inFoes, JSON.stringify(R.slime));
};
