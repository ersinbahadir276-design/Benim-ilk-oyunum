// Screenshots of every new feature in real gameplay frames. node test/harness.js test/s-shots.js
const path = require('path');
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(600);
  await page.addScriptTag({ path: path.join(__dirname, 'mech-tests.js') });
  // helpers inside the page
  await G(() => {
    const g = __G, P = g.P, GT = g.GT; window.__noAutoQ = 1; GT.paused = true;
    window.S = {
      sim(sec) { for (let i = 0; i < Math.round(sec * 60); i++) { GT.time += 1 / 60; g.step(1 / 60); } },
      cam(yawOff, dist, pitch, ty) { g.CAM.yaw = g.P.yaw + yawOff; g.CAM.dist = dist; g.CAM.pitch = pitch; if (ty !== undefined) { g.__lockCam = 1; g.CAM.ty = ty; g.CAM.tx = P.x; g.CAM.tz = P.z; } else g.__lockCam = 0; },
      at(x, z, yaw) { g.tp(x, z); P.yaw = yaw; P.st = 'move'; P.hp = 500; P.sta = 100; P.guard = 100; P.alive = true; P.rag.ang = 0; P.td = null; P.pinBy = null; g.CAM.yaw = yaw; },
    };
  });
  const cap = async (name, wait = 350) => { await shot(name, { wait }); };
  // village with NPCs
  await G(() => { S.at(6, 72, Math.PI); __G.GT.tod = .25; S.sim(4); S.cam(0, 7, .3); }); await cap('v1-village', 900);
  await G(() => { const n = __G.NPCS.find((n) => n.kind === 'guard'); S.at(n.x + Math.sin(n.yaw) * 3, n.z + Math.cos(n.yaw) * 3, n.yaw + Math.PI); S.sim(.5); S.cam(.9, 3.6, .15); }); await cap('v2-guard', 700);
  await G(() => { const n = __G.NPCS.find((n) => n.kind === 'merchant'); S.at(n.x + Math.sin(n.yaw) * 2.6, n.z + Math.cos(n.yaw) * 2.6, n.yaw + Math.PI); S.sim(.5); S.cam(.7, 3.4, .15); }); await cap('v3-merchant', 700);
  // goblin camp, big goblin wind-up with the red circle
  await G(() => { const b = __G.GOBS.find((g) => g.big); S.at(b.x + Math.sin(b.yaw) * 3.4, b.z + Math.cos(b.yaw) * 3.4, b.yaw + Math.PI); b.st = 'windup'; b.t = .9; b.aware = 1; S.sim(.02); S.cam(1.2, 6.5, .22); }); await cap('g1-big-windup', 700);
  await G(() => { const g2 = __G.GOBS.filter((g) => !g.big && g.group === 'camp0'); const c = g2[0]; S.at(c.x + 4, c.z + 4, Math.atan2(-4, -4)); for (const x of g2) { x.st = 'chase'; x.aware = 1 } S.sim(1.2); S.cam(.5, 6, .3); }); await cap('g2-small-group', 700);
  // wolf wind-up with the red strip and "!"
  await G(() => { const w = __G.wolves.find((w) => !w.dead && !w.tame); S.at(30, 420, 0); w.x = 30; w.z = 425.5; w.yaw = Math.PI; w.st = 'windup'; w.t = .45; w.aware = 1; w.ax = 30; w.az = 420; w.resolved = false; w.dodged = false; S.sim(.02); S.cam(1.1, 5.5, .25); }); await cap('w1-wolf-windup', 600);
  // ragdoll: pinned by a wolf
  await G(() => { const w = __G.wolves.find((w) => !w.dead && !w.tame); S.at(30, 420, 0); w.x = 30; w.z = 425.5; w.yaw = Math.PI; w.st = 'windup'; w.t = .99; w.aware = 1; w.ax = 30; w.az = 420; w.resolved = false; w.dodged = false; S.sim(1.6); S.cam(1.6, 3.8, .35); }); await cap('w2-pinned', 700);
  // block pose, heavy charge, reverse-grip stab, choke
  await G(() => { S.at(30, 440, 0); __G.IN.blockHeld = true; S.sim(.6); S.cam(Math.PI * .8, 2.6, .12, __G.P.y + 1.1); }); await cap('p1-block', 500);
  await G(() => { __G.IN.blockHeld = false; S.at(30, 440, 0); const IN = __G.IN; IN.atkHeld = true; IN.atkAt = __G.GT.clock; IN.atkUsed = false; S.sim(1.1); S.cam(Math.PI * .75, 2.8, .1, __G.P.y + 1.2); }); await cap('p2-charge', 500);
  await G(() => { const IN = __G.IN; IN.atkHeld = false; IN.atkUp = true; S.sim(.4); S.cam(Math.PI * .6, 3, .1, __G.P.y + 1.0); }); await cap('p3-heavy', 400);
  await G(() => { const gob = __G.GOBS.find((g) => !g.big && !g.dead && g.group.endsWith('p')); gob.st = 'idle'; gob.aware = 0; gob.yaw = 0; gob.hyaw = 0; gob.sees = false; S.at(gob.x, gob.z - 3.5, 0); for (const w of __G.wolves) if (Math.hypot(w.x - gob.x, w.z - gob.z) < 60) w.x += 300; __G.press('jump'); S.sim(.15); __G.press('jump'); S.sim(.95); S.cam(Math.PI * .6, 3, .2, __G.P.y + .7); }); await cap('p4-stab', 500);
  await G(() => { const gob = __G.GOBS.find((g) => !g.big && !g.dead && g.group.endsWith('p')); gob.st = 'idle'; gob.aware = 0; gob.yaw = 0; gob.hyaw = 0; gob.sees = false; S.at(gob.x, gob.z - 1.3, 0); __G.press('inter'); S.sim(.8); S.cam(Math.PI * .65, 3, .15, __G.P.y + 1.0); }); await cap('p5-choke', 500);
  // crocodile with jaws open
  await G(() => { const c = __G.CROCS[0]; S.at(c.x + Math.sin(c.yaw) * 4, c.z + Math.cos(c.yaw) * 4, c.yaw + Math.PI); c.st = 'open'; c.t = .5; c.jaw = 1; S.sim(.02); S.cam(1.3, 5, .3); }); await cap('c1-croc-open', 700);
  // dragon: claw wind-up, then breath with burning ground
  await G(() => { const d = __G.DRAGON; S.at(d.x + Math.sin(d.yaw) * 14, d.z + Math.cos(d.yaw) * 14, d.yaw + Math.PI); d.st = 'claw'; d.t = 0; __G.dPlay(d, 'attack01', 0, 1); S.sim(2.2); S.cam(.9, 9, .25); }); await cap('d1-dragon-claw', 900);
  await G(() => { const d = __G.DRAGON; d.st = 'breath'; d.breathA = null; __G.dPlay(d, 'skill10', 0, 1); S.sim(3.6); S.cam(1.2, 12, .35); }); await cap('d2-dragon-breath', 900);
  await G(() => { S.sim(2.0); S.cam(2.2, 12, .5); }); await cap('d3-burning', 700);
  // overview of regions
  await G(() => { S.at(560, 640, .7); S.sim(.2); S.cam(0, 7, .25); }); await cap('r1-swamp', 1200);
  await G(() => { S.at(0, -700, Math.PI); S.sim(.2); S.cam(0, 7, .12); }); await cap('r2-mountains', 1200);
};
