module.exports = async ({ page, shot, G }) => {
  await page.waitForTimeout(1500); await shot('pt-1', { wait: 400 });
  await G(() => { const g = __G; g.tp(6, 72); g.P.yaw = Math.PI; g.CAM.yaw = Math.PI; }); await page.waitForTimeout(2500); await shot('pt-2');
  // performance probe: average ms of step+render over 120 frames with the real loop, draw calls
  const perf = await G(async () => { const g = __G; g.tp(820, -150); g.P.yaw = Math.PI; g.CAM.yaw = Math.PI; await new Promise((r) => setTimeout(r, 1500)); let n = 0, t0 = performance.now(); await new Promise((r) => { const f = () => { n++; if (n < 90) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); }); return { ms: +((performance.now() - t0) / n).toFixed(1), draws: g.drawn(), ql: g.QUAL.QL }; });
  console.log('PERF (yazılımsal GPU, telefon değil):', JSON.stringify(perf));
  await shot('pt-3');
};
module.exports.portrait = true;
