// Skeleton mage: the same bones under a hooded robe, with a crooked staff and a glowing orb.
import { humanoid } from '../lib/humanoid.mjs';
import { bones, skMats } from './skeleton.mjs';
import { hood, staff } from './_props.mjs';
export default (ALL) => { const M = skMats([0.2, 0.12, 0.32]); M.gem = { col: [0.9, 0.4, 1.5], em: 0.9, gloss: 0.9 };
  const m = humanoid(ALL, 'villager', { hr: 0.1, skull: true, limb: 0.42, torso: 0.6, dress: true, noBelt: true, cuffs: false, torsoMat: 'c1', armMat: 'c1', forearmMat: 'skin', legMat: 'skin', pelvisMat: 'c1', bootMat: 'skin', tris: 6500, voxel: 0.0055,
    extras: [(c) => hood(c, true), staff], mats: M }); m.name = 'skmage'; return m; };
