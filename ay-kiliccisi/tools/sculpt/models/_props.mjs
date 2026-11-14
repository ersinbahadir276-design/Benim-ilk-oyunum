// hand-held props and role accessories for the humanoid sculpts (placed in bone frames via ctx.at)
import { v3, rot, sphere, cone, tube, ellipsoid, box, plane, horn, U, Sub, I, shell, grow, disp, symX, fbm, noise } from '../sdf.mjs';
const R = 8; // right hand bone
export const spear = (c) => { c.add({ name: 'spearShaft', mat: 'wood', bone: 'rWr', rigid: true, k: 0.003, sdf: cone(c.at(R, [0, -0.06, -0.9]), c.at(R, [0, -0.06, 1.33]), 0.018, 0.016) });
  c.add({ name: 'spearHead', mat: 'steel', bone: 'rWr', rigid: true, k: 0.004, sdf: U(0.004, I(0.003, ellipsoid(c.at(R, [0, -0.06, 1.46]), [0.045, 0.012, 0.15]), plane(c.at(R, [0, -0.06, 1.33]), [0, 0, -1])), cone(c.at(R, [0, -0.06, 1.3]), c.at(R, [0, -0.06, 1.36]), 0.024, 0.02)) }); };
export const staff = (c) => { c.add({ name: 'staff', mat: 'wood', bone: 'rWr', rigid: true, k: 0.004, sdf: U(0.02, disp(tube([c.at(R, [0, -0.06, -0.9]), c.at(R, [0.01, -0.06, 0.2]), c.at(R, [-0.01, -0.06, 0.75])], () => 0.02), (x, y, z) => 0.004 * noise(x * 40, y * 40, z * 40), 0.005),
  disp(sphere(c.at(R, [0, -0.08, 0.86]), 0.055), (x, y, z) => 0.01 * fbm(x * 30, y * 30, z * 30, 2), 0.012)) });
  c.add({ name: 'staffGem', mat: 'gem', bone: 'rWr', rigid: true, k: 0.003, sdf: sphere(c.at(R, [0, -0.08, 0.9]), 0.03) }); };
export const hammer = (c) => { c.add({ name: 'hammerHandle', mat: 'wood', bone: 'rWr', rigid: true, k: 0.003, sdf: cone(c.at(R, [0, -0.06, -0.1]), c.at(R, [0, -0.06, 0.45]), 0.018, 0.016) });
  c.add({ name: 'hammerHead', mat: 'steel', bone: 'rWr', rigid: true, k: 0.004, sdf: box(c.at(R, [0, -0.06, 0.46]), [0.1, 0.045, 0.045], c.WR[R], 0.012) }); };
export const dagger = (c) => { c.add({ name: 'daggerGrip', mat: 'leather', bone: 'rWr', rigid: true, k: 0.003, sdf: cone(c.at(R, [0, -0.05, -0.06]), c.at(R, [0, -0.05, 0.06]), 0.017, 0.015) });
  c.add({ name: 'daggerBlade', mat: 'steel', bone: 'rWr', rigid: true, k: 0.003, sdf: U(0.003, I(0.002, ellipsoid(c.at(R, [0, -0.05, 0.22]), [0.03, 0.008, 0.17]), plane(c.at(R, [0, -0.05, 0.07]), [0, 0, -1])), box(c.at(R, [0, -0.05, 0.065]), [0.045, 0.012, 0.01], c.WR[R], 0.004)) }); };
