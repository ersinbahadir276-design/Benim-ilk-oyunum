// Adventurers' Guild: register, board, accept, progress, hand in, rank up, bounty and lost villager
module.exports = async ({ page, shot, G, log }) => {
  await G(() => { const g = __G; g.GT.paused = true; g.fastStream = 1; const k = g.X.GUILD.clerk; g.tp(k.x + 1.5, k.z + 0.5); g.press('inter'); g.GT.time += 0.016; g.step(0.016); });
  await page.waitForTimeout(1500); await shot('guild-cine', { wait: 300 });
  const reg = await G(() => { const g = __G, X = g.X; const on = X.CINE.on, has = !!g.SYS.guild; for (let k = 0; k < 10 && X.CINE.on; k++) X.cineEnd(); return { on, has, rank: g.SYS.guild && g.SYS.guild.rank, board: g.SYS.guild && g.SYS.guild.board.length, win: document.getElementById('win').style.display !== 'none' }; });
  log('lonca: görevliyle konuşunca kayıt sahnesi oynuyor, F rütbesi ve 4 kontratlı pano açılıyor', reg.on && reg.has && reg.rank === 0 && reg.board === 4, JSON.stringify(reg));
  await G(() => { __G.X.openWin('lonca'); }); await shot('guild-win', { wait: 400 });
  const r = await G(() => { const g = __G, X = g.X, SYS = g.SYS, P = g.P, G2 = SYS.guild, DT = 1 / 60, o = {}; const sim = (s) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); } };
    const mk = (over) => Object.assign({ id: ++G2.seq, k: 'hunt', tg: 'wolf', t: 'T' + G2.seq, d: 'd', r: 0, need: 2, have: 0, gold: 30, pts: 20, xp: 10 }, over);
    G2.board = [mk({}), mk({ k: 'gather', tg: 'meat', need: 3, t: 'Et' }), mk({ k: 'bounty', tg: 'gob', need: 1, t: 'Azılı', x: 60, z: 300 }), mk({ k: 'rescue', need: 1, t: 'Kayıp', x: 80, z: 330 }), mk({ t: 'Fazla' })];
    const ids = G2.board.map((c) => c.id); X.guildAccept(ids[0]); X.guildAccept(ids[1]); X.guildAccept(ids[2]); X.guildAccept(ids[4]); o.max3 = G2.active.length;
    // hunt progress through real kills
    const gold0 = SYS.gold || 0; for (let k = 0; k < 2; k++) { const w = g.wolves.find((x) => !x.dead && !x.boss && !x.tame && !x.bounty); w.hp = 1; if (X.foeHurt(w, 99, 0, 1)) X.onFoeKilled(w, false); } o.hunt = G2.active[0].have;
    SYS.meat = 5; o.gatherDone = X.cDone(G2.active[1]);
    // bounty target exists in the world with two followers; killing it completes the contract
    const b = g.GOBS.find((x) => x.bounty === ids[2]); o.bounty = b ? { hp: b.max, lv: b.lv, near: g.GOBS.filter((x) => !x.dead && Math.hypot(x.x - b.x, x.z - b.z) < 6).length } : null; if (b) { b.hp = 1; if (X.foeHurt(b, 99, 0, 1)) X.onFoeKilled(b, false); } o.bountyDone = X.cDone(G2.active[2]);
    // hand in at the clerk
    const k = X.GUILD.clerk; g.tp(k.x + 1.5, k.z + 0.5); X.guildTurnIn(); o.after = { active: G2.active.length, done: G2.done, pts: G2.pts, gold: (SYS.gold || 0) - gold0, meat: SYS.meat, rank: G2.rank };
    // rescue: take it, find the villager, talk
    G2.board.unshift(mk({ k: 'rescue', need: 1, t: 'Kayıp2', x: 80, z: 330 })); X.guildAccept(G2.board[0].id); const lost = g.NPCS.find((n) => n.lost); o.lost = !!lost; if (lost) { g.tp(lost.x + 1, lost.z); g.press('inter'); sim(.1); } o.found = G2.active.some((c) => c.k === 'rescue' && c.found); o.lostGone = !g.NPCS.some((n) => n.lost);
    // rank: points alone are not enough for D, the deed is needed
    G2.pts = 100; SYS.ashmane = 0; g.tp(k.x + 1.5, k.z + 0.5); X.guildTurnIn(); o.rankNoDeed = G2.rank; SYS.ashmane = 1; X.guildTurnIn(); o.rankDeed = G2.rank; o.board = G2.board.length;
    X.save(P); o.saved = JSON.parse(localStorage.getItem('kf2_save')).guild.rank; return o; });
  const j = JSON.stringify(r);
  log('lonca: en fazla 3 kontrat taşınıyor', r.max3 === 3, j);
  log('lonca: av kontratı gerçek öldürmelerle ilerliyor, toplama kontratı çantadaki malzemeyle', r.hunt === 2 && r.gatherDone, j);
  log('lonca: azılı hedef dünyada iki yardımcısıyla doğuyor, öldürünce kontrat tamamlanıyor', r.bounty && r.bounty.near >= 3 && r.bounty.hp > 200 && r.bountyDone, j);
  log('lonca: teslimde altın + lonca puanı veriliyor, malzeme düşüyor', r.after.done === 3 && r.after.gold >= 90 && r.after.pts === 60 && r.after.meat === 2, j);
  log('lonca: kayıp köylü ormanda bulunup konuşulunca kontrat tamamlanıyor', r.lost && r.found && r.lostGone, j);
  log('lonca: rütbe yalnızca puanla değil başarıyla yükseliyor (D için Kül Yele)', r.rankNoDeed === 1 && r.rankDeed === 2, j);
  log('lonca: pano yenileniyor ve kayıt dosyasına yazılıyor', r.board === 4 && r.saved === 2, j);
};
module.exports.pauseAtStart = true;
