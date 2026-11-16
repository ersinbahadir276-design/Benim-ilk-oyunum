module.exports = async ({ page, G, log }) => {
  const r = await G(() => { const g = __G, P = g.P, X = g.X, IN = g.IN, DT = 1 / 60; g.GT.paused = true; const sim = (s, f) => { for (let i = 0; i < Math.round(s / DT); i++) { g.GT.time += DT; g.step(DT); if (f && f() === false) break; } };
    const far = (x, z) => { for (const l of [g.wolves, g.GOBS, g.CROCS]) for (const a of l) if (!a.boss && Math.hypot(a.x - x, a.z - z) < 60) { a.x += 400; a.hx = a.x; } }; far(30, 420);
    const fresh = () => { g.tp(30, 420); Object.assign(P, { st: 'move', t: 0, hp: X.maxHP(), sta: 100, yaw: 0, alive: true, crouch: true }); IN.atkHeld = false; for (const k in g.BUF) g.BUF[k] = -9; };
    const o = {};
    // small goblin from behind: △ kills at once
    fresh(); const gb = g.GOBS.find((x) => !x.dead && !x.big && !x.boss && !x.archer); gb.x = P.x; gb.z = P.z + 1.6; gb.hx = gb.x; gb.hz = gb.z; gb.yaw = 0; gb.hyaw = 0; gb.st = 'idle'; gb.t = -99; gb.aware = 0; gb.hp = gb.max = 300; gb.seeT = 9;
    g.press('hvy'); IN.atkHeld = true; IN.atkAt = g.GT.clock - 1; IN.atkUsed = false; sim(.05); const st = P.st; IN.atkHeld = false; IN.atkUp = true; sim(.9); o.small = [st, gb.dead ? 1 : 0, P.st];
    // facing the player (aware): △ is a normal heavy, no assassination
    fresh(); const g2 = g.GOBS.find((x) => !x.dead && !x.big && !x.boss && !x.archer); g2.x = P.x; g2.z = P.z + 1.6; g2.hx = g2.x; g2.hz = g2.z; g2.yaw = Math.PI; g2.st = 'chase'; g2.aware = 1; g2.hp = g2.max = 300;
    g.press('hvy'); IN.atkHeld = true; IN.atkAt = g.GT.clock - 1; IN.atkUsed = false; sim(.05); o.aware = P.st; IN.atkHeld = false; IN.atkUp = true; sim(1); g2.x += 400; g2.hx = g2.x;
    // big goblin: deep wound + balance broken, not an instant kill
    fresh(); const bg = g.GOBS.find((x) => x.big && !x.boss && !x.dead); bg.x = P.x; bg.z = P.z + 2.0; bg.hx = bg.x; bg.hz = bg.z; bg.yaw = 0; bg.hyaw = 0; bg.st = 'idle'; bg.t = -99; bg.aware = 0; bg.hp = bg.max; bg.seeT = 9; const h0 = bg.hp;
    g.press('hvy'); IN.atkHeld = true; IN.atkAt = g.GT.clock - 1; IN.atkUsed = false; sim(.05); const st3 = P.st; IN.atkHeld = false; IN.atkUp = true; sim(.5); o.big = [st3, bg.dead ? 1 : 0, h0 - bg.hp > 50, X.isBroken(bg)]; bg.x += 400; bg.hx = bg.x;
    // archer accuracy: 40 arrows at a standing player 12 m away, and at a strafing player
    const shots = (strafe) => { fresh(); P.crouch = false; const a = g.GOBS.find((x) => x.archer && !x.dead); a.x = P.x; a.z = P.z + 12; a.hx = a.x; a.hz = a.z; a.hp = a.max = 9999; a.aware = 1; a.st = 'chase'; a.ls = [P.x, P.z]; a.cd = 0; let hits = 0, n = 0, last = false, hp = P.hp = 1e6, ph = 0;
      sim(70, () => { ph += DT; if (strafe) { P.x = 30 + Math.sin(ph * 1.2) * 5; P.vx = Math.cos(ph * 1.2) * 6; } else P.vx = 0; P.z = 420; P.st = 'move'; a.x = 30; a.z = 432; a.unseen = 0; a.sees = true; if (a.st === 'aim' && !last) n++; last = a.st === 'aim'; if (a.cd > .6) a.cd = .6; if (P.hp < hp) { hits++; hp = P.hp; } }); a.x += 400; a.hx = a.x; return [hits, n]; };
    o.still = shots(false); o.strafe = shots(true); return o; });
  const j = JSON.stringify(r);
  log('suikast: arkadan △ küçük düşmanı tek hamlede öldürüyor', r.small[0] === 'assn' && r.small[1] === 1 && r.small[2] === 'move', j);
  log('suikast: fark etmiş düşmanda çalışmıyor (normal ağır saldırı)', r.aware === 'charge', j);
  log('suikast: büyük goblinde ağır yara + denge kırma, anında ölüm yok', r.big[0] === 'assn' && r.big[1] === 0 && r.big[2] && r.big[3], j);
  const s = r.still[0] / r.still[1], m = r.strafe[0] / r.strafe[1];
  log('okçu: duran hedefte bile her ok isabet etmiyor (%35–85)', s > 0.35 && s < 0.85, JSON.stringify({ duran: r.still, oran: +s.toFixed(2) }));
  log('okçu: yana koşan hedefi çoğunlukla ıskalıyor (<%35)', m < 0.35, JSON.stringify({ kosan: r.strafe, oran: +m.toFixed(2) }));
};
module.exports.pauseAtStart = true;
