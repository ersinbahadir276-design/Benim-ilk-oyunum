// Grey forest wolf: deep chest, tucked belly, heavy neck ruff, long muzzle, pointed ears, bushy tail.
// One mesh on 12 bones (body, head, jaw, tail, 4 upper + 4 lower legs); bind pose = the game's standing pose
// (all rotations zero; positions from drawWolves: head (0,.3,.76), jaw +(0,-.055,.1), tail (0,.1,-.62), hips WHIP, knees -W_UP).
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, mirrorX, symX, fbm, noise } from '../sdf.mjs';

export default function wolf(ALL) {
  const { WHIP, W_UP, W_LO } = ALL.wolf;
  const bones = ['body', 'head', 'jaw', 'tail', 'leg0', 'leg1', 'leg2', 'leg3', 'low0', 'low1', 'low2', 'low3'];
  const HD = [0, 0.3, 0.76], JW = v3.add(HD, [0, -0.055, 0.1]), TL = [0, 0.1, -0.62];
  const P = [];
  const furD = (a, amp = 0.005, fz = 7) => disp(a, (x, y, z) => amp * fbm(x * 22, y * 22, z * fz, 2), amp * 1.2);
  // body: chest, ribs, tucked waist, haunches
  const body = U(0.07, ellipsoid([0, 0.03, 0.34], [0.165, 0.21, 0.2]), ellipsoid([0, 0.04, 0.12], [0.165, 0.2, 0.28]), ellipsoid([0, 0.05, -0.2], [0.125, 0.15, 0.26]), ellipsoid([0, 0.05, -0.43], [0.14, 0.16, 0.17]));
  P.push({ name: 'body', mat: 'fur', bone: 'body', tau: 0.06, sdf: furD(body) });
  // neck with a heavy ruff
  P.push({ name: 'neck', mat: 'fur', tau: 0.05, k: 0.06, sdf: furD(U(0.05, cone([0, 0.08, 0.42], [0, 0.27, 0.7], 0.155, 0.11), ellipsoid([0, 0.13, 0.55], [0.17, 0.17, 0.16])), 0.01, 10),
    boneFn: (x, y, z) => { const t = Math.max(0, Math.min(1, (z - 0.5) / 0.22)); return [['head', t * t], ['body', 1 - t * t]]; } });
  // head: skull, cheek ruff, muzzle, nose, brow, ears
  const H = (p) => v3.add(HD, p);
  const skull = U(0.04, ellipsoid(H([0, 0.02, 0.05]), [0.105, 0.1, 0.125]), symX(ellipsoid(H([0.07, -0.025, 0.05]), [0.06, 0.07, 0.08])));
  const muzzle = U(0.03, I(0.02, cone(H([0, -0.005, 0.12]), H([0, -0.03, 0.33]), 0.072, 0.04), plane(H([0, -0.085, 0]), [0, -1, 0])), ellipsoid(H([0, 0.03, 0.15]), [0.06, 0.04, 0.08]));
  const ears = symX(Sub(0.004, I(0.006, cone(H([0.062, 0.08, 0.0]), H([0.09, 0.22, -0.025]), 0.046, 0.006), plane(H([0, 0, 0.028]), [0, 0, 1]), plane(H([0, 0, -0.045]), [0, 0, -1])), ellipsoid(H([0.068, 0.14, 0.022]), [0.022, 0.06, 0.012])));
  const sockets = symX(ellipsoid(H([0.058, 0.04, 0.15]), [0.03, 0.016, 0.02], rot.z(-0.3)));
  P.push({ name: 'head', mat: 'fur', bone: 'head', rigid: true, k: 0.02, sdf: Sub(0.006, furD(U(0.025, skull, muzzle, ears), 0.003, 14), sockets) });
  P.push({ name: 'eyes', mat: 'eye', bone: 'head', rigid: true, k: 0.002, sdf: symX(ellipsoid(H([0.056, 0.04, 0.143]), [0.022, 0.012, 0.014], rot.z(-0.3))) });
  P.push({ name: 'nose', mat: 'nose', bone: 'head', rigid: true, k: 0.01, sdf: ellipsoid(H([0, -0.012, 0.345]), [0.03, 0.022, 0.026]) });
  P.push({ name: 'ruff', mat: 'fur', bone: 'head', tau: 0.03, k: 0.04, sdf: furD(symX(ellipsoid(H([0.08, -0.05, 0.0]), [0.06, 0.08, 0.07])), 0.009, 12) });
  // jaw with teeth
  const J = (p) => v3.add(JW, p);
  P.push({ name: 'jaw', mat: 'furL', bone: 'jaw', rigid: true, k: 0.012, sdf: I(0.01, cone(J([0, 0.0, -0.03]), J([0, -0.008, 0.215]), 0.05, 0.028), plane(J([0, 0.018, 0]), [0, 1, 0])) });
  P.push({ name: 'teeth', mat: 'tooth', bone: 'jaw', rigid: true, k: 0.002, sdf: U(0, symX(horn([J([0.022, 0.012, 0.19]), J([0.022, 0.04, 0.195])], 0.009)), symX(horn([J([0.03, 0.012, 0.13]), J([0.03, 0.03, 0.135])], 0.007))) });
  P.push({ name: 'fangsUp', mat: 'tooth', bone: 'head', rigid: true, k: 0.002, sdf: symX(horn([H([0.026, -0.07, 0.29]), H([0.026, -0.105, 0.295])], 0.009)) });
  // tail
  const T = (p) => v3.add(TL, p);
  P.push({ name: 'tail', mat: 'fur', bone: 'tail', tau: 0.04, k: 0.04, sdf: furD(tube([T([0, 0.02, 0.06]), T([0, -0.03, -0.18]), T([0, -0.09, -0.36]), T([0, -0.15, -0.52])], (t) => 0.035 + 0.055 * Math.sin(Math.PI * (0.18 + 0.75 * t)), 0.03), 0.008, 12) });
  // legs
  WHIP.forEach((hp, l) => { const front = l < 2, s = Math.sign(hp[0]), top = [hp[0], hp[1], hp[2]], knee = v3.add(top, [0, -W_UP, 0]), paw = v3.add(knee, [0, -W_LO, 0]);
    const thigh = front ? U(0.04, ellipsoid(v3.add(top, [s * 0.01, 0.04, 0.0]), [0.06, 0.13, 0.085]), cone(v3.add(top, [0, -0.02, 0]), knee, 0.065, 0.042))
      : U(0.04, ellipsoid(v3.add(top, [s * 0.005, 0.03, -0.01]), [0.075, 0.15, 0.11]), cone(v3.add(top, [0, -0.04, -0.03]), v3.add(knee, [0, 0, -0.02]), 0.07, 0.04));
    P.push({ name: 'up' + l, mat: 'fur', tau: 0.04, k: 0.045, sdf: furD(thigh, 0.004), boneFn: (x, y) => { const t = Math.max(0, Math.min(1, (top[1] + 0.06 - y) / 0.14)); return [['leg' + l, t], ['body', 1 - t]]; } });
    P.push({ name: 'lo' + l, mat: 'furL', bone: 'low' + l, tau: 0.02, k: 0.02, sdf: furD(cone(knee, v3.add(paw, [0, 0.03, 0]), 0.04, 0.028), 0.002) });
    P.push({ name: 'paw' + l, mat: 'furD', bone: 'low' + l, rigid: true, k: 0.02, sdf: U(0.012, ellipsoid(v3.add(paw, [0, 0.01, 0.03]), [0.042, 0.028, 0.06]), ...[-1, 0, 1].map((i) => sphere(v3.add(paw, [i * 0.022, 0.0, 0.075 - Math.abs(i) * 0.012]), 0.018))) });
    P.push({ name: 'claws' + l, mat: 'claw', bone: 'low' + l, rigid: true, k: 0.002, sdf: U(0, ...[-1, 0, 1].map((i) => horn([v3.add(paw, [i * 0.022, -0.005, 0.085 - Math.abs(i) * 0.012]), v3.add(paw, [i * 0.024, -0.02, 0.11 - Math.abs(i) * 0.012])], 0.008))) });
  });
  return {
    name: 'wolf', voxel: 0.0058, tris: 7000, err: 0.0018, bones, parts: P,
    decals: [
      { mat: 'furL', sdf: U(0.05, ellipsoid([0, -0.17, 0.15], [0.16, 0.12, 0.42]), ellipsoid([0, 0.0, 0.5], [0.13, 0.12, 0.13]), ellipsoid(H([0, -0.06, 0.2]), [0.06, 0.035, 0.15]), symX(ellipsoid(H([0.07, -0.04, 0.08]), [0.05, 0.04, 0.06]))), on: ['fur'] },
      { mat: 'furD', sdf: U(0.05, ellipsoid([0, 0.22, -0.05], [0.1, 0.07, 0.55]), ellipsoid(H([0, 0.1, 0.0]), [0.08, 0.05, 0.12]), cone(T([0, -0.05, -0.3]), T([0, -0.16, -0.6]), 0.06, 0.07)), on: ['fur'] },
      { mat: 'nose', sdf: symX(ellipsoid(H([0.05, 0.03, 0.155]), [0.03, 0.022, 0.02], rot.z(-0.3))), on: ['fur'] },
    ],
    mats: {
      fur: { col: [0.48, 0.49, 0.52], col2: [0.36, 0.36, 0.38], freq2: 9, var: 0.2, freq: 50, gloss: 0.06, dirt: 0.55 },
      furL: { col: [0.78, 0.76, 0.7], col2: [0.62, 0.6, 0.55], freq2: 9, var: 0.15, freq: 50, gloss: 0.05, dirt: 0.45 },
      furD: { col: [0.26, 0.26, 0.28], col2: [0.18, 0.18, 0.2], freq2: 9, var: 0.2, freq: 50, gloss: 0.06, dirt: 0.5 },
      nose: { col: [0.06, 0.05, 0.06], gloss: 0.7 }, tooth: { col: [0.95, 0.92, 0.82], gloss: 0.5 }, claw: { col: [0.15, 0.13, 0.12], gloss: 0.4 },
      eye: { col: [1.5, 1.05, 0.25], gloss: 0.8, em: 0.45 },
    },
  };
}
