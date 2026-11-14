// Signed-distance "clay" for sculpting game characters offline.
// Every node has d(x,y,z) -> signed distance (negative inside) and bb = [x0,y0,z0,x1,y1,z1].
// Shapes blend with smooth unions, so joints and plates read like a sculpt, not like glued cylinders.

export const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  len: (a) => Math.hypot(a[0], a[1], a[2]), norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t],
};
const INF = 1e9;
const bbOf = (pts, pad) => { const b = [INF, INF, INF, -INF, -INF, -INF]; for (const p of pts) for (let i = 0; i < 3; i++) { b[i] = Math.min(b[i], p[i] - pad); b[i + 3] = Math.max(b[i + 3], p[i] + pad); } return b; };
const bbPad = (b, p) => [b[0] - p, b[1] - p, b[2] - p, b[3] + p, b[4] + p, b[5] + p];
const bbU = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[3], b[3]), Math.max(a[4], b[4]), Math.max(a[5], b[5])];
const bbI = (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2]), Math.min(a[3], b[3]), Math.min(a[4], b[4]), Math.min(a[5], b[5])];
export { bbPad, bbU };

// rotation helpers: 3x3 row-major; frame(axisY) builds a frame whose local +y points along a direction
export const rot = {
  x: (a) => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; },
  y: (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; },
  z: (a) => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; },
  mul: (a, b) => { const o = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]); return o; },
  eul: (x, y, z) => rot.mul(rot.y(y || 0), rot.mul(rot.x(x || 0), rot.z(z || 0))),
  frameY: (dir, hint = [0, 0, 1]) => { const Y = v3.norm(dir); let X = v3.cross(Y, hint); if (v3.len(X) < 1e-4) X = v3.cross(Y, [1, 0, 0]); X = v3.norm(X); const Z = v3.cross(X, Y); return [X[0], Y[0], Z[0], X[1], Y[1], Z[1], X[2], Y[2], Z[2]]; },
};
const apT = (m, x, y, z) => [m[0] * x + m[3] * y + m[6] * z, m[1] * x + m[4] * y + m[7] * z, m[2] * x + m[5] * y + m[8] * z]; // transpose (world->local)
const ap = (m, v) => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];

// ---------------- primitives
export function sphere(c, r) { return { d: (x, y, z) => Math.hypot(x - c[0], y - c[1], z - c[2]) - r, bb: bbOf([c], r) }; }
// capsule with different end radii (iq round cone, exact)
export function cone(a, b, r1, r2 = r1) {
  const ba = v3.sub(b, a), l2 = v3.dot(ba, ba), rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
  return { d: (x, y, z) => { const px = x - a[0], py = y - a[1], pz = z - a[2], yy = px * ba[0] + py * ba[1] + pz * ba[2], zz = yy - l2;
    const qx = px * l2 - ba[0] * yy, qy = py * l2 - ba[1] * yy, qz = pz * l2 - ba[2] * yy, x2 = qx * qx + qy * qy + qz * qz, y2 = yy * yy * l2, z2 = zz * zz * l2, k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2; if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1; return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1; },
    bb: bbU(bbOf([a], r1), bbOf([b], r2)) };
}
// smooth spline tube through points with radius function r(t)
export function tube(pts, rf, k = 0.01) { const parts = []; const n = pts.length - 1; for (let i = 0; i < n; i++) parts.push(cone(pts[i], pts[i + 1], rf(i / n), rf((i + 1) / n))); return U(k, ...parts); }
export function ellipsoid(c, r, R) {
  return { d: (x, y, z) => { let px = x - c[0], py = y - c[1], pz = z - c[2]; if (R) [px, py, pz] = apT(R, px, py, pz);
      const ax = px / r[0], ay = py / r[1], az = pz / r[2], k0 = Math.hypot(ax, ay, az), k1 = Math.hypot(ax / r[0], ay / r[1], az / r[2]); return k1 < 1e-9 ? -Math.min(r[0], r[1], r[2]) : k0 * (k0 - 1) / k1; },
    bb: bbOf([c], Math.max(r[0], r[1], r[2])) };
}
export function box(c, h, R, rad = 0) {
  return { d: (x, y, z) => { let px = x - c[0], py = y - c[1], pz = z - c[2]; if (R) [px, py, pz] = apT(R, px, py, pz);
      const qx = Math.abs(px) - h[0] + rad, qy = Math.abs(py) - h[1] + rad, qz = Math.abs(pz) - h[2] + rad;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - rad; },
    bb: bbOf([c], Math.hypot(h[0], h[1], h[2])) };
}
export function torus(c, R0, r, R) {
  return { d: (x, y, z) => { let px = x - c[0], py = y - c[1], pz = z - c[2]; if (R) [px, py, pz] = apT(R, px, py, pz); return Math.hypot(Math.hypot(px, pz) - R0, py) - r; }, bb: bbOf([c], R0 + r) };
}
// half space: points with dot(p-c, n) > 0 are outside
export function plane(c, n) { const N = v3.norm(n); return { d: (x, y, z) => (x - c[0]) * N[0] + (y - c[1]) * N[1] + (z - c[2]) * N[2], bb: [-INF, -INF, -INF, INF, INF, INF] }; }
// a cone point (horn / spike / claw): curved tube that tapers to a tip
export function horn(pts, r0, sharp = 0.003) { return tube(pts, (t) => Math.max(sharp, r0 * Math.pow(1 - t, 0.9)), 0.004); }

