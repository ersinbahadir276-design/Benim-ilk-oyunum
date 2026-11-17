// Every sculpted model must decode at boot (the game silently falls back to old meshes when one is missing),
// and the hero must carry the session-8 armour redesign (moon crest + tabard → ~23.8k triangles).
module.exports = async ({ G, log }) => {
  const want = ['bigGoblin', 'croc', 'elder', 'goblin', 'guard', 'hero', 'hunter', 'king', 'merchant', 'priest', 'smith', 'sword', 'veyra', 'villager', 'villager2', 'wolf'];
  const r = await G((want) => { const MODEL = __G.MODEL; const have = Object.keys(__G.MODEL); return { missing: want.filter((n) => !MODEL[n] || !MODEL[n].nv), hero: MODEL.hero && { nv: MODEL.hero.nv, tris: MODEL.hero.I.length / 3 }, have: have.length }; }, want);
  log('modeller: 16 heykel modelinin hepsi açıldı', r.missing.length === 0, JSON.stringify(r.missing));
  log('kahraman: yeni zırh (ay arması + önlük) yüklü', r.hero && r.hero.nv > 10500, JSON.stringify(r.hero));
  const em = await G(() => { const m = __G.MODEL.hero; if (!m.M) return -1; let n = 0; for (let i = 0; i < m.nv; i++) if (m.M[i * 4 + 2] > 0.5) n++; return n; });
  log('kahraman: göğüsteki ay taşı ve vizör ışıyor', em < 0 || em > 20, em);
};
