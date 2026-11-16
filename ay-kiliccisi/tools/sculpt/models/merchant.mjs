import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
import { apron } from './_props.mjs';
import { ellipsoid, cone, I, U, shell, plane, grow } from '../sdf.mjs';
export default (ALL) => humanoid(ALL, 'merchant', { hr: 0.105, belly: 1, beard: 0.45, hairStyle: 'short', decals: eyeDecals,
  extras: [(c) => apron(c, 'linen'), (c) => { const H = c.H, hr = c.hr; c.add({ name: 'hat', mat: 'felt', bone: 'head', rigid: true, k: 0.01, sdf: U(0.015, I(0.004, ellipsoid(H([0, hr * 0.55, -hr * 0.03]), [hr * 2.0, hr * 0.12, hr * 1.9]), plane(H([0, hr * 0.62, 0]), [0, 1, 0])), cone(H([0, hr * 0.5, -hr * 0.03]), H([0, hr * 1.55, -hr * 0.12]), hr * 0.95, hr * 0.7)) });
    c.add({ name: 'hatBand', mat: 'gold', bone: 'head', rigid: true, k: 0.003, sdf: I(0.003, grow(cone(H([0, hr * 0.5, -hr * 0.03]), H([0, hr * 1.55, -hr * 0.12]), hr * 0.95, hr * 0.7), 0.006), plane(H([0, hr * 0.85, 0]), [0, 1, 0]), plane(H([0, hr * 0.68, 0]), [0, -1, 0])) }); }],
  mats: mats({ skin: [0.84, 0.64, 0.5], c1: [0.48, 0.18, 0.24], c2: [0.28, 0.22, 0.18], hair: [0.2, 0.18, 0.16], extra: { linen: { col: [0.86, 0.83, 0.76], var: 0.1, freq: 50, gloss: 0.1, dirt: 0.5 }, felt: { col: [0.3, 0.18, 0.12], var: 0.12, freq: 50, gloss: 0.1 } } }) });
