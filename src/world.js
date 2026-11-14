// Dünya: arazi, bölgeler, su, ağaçlar, kayalar ve toplanabilir kaynaklar.
import * as THREE from 'three';

export const SIZE = 400, HALF = 190, WATER_Y = -1.0;
export const LAKE = { x: 100, z: 10 }, PEAK = { x: 0, z: -150 };
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function height(x, z) {
  let h = Math.sin(x * 0.045) * Math.cos(z * 0.05) * 2.2 + Math.sin(x * 0.11 + 1.3) * Math.sin(z * 0.09 + 0.7) * 1.0 + Math.sin((x + z) * 0.021) * 2.4;
  h *= smooth(6, 45, Math.hypot(x, z)); // kamp düzlüğü
  const dm = Math.hypot(x - PEAK.x, z - PEAK.z);
  h += Math.min(24, 40 * smooth(100, 18, dm)); // dağ + zirve düzlüğü
  const dl = Math.hypot(x - LAKE.x, z - LAKE.z);
  h = THREE.MathUtils.lerp(-3.4, h, smooth(16, 44, dl)); // göl çukuru
  h += Math.max(0, Math.max(Math.abs(x), Math.abs(z)) - HALF) * 1.6; // dünya kenarı
  return h;
}
// Su yalnızca göl çukurunda vardır; başka yerdeki alçak noktalar kuru zemindir.
export const inLake = (x, z) => Math.hypot(x - LAKE.x, z - LAKE.z) < 52;
export const waterDepth = (x, z) => (inLake(x, z) ? Math.max(0, WATER_Y - height(x, z)) : 0);
export const floorY = (x, z, maxDepth) => { const h = height(x, z); return inLake(x, z) ? Math.max(h, WATER_Y - maxDepth) : h; };
export function zone(x, z) {
  if (Math.hypot(x - LAKE.x, z - LAKE.z) < 48) return 'lake';
  if (Math.hypot(x - PEAK.x, z - PEAK.z) < 92) return 'mountain';
  if (x > 55 && z < -45) return 'dark';
  if (x < -55 && z < 40) return 'forest';
  if (x < -40 && z >= 40) return 'jungle';
  if (z > 75) return 'savanna';
  return 'meadow';
}
const ZCOL = { meadow: 0x6cab4c, forest: 0x3c7436, jungle: 0x2c8544, savanna: 0xbcae58, dark: 0x4b3e60, lake: 0x7fae58, mountain: 0x7b7f78 };

