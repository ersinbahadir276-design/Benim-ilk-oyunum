// Veyra — the Demon King's daughter (our own design): pale skin, crimson hair to the waist, swept dark horns with
// ember tips, black corset with crimson trim, split skirt (front/back flaps), long gloves, thigh boots,
// a spade-tipped tail and the ember sword "Kızıl Kor". Bones 15–19: hair, skirtF, skirtB, tail, hair2.
import { humanoid, mats } from '../lib/humanoid.mjs';
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, symX, fbm, noise } from '../sdf.mjs';
const BONES = ['root', 'spine', 'head', 'lSh', 'lEl', 'lWr', 'rSh', 'rEl', 'rWr', 'lHip', 'lKnee', 'lFoot', 'rHip', 'rKnee', 'rFoot', 'hair', 'skirtF', 'skirtB', 'tail', 'hair2'];
export default (ALL) => humanoid(ALL, 'veyra', { def: ALL.veyra, bones: BONES, hr: 0.098, hairStyle: 'bald', tunic: false, noBelt: true, torsoMat: 'black', pelvisMat: 'black', armMat: 'skin', forearmMat: 'black', legMat: 'black', bootMat: 'boot', cuffs: false, tris: 9000, voxel: 0.0052,
  extras: [(c) => { const H = c.H, hr = c.hr, T = c.T, ch = c.chestR, y = 0.06 + T * 0.72, hb = c.headB;
    // bust and corset shape, choker with a red gem, crimson trim
    c.add({ name: 'bust', mat: 'black', bone: 'spine', tau: 0.03, k: 0.03, sdf: symX(ellipsoid([0.055, y + 0.005, ch[2] * 0.62], [0.06, 0.055, 0.06])) });
    c.add({ name: 'choker', mat: 'black', bone: 'head', rigid: false, tau: 0.02, k: 0.004, sdf: I(0.003, grow(cone(v3.add(hb, [0, -0.07, 0]), v3.add(hb, [0, 0.05, 0]), 0.045, 0.04), 0.006), plane(v3.add(hb, [0, -0.005, 0]), [0, 1, 0]), plane(v3.add(hb, [0, -0.03, 0]), [0, -1, 0])), boneFn: () => [['head', 0.6], ['spine', 0.4]] });
    c.add({ name: 'gem', mat: 'gem', bone: 'spine', rigid: true, k: 0.002, sdf: sphere(v3.add(hb, [0, -0.02, 0.05]), 0.011) });
    // horns: from the temples, back then up, ember tips
    c.add({ name: 'horns', mat: 'horn', bone: 'head', rigid: true, k: 0.012, sdf: symX(disp(horn([H([hr * 0.62, hr * 0.62, hr * 0.15]), H([hr * 1.05, hr * 0.95, -hr * 0.2]), H([hr * 1.25, hr * 1.5, -hr * 0.65]), H([hr * 1.15, hr * 2.15, -hr * 0.9]), H([hr * 0.85, hr * 2.6, -hr * 0.8])], hr * 0.26, 0.003),
      (x, y, z) => 0.0025 * Math.sin((y - c.hc[1]) * 160), 0.003)) });
    // crimson hair: crown cap + fringe + side locks (head), long back fall (hair, hair2)
    const cran = ellipsoid(H([0, hr * 0.06, -hr * 0.04]), [hr * 0.9, hr * 1.02, hr * 0.98]);
    const cap = I(0.012, grow(cran, hr * 0.11), plane(H([0, hr * 0.45, hr * 0.5]), [0, -0.6, 0.8]), plane(H([0, -hr * 0.2, 0]), [0, -1, 0.25]));
    const fringe = U(0.01, ...[-1, -0.35, 0.35, 1].map((s) => horn([H([s * hr * 0.32, hr * 0.7, hr * 0.74]), H([s * hr * 0.42, hr * 0.48, hr * 0.94]), H([s * hr * 0.46, hr * 0.3, hr * 0.95])], hr * 0.17, 0.004)));
    const locks = symX(U(0.02, horn([H([hr * 0.78, hr * 0.2, hr * 0.32]), H([hr * 0.86, -hr * 0.4, hr * 0.38]), H([hr * 0.8, -hr * 1.2, hr * 0.2])], hr * 0.24, 0.006)));
    const strands = (x, y, z) => 0.004 * fbm(x * 80, y * 10, z * 80, 2);
    c.add({ name: 'hairTop', mat: 'hair', bone: 'head', rigid: true, k: 0.015, sdf: disp(U(0.02, cap, fringe, locks), strands, 0.005) });
    const fall = U(0.04, ellipsoid(H([0, -hr * 0.4, -hr * 0.75]), [hr * 0.95, hr * 1.2, hr * 0.45]), ellipsoid(v3.add(hb, [0, -0.22, -hr * 1.05]), [hr * 0.92, 0.2, hr * 0.38]), cone(v3.add(hb, [0, -0.3, -hr * 1.05]), v3.add(hb, [0, -0.62, -hr * 1.15]), hr * 0.85, hr * 0.35));
    const hairTop = hb[1] + hr * 0.4, hairBot = hb[1] - 0.62;
    c.add({ name: 'hairFall', mat: 'hair', tau: 0.03, k: 0.03, sdf: disp(fall, strands, 0.005), boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (hairTop - y) / (hairTop - hairBot))); return [['head', Math.max(0, 1 - t * 3)], ['hair', Math.max(0, 1 - Math.abs(t - 0.4) * 2.2)], ['hair2', Math.max(0, t * 1.8 - 0.6)]]; } });
    // split skirt: front and back flaps on their own bones, sides on the hips
    const skirt = (z0, z1) => I(0.005, shell(disp(cone([0, 0.07, 0], [0, -0.24, 0.0], 0.15, 0.24), (x, y, z) => Math.max(0, -y) * 0.06 * Math.sin(Math.atan2(x, z) * 8), 0.02), 0.006), plane([0, 0.07, 0], [0, 1, 0]), plane([0, -0.24, 0], [0, -1, 0]), plane([0, 0, z0], [0, 0, -1]), plane([0, 0, z1], [0, 0, 1]));
    c.add({ name: 'skirtF', mat: 'crimson', tau: 0.02, k: 0.006, sdf: skirt(0.02, 1), boneFn: (x, y) => [['skirtF', Math.min(1, Math.max(0, -y / 0.1))], ['root', Math.max(0.05, 1 - Math.max(0, -y / 0.1))]] });
    c.add({ name: 'skirtB', mat: 'crimson', tau: 0.02, k: 0.006, sdf: skirt(-1, -0.02), boneFn: (x, y) => [['skirtB', Math.min(1, Math.max(0, -y / 0.1))], ['root', Math.max(0.05, 1 - Math.max(0, -y / 0.1))]] });
    c.add({ name: 'sash', mat: 'gold', bone: 'root', rigid: true, k: 0.004, sdf: I(0.004, grow(ellipsoid([0, 0.05, 0], [0.14, 0.08, 0.105]), 0.012), plane([0, 0.075, 0], [0, 1, 0]), plane([0, 0.055, 0], [0, -1, 0])) });
    // boot tops above the knee and glove cuffs
    c.side((s, sb, eb, wb, hbn, kb) => { const k = c.WP[kb]; c.add({ name: 'bootTop' + s, mat: 'crimson', bone: c.N(hbn), rigid: true, k: 0.004, sdf: I(0.003, grow(cone(c.WP[hbn], k, 0.07, 0.052), 0.008), plane(v3.add(k, [0, 0.14, 0]), [0, 1, 0]), plane(v3.add(k, [0, 0.11, 0]), [0, -1, 0])) });
      c.add({ name: 'glove' + s, mat: 'crimson', bone: c.N(eb), rigid: true, k: 0.004, sdf: I(0.003, grow(cone(c.WP[eb], c.WP[wb], 0.042, 0.034), 0.007), plane(c.at(eb, [0, -0.02, 0]), c.WR[eb].length ? [c.WR[eb][1], c.WR[eb][4], c.WR[eb][7]] : [0, 1, 0]), plane(c.at(eb, [0, -0.045, 0]), [-c.WR[eb][1], -c.WR[eb][4], -c.WR[eb][7]])) }); });
    // tail with a spade tip
    const tb = v3.add(c.WP[0], [0, -0.05, -0.12]), tp = [tb, v3.add(tb, [0, -0.12, -0.18]), v3.add(tb, [0.04, -0.34, -0.3]), v3.add(tb, [0.12, -0.5, -0.32]), v3.add(tb, [0.2, -0.58, -0.25])];
    c.add({ name: 'tail', mat: 'black', bone: 'tail', rigid: true, k: 0.01, sdf: U(0.006, tube(tp, (t) => 0.024 - 0.014 * t, 0.01), I(0.004, ellipsoid(v3.add(tp[4], [0.04, -0.02, 0.04]), [0.055, 0.045, 0.012], rot.mul(rot.y(0.9), rot.z(0.6))), plane(v3.add(tp[4], [0, 0, 0]), [-0.5, 0.8, 0]))) });
    // ember sword in the right hand (blade along the hand's local z, like the old model)
    const R = 8; c.add({ name: 'grip', mat: 'black', bone: 'rWr', rigid: true, k: 0.003, sdf: cone(c.at(R, [0, -0.05, -0.08]), c.at(R, [0, -0.05, 0.06]), 0.015, 0.014) });
    c.add({ name: 'guard', mat: 'gold', bone: 'rWr', rigid: true, k: 0.004, sdf: U(0.006, box(c.at(R, [0, -0.05, 0.075]), [0.07, 0.014, 0.014], c.WR[R], 0.008), sphere(c.at(R, [0, -0.05, -0.095]), 0.022)) });
    c.add({ name: 'blade', mat: 'ember', bone: 'rWr', rigid: true, k: 0.003, sdf: I(0.002, ellipsoid(c.at(R, [0, -0.05, 0.48]), [0.03, 0.008, 0.42], c.WR[R]), plane(c.at(R, [0, -0.05, 0.085]), v3.norm([-c.WR[R][2], -c.WR[R][5], -c.WR[R][8]]))) });
  }],
  mats: mats({ skin: [0.96, 0.84, 0.8], c1: [0.1, 0.08, 0.1], c2: [0.1, 0.08, 0.1], hair: [0.62, 0.08, 0.1], horn: [0.12, 0.08, 0.1],
    extra: { black: { col: [0.12, 0.1, 0.12], var: 0.12, freq: 50, gloss: 0.4, dirt: 0.4 }, boot: { col: [0.08, 0.06, 0.07], gloss: 0.7, dirt: 0.3 },
      crimson: { col: [0.55, 0.06, 0.08], col2: [0.36, 0.04, 0.05], freq2: 8, var: 0.15, gloss: 0.3 }, gem: { col: [1.4, 0.15, 0.1], em: 0.7, gloss: 0.9 }, ember: { col: [1.5, 0.5, 0.12], em: 1, gloss: 0.6 },
      horn: { col: [0.12, 0.08, 0.1], col2: [0.3, 0.06, 0.06], freq2: 14, var: 0.15, gloss: 0.6, grad: [1.45, 1.85, [1, 1, 1]] } } }) });
