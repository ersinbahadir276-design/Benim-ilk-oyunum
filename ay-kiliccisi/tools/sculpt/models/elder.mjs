import { humanoid, mats, eyeDecals } from '../lib/humanoid.mjs';
import { staff } from './_props.mjs';
export default (ALL) => humanoid(ALL, 'elder', { hr: 0.105, dress: true, beard: 1.6, hairStyle: 'long', brow: 0.01, decals: eyeDecals, extras: [staff],
  mats: mats({ skin: [0.82, 0.66, 0.56], c1: [0.32, 0.28, 0.4], c2: [0.28, 0.26, 0.32], hair: [0.86, 0.86, 0.84], extra: { gem: { col: [0.4, 0.8, 1.2], gloss: 0.9, em: 0.6 } } }) });