export class World {
  constructor(scene) {
    this.scene = scene; this.trees = []; this.nodes = []; // nodes: toplanabilir kaynaklar
    this._ground(); this._water(); this._plants(); this._camp();
  }
  _ground() {
    const seg = 200, g = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg).rotateX(-Math.PI / 2), p = g.attributes.position;
    const col = new Float32Array(p.count * 3), c = new THREE.Color(), c2 = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), h = height(x, z); p.setY(i, h);
      // bölge renkleri arasında yumuşak geçiş için komşu örnekleme
      c.set(0, 0, 0); let n = 0; for (const [dx, dz] of [[0, 0], [7, 0], [-7, 0], [0, 7], [0, -7]]) { c2.set(ZCOL[zone(x + dx, z + dz)]); c.add(c2); n++; } c.multiplyScalar(1 / n);
      if (zone(x, z) === 'mountain') { c.lerp(c2.set(0x5f8a4a), smooth(9, 2, h)); c.lerp(c2.set(0xf2f4f7), smooth(19, 23.5, h) * 0.85); }
      if (h < -0.35 && Math.hypot(x - LAKE.x, z - LAKE.z) < 60) c.lerp(c2.set(0xd8cb93), smooth(-0.35, -0.9, h));
      const v = 0.94 + 0.1 * Math.sin(x * 1.7) * Math.cos(z * 1.3); c.multiplyScalar(v);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); m.receiveShadow = true; this.scene.add(m); this.ground = m;
  }
  _water() {
    const w = new THREE.Mesh(new THREE.CircleGeometry(50, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2f7fb5, transparent: true, opacity: 0.72, roughness: 0.15, metalness: 0.2 }));
    w.position.set(LAKE.x, WATER_Y, LAKE.z); this.scene.add(w); this.water = w;
  }
  _plants() {
    const R = rng(20261114), dummy = new THREE.Object3D();
    const trunkG = new THREE.CylinderGeometry(0.16, 0.26, 1, 7).translate(0, 0.5, 0);
    const pineG = new THREE.ConeGeometry(1, 1, 8).translate(0, 0.5, 0), roundG = new THREE.IcosahedronGeometry(1, 1);
    const spots = { pine: [], round: [], palm: [], dead: [] };
    const tryTree = (x, z, type, s) => { const h = height(x, z); if (h < -0.5 || Math.hypot(x, z) < 12) return; spots[type].push({ x, z, h, s }); this.trees.push({ x, z, r: 0.35 * s }); };
    for (let i = 0; i < 2600; i++) {
      const x = (R() - 0.5) * 2 * HALF, z = (R() - 0.5) * 2 * HALF, zn = zone(x, z), r = R(), s = 0.8 + R() * 0.7;
      if (zn === 'forest' && r < 0.75) tryTree(x, z, R() < 0.7 ? 'pine' : 'round', s * 1.15);
      else if (zn === 'jungle' && r < 0.7) tryTree(x, z, 'round', s * 1.3);
      else if (zn === 'meadow' && r < 0.1) tryTree(x, z, 'round', s);
      else if (zn === 'savanna' && r < 0.06) tryTree(x, z, 'palm', s);
      else if (zn === 'dark' && r < 0.3) tryTree(x, z, 'dead', s);
      else if (zn === 'mountain' && r < 0.2 && height(x, z) < 12) tryTree(x, z, 'pine', s);
      else if (zn === 'lake' && r < 0.1) tryTree(x, z, 'round', s * 0.8);
    }
    const inst = (geo, mat, list, fn) => { const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((t, i) => { fn(t, dummy); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); }); m.castShadow = true; m.receiveShadow = true; this.scene.add(m); return m; };
    const bark = new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 1 }), darkBark = new THREE.MeshStandardMaterial({ color: 0x2c2530, roughness: 1 });
    const leaf = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true });
    const all = [...spots.pine, ...spots.round, ...spots.palm];
    inst(trunkG, bark, all, (t, d) => { d.position.set(t.x, t.h - 0.1, t.z); d.rotation.set(0, 0, 0); d.scale.set(t.s, 2.6 * t.s, t.s); });
    inst(trunkG, darkBark, spots.dead, (t, d) => { d.position.set(t.x, t.h - 0.1, t.z); d.rotation.set(0.1, t.x, 0.12); d.scale.set(t.s * 0.8, 4.2 * t.s, t.s * 0.8); });
    inst(pineG, leaf(0x2f6b3a), spots.pine, (t, d) => { d.position.set(t.x, t.h + 1.5 * t.s, t.z); d.rotation.set(0, t.x, 0); d.scale.set(1.7 * t.s, 3.2 * t.s, 1.7 * t.s); });
    inst(pineG, leaf(0x3d7f45), spots.pine, (t, d) => { d.position.set(t.x, t.h + 3.2 * t.s, t.z); d.rotation.set(0, t.z, 0); d.scale.set(1.15 * t.s, 2.4 * t.s, 1.15 * t.s); });
    inst(roundG, leaf(0x4f9a3f), spots.round, (t, d) => { d.position.set(t.x, t.h + 3.3 * t.s, t.z); d.rotation.set(t.x, t.z, 0); d.scale.set(1.8 * t.s, 1.5 * t.s, 1.8 * t.s); });
    inst(roundG, leaf(0x5fae4a), spots.round, (t, d) => { d.position.set(t.x + 0.7 * t.s, t.h + 4.2 * t.s, t.z + 0.3); d.rotation.set(t.z, t.x, 0); d.scale.setScalar(1.15 * t.s); });
    inst(roundG, leaf(0x8fae3c), spots.palm, (t, d) => { d.position.set(t.x, t.h + 2.9 * t.s, t.z); d.rotation.set(0, t.x, 0); d.scale.set(2.6 * t.s, 0.55 * t.s, 2.6 * t.s); });
    // kayalar
    const rocks = []; for (let i = 0; i < 260; i++) { const x = (R() - 0.5) * 2 * HALF, z = (R() - 0.5) * 2 * HALF, zn = zone(x, z); if (Math.hypot(x, z) < 10 || height(x, z) < -0.6) continue; if (zn === 'mountain' || zn === 'dark' || R() < 0.25) rocks.push({ x, z, h: height(x, z), s: 0.4 + R() * 1.3 }); }
    inst(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0x86888c, roughness: 1, flatShading: true }), rocks, (t, d) => { d.position.set(t.x, t.h + t.s * 0.3, t.z); d.rotation.set(t.x, t.z, t.s); d.scale.set(t.s * 1.2, t.s * 0.8, t.s); });
    rocks.forEach((r) => { if (r.s > 0.9) this.trees.push({ x: r.x, z: r.z, r: r.s * 0.9 }); });
    // çalı / ot kümeleri (süs)
    const tufts = []; for (let i = 0; i < 1500; i++) { const x = (R() - 0.5) * 2 * HALF, z = (R() - 0.5) * 2 * HALF, h = height(x, z), zn = zone(x, z); if (h < -0.4 || zn === 'mountain' && h > 10) continue; tufts.push({ x, z, h, s: 0.12 + R() * 0.16, zn }); }
    const tm = inst(new THREE.ConeGeometry(1, 3.2, 5).translate(0, 1.4, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), tufts, (t, d) => { d.position.set(t.x, t.h, t.z); d.rotation.set(0, t.x, 0); d.scale.set(t.s, t.s * (t.zn === 'savanna' ? 1.6 : 1), t.s); });
    const tc = new THREE.Color(); tufts.forEach((t, i) => { tm.setColorAt(i, tc.set(ZCOL[t.zn]).multiplyScalar(0.8)); }); tm.castShadow = false;
    // toplanabilir kaynaklar
    const place = (type, n, zones, extra) => { let tries = 0, k = 0; while (k < n && tries++ < 4000) { const x = (R() - 0.5) * 2 * (HALF - 8), z = (R() - 0.5) * 2 * (HALF - 8), h = height(x, z); if (!zones.includes(zone(x, z)) || Math.hypot(x, z) < 9 || (extra ? !extra(x, z, h) : h < -0.3)) continue; this._node(type, x, z); k++; } };
    place('berry', 26, ['meadow', 'forest', 'jungle']); place('carrot', 16, ['meadow']); place('apple', 14, ['meadow', 'savanna', 'forest']); place('honey', 12, ['forest', 'jungle']);
    place('fish', 9, ['lake'], (x, z, h) => h < -0.75 && h > -1.5); place('moonstone', 9, ['dark']);
    // başlangıçta kampın hemen yanında birer örnek
    this._node('berry', 9, 6); this._node('carrot', -8, 8); this._node('apple', 10, -8);
  }
  _node(type, x, z) {
    const g = new THREE.Group(), h = height(x, z); g.position.set(x, type === 'fish' ? WATER_Y + 0.02 : h, z);
    const M = (c, e) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true, emissive: e || 0, emissiveIntensity: e ? 1.2 : 0 });
    const add = (geo, mat, x2 = 0, y = 0, z2 = 0, s = 1) => { const m = new THREE.Mesh(geo, mat); m.position.set(x2, y, z2); m.scale.setScalar(s); m.castShadow = true; g.add(m); return m; };
    const fruit = new THREE.Group(); g.add(fruit); const addF = (geo, mat, x2, y, z2) => { const m = new THREE.Mesh(geo, mat); m.position.set(x2, y, z2); fruit.add(m); };
    const sph = new THREE.IcosahedronGeometry(1, 1);
    if (type === 'berry') { add(sph, M(0x2f7a35), 0, 0.45, 0, 0.65); add(sph, M(0x3a8a3f), 0.4, 0.35, 0.2, 0.45); for (let i = 0; i < 9; i++) addF(new THREE.SphereGeometry(0.07, 6, 5), M(0x8e1f6b), Math.sin(i * 2.3) * 0.55, 0.45 + Math.cos(i * 1.7) * 0.3, Math.cos(i * 2.3) * 0.55); }
    if (type === 'carrot') { for (let i = 0; i < 4; i++) { add(new THREE.ConeGeometry(0.12, 0.5, 5), M(0x4fae3a), Math.sin(i * 1.6) * 0.3, 0.25, Math.cos(i * 1.6) * 0.3); addF(new THREE.ConeGeometry(0.08, 0.16, 6), M(0xf07c1c), Math.sin(i * 1.6) * 0.3, 0.05, Math.cos(i * 1.6) * 0.3); } }
    if (type === 'apple') { add(new THREE.CylinderGeometry(0.14, 0.2, 2.2, 6), M(0x5a4028), 0, 1.1, 0); add(sph, M(0x4b9a3a), 0, 2.9, 0, 1.4); for (let i = 0; i < 7; i++) addF(new THREE.SphereGeometry(0.12, 7, 6), M(0xd4222a), Math.sin(i * 2.1) * 1.15, 2.5 + Math.cos(i * 1.3) * 0.5, Math.cos(i * 2.1) * 1.15); this.trees.push({ x, z, r: 0.3 }); }
    if (type === 'honey') { add(new THREE.CylinderGeometry(0.2, 0.3, 3.2, 6), M(0x4a3420), 0, 1.6, 0); add(sph, M(0x356b33), 0, 3.9, 0, 1.6); const hv = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 7).scale(1, 1.25, 1), M(0xe3a51d)); hv.position.set(0.42, 1.5, 0); fruit.add(hv); this.trees.push({ x, z, r: 0.35 }); }
    if (type === 'fish') { const ring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); fruit.add(ring); const f = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6).scale(1.8, 0.7, 0.5), M(0xc0c8d4)); f.position.y = 0.05; fruit.add(f); }
    if (type === 'moonstone') { for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8 + i * 0.2, 5), M(0xb9a8ff, 0x7a4cff)); c.position.set(Math.sin(i * 1.7) * 0.25, 0.35, Math.cos(i * 1.7) * 0.25); c.rotation.set(Math.sin(i) * 0.4, 0, Math.cos(i) * 0.4); fruit.add(c); } }
    this.scene.add(g); this.nodes.push({ type, x, z, g, fruit, ready: true, timer: 0 });
  }
  _camp() {
    const g = new THREE.Group(); g.position.set(-4, height(-4, -3), -3);
    const tent = new THREE.Mesh(new THREE.ConeGeometry(1.9, 2.4, 4).rotateY(Math.PI / 4).translate(0, 1.2, 0), new THREE.MeshStandardMaterial({ color: 0xc8b48a, flatShading: true })); tent.castShadow = true; g.add(tent);
    const fire = new THREE.Group(); fire.position.set(3.2, 0, 1.6); g.add(fire);
    for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 5), new THREE.MeshStandardMaterial({ color: 0x4a3420 })); l.rotation.set(Math.PI / 2 - 0.4, i * 1.26, 0); l.position.y = 0.15; fire.add(l); }
    this.flame = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 6).translate(0, 0.5, 0), new THREE.MeshBasicMaterial({ color: 0xffa02a })); fire.add(this.flame);
    const pl = new THREE.PointLight(0xff9a3c, 12, 14); pl.position.y = 1; fire.add(pl);
    this.scene.add(g); this.trees.push({ x: -4, z: -3, r: 1.6 });
  }
  update(dt, t) {
    this.flame.scale.set(1 + Math.sin(t * 13) * 0.15, 1 + Math.sin(t * 9) * 0.25, 1 + Math.cos(t * 11) * 0.15);
    for (const n of this.nodes) {
      if (!n.ready) { n.timer -= dt; if (n.timer <= 0) { n.ready = true; n.fruit.visible = true; } }
      if (n.type === 'fish') n.fruit.children[0].scale.setScalar(1 + (t * 0.6 + n.x) % 1);
    }
  }
  // ağaç/kaya çarpışması: konumu engellerin dışına it
  collide(pos, radius) {
    for (const t of this.trees) { const dx = pos.x - t.x, dz = pos.z - t.z, d = Math.hypot(dx, dz), m = t.r + radius; if (d < m && d > 1e-4) { pos.x = t.x + dx / d * m; pos.z = t.z + dz / d * m; } }
    pos.x = Math.min(HALF, Math.max(-HALF, pos.x)); pos.z = Math.min(HALF, Math.max(-HALF, pos.z));
  }
}
