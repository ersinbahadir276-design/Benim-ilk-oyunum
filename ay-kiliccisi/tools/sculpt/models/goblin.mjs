import { humanoid, mats } from '../lib/humanoid.mjs';
import { dagger } from './_props.mjs';
export default (ALL) => humanoid(ALL, 'goblin', { hr: 0.15, gob: true, torsoMat: 'skin', armMat: 'skin', legMat: 'skin', pelvisMat: 'skin', tunic: false, extras: [dagger], tris: 6500,
  mats: mats({ skin: [0.42, 0.56, 0.25], c1: [0.38, 0.27, 0.17], c2: [0.3, 0.22, 0.14], hair: [0.1, 0.1, 0.08] }) });