export const club = (c) => { const pts = [-0.25, 0.5, 1.3, 1.75].map((z) => c.at(R, [0, -0.08, z]));
  c.add({ name: 'club', mat: 'wood', bone: 'rWr', rigid: true, k: 0.01, sdf: disp(tube(pts, (t) => 0.05 + 0.12 * t * t, 0.03), (x, y, z) => 0.012 * fbm(x * 18, y * 18, z * 18, 2), 0.015) });
  const sp = []; for (let i = 0; i < 9; i++) { const a = i * 2.4, z = 1.05 + i * 0.075, r = 0.06 + 0.12 * Math.pow((z + 0.25) / 2, 2); sp.push(horn([c.at(R, [Math.cos(a) * r * 0.8, -0.08 + Math.sin(a) * r * 0.8, z]), c.at(R, [Math.cos(a) * (r + 0.1), -0.08 + Math.sin(a) * (r + 0.1), z + 0.03])], 0.022)); }
  c.add({ name: 'clubSpikes', mat: 'steel', bone: 'rWr', rigid: true, k: 0.006, sdf: U(0, ...sp) }); };
export const bowBack = (c) => { const y = c.T, ch = c.chestR;
  c.add({ name: 'bow', mat: 'wood', bone: 'spine', rigid: true, k: 0.004, sdf: tube([[0.2, 0.06 + y * 1.05, -ch[2] - 0.06], [0.03, 0.06 + y * 0.5, -ch[2] - 0.1], [-0.17, 0.06 - y * 0.05, -ch[2] - 0.06]], (t) => 0.012 + 0.006 * Math.sin(Math.PI * t)) });
  c.add({ name: 'quiver', mat: 'leather', bone: 'spine', rigid: true, k: 0.01, sdf: U(0.01, cone([-0.08, 0.06 + y * 0.95, -ch[2] - 0.04], [0.05, 0.06 + y * 0.25, -ch[2] - 0.05], 0.045, 0.04), ...[0, 1, 2].map((i) => cone([-0.08 + i * 0.02, 0.06 + y * 0.95, -ch[2] - 0.04], [-0.1 + i * 0.02, 0.06 + y * 1.12, -ch[2] - 0.03], 0.008, 0.008))) }); };
export const hood = (c, cape) => { const H = c.H, hr = c.hr;
  c.add({ name: 'hood', mat: 'c1', bone: 'head', rigid: true, k: 0.01, sdf: Sub(0.01, disp(grow(ellipsoid(H([0, hr * 0.08, -hr * 0.08]), [hr * 1.02, hr * 1.12, hr * 1.1]), hr * 0.12), (x, y, z) => 0.005 * fbm(x * 30, y * 30, z * 30, 2), 0.006),
    ellipsoid(H([0, -hr * 0.15, hr * 0.85]), [hr * 0.78, hr * 0.95, hr * 0.7]), plane(H([0, -hr * 0.75, 0]), [0, 1, 0])) });
  if (cape) c.add({ name: 'mantle', mat: 'c1', tau: 0.03, k: 0.01, sdf: I(0.006, shell(disp(cone(v3.add(c.headB, [0, -0.02, -0.01]), [0, 0.06 + c.T * 0.35, -0.01], 0.09, c.sh + 0.1), (x, y, z) => 0.008 * Math.sin(Math.atan2(x, z) * 8), 0.01), 0.008), plane([0, 0.06 + c.T * 0.4, 0], [0, -1, 0])),
    boneFn: (x) => [['spine', 0.7], [x > 0 ? 'lSh' : 'rSh', 0.3 * Math.min(1, Math.abs(x) / 0.2)]] }); };
export const apron = (c, mat) => c.add({ name: 'apron', mat: mat || 'leather', tau: 0.03, k: 0.006, sdf: I(0.005, shell(cone([0, 0.06 + c.T * 0.62, 0.0], [0, -0.55, 0.02], c.chestR[0] * 0.95, c.waistR[0] * 1.15), 0.007), plane([0, 0, -0.02], [0, 0, -1]), plane([0, 0.06 + c.T * 0.62, 0], [0, 1, 0]), plane([0, -0.55, 0], [0, -1, 0])),
  boneFn: (x, y) => { const d = Math.max(0, Math.min(1, -y / 0.45)), t = Math.max(0, Math.min(1, (x + 0.08) / 0.16)); return y > 0.05 ? [['spine', 1]] : [['root', 1 - d * 0.6], ['lHip', d * 0.6 * t], ['rHip', d * 0.6 * (1 - t)]]; } });