// ---------------- operators
const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const smax = (a, b, k) => -smin(-a, -b, k);
export function U(k, ...c) { c = c.filter(Boolean); let bb = c[0].bb; for (const n of c) bb = bbU(bb, n.bb); return { d: (x, y, z) => { let d = c[0].d(x, y, z); for (let i = 1; i < c.length; i++) d = smin(d, c[i].d(x, y, z), k); return d; }, bb: bbPad(bb, k * 0.25) }; }
export function Sub(k, a, ...b) { return { d: (x, y, z) => { let d = a.d(x, y, z); for (const n of b) d = smax(d, -n.d(x, y, z), k); return d; }, bb: a.bb }; }
export function I(k, a, ...b) { let bb = a.bb; for (const n of b) bb = bbI(bb, n.bb); return { d: (x, y, z) => { let d = a.d(x, y, z); for (const n of b) d = smax(d, n.d(x, y, z), k); return d; }, bb }; }
export function shell(a, t, off = 0) { return { d: (x, y, z) => Math.abs(a.d(x, y, z) - off) - t, bb: bbPad(a.bb, off + t) }; }
export function grow(a, r) { return { d: (x, y, z) => a.d(x, y, z) - r, bb: bbPad(a.bb, Math.max(r, 0)) }; }
export function disp(a, f, amp) { return { d: (x, y, z) => a.d(x, y, z) - f(x, y, z), bb: bbPad(a.bb, amp) }; }
export function mirrorX(a) { return { d: (x, y, z) => a.d(-x, y, z), bb: [-a.bb[3], a.bb[1], a.bb[2], -a.bb[0], a.bb[4], a.bb[5]] }; }
// both sides at once (symmetric detail on one bone, e.g. helmet)
export function symX(a) { return { d: (x, y, z) => a.d(Math.abs(x), y, z), bb: bbU(a.bb, [-a.bb[3], a.bb[1], a.bb[2], -a.bb[0], a.bb[4], a.bb[5]]) }; }
export function move(a, t, R) { // rigidly move a node (R about origin, then translate)
  const cs = []; const b = a.bb; for (const x of [b[0], b[3]]) for (const y of [b[1], b[4]]) for (const z of [b[2], b[5]]) cs.push(v3.add(R ? ap(R, [x, y, z]) : [x, y, z], t));
  return { d: (x, y, z) => { let px = x - t[0], py = y - t[1], pz = z - t[2]; if (R) [px, py, pz] = apT(R, px, py, pz); return a.d(px, py, pz); }, bb: bbOf(cs, 0) };
}
// repeat along a polyline: n copies of node f(i,t,p) (rivets, spikes, fur tufts)
export function along(pts, n, f, k = 0) { const out = []; const L = []; let tot = 0; for (let i = 0; i < pts.length - 1; i++) { const l = v3.len(v3.sub(pts[i + 1], pts[i])); L.push(l); tot += l; }
  for (let i = 0; i < n; i++) { let s = (n === 1 ? 0.5 : i / (n - 1)) * tot, j = 0; while (j < L.length - 1 && s > L[j]) { s -= L[j]; j++; } const p = v3.lerp(pts[j], pts[j + 1], Math.min(1, s / L[j])); out.push(f(i, i / Math.max(1, n - 1), p)); }
  return U(k, ...out); }

// ---------------- value noise for organic detail (fur, cloth, hammered metal)
const hash = (x, y, z) => { let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
export function noise(x, y, z) { const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi, s = (t) => t * t * (3 - 2 * t), u = s(xf), v = s(yf), w = s(zf);
  const l = (a, b, t) => a + (b - a) * t; const c = (i, j, k) => hash(xi + i, yi + j, zi + k);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v), l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w) * 2 - 1; }
export const fbm = (x, y, z, o = 3) => { let a = 0, f = 1, s = 0.5; for (let i = 0; i < o; i++) { a += noise(x * f, y * f, z * f) * s; f *= 2.03; s *= 0.5; } return a; };
