// Skeleton warriors of the ruins: buried by day, rise at night, reassemble once after a plain killing blow,
// a heavy blow / execution ends them; they sink back at dawn. Plus a close-up screenshot of the sculpted model.
module.exports = async ({ G, log, shot, page }) => {
  const r = await G(() => { const g = __G, P = g.P, X = g.X, GT = g.GT, DT = 1 / 60; GT.paused = true;
    const sim = (s) => { for (let i = 0; i < Math.round(s / DT); i++) { GT.time += DT; g.step(DT); } };
    const setNight = (n) => { GT.tod = n ? 0.75 : 0.25; GT.night = !!n; };
    const o = {}; const S = g.GOBS.filter((x) => x.skel);
    o.count = S.length; o.model = !!(X.dbg.humanGeo('skeleton').binv); o.ruinsZone = S.every((s) => g.zoneAt(s.hx, s.hz) === 'ruins');
    o.lv = S[0].lv; o.hp = S[0].max;
    // day: all buried and not counted as foes
    setNight(0); const s0 = S[0]; g.tp(s0.hx + 15, s0.hz); P.hp = X.maxHP(); sim(0.5); setNight(0);
    o.dayBuried = S.every((s) => s.buried && s.dead) && !X.foes().some((f) => f.skel);
    // night: the group near the hero rises
    setNight(1); sim(0.2); setNight(1);
    const grp = S.filter((s) => s.group === s0.group); o.rising = grp.filter((s) => s.st === 'rise').length;
    o.sunk = +s0.R.ob.bones[3] < 0 ? 1 : 0; // drawn below ground at start (root y below terrain)
    sim(2.6); setNight(1); o.afterRise = grp.map((s) => s.st);
    o.inFoes = X.foes().filter((f) => f.skel).length;
    // plain killing blow: bones scatter, then reassemble at half health
    const a = grp[1]; a.x = P.x; a.z = P.z + 1.5; a.st = 'chase'; a.t = 0;
    const dead1 = X.foeHurt(a, 99999, 0, 1, 'light'); o.collapse = [dead1, a.dead, a.reformPend];
    sim(3.6); setNight(1); o.reform = [a.dead, a.st, a.hp === Math.round(a.max * 0.5)];
    sim(1.6); setNight(1); o.afterReform = a.st;
    // second plain blow kills for good
    const k0 = g.SYS.skelKills || 0, xp0 = g.SYS.xp;
    const dead2 = X.foeHurt(a, 99999, 0, 1, 'light'); if (dead2) X.onFoeKilled(a, false); o.second = [dead2, a.dead, a.reformPend, (g.SYS.skelKills || 0) - k0];
    // heavy finisher kills at once
    const b = grp[2]; b.dead = 0; b.st = 'chase'; const dead3 = X.foeHurt(b, 99999, 0, 1, 'heavy'); if (dead3) X.onFoeKilled(b, false); o.heavy = [dead3, b.reformPend];
    // the destroyed ones stay down for the rest of the night, then return to the earth
    P.x += 60; sim(31); setNight(1); o.restBuried = [a.buried, b.buried, a.restUntil > GT.clock];
    // dawn: survivors that are not fighting sink back
    setNight(0); for (const s of grp) if (!s.dead) { s.st = 'idle'; s.aware = 0; } g.tp(s0.hx + 60, s0.hz); sim(0.3); setNight(0);
    o.dawn = grp.every((s) => s.buried);
    return o; });
  log('15 iskelet, 3 harabede', r.count === 15 && r.ruinsZone, JSON.stringify([r.count, r.ruinsZone]));
  log('heykel modeli yüklü', r.model);
  log('bölge seviyesine göre can', r.lv >= 8 && r.hp > 70, JSON.stringify([r.lv, r.hp]));
  log('gündüz gömülü, düşman listesinde değil', r.dayBuried);
  log('gece yaklaşınca topraktan kalkıyorlar', r.rising >= 4, r.rising);
  log('kalkıştan sonra savaşa giriyorlar', r.afterRise.every((s) => s !== 'rise' && s !== 'dead') && r.inFoes >= 4, JSON.stringify(r.afterRise) + ' foes=' + r.inFoes);
  log('hafif öldürücü vuruş: kemikler dağılır (ölüm sayılmaz)', r.collapse[0] === false && r.collapse[1] && r.collapse[2], JSON.stringify(r.collapse));
  log('3 sn sonra yarım canla yeniden birleşir', r.reform[0] === 0 && r.reform[1] === 'reform' && r.reform[2], JSON.stringify(r.reform));
  log('birleşince saldırıya döner', r.afterReform !== 'reform' && r.afterReform !== 'dead', r.afterReform);
  log('ikinci kez: gerçekten ölür, sayaç + ödül', r.second[0] === true && r.second[1] && !r.second[2] && r.second[3] === 1, JSON.stringify(r.second));
  log('ağır saldırı tek seferde bitirir', r.heavy[0] === true && !r.heavy[1], JSON.stringify(r.heavy));
  log('ölenler o gece dinlenir (toprağa döner)', r.restBuried[0] && r.restBuried[1] && r.restBuried[2], JSON.stringify(r.restBuried));
  log('şafakta savaşmayanlar toprağa döner', r.dawn);
  // close-up screenshot of a risen skeleton (night)
  await G(() => { const g = __G, GT = g.GT, S = g.GOBS.filter((x) => x.skel && x.group === 'ruin1'); GT.tod = 0.83; GT.night = true; const s = S[0];
    for (const x of S) { x.restUntil = 0; } g.tp(s.hx + 10, s.hz + 10); g.sim(1 / 60, 20); for (const x of S) { if (!x.buried) { x.st = 'idle'; x.aware = 0; } }
    g.sim(1 / 60, 200); g.GT.tod = 0.83; const P = g.P; P.yaw = 0; g.CAM.yaw = Math.PI; g.CAM.pitch = 0.12; g.CAM.dist = 4.2;
    S.filter((x) => !x.buried).slice(0, 3).forEach((x, i) => { x.x = P.x + (i - 1) * 1.6; x.z = P.z - 3.4 - Math.abs(i - 1) * 0.6; x.hx = x.x; x.hz = x.z; x.yaw = 0; x.st = 'idle'; x.aware = 0; x.t = 0; x.spd = 0; });
    g.GT.paused = false; });
  await shot('undead-close', { wait: 1200 });
};
