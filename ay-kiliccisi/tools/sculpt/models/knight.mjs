// Cursed knight (Lanetli Şövalye): blackened plate, a closed horned helm with a burning visor slit, spiked pauldrons, a long dark greatsword.
import { humanoid, mats } from '../lib/humanoid.mjs';
import { v3, cone, horn, ellipsoid, box, plane, sphere, U, I, Sub, shell, grow, symX } from '../sdf.mjs';
const armour = (c) => { const H = c.H, hr = c.hr, ch = c.chestR, y = 0.06 + c.T * 0.72;
  c.add({ name: 'helm', mat: 'steel', bone: 'head', rigid: true, k: 0.006, sdf: Sub(0.004, U(0.01, ellipsoid(H([0, hr * 0.12, -hr * 0.02]), [hr * 1.14, hr * 1.22, hr * 1.2]), ellipsoid(H([0, -hr * 0.55, hr * 0.25]), [hr * 0.9, hr * 0.7, hr * 0.95]), cone(H([0, hr * 1.2, -hr * 0.1]), H([0, hr * 0.6, hr * 0.9]), 0.012, 0.012)),
    box(H([0, hr * 0.02, hr * 1.1]), [hr * 0.7, hr * 0.06, hr * 0.4], null, 0.004)) });
  c.add({ name: 'visor', mat: 'glow', bone: 'head', rigid: true, k: 0.002, sdf: box(H([0, hr * 0.02, hr * 0.98]), [hr * 0.6, hr * 0.045, hr * 0.06], null, 0.004) });
  c.add({ name: 'horns', mat: 'horn', bone: 'head', rigid: true, k: 0.006, sdf: symX(horn([H([hr * 0.85, hr * 0.5, 0]), H([hr * 1.5, hr * 0.85, -hr * 0.2]), H([hr * 1.7, hr * 1.6, -hr * 0.5]), H([hr * 1.55, hr * 2.2, -hr * 0.6])], 0.03)) });
  c.add({ name: 'breast', mat: 'steel', bone: 'spine', rigid: true, k: 0.006, sdf: I(0.006, grow(ellipsoid([0, y, 0.01], [ch[0] * 1.06, ch[1] * 1.2, ch[2] * 1.12]), 0.016), plane([0, y + ch[1] * 0.9, 0], [0, 1, 0]), plane([0, y - ch[1] * 1.45, 0], [0, -1, 0])) });
  c.add({ name: 'sigil', mat: 'glow', bone: 'spine', rigid: true, k: 0.002, sdf: Sub(0.002, sphere([0, y, ch[2] * 1.12 + 0.03], 0.03), sphere([0, y + 0.012, ch[2] * 1.12 + 0.045], 0.026)) });
  c.side((s, sb) => { const P0 = c.at(sb, [0, 0.01, 0]);
    c.add({ name: 'pauld' + s, mat: 'steel', bone: c.N(sb), rigid: true, k: 0.004, sdf: U(0.008, I(0.004, shell(ellipsoid(P0, [0.11, 0.09, 0.11]), 0.01), plane(c.at(sb, [0, -0.05, 0]), [0, -1, 0])),
      ...[0, 1, 2].map((i) => cone(c.at(sb, [0, 0.07, -0.05 + i * 0.05]), c.at(sb, [0, 0.19 - i * 0.02, -0.06 + i * 0.05]), 0.016, 0.002))) }); });
  const R = 8, a = c.at(R, [0, -0.06, -0.1]), b = c.at(R, [0, -0.06, 0.1]), dir = v3.norm(v3.sub(b, a)), tip = v3.add(b, v3.mul(dir, 1.05));
  c.add({ name: 'grip', mat: 'leather', bone: 'rWr', rigid: true, k: 0.003, sdf: cone(a, b, 0.017, 0.016) });
  c.add({ name: 'guard', mat: 'steel', bone: 'rWr', rigid: true, k: 0.004, sdf: box(c.at(R, [0, -0.06, 0.1]), [0.13, 0.02, 0.02], c.WR[R], 0.006) });
  c.add({ name: 'blade', mat: 'blade', bone: 'rWr', rigid: true, k: 0.003, sdf: U(0.004, cone(b, tip, 0.03, 0.006)) }); };
export default (ALL) => { const M = mats({ skin: [0.3, 0.27, 0.27], c1: [0.13, 0.12, 0.13], c2: [0.18, 0.06, 0.06], hair: [0.1, 0.1, 0.1], horn: [0.12, 0.1, 0.1],
  extra: { glow: { col: [1.6, 0.25, 0.1], em: 1 }, steel: { col: [0.17, 0.17, 0.19], gloss: 0.65, metal: 1, wear: 0.6, edge: [0.55, 0.5, 0.5], dirt: 0.5 }, blade: { col: [0.12, 0.11, 0.13], gloss: 0.85, metal: 1, edge: [0.9, 0.3, 0.2], wear: 0.7 } } });
  const m = humanoid(ALL, 'guard', { hr: 0.105, skull: true, bulk: 0.35, torsoMat: 'c1', armMat: 'c1', legMat: 'c1', skirtMat: 'c2', bootMat: 'c1', tris: 7500, voxel: 0.0056, extras: [armour], mats: M });
  m.name = 'knight'; return m; };
