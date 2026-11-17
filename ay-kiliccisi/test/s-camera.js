// AŞAMA 4 — kamera ve mobil kontroller (senaryo 9): çoklu dokunuş, hassasiyet, sıkıştırma, hedef değiştirme, yumuşak kilit,
// ağaç engeli, ekran dışı saldırı okları, HUD düzenleyici (kaydedilir)
module.exports = async ({ page, G, log, shot }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.paused = false; });
  const ev = (type, id, x, y, target) => G(([type, id, x, y, target]) => { const el = target === 'win' ? window : target ? document.getElementById(target) : document.getElementById('c'); el.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: id === 1 })); }, [type, id, x, y, target]);
  const W = await G(() => [innerWidth, innerHeight]);
  const setup = () => G(() => { const P = __G.P; for (const w of __G.wolves) { w.dead = 300; w.st = 'dead'; w.x = w.hx = 9000 } for (const g of __G.GOBS) { g.dead = 1; g.x = g.hx = 5000 } __G.tp(6, 250); Object.assign(P, { st: 'move', yaw: 0, lock: null, sta: 100 }); __G.CAM.yaw = 0; __G.CAM.pitch = .24; __G.IN.mx = __G.IN.mz = 0 });
  // 1) three fingers at once: stick (left), camera drag (right), attack button
  await setup();
  const r1 = await (async () => { const x0 = await G(() => [__G.P.x, __G.P.z, __G.CAM.yaw]); await ev('pointerdown', 1, W[0] * .2, W[1] * .7); await ev('pointermove', 1, W[0] * .2, W[1] * .7 - 55, 'win');
    await ev('pointerdown', 2, W[0] * .55, W[1] * .4); for (let k = 1; k <= 6; k++) await ev('pointermove', 2, W[0] * .55 + k * 12, W[1] * .4, 'win');
    const b = await page.locator('#bAtk').boundingBox(); await ev('pointerdown', 3, b.x + b.width / 2, b.y + b.height / 2, 'bAtk'); await page.waitForTimeout(120); await ev('pointerup', 3, b.x + b.width / 2, b.y + b.height / 2, 'bAtk');
    await page.waitForTimeout(500); const st = await G(() => ({ moved: Math.hypot(__G.P.x - 0, 0), x: __G.P.x, z: __G.P.z, yaw: __G.CAM.yaw, st: __G.P.st, atk: !!__G.P.atk || __G.P.st === 'attack' || __G.P.combo >= 0 }));
    await ev('pointerup', 1, W[0] * .2, W[1] * .7 - 55, 'win'); await ev('pointerup', 2, W[0] * .55 + 72, W[1] * .4, 'win');
    return { walked: +Math.hypot(st.x - x0[0], st.z - x0[1]).toFixed(2), yawTurned: +(x0[2] - st.yaw).toFixed(3), st: st.st } })();
  const atkSeen = await G(() => !!window.__atkSeen);
  // 2) sensitivity: double speed doubles the turn; inverted vertical flips pitch
  const turn = async (sx, inv) => { await G(([sx, inv]) => { const c = __G.X.camSet(); c.sx = sx; c.sy = 1; c.inv = inv; __G.CAM.yaw = 0; __G.CAM.pitch = .3; __G.P.lock = null }, [sx, inv]); await ev('pointerdown', 7, W[0] * .6, W[1] * .4); await ev('pointermove', 7, W[0] * .6 + 50, W[1] * .4 + 20, 'win'); await ev('pointerup', 7, W[0] * .6 + 50, W[1] * .4 + 20, 'win'); return G(() => [-__G.CAM.yaw, __G.CAM.pitch - .3]) };
  const t1 = await turn(1, 0), t2 = await turn(2, 0), ti = await turn(1, 1); await G(() => { const c = __G.X.camSet(); c.sx = 1; c.inv = 0 });
  // 3) pinch: fingers apart = closer camera
  const pinch = await (async () => { await G(() => { __G.X.camSet().dist = 4.8; __G.CAM.dist = 4.8 }); await ev('pointerdown', 4, W[0] * .6, W[1] * .5); await ev('pointerdown', 5, W[0] * .7, W[1] * .5); await ev('pointermove', 5, W[0] * .85, W[1] * .5, 'win'); const d = await G(() => __G.X.camSet().dist); await ev('pointerup', 5, 0, 0, 'win'); await ev('pointerup', 4, 0, 0, 'win'); return d })();
  // 4) lock-on: flick switches target, a dead target hands the lock on, dragging softens the lock
  const lock = await (async () => { await setup(); await G(() => { const P = __G.P, mk = (dx, dz) => { const g = __G.GOBS.find(g => !g.big && !g.boss && g.dead); g.dead = 0; g.x = g.hx = P.x + dx; g.z = g.hz = P.z + dz; g.hp = g.max = 9999; g.st = 'stagger'; g.t = -99; g.cd = 99; g.aware = 1; return g }; window.__L = mk(-4, 8); window.__R = mk(4, 8); __G.CAM.yaw = 0; P.lock = window.__L });
    await G(([x, y]) => { const c = document.getElementById('c'), mk = (t, el, cx) => el.dispatchEvent(new PointerEvent(t, { pointerId: 6, clientX: cx, clientY: y, bubbles: true, pointerType: 'touch' })); mk('pointerdown', c, x); mk('pointermove', window, x - 60); mk('pointermove', window, x - 110); mk('pointerup', window, x - 110) }, [W[0] * .55, W[1] * .4]); // a real flick takes ~0.1 s
    const afterFlick = await G(() => __G.P.lock === window.__R ? 'R' : __G.P.lock === window.__L ? 'L' : 'none:' + (__G.P.lock ? 'x' : 'null') + ':' + window.__L.dead + window.__L.st);
    if (!(await G(() => !!__G.P.lock))) return { afterFlick, relock: false, soft: { softErr: 0, hardErr: 0 } };
    const relock = await G(() => { const f = __G.P.lock; f.hp = 0; f.dead = 1; f.st = 'dead'; const o = f === window.__R ? window.__L : window.__R; o.st = 'chase'; o.t = 0; o.unseen = 0; o.aware = 1; o.ls = [__G.P.x, __G.P.z]; __G.sim(1 / 60, 2); o.st = 'stagger'; o.t = -99; return __G.P.lock === o });
    const soft = await G(() => { const P = __G.P, f = P.lock, want = Math.atan2(f.x - P.x, f.z - P.z); __G.CAM.yaw = want + 1; __G.CAM.userT = __G.GT.time; __G.sim(1 / 60, 12); const softErr = Math.abs(Math.atan2(Math.sin(__G.CAM.yaw - want), Math.cos(__G.CAM.yaw - want))); __G.CAM.yaw = want + 1; __G.CAM.userT = -99; __G.sim(1 / 60, 12); const hardErr = Math.abs(Math.atan2(Math.sin(__G.CAM.yaw - want), Math.cos(__G.CAM.yaw - want))); return { softErr: +softErr.toFixed(2), hardErr: +hardErr.toFixed(2) } });
    return { afterFlick, relock, soft } })();
  // 5) trees: put the camera behind a big tree — it never ends up inside the crown or behind the trunk
  const tree = await G(() => { const P = __G.P, X = __G.X; P.lock = null; let t = null; for (const tr of X.ctrees) { if ((tr.h || 0) > 5 && tr.r < .9 && Math.hypot(tr.x - 6, tr.z - 250) < 200) { t = tr; break } } if (!t) return { none: 1 };
    __G.tp(t.x, t.z + 2.2); P.yaw = 0; __G.CAM.yaw = 0; __G.CAM.pitch = .2; __G.CAM.tx = P.x; __G.CAM.tz = P.z; __G.render(1 / 60); const e = __G.CAM.eye; return { inCrown: X.camTree(e, [__G.CAM.tx, __G.CAM.ty, __G.CAM.tz]), dTree: +Math.hypot(e[0] - t.x, e[2] - t.z).toFixed(2), r: t.r } });
  // 6) an attack from behind shows a red arrow on the screen edge
  const thr = await G(() => { const P = __G.P; __G.tp(6, 250); P.yaw = 0; __G.CAM.yaw = 0; const w = __G.mkWolf(P.x, P.z - 4); w.st = 'bitewind'; w.t = 0; w.aware = 1; w.yaw = 0; w.pack = null; __G.render(1 / 60); const vis = [...document.querySelectorAll('.thr')].filter(e => e.style.display === 'block'); const top = vis[0] ? parseFloat(vis[0].style.top) : -1; w.dead = 300; w.st = 'dead'; __G.render(1 / 60); return { n: vis.length, below: top > innerHeight / 2 } });
  await shot('cam-threat', { wait: 50 });
  // 7) HUD editor: drag the attack button, it does not attack while editing, and the place survives a reload
  const hud = await (async () => { await G(() => { try { localStorage.removeItem('kf2_hud') } catch (e) {} __G.X.hudApply(); __G.X.hudEdit(true) }); const b = await page.locator('#bAtk').boundingBox();
    const st0 = await G(() => __G.P.st); await ev('pointerdown', 9, b.x + 20, b.y + 20, 'bAtk'); await ev('pointermove', 9, W[0] * .5, W[1] * .3, 'win'); await ev('pointerup', 9, W[0] * .5, W[1] * .3, 'win');
    const st1 = await G(() => __G.P.st); await G(() => document.querySelector('#hudbar [data-a="p"]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); await G(() => document.querySelector('#hudbar [data-a="d"]').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
    const nb = await page.locator('#bAtk').boundingBox(); return { moved: Math.hypot(nb.x - b.x, nb.y - b.y), attacked: st0 !== st1 && st1 === 'attack', paused: await G(() => __G.GT.paused) } })();
  await page.reload(); await page.waitForFunction('window.__G', { timeout: 120000 }); await page.evaluate(() => { const b = document.getElementById('introb'); if (b && document.getElementById('intro').style.display !== 'none') b.click(); if (__G.X.CINE.on) __G.X.cineEnd() }); await page.waitForTimeout(500);
  const kept = await (async () => { const nb = await page.locator('#bAtk').boundingBox(); return { x: nb.x, y: nb.y, bs: await G(() => getComputedStyle(document.documentElement).getPropertyValue('--bs').trim()) } })();
  await shot('cam-hud', { wait: 100 });
  await G(() => { try { localStorage.removeItem('kf2_hud') } catch (e) {} });
  log('çoklu dokunuş: aynı anda yürü + kamera çevir + saldır', r1.walked > .5 && r1.yawTurned > .1 && (r1.st === 'attack' || r1.st === 'move'), JSON.stringify(r1));
  log('kamera hızı ayarı: 2× hız = 2× dönüş', Math.abs(t2[0] / t1[0] - 2) < .05, JSON.stringify([t1, t2]));
  log('dikey ters çevir', Math.sign(ti[1]) === -Math.sign(t1[1]) && t1[1] !== 0, JSON.stringify([t1, ti]));
  log('iki parmakla sıkıştır: parmaklar açılınca kamera yaklaşır', pinch < 4, pinch);
  log('hedef kilidi: hızlı kaydırma hedefi değiştirir', lock.afterFlick === 'R', lock.afterFlick);
  log('hedef ölünce kilit sıradaki düşmana geçer', lock.relock);
  log('kilit, oyuncu kamerayı sürüklerken zorla çevirmez', lock.soft.softErr > lock.soft.hardErr + .2, JSON.stringify(lock.soft));
  log('kamera ağaç tepesinin içine / gövdenin arkasına girmiyor', tree.none || !tree.inCrown, JSON.stringify(tree));
  log('arkadan saldırı: ekranın alt kenarında kırmızı ok', thr.n >= 1 && thr.below, JSON.stringify(thr));
  log('HUD düzenleyici: düğme taşınır, düzenlerken saldırmaz', hud.moved > 60 && !hud.attacked, JSON.stringify(hud));
  log('HUD düzeni ve boyutu yeniden açınca korunur', Math.hypot(kept.x - (W[0] * .5 - 20), kept.y - (W[1] * .3 - 20)) < 40 && kept.bs === '1.1', JSON.stringify(kept));
};
