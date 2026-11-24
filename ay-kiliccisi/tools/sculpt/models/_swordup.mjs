// Shared geometry for the greatsword's forge-upgrade ornaments (swup3 / swup5).
// Same canonical frame as sword.mjs: blade along +z (z0 = 0.15 … 1.5), width along y, thickness along x.
// The game stretches z > 0.15 by the item's blade length and y by its width, exactly like the base sword.
export const Z0 = 0.15, BL = 1.5, W = 0.068;
export const tOf = (z) => Math.max(0, Math.min(1, (z - Z0) / (BL - Z0)));
// half-thickness of the blade at (y, z) — copied from sword.mjs so inlays land on the flat
export const faceX = (y, z) => { const t = tOf(z), w = W * (t < 0.86 ? 1 - t * 0.18 : (1 - t) / 0.14 * 0.84);
  return 0.016 * (1 - t * 0.4) * (1 - Math.abs(y) / Math.max(w, 1e-4) * 0.7); };
// a point on the +x flat of the blade, sunk `sink` metres into it
export const onFace = (y, z, sink = 0.0008) => [faceX(y, z) - sink, y, z];
// rune strokes in fuller-local units: u across (-1…1 → ±0.0085 m), v along (0…1 → rune height). Eight glyphs,
// each a stave with branches, so a row reads as an engraved inscription rather than random dashes.
const GLYPHS = [
  [[[0, 0], [0, 1]], [[0, 0.75], [0.8, 1]], [[0, 0.45], [0.8, 0.7]]],
  [[[0, 0], [0, 1]], [[-0.8, 0.8], [0, 0.5]], [[0, 0.5], [0.8, 0.2]]],
  [[[-0.6, 0], [-0.6, 1]], [[0.6, 0], [0.6, 1]], [[-0.6, 0.8], [0.6, 0.2]]],
  [[[0, 0], [0, 1]], [[0, 1], [0.8, 0.65]], [[0.8, 0.65], [0, 0.35]]],
  [[[-0.7, 0], [0, 1]], [[0, 1], [0.7, 0]], [[-0.35, 0.5], [0.35, 0.5]]],
  [[[0, 0], [0, 1]], [[-0.8, 1], [0.8, 0.6]], [[-0.8, 0.4], [0.8, 0]]],
  [[[-0.7, 1], [0.7, 0]], [[0.7, 1], [-0.7, 0]]],
  [[[0, 0], [0, 1]], [[-0.7, 0.3], [0, 0.6]], [[0, 0.6], [0.7, 0.3]], [[-0.4, 1], [0.4, 1]]],
];
// rows of runes down the fuller (z 0.27 … 0.95), each stroke as [a, b] points on the +x face
export function runeStrokes(sink = 0.0008) {
  const S = [], h = 0.05, gap = 0.032;
  for (let i = 0, z = 0.27; z + h <= 0.96; i++, z += h + gap) {
    for (const [a, b] of GLYPHS[i % GLYPHS.length]) S.push([onFace(a[0] * 0.0085, z + a[1] * h, sink), onFace(b[0] * 0.0085, z + b[1] * h, sink)]);
  }
  return S;
}
