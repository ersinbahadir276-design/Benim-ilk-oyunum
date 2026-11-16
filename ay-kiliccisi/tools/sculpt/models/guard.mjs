import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
import { spear } from './_props.mjs';
import { ellipsoid, cone, I, U, Sub, shell, plane, grow, symX, sphere, box } from '../sdf.mjs';
export default (ALL) => humanoid(ALL, 'guard', { hr: 0.105, hairStyle: 'bald', decals: eyeDecals, torsoMat: 'c2', armMat: 'c2', skirtMat: 'c2',
  extras: [spear, (c) => { const H = c.H, hr = c.hr, ch = c.chestR, y = 0.06 + c.T * 0.72;
    c.add({ name: 'helm', mat: 'steel', bone: 'head', rigid: true, k: 0.006, sdf: U(0.008, I(0.004, shell(ellipsoid(H([0, hr * 0.15, -hr * 0.04]), [hr * 1.08, hr * 1.08, hr * 1.12]), 0.008), plane(H([0, -hr * 0.12, 0]), [0, -1, 0])),
      I(0.004, shell(ellipsoid(H([0, -hr * 0.1, -hr * 0.04]), [hr * 1.5, hr * 0.2, hr * 1.55]), 0.006), plane(H([0, -hr * 0.05, 0]), [0, 1, 0]), plane(H([0, -hr * 0.16, 0]), [0, -1, 0])), cone(H([0, hr * 0.0, hr * 1.1]), H([0, -hr * 0.45, hr * 1.16]), 0.011, 0.009)) });
    c.add({ name: 'breast', mat: 'steel', bone: 'spine', rigid: true, k: 0.006, sdf: I(0.006, grow(ellipsoid([0, y, 0.01], [ch[0] * 1.02, ch[1] * 1.15, ch[2] * 1.05]), 0.012), plane([0, 0, -0.01], [0, 0, -1]), plane([0, y + ch[1] * 0.85, 0], [0, 1, 0]), plane([0, y - ch[1] * 1.3, 0], [0, -1, 0])) });
    c.add({ name: 'emblem', mat: 'gold', bone: 'spine', rigid: true, k: 0.003, sdf: Sub(0.002, sphere([0, y - 0.02, ch[2] * 1.05 + 0.02], 0.035), sphere([0.012, y - 0.015, ch[2] * 1.05 + 0.035], 0.03)) });
    c.side((s, sb) => c.add({ name: 'pauld' + s, mat: 'steel', bone: c.N(sb), rigid: true, k: 0.004, sdf: I(0.004, shell(ellipsoid(c.at(sb, [0, 0.0, 0]), [0.085, 0.07, 0.085]), 0.007), plane(c.at(sb, [0, -0.03, 0]), [0, -1, 0])) })); }],
  mats: mats({ skin: [0.84, 0.64, 0.52], c1: [0.55, 0.57, 0.62], c2: [0.18, 0.26, 0.55], hair: [0.2, 0.16, 0.12] }) });
