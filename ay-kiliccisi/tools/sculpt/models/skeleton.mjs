// Skeleton warrior ("İskelet Savaşçı"): a risen dead soldier of the ruins.
// Same 16-bone game rig as the villagers (A-pose bind), so the goblin animation code drives it.
// Bones are sculpted as bones (knobbed long bones, ribcage, pelvis bowl, skull with sockets),
// plus rusted sword, torn loincloth and a pale-blue soul fire in the eye sockets.
import { BONES, fk, mats } from '../lib/humanoid.mjs';
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, U, Sub, I, shell, disp, symX, fbm, noise } from '../sdf.mjs';

const ap = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];

export default (ALL) => {
  const def = ALL.kinds.skeleton || ALL.kinds.villager, { WR, WP } = fk(def), P = [], hr = 0.1;
  const at = (b, p) => v3.add(WP[b], ap(WR[b], p));
  const add = (p) => { P.push(p); return p; };
  const N = (i) => BONES[i];
  const T = def[2].o[1], headB = WP[2], hc = v3.add(headB, [0, hr * 0.95, 0]), H = (p) => v3.add(hc, p);
  const knob = (c, r) => U(r * 0.5, sphere(v3.add(c, [r * 0.45, 0, 0]), r), sphere(v3.add(c, [-r * 0.45, 0, 0]), r));
  // a long bone: thin shaft with knobbed ends
  const longBone = (a, b, r) => U(0.008, cone(a, b, r, r * 0.85), knob(v3.lerp(a, b, 0.04), r * 1.55), knob(v3.lerp(a, b, 0.96), r * 1.45));
  const spineW = (x, y) => { const t = Math.max(0, Math.min(1, y / (T * 0.45))); return [['spine', t], ['root', 1 - t]]; };

  // ---------------------------------------------------------------- skull + jaw + soul fire
  const cranium = ellipsoid(H([0, hr * 0.12, -hr * 0.08]), [hr * 0.86, hr * 0.92, hr * 1.02]);
  const face = U(hr * 0.12, ellipsoid(H([0, -hr * 0.3, hr * 0.42]), [hr * 0.6, hr * 0.48, hr * 0.5]), symX(ellipsoid(H([hr * 0.5, -hr * 0.3, hr * 0.48]), [hr * 0.2, hr * 0.14, hr * 0.22])),
    ellipsoid(H([0, hr * 0.12, hr * 0.7]), [hr * 0.58, hr * 0.16, hr * 0.22]));
  const sockets = symX(ellipsoid(H([hr * 0.3, -hr * 0.1, hr * 0.84]), [hr * 0.22, hr * 0.2, hr * 0.26]));
  const nasal = cone(H([0, -hr * 0.28, hr * 1.0]), H([0, -hr * 0.48, hr * 0.98]), hr * 0.05, hr * 0.11);
  const temple = symX(ellipsoid(H([hr * 0.86, -hr * 0.1, hr * 0.15]), [hr * 0.12, hr * 0.3, hr * 0.3]));
  const crack = disp(box(H([hr * 0.35, hr * 0.7, -hr * 0.1]), [hr * 0.02, hr * 0.4, hr * 0.5], rot.z(0.5), 0.002), (x, y, z) => 0.01 * noise(x * 90, y * 90, z * 90), 0.012);
  add({ name: 'skull', mat: 'bone', bone: 'head', rigid: true, k: 0.006, sdf: Sub(0.004, U(hr * 0.15, cranium, face), sockets, nasal, temple, crack) });
  add({ name: 'soul', mat: 'soul', bone: 'head', rigid: true, k: 0.002, sdf: symX(sphere(H([hr * 0.3, -hr * 0.1, hr * 0.74]), hr * 0.1)) });
  const jawPts = (s) => [H([s * hr * 0.64, -hr * 0.18, hr * 0.06]), H([s * hr * 0.6, -hr * 0.72, hr * 0.2]), H([s * hr * 0.36, -hr * 0.86, hr * 0.62]), H([0, -hr * 0.88, hr * 0.8])];
  add({ name: 'jaw', mat: 'bone', bone: 'jaw', rigid: true, k: 0.006, sdf: U(0.01, tube(jawPts(1), () => hr * 0.075), tube(jawPts(-1), () => hr * 0.075), sphere(H([0, -hr * 0.86, hr * 0.78]), hr * 0.1)) });
  const teeth = []; for (let i = -3; i <= 3; i++) { const zz = hr * (0.86 - Math.abs(i) * 0.05);
    teeth.push(['head', ellipsoid(H([i * hr * 0.085, -hr * 0.58, zz]), [hr * 0.04, hr * 0.07, hr * 0.04])], ['jaw', ellipsoid(H([i * hr * 0.08, -hr * 0.74, zz - hr * 0.03]), [hr * 0.038, hr * 0.06, hr * 0.038])]); }
  add({ name: 'teethU', mat: 'tooth', bone: 'head', rigid: true, k: 0.002, sdf: U(0, ...teeth.filter((t) => t[0] === 'head').map((t) => t[1])) });
  add({ name: 'teethL', mat: 'tooth', bone: 'jaw', rigid: true, k: 0.002, sdf: U(0, ...teeth.filter((t) => t[0] === 'jaw').map((t) => t[1])) });

  // ---------------------------------------------------------------- spine, neck, ribcage, sternum, clavicles, scapulae
  const vert = []; const spineTop = headB[1] - 0.02;
  for (let i = 0; i < 13; i++) { const y = -0.02 + (spineTop + 0.02) * (i / 12), z = -0.055 + 0.03 * Math.sin((i / 12) * Math.PI) * -1 + (i > 9 ? 0.03 : 0);
    vert.push(U(0.004, ellipsoid([0, y, z], [0.026 - i * 0.0008, 0.013, 0.022]), cone([0, y, z - 0.01], [0, y - 0.01, z - 0.04], 0.01, 0.005))); }
  add({ name: 'spine', mat: 'bone', boneFn: (x, y) => (y > headB[1] - 0.06 ? [['head', 0.5], ['spine', 0.5]] : spineW(x, y)), k: 0.008, sdf: U(0.006, ...vert, cone([0, -0.02, -0.055], [0, spineTop, -0.035], 0.012, 0.01)) });
  const ribs = [];
  for (let k = 0; k < 7; k++) { const y = 0.06 + T * (0.86 - k * 0.085), rx = 0.1 + 0.035 * Math.sin(((k + 1.5) / 8.5) * Math.PI), rz = 0.085 + 0.02 * Math.sin(((k + 1) / 8) * Math.PI), fr = k < 5;
    for (const s of [1, -1]) ribs.push(tube([[s * 0.02, y, -0.055], [s * rx * 0.85, y - 0.012, -0.045], [s * rx, y - 0.03, 0.01], [s * rx * 0.75, y - 0.05, rz * 0.8], fr ? [s * 0.03, y - 0.065, rz] : [s * rx * 0.45, y - 0.07, rz * 0.85]], () => 0.0085)); }
  add({ name: 'ribs', mat: 'bone', bone: 'spine', k: 0.003, sdf: U(0.003, ...ribs) });
  add({ name: 'sternum', mat: 'bone', bone: 'spine', rigid: true, k: 0.004, sdf: U(0.006, ellipsoid([0, 0.06 + T * 0.72, 0.1], [0.016, T * 0.1, 0.008], rot.x(-0.12)), ellipsoid([0, 0.06 + T * 0.5, 0.108], [0.012, T * 0.14, 0.007], rot.x(-0.12))) });
  for (const [s, sb] of [[1, 3], [-1, 6]]) {
    add({ name: 'clav' + s, mat: 'bone', bone: 'spine', k: 0.004, sdf: tube([[s * 0.025, 0.06 + T * 0.86, 0.09], [s * 0.09, 0.06 + T * 0.9, 0.07], at(sb, [0, 0.01, 0.02])], () => 0.009) });
    add({ name: 'scap' + s, mat: 'bone', bone: 'spine', rigid: true, k: 0.004, sdf: I(0.003, ellipsoid([s * 0.09, 0.06 + T * 0.72, -0.07], [0.055, 0.075, 0.012], rot.mul(rot.y(s * 0.5), rot.z(s * 0.2))), plane([0, 0.06 + T * 0.9, 0], [0, 1, 0])) });
  }
  // pelvis bowl with iliac wings and a hole for the spine
  const pel = U(0.01, I(0.004, shell(ellipsoid([0, -0.01, 0], [0.13, 0.1, 0.09]), 0.011), plane([0, 0.04, 0], [0, 1, 0])), symX(I(0.003, ellipsoid([0.09, 0.03, -0.01], [0.06, 0.075, 0.02], rot.y(0.7)), plane([0, -0.03, 0], [0, -1, 0]))));
  add({ name: 'pelvis', mat: 'bone', bone: 'root', rigid: true, k: 0.005, sdf: Sub(0.004, pel, symX(sphere([0.06, -0.06, 0.08], 0.035))) });

  // ---------------------------------------------------------------- arms and hands
  for (const [s, sb, eb, wb, L] of [[1, 3, 4, 5, 'l'], [-1, 6, 7, 8, 'r']]) {
    const sp = WP[sb], ep = WP[eb], wp = WP[wb];
    add({ name: L + 'hum', mat: 'bone', bone: N(sb), k: 0.004, sdf: longBone(sp, ep, 0.016) });
    const side = ap(WR[eb], [0.012, 0, 0]);
    add({ name: L + 'rad', mat: 'bone', bone: N(eb), k: 0.004, sdf: U(0.006, cone(v3.add(ep, side), v3.add(wp, side), 0.01, 0.009), cone(v3.sub(ep, side), v3.sub(wp, side), 0.011, 0.008), sphere(ep, 0.02)) });
    const fingers = [sphere(at(wb, [0, -0.02, 0.008]), 0.02)];
    for (let f = 0; f < 4; f++) { const fx = (f - 1.5) * 0.011;
      fingers.push(tube([at(wb, [fx, -0.03, 0.01]), at(wb, [fx, -0.075, 0.016]), at(wb, [fx, -0.1, 0.035]), at(wb, [fx, -0.105, 0.055])], () => 0.0055)); }
    fingers.push(tube([at(wb, [s * -0.0, -0.03, 0.02]), at(wb, [s * 0.004, -0.05, 0.045]), at(wb, [s * 0.006, -0.06, 0.06])], () => 0.006));
    add({ name: L + 'hand', mat: 'bone', bone: N(wb), rigid: true, k: 0.003, sdf: U(0.003, ...fingers) });
  }
  // ---------------------------------------------------------------- legs and feet
  for (const [hb, kb, fb, L] of [[9, 10, 11, 'l'], [12, 13, 14, 'r']]) {
    const hp = WP[hb], kp = WP[kb], ap2 = WP[fb];
    add({ name: L + 'fem', mat: 'bone', bone: N(hb), k: 0.004, sdf: longBone(v3.add(hp, [0, 0.01, 0]), kp, 0.02) });
    add({ name: L + 'patella', mat: 'bone', bone: N(kb), rigid: true, k: 0.003, sdf: ellipsoid(v3.add(kp, [0, 0.0, 0.03]), [0.022, 0.026, 0.012]) });
    add({ name: L + 'tib', mat: 'bone', bone: N(kb), k: 0.004, sdf: U(0.006, longBone(kp, ap2, 0.016), cone(v3.add(kp, [0.022, -0.03, -0.01]), v3.add(ap2, [0.02, 0.02, -0.01]), 0.008, 0.007)) });
    const toes = [ellipsoid(v3.add(ap2, [0, -0.035, -0.01]), [0.025, 0.025, 0.03])];
    for (let t = 0; t < 5; t++) { const tx = (t - 2) * 0.012; toes.push(tube([v3.add(ap2, [tx * 0.6, -0.04, 0.0]), v3.add(ap2, [tx, -0.055, 0.07]), v3.add(ap2, [tx * 1.1, -0.06, 0.11])], () => 0.006)); }
    add({ name: L + 'foot', mat: 'bone', bone: N(fb), rigid: true, k: 0.004, sdf: U(0.005, ...toes) });
  }

  // ---------------------------------------------------------------- torn loincloth, rusted belt, rusted sword
  const loin = I(0.004, shell(disp(cone([0, 0.04, 0], [0, -0.3, 0.02], 0.14, 0.17), (x, y, z) => 0.012 * fbm(x * 18, y * 4, z * 18, 2), 0.014), 0.006),
    I(0, plane([0, 0.035, 0], [0, 1, 0]), { d: (x, y, z) => -0.28 - 0.09 * Math.abs(noise(x * 22, 3, z * 22)) - 0.05 * Math.sin(Math.atan2(x, z) * 7) - y, bb: [-2, -2, -2, 2, 2, 2] }));
  add({ name: 'loin', mat: 'c1', tau: 0.03, k: 0.004, sdf: loin, boneFn: (x, y) => { const d = Math.max(0, Math.min(1, -y / 0.28)), t = Math.max(0, Math.min(1, (x + 0.08) / 0.16)); return [['root', 1 - d * 0.65], ['lHip', d * 0.65 * t], ['rHip', d * 0.65 * (1 - t)]]; } });
  add({ name: 'belt', mat: 'rust', bone: 'root', rigid: true, k: 0.003, sdf: I(0.003, shell(ellipsoid([0, 0.03, 0], [0.142, 0.1, 0.105]), 0.006), plane([0, 0.055, 0], [0, 1, 0]), plane([0, 0.015, 0], [0, -1, 0])) });
  const R = 8, rough = (a, amp) => disp(a, (x, y, z) => amp * fbm(x * 70, y * 70, z * 70, 2), amp * 1.3);
  add({ name: 'grip', mat: 'leather', bone: 'rWr', rigid: true, k: 0.003, sdf: cone(at(R, [0, -0.07, -0.08]), at(R, [0, -0.07, 0.11]), 0.014, 0.013) });
  add({ name: 'pommel', mat: 'rust', bone: 'rWr', rigid: true, k: 0.003, sdf: sphere(at(R, [0, -0.07, -0.1]), 0.022) });
  add({ name: 'guard', mat: 'rust', bone: 'rWr', rigid: true, k: 0.003, sdf: box(at(R, [0, -0.07, 0.125]), [0.012, 0.085, 0.014], WR[R], 0.005) });
  // notched, tapering blade (flat in the hand's x)
  const bl0 = at(R, [0, -0.07, 0.14]), bl1 = at(R, [0, -0.07, 0.92]), dir = v3.norm(v3.sub(bl1, bl0)), mid = v3.lerp(bl0, bl1, 0.5);
  const blade = I(0.002, box(mid, [0.006, 0.032, 0.4], WR[R], 0.002), { d: (x, y, z) => { const q = v3.sub([x, y, z], bl0), u = v3.dot(q, dir) / 0.78, side = Math.abs(v3.dot(q, ap(WR[R], [0, 1, 0]))); return side - 0.032 * Math.min(1, (1.02 - u) * 3.2); }, bb: [-3, -3, -3, 3, 3, 3] });
  const notches = [0.3, 0.55, 0.7].map((u, i) => sphere(v3.add(v3.lerp(bl0, bl1, u), ap(WR[R], [0, (i % 2 ? 1 : -1) * 0.034, 0])), 0.011));
  add({ name: 'blade', mat: 'rust', bone: 'rWr', rigid: true, k: 0.002, sdf: Sub(0.002, rough(blade, 0.0015), ...notches) });

  return {
    name: 'skeleton', uv: null, voxel: 0.0042, tris: 9000, err: 0.0015, bones: BONES, parts: P, decals: [],
    mats: mats({ skin: [0.8, 0.75, 0.62], c1: [0.3, 0.12, 0.1], c2: [0.2, 0.18, 0.16], hair: [0.1, 0.1, 0.1], extra: {
      bone: { col: [0.84, 0.79, 0.66], col2: [0.62, 0.56, 0.44], freq2: 14, var: 0.16, freq: 55, gloss: 0.28, dirt: 0.75 },
      rust: { col: [0.44, 0.27, 0.15], col2: [0.36, 0.36, 0.38], freq2: 22, var: 0.3, freq: 60, gloss: 0.45, metal: 1, wear: 0.45, edge: [0.62, 0.58, 0.54], dirt: 0.5 },
      soul: { col: [0.45, 0.95, 1.5], em: 1 } } }),
  };
};
