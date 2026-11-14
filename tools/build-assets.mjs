// Varlık hazırlama: ejderha GLB'sini web için uyarlar, kahraman animasyon kitaplığını küçültür.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough, prune, resample, dedup } from '@gltf-transform/functions';
const [,, dragonIn, ual1, ual2, outDir] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

function keepAnims(doc, names) {
  for (const a of doc.getRoot().listAnimations()) if (!names.includes(a.getName())) {
    for (const c of a.listChannels()) c.dispose();
    for (const s of a.listSamplers()) s.dispose();
    a.dispose();
  }
}
function rebase(doc) { // her klibi 0. saniyeden başlat
  for (const a of doc.getRoot().listAnimations()) {
    let mn = Infinity;
    for (const s of a.listSamplers()) mn = Math.min(mn, s.getInput().getArray()[0]);
    const map = new Map();
    for (const s of a.listSamplers()) {
      const inp = s.getInput();
      if (!map.has(inp)) { const c = inp.clone(); const arr = Float32Array.from(inp.getArray(), v => v - mn); c.setArray(arr); map.set(inp, c); }
      s.setInput(map.get(inp));
    }
  }
}
{ // Ejderha
  const doc = await io.read(dragonIn);
  const keep = ['Qishilong_stand','Qishilong_walk','Qishilong_attack01','Qishilong_attack02','Qishilong_skill08','Qishilong_die']; // fly2 sinematik kök hareketi içerdiği için oyunda kullanılmıyor
  keepAnims(doc, keep); rebase(doc);
  await doc.transform(metalRough(), resample({ tolerance: 1e-4 }), prune(), dedup());
  for (const a of doc.getRoot().listAnimations()) a.setName(a.getName().replace('Qishilong_', ''));
  await io.write(outDir + '/dragon.glb', doc);
}
for (const [src, out, keep] of [
  [ual1, 'hero_anims1.glb', ['A_TPose','Idle_Loop','Walk_Loop','Jog_Fwd_Loop','Sprint_Loop','Jump_Start','Jump_Loop','Jump_Land','Sword_Attack','Sword_Idle','Crouch_Idle_Loop','Crouch_Fwd_Loop','Roll','Death01','Hit_Chest','Interact','PickUp_Kneeling']],
  [ual2, 'hero_anims2.glb', ['A_TPose','Sword_Regular_A','Sword_Regular_B','Sword_Regular_C']],
]) {
  const doc = await io.read(src);
  keepAnims(doc, keep);
  for (const n of doc.getRoot().listNodes()) { n.setMesh(null); n.setSkin(null); }
  for (const s of doc.getRoot().listSkins()) s.dispose();
  await doc.transform(prune({ keepLeaves: true }), dedup());
  await io.write(outDir + '/' + out, doc);
}
