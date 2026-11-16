import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
import { hood } from './_props.mjs';
import { torus, sphere, U } from '../sdf.mjs';
export default (ALL) => humanoid(ALL, 'priest', { hr: 0.102, dress: true, hairStyle: 'long', decals: eyeDecals, extras: [(c) => hood(c, true),
  (c) => c.add({ name: 'beads', mat: 'gold', bone: 'spine', rigid: true, k: 0.003, sdf: U(0, ...Array.from({ length: 11 }, (_, i) => { const a = -1.2 + i * 0.24; return sphere([Math.sin(a) * c.chestR[0] * 0.75, 0.06 + c.T * (0.8 - 0.25 * Math.cos(a)), c.chestR[2] * 0.95 + 0.012], 0.011); })) })],
  mats: mats({ skin: [0.94, 0.8, 0.72], c1: [0.9, 0.88, 0.84], c2: [0.82, 0.8, 0.74], hair: [0.75, 0.62, 0.4], iris: [0.3, 0.4, 0.6] }) });
