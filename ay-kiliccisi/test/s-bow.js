module.exports = async ({ G, log }) => {
  const r = await G(() => { const g = __G, P = g.P, X = g.X; g.GT.paused = true; const sim = (n, f) => { for (let i = 0; i < n; i++) { g.GT.time += 1 / 60; g.step(1 / 60); if (f) f(); } };
    const arch = g.GOBS.filter((x) => x.archer && !x.dead), pat = g.GOBS.filter((x) => String(x.group).startsWith('road'));
    const a = arch[0]; g.tp(a.x + 11, a.z); P.hp = X.maxHP(); a.st = 'chase'; a.aware = 1; a.cd = 0; a.ls = [P.x, P.z]; a.hx = a.x; a.hz = a.z; for (const o of g.GOBS) if (o !== a && Math.hypot(o.x - a.x, o.z - a.z) < 40) { o.x += 300; o.hx = o.x; }
    const h0 = P.hp = X.maxHP(); let aimed = 0, lost = 0; const px = P.x, pz = P.z; sim(2400, () => { if (a.st === 'aim') aimed = 1; if (P.hp < h0) { lost += h0 - P.hp; P.hp = h0; } P.x = px; P.z = pz; P.st = 'move'; P.alive = true; a.unseen = 0; if (a.cd > .6) a.cd = .6; }); // archers miss sometimes: give it several volleys
    const archerDmg = lost;
    // hero bow vs a wolf
    const w = g.wolves.find((x) => !x.dead && !x.boss && !x.tame); g.tp(w.x, w.z + 15); P.yaw = Math.PI; g.CAM.yaw = Math.PI; P.st = 'move'; P.sta = 100; const wh = w.hp; w.st = 'idle'; X.toggleLock && (P.lock = w);
    X.useBow(); const st = P.st; sim(90); const wolfDmg = wh - w.hp;
    // wolf counters after two hits
    g.tp(w.x, w.z + 1.6); P.st = 'move'; w.hp = w.max = 500; w.st = 'chase'; w.aware = 1; const hp1 = P.hp = X.maxHP(); let ev = 0, wu = 0;
    const trace = []; for (let k = 0; k < 2; k++) { X.foeHurt(w, 5, 0, 1); trace.push(w.st + ':' + w.combo + ':' + g.GT.clock.toFixed(2)); sim(5); } sim(120, () => { if (w.st === 'evade') ev = 1; if (w.st === 'windup' || w.st === 'pounce' || w.st === 'bitewind' || w.st === 'rush' || w.st === 'bite') wu = 1; });
    return { archers: arch.length, patrols: pat.length, aimed, archerDmg: Math.round(archerDmg), bowState: st, wolfDmg, ev, wu, trace };
  });
  log('okçu goblinler ve yol devriyeleri var', r.archers >= 6 && r.patrols === 12, JSON.stringify(r));
  log('okçu nişan alıp ok atıyor, ok can götürüyor', r.aimed && r.archerDmg > 0, JSON.stringify(r));
  log('kahramanın yayı: atış, kurda isabet', r.bowState === 'shoot' && r.wolfDmg > 0, JSON.stringify(r));
  log('kurt iki vuruştan sonra kaçıp karşı saldırıya geçiyor', (r.ev || r.trace.some((t) => t.startsWith('evade'))) && r.wu, JSON.stringify(r));
};
module.exports.pauseAtStart = true;
