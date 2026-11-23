// Shared helpers for the hero's armour overlays (armwolf / armbone / armash).
// An overlay is a separate skinned mesh on Kael's skeleton that the game shows on top of the base plate when that
// armour is equipped, so each armour changes the silhouette, not only the tint. Pieces are placed by projecting
// onto the base armour's own surfaces (read from hero.mjs), so they sit on the plate instead of floating or sinking.
import { v3, mirrorX } from '../sdf.mjs';
import hero from './hero.mjs';

export function base(ALL) {
  const H = hero(ALL), parts = {}; for (const p of H.parts) parts[p.name] = p;
  const B = {}; ALL.hero.bones.forEach((b) => { B[b.n] = b.r; });
  // march from `from` along `dir` until the named base part's surface (+ lift outwards); returns the surface point
  const onto = (name, from, dir, lift = 0) => { const s = parts[name].sdf, d = v3.norm(dir); let p = from.slice();
    for (let i = 0; i < 200; i++) { const q = s.d(p[0], p[1], p[2]) - lift; if (q < 2e-4) return p; p = v3.add(p, v3.mul(d, Math.max(q, 5e-4))); }
    throw new Error('onto: missed ' + name + ' from ' + from); };
  // a polyline projected point by point (curves that hug the plate)
  const hug = (name, pts, dir, lift) => pts.map((p) => onto(name, p, typeof dir === 'function' ? dir(p) : dir, lift));
  return { H, parts, B, bones: H.bones, onto, hug, pFn: () => [['leftUpperArm', 0.62], ['leftShoulder', 0.38]] };
}

// side parts are written for the left (+x) side and mirrored, like hero.mjs
export function mirror(P) {
  const swap = (n) => n.startsWith('left') ? 'right' + n.slice(4) : n.startsWith('right') ? 'left' + n.slice(5) : n;
  for (const p of P.slice()) if (p.side) P.push({ ...p, side: 0, name: p.name + 'R', sdf: mirrorX(p.sdf), bone: p.bone && swap(p.bone), boneFn: p.boneFn && ((x, y, z) => p.boneFn(-x, y, z).map(([b, w]) => [swap(b), w])) });
  return P;
}
