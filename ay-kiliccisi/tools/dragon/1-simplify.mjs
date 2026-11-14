import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { metalRough, weld, simplify, prune, dedup } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(process.argv[2]);
const keep = ['Qishilong_stand','Qishilong_walk','Qishilong_attack01','Qishilong_skill08','Qishilong_skill10','Qishilong_up','Qishilong_down','Qishilong_die','Qishilong_taitou_02_12_DH'];
for (const a of doc.getRoot().listAnimations()) if (!keep.includes(a.getName())) { for (const c of a.listChannels()) c.dispose(); for (const s of a.listSamplers()) s.dispose(); a.dispose(); }
await MeshoptSimplifier.ready;
await doc.transform(metalRough(), weld(), simplify({ simplifier: MeshoptSimplifier, ratio: +process.argv[4], error: 0.002, lockBorder: false }), prune(), dedup());
for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) console.log(m.getName(), 'verts', p.getAttribute('POSITION').getCount(), 'tris', p.getIndices().getCount() / 3);
await io.write(process.argv[3], doc);
