// Azgal, the Demon Queen (manhwa style, our own design). Upper body on Aldrich's proportions (narrow shoulders,
// short arms); his serpent lower body becomes a scaled tail trailing from under the gown.
import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, symX, fbm, noise } from '../sdf.mjs';
export default (ALL) => humanoid(ALL, 'king', { hr: 0.11, dress: true, hairStyle: 'long', bulk: 0, waist: 0.68, torsoMat: 'corset', armMat: 'skin', forearmMat: 'glove', skirtMat: 'gown', legMat: 'gown', bootMat: 'corset', cuffs: false, noBelt: true, tris: 12000, voxel: 0.006,
  extras: [(c) => { const H = c.H, hr = c.hr, T = c.T, ch = c.chestR, y = 0.06 + T * 0.72, hb = c.headB;
    c.add({ name: 'bust', mat: 'corset', bone: 'spine', tau: 0.03, k: 0.03, sdf: symX(ellipsoid([0.06, y + 0.005, ch[2] * 0.62], [0.065, 0.06, 0.065])) });
    c.add({ name: 'corsetTrim', mat: 'gold', bone: 'spine', rigid: true, k: 0.004, sdf: U(0, I(0.004, grow(ellipsoid([0, y - 0.02, 0.01], [ch[0], ch[1] * 1.3, ch[2]]), 0.012), plane([0, y + 0.07, 0], [0, 1, 0]), plane([0, y + 0.05, 0], [0, -1, 0])), symX(tube([[0.02, y + 0.05, ch[2] + 0.02], [0.06, y - 0.12, ch[2] - 0.01], [0.04, 0.08, ch[2] * 0.8]], () => 0.007))) });
    c.add({ name: 'gem', mat: 'glow', bone: 'spine', rigid: true, k: 0.003, sdf: ellipsoid([0, y + 0.07, ch[2] + 0.035], [0.022, 0.03, 0.012]) });
    // horns sweeping forward like a crown, and a thin gold circlet
    c.add({ name: 'horns', mat: 'horn', bone: 'head', rigid: true, k: 0.015, sdf: symX(disp(horn([H([hr * 0.55, hr * 0.7, hr * 0.1]), H([hr * 1.1, hr * 1.25, -hr * 0.3]), H([hr * 1.6, hr * 1.9, -hr * 0.25]), H([hr * 1.65, hr * 2.6, hr * 0.25]), H([hr * 1.35, hr * 3.0, hr * 0.7])], hr * 0.3, 0.004), (x, yy) => 0.003 * Math.sin((yy - c.hc[1]) * 120), 0.004)) });
    c.add({ name: 'circlet', mat: 'gold', bone: 'head', rigid: true, k: 0.005, sdf: U(0.006, I(0.003, shell(ellipsoid(H([0, hr * 0.42, -hr * 0.02]), [hr * 1.0, hr * 0.3, hr * 1.05]), 0.006), plane(H([0, hr * 0.48, 0]), [0, 1, 0]), plane(H([0, hr * 0.38, 0]), [0, -1, 0])), horn([H([0, hr * 0.45, hr * 1.0]), H([0, hr * 0.8, hr * 1.02]), H([0, hr * 1.05, hr * 0.98])], hr * 0.12)) });
    c.add({ name: 'brow', mat: 'glow', bone: 'head', rigid: true, k: 0.002, sdf: ellipsoid(H([0, hr * 0.32, hr * 0.97]), [hr * 0.06, hr * 0.06, hr * 0.03]) });
    // long hair to the knees with loose locks at the front
    c.add({ name: 'hairFall', mat: 'hair', bone: 'spine', tau: 0.05, k: 0.04, sdf: disp(U(0.06, ellipsoid(v3.add(hb, [0, -0.15, -hr * 1.0]), [hr * 1.05, 0.22, hr * 0.5]), cone(v3.add(hb, [0, -0.25, -hr * 1.1]), [0, -0.55, -0.22], hr * 0.95, hr * 0.55)), (x, yy, z) => 0.005 * fbm(x * 70, yy * 8, z * 70, 2), 0.006) });
    c.add({ name: 'locks', mat: 'hair', bone: 'head', rigid: true, k: 0.02, sdf: symX(horn([H([hr * 0.75, hr * 0.1, hr * 0.4]), H([hr * 0.9, -hr * 0.8, hr * 0.5]), H([hr * 0.85, -hr * 2.2, hr * 0.45])], hr * 0.22, 0.008)) });
    // high collar cape
    const y0 = 0.06 + T * 0.95, y1 = -c.legLen + 0.02;
    c.add({ name: 'collar', mat: 'gown', bone: 'spine', rigid: true, k: 0.01, sdf: I(0.006, shell(cone(v3.add(hb, [0, -0.08, -0.02]), v3.add(hb, [0, 0.16, -0.05]), 0.1, 0.16), 0.007), plane([0, 0, -0.02], [0, 0, 1]), { d: (x, yy, z) => yy - (hb[1] + 0.17 - 0.25 * x * x), bb: [-2, -2, -2, 2, 2, 2] }) });
    c.add({ name: 'cape', mat: 'cape', tau: 0.05, k: 0.02, sdf: I(0.006, shell(disp(cone([0, y0, 0.0], [0, y1, 0.15], c.sh + 0.1, 0.55), (x, yy, z) => Math.max(0, y0 - yy) * 0.05 * Math.sin(Math.atan2(x, z) * 7), 0.06), 0.009), plane([0, 0, -0.07], [0, 0, 1]), plane([0, y0, 0], [0, 1, 0]), plane([0, y1, 0], [0, -1, 0])),
      boneFn: (x, yy) => { const d = Math.max(0, Math.min(1, -yy / 0.8)); return [['spine', 1 - d * 0.6], ['root', d * 0.6]]; } });
    // Aldrich's serpent: a scaled tail flowing from under the gown along the ground
    const g = -c.legLen + 0.06, tp = [[0, -0.2, -0.12], [0, g + 0.1, -0.45], [0.25, g + 0.05, -0.95], [0.1, g + 0.04, -1.45], [-0.3, g + 0.04, -1.85], [-0.45, g + 0.1, -2.25]];
    c.add({ name: 'tail', mat: 'scale', bone: 'root', tau: 0.05, k: 0.05, sdf: disp(tube(tp, (t) => 0.13 - 0.11 * t, 0.05), (x, yy, z) => 0.003 * Math.abs(Math.sin(x * 60) * Math.sin(z * 60)), 0.004) }); }],
  decals: eyeDecals,
  mats: mats({ skin: [0.88, 0.8, 0.86], c1: [0.1, 0.06, 0.09], c2: [0.1, 0.06, 0.09], hair: [0.07, 0.05, 0.09], horn: [0.08, 0.05, 0.07],
    extra: { corset: { col: [0.12, 0.05, 0.08], gloss: 0.55, var: 0.1, freq: 40 }, glove: { col: [0.06, 0.04, 0.06], gloss: 0.6 }, gown: { col: [0.09, 0.04, 0.07], col2: [0.28, 0.03, 0.06], freq2: 4, mix2: 0.9, var: 0.12, gloss: 0.3, grad: [-1.0, 0.0, [0.5, 0.5, 0.5]] },
      cape: { col: [0.3, 0.02, 0.05], col2: [0.16, 0.01, 0.03], freq2: 5, var: 0.15, gloss: 0.2, grad: [-1.0, 0.8, [0.45, 0.45, 0.45]] }, gold: { col: [0.7, 0.5, 0.18], gloss: 0.85, metal: 1, wear: 0.4, edge: [1, 0.9, 0.5] },
      glow: { col: [1.5, 0.3, 0.12], em: 1 }, scale: { col: [0.1, 0.05, 0.09], col2: [0.25, 0.04, 0.08], freq2: 6, var: 0.2, gloss: 0.6 }, horn: { col: [0.08, 0.05, 0.07], col2: [0.4, 0.06, 0.06], freq2: 12, var: 0.15, gloss: 0.7, grad: [1.5, 2.2, [1, 1, 1]] } } }) });
