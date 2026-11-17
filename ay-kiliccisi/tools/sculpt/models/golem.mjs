// Stone golem on the big-goblin rig: stacked boulders, a rune core in the chest, mossy shoulders, fists like anvils.
import { BONES, fk } from '../lib/humanoid.mjs';
import { v3, rot, sphere, cone, ellipsoid, box, U, Sub, disp, symX, fbm, noise } from '../sdf.mjs';
export default function golem(ALL) { const def = ALL.kinds.bigGoblin, { WR, WP } = fk(def), P = [], T = def[2].o[1];
  const rockD = (a, amp = 0.02) => disp(a, (x, y, z) => amp * (fbm(x * 9, y * 9, z * 9, 3) + 0.5 * Math.abs(noise(x * 22, y * 22, z * 22))), amp * 1.6), ap = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]], at = (b, p) => v3.add(WP[b], ap(WR[b], p));
  P.push({ name: 'chest', mat: 'stone', bone: 'spine', tau: 0.05, sdf: rockD(box([0, 0.06 + T * 0.66, 0.0], [0.4, 0.3, 0.27], null, 0.09)) });
  P.push({ name: 'belly', mat: 'stone', boneFn: (x, y) => { const t = Math.max(0, Math.min(1, y / 0.3)); return [['spine', t], ['root', 1 - t]]; }, tau: 0.05, k: 0.03, sdf: rockD(box([0, 0.14, 0.0], [0.3, 0.2, 0.22], null, 0.08)) });
  P.push({ name: 'core', mat: 'rune', bone: 'spine', rigid: true, k: 0.004, sdf: Sub(0.004, sphere([0, 0.06 + T * 0.66, 0.26], 0.1), box([0, 0.06 + T * 0.66, 0.4], [0.2, 0.012, 0.1])) });
  P.push({ name: 'head', mat: 'stone', bone: 'head', rigid: true, k: 0.02, sdf: Sub(0.01, rockD(box(v3.add(WP[2], [0, 0.14, 0.02]), [0.17, 0.15, 0.17], null, 0.05), 0.012), symX(box(v3.add(WP[2], [0.075, 0.15, 0.18]), [0.045, 0.02, 0.05], rot.z(-0.2), 0.006))) });
  P.push({ name: 'eyes', mat: 'rune', bone: 'head', rigid: true, k: 0.002, sdf: symX(box(v3.add(WP[2], [0.075, 0.15, 0.15]), [0.04, 0.014, 0.02], rot.z(-0.2), 0.004)) });
  for (const [s, sb, eb, wb, hb, kb, fb, L] of [[1, 3, 4, 5, 9, 10, 11, 'l'], [-1, 6, 7, 8, 12, 13, 14, 'r']]) { const N = (i) => BONES[i];
    P.push({ name: L + 'sh', mat: 'moss', boneFn: () => [[N(sb), 0.6], ['spine', 0.4]], tau: 0.03, k: 0.03, sdf: rockD(sphere(at(sb, [0, 0.02, 0]), 0.24)) });
    P.push({ name: L + 'ua', mat: 'stone', bone: N(sb), k: 0.02, sdf: rockD(cone(at(sb, [0, -0.1, 0]), at(eb, [0, 0.06, 0]), 0.15, 0.13), 0.014) });
    P.push({ name: L + 'el', mat: 'dark', boneFn: () => [[N(sb), 0.5], [N(eb), 0.5]], k: 0.02, sdf: sphere(WP[eb], 0.1) });
    P.push({ name: L + 'fa', mat: 'stone', bone: N(eb), k: 0.02, sdf: rockD(cone(at(eb, [0, -0.06, 0]), at(wb, [0, 0.02, 0]), 0.14, 0.18), 0.014) });
    P.push({ name: L + 'fist', mat: 'stone', bone: N(wb), rigid: true, k: 0.02, sdf: rockD(box(at(wb, [0, -0.14, 0.02]), [0.16, 0.17, 0.17], WR[wb], 0.06), 0.014) });
    P.push({ name: L + 'th', mat: 'stone', bone: N(hb), tau: 0.03, k: 0.03, sdf: rockD(cone(v3.add(WP[hb], [0, 0.03, 0]), at(kb, [0, 0.05, 0]), 0.2, 0.16), 0.014) });
    P.push({ name: L + 'kn', mat: 'dark', boneFn: () => [[N(hb), 0.5], [N(kb), 0.5]], k: 0.02, sdf: sphere(WP[kb], 0.12) });
    P.push({ name: L + 'sn', mat: 'stone', bone: N(kb), k: 0.02, sdf: rockD(cone(at(kb, [0, -0.05, 0]), WP[fb], 0.16, 0.19), 0.014) });
    P.push({ name: L + 'ft', mat: 'stone', bone: N(fb), rigid: true, k: 0.02, sdf: rockD(box(v3.add(WP[fb], [0, -0.06, 0.07]), [0.19, 0.09, 0.26], null, 0.05), 0.012) }); }
  return { name: 'golem', voxel: 0.0085, tris: 8000, err: 0.0022, bones: BONES, parts: P, decals: [],
    mats: { stone: { col: [0.42, 0.42, 0.45], col2: [0.3, 0.31, 0.34], freq2: 5, var: 0.2, freq: 30, gloss: 0.15, wear: 0.35, edge: [0.8, 0.8, 0.82], dirt: 0.6 }, moss: { col: [0.27, 0.36, 0.2], col2: [0.4, 0.4, 0.42], freq2: 7, mix2: 2, var: 0.2, gloss: 0.08, dirt: 0.5 },
      dark: { col: [0.14, 0.14, 0.17], gloss: 0.2 }, rune: { col: [0.3, 1.2, 1.5], em: 1, gloss: 0.6 } } }; }
