// Zindan girişleri (dünyada)
module.exports = async ({ page, shot, G }) => {
  await G(() => { window.__noAutoQ = 1; __G.GT.tod = .3; });
  for (const id of ['crypt', 'cave', 'temple']) {
    await G((id) => { const D = __G.X.DUNS[id]; __G.tp(D.x + 1.5, D.z + 4); __G.P.yaw = Math.PI; __G.__lockCam = 1; Object.assign(__G.CAM, { tx: D.x, ty: __G.hAt(D.x, D.z) + 1.8, tz: D.z, yaw: Math.PI + .35, pitch: .12, dist: 9.5 }); __G.sim(1 / 30, 5) }, id);
    await shot('ent-' + id, { wait: 900 });
  }
};
