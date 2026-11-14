// dumps the game's skeletons for the offline sculpt tool -> tools/sculpt/skeletons.json
const fs = require('fs'), path = require('path');
module.exports = async ({ G }) => {
  const s = await G(() => { const D = __G.X.dbg, o = { hero: { bones: D.PLD.bones, hum: D.PLD.hum }, kinds: {}, croc: D.crocDef(), veyra: D.VEYM.def.map((b) => ({ p: b.p, o: b.o })), wolf: { WHIP: D.WHIP, W_UP: D.W_UP, W_LO: D.W_LO } };
    for (const k of ['villager', 'villager2', 'merchant', 'guard', 'goblin', 'bigGoblin', 'elder', 'smith', 'hunter', 'priest', 'king']) o.kinds[k] = D.humanGeo(k).def.map((b) => ({ p: b.p, o: b.o }));
    return o; });
  fs.writeFileSync(path.join(__dirname, '../tools/sculpt/skeletons.json'), JSON.stringify(s));
  console.log('hero bones', s.hero.bones.length, 'kinds', Object.keys(s.kinds).length, 'croc', s.croc.length, 'veyra', s.veyra.length);
};
