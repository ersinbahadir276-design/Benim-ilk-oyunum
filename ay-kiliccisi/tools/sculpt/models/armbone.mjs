// «Kemik Zırh» overlay: a bone rib-cage strapped over the breastplate, horned beast skulls riding the pauldrons,
// bone spurs along the forearms, skull-cap knee guards and a fringe of bone slats over the thighs.
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, disp, noise } from '../sdf.mjs';
import { base, mirror } from './_armor.mjs';

export default function armbone(ALL) {
  const { B, bones, onto, hug, pFn } = base(ALL), P = [];
  const L = (p) => { p.side = 1; P.push(p); return p; }, C = (p) => { P.push(p); return p; };
  const pitted = (a, s = 1) => disp(a, (x, y, z) => s * 0.0018 * noise(x * 220, y * 220, z * 220), 0.002 * s);

  // ---- rib cage on the breastplate: sternum + four pairs of ribs that hug the plate, bound with a leather strap
  const front = [0, 0, -1];
  const stern = hug('cuirass', [[0, 1.6, 0.4], [0, 1.5, 0.4], [0, 1.4, 0.4], [0, 1.34, 0.4]], front, 0.012);
  C({ name: 'sternum', mat: 'bone', bone: 'UpperChest', rigid: true, k: 0.004, sdf: pitted(tube(stern, (t) => 0.019 - t * 0.006, 0.006)) });
  const ribs = [];
  for (let i = 0; i < 4; i++) { const y = 1.56 - i * 0.06, sag = 0.02 + i * 0.006;
    const pts = [0.012, 0.06, 0.11, 0.155, 0.19].map((x, j) => [x, y - sag * (j / 4) * (j / 4) * 2.2, 0.4]);
    // project towards the body axis so the outer end wraps round the flank
    ribs.push(tube(hug('cuirass', pts, (p) => [-p[0] * 0.9, 0, -1], 0.01), (t) => 0.011 - t * 0.004, 0.004)); }
  L({ name: 'ribs', mat: 'bone', bone: 'UpperChest', rigid: true, k: 0.004, sdf: pitted(U(0.004, ...ribs)) });
  C({ name: 'ribStrap', mat: 'strap', bone: 'UpperChest', rigid: true, k: 0.002, sdf: tube(hug('cuirass', [-0.2, -0.12, -0.05, 0, 0.05, 0.12, 0.2].map((x) => [x, 1.43, 0.4]), (p) => [-p[0] * 0.9, 0, -1], 0.008), () => 0.007, 0.004) });

  // ---- beast skull on each pauldron, snout to the outside, two horns curling back
  const sk = [0.3, 1.81, 0.0], sR = rot.z(-0.3);
  const cranium = ellipsoid(sk, [0.062, 0.052, 0.058], sR), snout = ellipsoid(v3.add(sk, [0.075, -0.03, 0]), [0.07, 0.03, 0.036], sR);
  const brow = ellipsoid(v3.add(sk, [0.03, 0.012, 0]), [0.03, 0.022, 0.06], sR);
  const sockets = U(0, sphere(v3.add(sk, [0.05, 0.0, 0.038]), 0.019), sphere(v3.add(sk, [0.05, 0.0, -0.038]), 0.019));
  const nose = ellipsoid(v3.add(sk, [0.13, -0.035, 0]), [0.012, 0.01, 0.014]);
  const skull = Sub(0.005, U(0.018, cranium, snout, brow), sockets, nose);
  L({ name: 'skull', mat: 'bone', boneFn: pFn, rigid: true, k: 0.006, sdf: pitted(skull, 1.5) });
  L({ name: 'teeth', mat: 'bone', boneFn: pFn, rigid: true, k: 0.001, sdf: U(0, ...[0.06, 0.085, 0.11].flatMap((dx) => [-1, 1].map((s) => { const o = v3.add(sk, [dx, -0.05 - dx * 0.25, s * 0.026]); return horn([o, v3.add(o, [0.004, -0.014, 0]), v3.add(o, [0.006, -0.024, 0])], 0.0055, 0.001); }))) });
  L({ name: 'skullHorns', mat: 'horn', boneFn: pFn, rigid: true, k: 0.004, sdf: U(0, ...[-1, 1].map((s) => { const o = v3.add(sk, [0.0, 0.04, s * 0.035]);
    return horn([o, v3.add(o, [-0.02, 0.05, s * 0.03]), v3.add(o, [-0.07, 0.08, s * 0.05]), v3.add(o, [-0.12, 0.06, s * 0.045]), v3.add(o, [-0.14, 0.02, s * 0.03])], 0.017, 0.002); })) });
  L({ name: 'skullDark', mat: 'cavity', boneFn: pFn, rigid: true, k: 0.002, sdf: I(0, U(0, sphere(v3.add(sk, [0.048, 0.0, 0.034]), 0.014), sphere(v3.add(sk, [0.048, 0.0, -0.034]), 0.014)), cranium) });

  // ---- bone spurs along the top of the forearm, pointing back at the elbow
  L({ name: 'spurs', mat: 'bone', bone: 'leftLowerArm', rigid: true, k: 0.004, sdf: pitted(U(0.006, ...[0.59, 0.64, 0.69].map((x, i) => { const o = [x, 1.712, 0]; const l = 0.07 - i * 0.012;
    return horn([o, [x - l * 0.4, 1.712 + l * 0.55, 0], [x - l, 1.712 + l * 0.75, 0]], 0.014, 0.0015); }))) });

  // ---- knee caps: a small skull plate over each poleyn
  const kn = B.leftLowerLeg, kc = v3.add(kn, [0, 0.005, 0.11]);
  L({ name: 'kneeSkull', mat: 'bone', boneFn: () => [['leftLowerLeg', 0.55], ['leftUpperLeg', 0.45]], rigid: true, k: 0.004,
    sdf: pitted(Sub(0.004, U(0.01, ellipsoid(kc, [0.046, 0.052, 0.022]), horn([v3.add(kc, [0, 0.03, 0.01]), v3.add(kc, [0, 0.06, 0.03]), v3.add(kc, [0, 0.075, 0.05])], 0.012)),
      sphere(v3.add(kc, [0.018, 0.008, 0.02]), 0.011), sphere(v3.add(kc, [-0.018, 0.008, 0.02]), 0.011))) });

  // ---- bone slats hanging from the belt over the front of the thighs
  const slats = [];
  for (let i = 0; i < 4; i++) { const x = 0.045 + i * 0.05, a = Math.atan2(x, 0.2), top = onto('belt', [x, 1.1, 0.4], [-x, 0, -0.4], 0.004), len = 0.15 + (i % 2) * 0.03;
    slats.push(box(v3.add(top, [Math.sin(a) * 0.01, -len / 2, Math.cos(a) * 0.012]), [0.014, len / 2, 0.005], rot.mul(rot.y(a), rot.x(-0.12)), 0.004)); }
  L({ name: 'slats', mat: 'bone', tau: 0.03, k: 0.003, sdf: pitted(U(0, ...slats)), boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (1.08 - y) / 0.15)); return [['Hips', 1 - t * 0.6], ['leftUpperLeg', t * 0.6]]; } });

  mirror(P);
  return {
    name: 'armbone', voxel: 0.005, tris: 6000, err: 0.004, bones, parts: P,
    mats: {
      bone: { col: [0.74, 0.69, 0.58], col2: [0.5, 0.44, 0.34], freq: 40, freq2: 14, var: 0.15, gloss: 0.32, dirt: 0.75, tint: 0 },
      horn: { col: [0.3, 0.26, 0.22], col2: [0.62, 0.57, 0.48], freq2: 9, var: 0.18, freq: 60, gloss: 0.45, dirt: 0.5, tint: 0 },
      cavity: { col: [0.05, 0.04, 0.035], gloss: 0.05, tint: 0 },
      strap: { col: [0.22, 0.14, 0.09], gloss: 0.25, var: 0.2, freq: 50, dirt: 0.5, tint: 0 },
    },
  };
}
