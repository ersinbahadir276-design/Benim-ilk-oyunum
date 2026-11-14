// in-game look at the sculpted characters (camera locked on each)
module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(800);
  await G(() => { const g = __G; g.GT.paused = true; window.__noAutoQ = 1; g.fastStream = 1; });
  const focus = async (sel, name, d, h, a, ty) => { await G(([sel, d, h, a, ty]) => { const g = __G; let o = null;
      if (sel.npc) o = g.NPCS.find((n) => n.role === sel.npc || (!n.role && n.kind === sel.npc)); else if (sel.gob) o = g.GOBS.find((x) => !x.dead && (sel.gob === 'big' ? x.big && !x.boss : sel.gob === 'chief' ? x.boss : !x.big));
      if (!o) return; g.tp(o.x + Math.sin(o.yaw + a) * (d + 2), o.z + Math.cos(o.yaw + a) * (d + 2)); o.st = 'idle'; o.t = 0; for (let i = 0; i < 20; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
      g.__lockCam = 1; g.CAM.yaw = o.yaw + a + Math.PI; g.CAM.dist = d; g.CAM.pitch = h; g.CAM.tx = o.x; g.CAM.tz = o.z; g.CAM.ty = o.y + ty; }, [sel, d, h, a, ty]); await shot(name, { wait: 700 }); };
  await G(() => { const g = __G, w = g.wolves.find((w) => !w.dead && !w.boss && !w.tame); g.tp(w.x + 3, w.z + 3); w.st = 'idle'; w.aware = 0; w.t = 0; for (let i = 0; i < 20; i++) { g.GT.time += 1 / 60; g.step(1 / 60); }
    g.__lockCam = 1; g.CAM.yaw = w.yaw + 2.2; g.CAM.dist = 2.6; g.CAM.pitch = 0.12; g.CAM.tx = w.x; g.CAM.tz = w.z; g.CAM.ty = w.y + 0.55; }); await shot('m-wolf', { wait: 700 });
  await G(() => { const g = __G, w = g.wolves.find((w) => !w.dead && !w.boss && !w.tame); w.st = 'chase'; w.spd = 6; for (let i = 0; i < 30; i++) { g.GT.time += 1 / 60; g.step(1 / 60); w.st = 'chase'; } g.CAM.tx = w.x; g.CAM.tz = w.z; g.CAM.yaw = w.yaw + 1.6; g.CAM.dist = 3; }); await shot('m-wolf-run', { wait: 300 });
  await focus({ npc: 'elder' }, 'm-elder', 2.4, 0.08, 0.35, 1.0);
  await focus({ npc: 'elder' }, 'm-elder-face', 0.9, 0.02, 0.15, 1.5);
  await focus({ npc: 'smith' }, 'm-smith', 2.4, 0.08, 0.3, 1.0);
  await focus({ npc: 'hunter' }, 'm-hunter', 2.4, 0.08, 0.3, 1.0);
  await focus({ npc: 'priest' }, 'm-priest', 2.4, 0.08, 0.3, 1.0);
  await focus({ npc: 'guard' }, 'm-guard', 2.4, 0.08, 0.3, 1.0);
  await focus({ npc: 'villager2' }, 'm-villager2', 2.2, 0.08, 0.3, 1.0);
  await focus({ npc: 'villager2' }, 'm-villager2-face', 0.8, 0.02, 0.1, 1.45);
  await focus({ npc: 'merchant' }, 'm-merchant', 2.4, 0.08, 0.3, 1.0);
  await focus({ gob: 'small' }, 'm-goblin', 2.0, 0.08, 0.3, 0.7);
  await focus({ gob: 'big' }, 'm-biggoblin', 4.2, 0.08, 0.3, 1.3);
};
