// Azgal, the Demon King: horned crown, burning eyes, black-crimson plate, spiked mantle, long cape and tail.
import { humanoid, mats } from '../lib/humanoid.mjs';
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, symX, fbm, noise } from '../sdf.mjs';
export default (ALL) => humanoid(ALL, 'king', { hr: 0.16, demon: true, big: true, bulk: 0.25, waist: 0.6, tunic: false, noBelt: true, torsoMat: 'plate', armMat: 'plate', forearmMat: 'plate', legMat: 'plate', pelvisMat: 'plate', bootMat: 'plate', cuffs: false, tris: 11000, voxel: 0.0075,
  extras: [(c) => { const ch = c.chestR, y = 0.06 + c.T * 0.72, T = c.T;
    c.add({ name: 'breast', mat: 'plate', bone: 'spine', rigid: true, k: 0.01, sdf: Sub(0.006, I(0.01, grow(ellipsoid([0, y, 0.01], [ch[0] * 1.03, ch[1] * 1.2, ch[2] * 1.06]), 0.02), plane([0, y + ch[1] * 0.9, 0], [0, 1, 0]), plane([0, y - ch[1] * 1.4, 0], [0, -1, 0])),
      symX(tube([[0.03, y + 0.1, ch[2] + 0.04], [0.14, y - 0.02, ch[2] - 0.0], [0.2, y - 0.18, ch[2] - 0.06]], () => 0.008))) });
    c.add({ name: 'core', mat: 'glow', bone: 'spine', rigid: true, k: 0.004, sdf: ellipsoid([0, y - 0.02, ch[2] * 1.06 + 0.03], [0.04, 0.06, 0.02]) });
    c.side((s, sb) => { const p = c.at(sb, [0, 0.03, 0]);
      c.add({ name: 'pauld' + s, mat: 'plate', bone: c.N(sb), rigid: true, k: 0.008, sdf: U(0.01, I(0.006, shell(ellipsoid(p, [0.2, 0.15, 0.2]), 0.016), plane(v3.add(p, [0, -0.06, 0]), [0, -1, 0])),
        ...[0, 1, 2].map((i) => horn([v3.add(p, [s * (0.08 + i * 0.05), 0.1 - i * 0.02, -0.06 + i * 0.06]), v3.add(p, [s * (0.18 + i * 0.07), 0.3 - i * 0.04, -0.1 + i * 0.05]), v3.add(p, [s * (0.26 + i * 0.08), 0.48 - i * 0.06, -0.18 + i * 0.04])], 0.05))) }); });
    // long cape from the shoulders to the ground, slit at the back
    const y0 = 0.06 + T * 0.95, y1 = -c.legLen + 0.08;
    c.add({ name: 'cape', mat: 'cloth', tau: 0.05, k: 0.02, sdf: I(0.006, shell(disp(cone([0, y0, 0.0], [0, y1, 0.05], c.sh + 0.12, 0.62), (x, yy, z) => Math.max(0, y0 - yy) * 0.05 * Math.sin(Math.atan2(x, z) * 7), 0.06), 0.01), plane([0, 0, -0.06], [0, 0, 1]), plane([0, y0, 0], [0, 1, 0]), { d: (x, yy, z) => (y1 + 0.06 * Math.max(0, noise(x * 12, 0, z * 12))) - yy, bb: [-3, -3, -3, 3, 3, 3] }),
      boneFn: (x, yy) => { const d = Math.max(0, Math.min(1, (0.0 - yy) / 0.8)); return [['spine', 1 - d * 0.6], ['root', d * 0.6]]; } });
    // tail
    const tb = [0, -0.05, -0.25], tp = [tb, [0, -0.35, -0.75], [0, -0.6, -1.35], [0.2, -0.75, -2.0], [0.45, -0.7, -2.5]];
    c.add({ name: 'tail', mat: 'skin', bone: 'root', tau: 0.05, k: 0.04, sdf: U(0.02, tube(tp, (t) => 0.14 - 0.12 * t, 0.04), ...[0.2, 0.4, 0.6, 0.8].map((t, i) => horn([v3.lerp(tp[i], tp[i + 1], 0.5), v3.add(v3.lerp(tp[i], tp[i + 1], 0.5), [0, 0.14 - i * 0.02, -0.04])], 0.045 - i * 0.006))) }); }],
  mats: mats({ skin: [0.16, 0.08, 0.12], c1: [0.07, 0.04, 0.07], c2: [0.1, 0.05, 0.09], hair: [0.05, 0.03, 0.05], horn: [0.25, 0.05, 0.06],
    extra: { plate: { col: [0.12, 0.06, 0.08], gloss: 0.65, metal: 1, wear: 0.5, edge: [0.8, 0.3, 0.3], dirt: 0.45, var: 0.1 }, cloth: { col: [0.24, 0.02, 0.04], col2: [0.14, 0.01, 0.02], freq2: 5, var: 0.15, gloss: 0.15, grad: [-1.2, 1.0, [0.5, 0.5, 0.5]] },
      glow: { col: [1.5, 0.35, 0.12], em: 1 } } }) });
