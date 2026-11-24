// shared helpers for Kael's armour-set overlays (heroWolf / heroBone / heroAsh): extra pieces worn over the base
// Kara Plaka mesh (hero.mjs), skinned to the same skeleton so the game just draws them on top when that set is equipped.
import { mirrorX, plane, I } from '../sdf.mjs';
export function setup(ALL) {
  const SK = ALL.hero, B = {}; SK.bones.forEach((b) => { B[b.n] = b.r; });
  const P = [], L = (p) => { p.side = 1; P.push(p); return p; }, C = (p) => { P.push(p); return p; };
  const slab = (y0, y1) => I(0, plane([0, y1, 0], [0, 1, 0]), plane([0, y0, 0], [0, -1, 0]));
  const zcut = (z0, dir) => plane([0, 0, z0], [0, 0, dir]), xcut = (x0, dir) => plane([x0, 0, 0], [dir, 0, 0]);
  const pFn = () => [['leftUpperArm', 0.62], ['leftShoulder', 0.38]];
  return { SK, B, P, L, C, slab, zcut, xcut, pFn, bones: SK.bones.map((b) => b.n) };
}
export function mirror(P) {
  const swap = (n) => n.startsWith('left') ? 'right' + n.slice(4) : n.startsWith('right') ? 'left' + n.slice(5) : n;
  for (const p of P.slice()) if (p.side) P.push({ ...p, side: 0, name: p.name + 'R', sdf: mirrorX(p.sdf), bone: p.bone && swap(p.bone), boneFn: p.boneFn && ((x, y, z) => p.boneFn(-x, y, z).map(([b, w]) => [swap(b), w])) });
  return P;
}
// cape-like weights for anything hanging down the back
export const backFn = (y0, y1) => (x, y) => { const t = (y0 - y) / (y0 - y1); if (y > y0 - 0.06) return [['UpperChest', 1]]; return [['CapeA', Math.max(0, 1 - t * 2.2) + 1e-3], ['CapeB', Math.max(0, 1 - Math.abs(t - 0.5) * 2.2)], ['CapeC', Math.max(0, t * 2.2 - 1.2)]]; };
