// Ejderhayı oyunun motoruna uygun sıkıştırılmış biçime çevirir: ds.glb -> drg.json (+ base64 bloklar)
const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch({ args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage();
 p.on('pageerror', e => console.log('ERR', e)); p.on('console', m => console.log('page:', m.text()));
 await p.goto('http://localhost:8790/v.html?f=ds.glb'); await p.waitForFunction('window.READY', { timeout: 180000 });
 const out = await p.evaluate(async () => {
  const THREE = await import('three'); const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const g = await new GLTFLoader().loadAsync('ds.glb'); const sc = g.scene; sc.updateMatrixWorld(true);
  const meshes = []; sc.traverse(o => { if (o.isSkinnedMesh) meshes.push(o); });
  const bones = meshes[0].skeleton.bones; const idx = new Map(bones.map((b, i) => [b, i]));
  for (const m of meshes) if (m.skeleton.bones.some((b, i) => b !== bones[i])) throw new Error('skeleton differs');
  const par = bones.map(b => idx.has(b.parent) ? idx.get(b.parent) : -1);
  const roots = bones.map((b, i) => par[i] < 0 ? Array.from(b.parent.matrixWorld.elements) : null);
  const ibm = bones.map((b, i) => Array.from(meshes[0].skeleton.boneInverses[i].elements));
  const b64 = (ta) => { const u8 = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength); let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); };
  const groups = [];
  for (const m of meshes) {
   const geo = m.geometry, P = geo.attributes.position, N = geo.attributes.normal, UV = geo.attributes.uv, J = geo.attributes.skinIndex, W = geo.attributes.skinWeight, I = geo.index;
   const n = P.count, bm = m.bindMatrix, nm = new THREE.Matrix3().getNormalMatrix(bm), v = new THREE.Vector3();
   const pos = new Float32Array(n * 3), nor = new Int8Array(n * 4), uv = new Float32Array(n * 2), jj = new Uint8Array(n * 4), ww = new Uint8Array(n * 4);
   for (let i = 0; i < n; i++) { v.fromBufferAttribute(P, i).applyMatrix4(bm); pos.set([v.x, v.y, v.z], i * 3); v.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor.set([Math.round(v.x * 127), Math.round(v.y * 127), Math.round(v.z * 127), 0], i * 4);
    uv[i * 2] = UV.getX(i); uv[i * 2 + 1] = UV.getY(i);
    const w = [W.getX(i), W.getY(i), W.getZ(i), W.getW(i)], s = w[0] + w[1] + w[2] + w[3] || 1; let q = w.map(x => Math.round(x / s * 255)); q[0] += 255 - (q[0] + q[1] + q[2] + q[3]);
    for (let k = 0; k < 4; k++) { jj[i * 4 + k] = J.getComponent(i, k); ww[i * 4 + k] = q[k]; } }
   const ind = new Uint16Array(I.array);
   // texture -> 512px jpeg
   const img = m.material.map.image, c = document.createElement('canvas'); c.width = c.height = 512; const cx = c.getContext('2d'); cx.drawImage(img, 0, 0, 512, 512);
   groups.push({ name: m.name, nv: n, P: b64(pos), N: b64(nor), U: b64(uv), J: b64(jj), W: b64(ww), I: b64(ind), tex: c.toDataURL('image/jpeg', 0.78), flipY: m.material.map.flipY });
  }
  // animations sampled at 15 fps in local TRS
  const mix = new THREE.AnimationMixer(sc), FPS = 15, clips = [];
  const allPos = bones.map(() => []), allQ = bones.map(() => []), allS = bones.map(() => []);
  for (const c of g.animations) { mix.stopAllAction(); const a = mix.clipAction(c); a.play(); let mn = 1e9; for (const t of c.tracks) mn = Math.min(mn, t.times[0]);
   const len = c.duration - mn, nf = Math.max(2, Math.round(len * FPS) + 1); const fr = [];
   for (let f = 0; f < nf; f++) { a.time = mn + Math.min(len, f / FPS); mix.update(0); const row = bones.map(b => [b.position.toArray(), b.quaternion.toArray(), b.scale.toArray()]); fr.push(row);
    row.forEach((r, i) => { allPos[i].push(r[0]); allS[i].push(r[2]); }); }
   clips.push({ name: c.name.replace('Qishilong_', '').replace('_02_12_DH', ''), len, nf, fr }); }
  // which bones need per-frame translation / scale
  const varies = (arr) => { const a = arr[0]; return arr.some(x => Math.abs(x[0] - a[0]) + Math.abs(x[1] - a[1]) + Math.abs(x[2] - a[2]) > 1e-3); };
  const tB = bones.map((b, i) => varies(allPos[i])), sB = bones.map((b, i) => varies(allS[i]));
  const restT = bones.map((b, i) => allPos[i][0]), restS = bones.map((b, i) => allS[i][0]);
  // pack: per clip, per frame: quats int16 x4 for every bone, then translations (int16 x3, scale per bone) for tB bones
  const tScale = bones.map((b, i) => { let m = 1e-6; for (const p of allPos[i]) for (const v of p) m = Math.max(m, Math.abs(v)); return m / 32000; });
  const packed = clips.map(c => { const nq = bones.length * 4, nt = tB.filter(x => x).length * 3, ns = sB.filter(x => x).length * 3, arr = new Int16Array(c.nf * (nq + nt + ns)); let o = 0;
   for (const row of c.fr) { for (let i = 0; i < bones.length; i++) { let q = row[i][1]; for (let k = 0; k < 4; k++) arr[o++] = Math.round(q[k] * 32767); }
    for (let i = 0; i < bones.length; i++) if (tB[i]) for (let k = 0; k < 3; k++) arr[o++] = Math.round(row[i][0][k] / tScale[i]);
    for (let i = 0; i < bones.length; i++) if (sB[i]) for (let k = 0; k < 3; k++) arr[o++] = Math.round(row[i][2][k] * 8000); }
   return { name: c.name, len: c.len, nf: c.nf, D: b64(arr) }; });
  return { fps: FPS, par, roots, ibm, names: bones.map(b => b.name), restT, restS, tB, sB, tScale, groups, clips: packed, headBone: bones.findIndex(b => b.name.startsWith('Bip001-Head')), rHand: bones.findIndex(b => b.name.startsWith('Bip001-R-Hand')), lHand: bones.findIndex(b => b.name.startsWith('Bip001-L-Hand')), pelvis: bones.findIndex(b => b.name.startsWith('Bip001-Pelvis')) };
 });
 fs.writeFileSync('drg.json', JSON.stringify(out));
 console.log('bones', out.par.length, 'groups', out.groups.map(g => g.name + ':' + g.nv), 'clips', out.clips.map(c => c.name + ':' + c.nf).join(' '), 'tB', out.tB.filter(x => x).length, 'sB', out.sB.filter(x => x).length, 'flipY', out.groups.map(g=>g.flipY));
 await b.close(); })();
