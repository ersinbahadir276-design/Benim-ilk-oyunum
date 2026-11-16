module.exports = async ({ shot, G }) => { await G(() => { const g = __G; g.fastStream = 1; g.P.rage = 100; }); await shot('hud-ps-portrait', { wait: 1200 }); };
module.exports.portrait = true;
