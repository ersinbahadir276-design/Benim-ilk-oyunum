import { humanoid, mats } from '../lib/humanoid.mjs';
import { club } from './_props.mjs';
export default (ALL) => humanoid(ALL, 'bigGoblin', { hr: 0.17, gob: true, big: true, torsoMat: 'skin', armMat: 'skin', legMat: 'skin', pelvisMat: 'skin', tunic: false, extras: [club], tris: 8000, voxel: 0.0068,
  mats: mats({ skin: [0.36, 0.47, 0.24], c1: [0.32, 0.24, 0.16], c2: [0.26, 0.2, 0.14], hair: [0.1, 0.1, 0.08] }) });
