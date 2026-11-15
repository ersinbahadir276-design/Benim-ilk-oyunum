// VRM 0.x "secondaryAnimation" yay kemikleri: saç tutamları ve ceket eteği için Verlet fiziği.
// UniVRM'in VRMSpringBone algoritmasının sade bir uyarlaması (sertlik, sürükleme, yerçekimi, küre çarpıştırıcılar).
// Animasyon karıştırıcısı bu kemiklere dokunmaz; her karede mikserden SONRA update() çağrılmalıdır.
import * as THREE from 'three';

const STEP = 1 / 60;           // sabit alt adım: kare hızından bağımsız davranış (mobil 30 fps / masaüstü 144 fps)
const MAX_STEPS = 4;           // takılma sonrası patlamayı önle
const TELEPORT = 1.5;
const MIN_DRAG = 0.2;           // modelde sürükleme 0 olan gruplar (ceket eteği) sonsuza dek salınmasın          // bir karede bu kadar (m) yer değişirse simülasyonu sıfırla (yeniden doğma vb.)
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4();

class Joint {
  constructor(bone, child, group) {
    this.bone = bone; this.group = group;
    this.initLocalRot = bone.quaternion.clone();
    // kemik ekseni (yerel): çocuğa doğru; uç kemikte UniVRM gibi 7 cm'lik sanal uç
    const local = child ? child.position.clone() : bone.position.clone().normalize().multiplyScalar(0.07);
    if (local.lengthSq() < 1e-10) local.set(0, -0.07, 0);
    this.axis = local.clone().normalize();
    this.localTail = local;
    this.cur = new THREE.Vector3(); this.prev = new THREE.Vector3();
    this.length = 0; this.reset();
  }
  reset() {
    this.bone.quaternion.copy(this.initLocalRot);
    this.bone.updateWorldMatrix(true, true);
    this.cur.copy(this.localTail).applyMatrix4(this.bone.matrixWorld);
    this.prev.copy(this.cur);
    this.length = this.bone.getWorldPosition(_v1).distanceTo(this.cur);
  }
}

export class SpringBones {
  /** @param joints Joint[] ; colliders {node, offset:Vector3, radius}[] */
  constructor(joints, colliders, anchor) {
    this.joints = joints; this.colliders = colliders; this.anchor = anchor;
    this.acc = 0; this.enabled = true; this.lastAnchor = new THREE.Vector3(); this.started = false;
    this._centers = colliders.map(() => new THREE.Vector3());
  }
  get count() { return this.joints.length; }

  reset() { for (const j of this.joints) j.reset(); this.acc = 0; this.started = false; }

  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    this.anchor.getWorldPosition(_v3);
    if (!this.started || _v3.distanceTo(this.lastAnchor) > TELEPORT) { this.lastAnchor.copy(_v3); this.reset(); this.started = true; return; }
    this.lastAnchor.copy(_v3);
    this.acc = Math.min(this.acc + dt, STEP * MAX_STEPS);
    // çarpıştırıcı merkezleri karede bir kez (animasyonlu gövde kemikleri)
    let n = 0;
    while (this.acc >= STEP) { this.acc -= STEP; if (n++ === 0) this._updateColliders(); this._step(STEP); }
  }

  _updateColliders() {
    this.colliders.forEach((c, i) => {
      c.node.updateWorldMatrix(true, false);
      this._centers[i].copy(c.offset).applyMatrix4(c.node.matrixWorld);
      c.worldRadius = c.radius * c.node.matrixWorld.getMaxScaleOnAxis();
    });
  }

  _step(dt) {
    for (const j of this.joints) {
      const g = j.group, bone = j.bone, parent = bone.parent;
      parent.updateWorldMatrix(true, false);
      parent.matrixWorld.decompose(_v1, _q1, _v2);           // _q1 = ebeveyn dünya dönüşü
      const scale = _v2.x;
      const bonePos = _v1.set(0, 0, 0); bonePos.copy(bone.position).applyMatrix4(parent.matrixWorld);
      _q2.copy(_q1).multiply(j.initLocalRot);                  // dinlenme dünya dönüşü
      // Verlet: atalet (sürükleme ile sönümlü) + dinlenme yönüne çeken sertlik + yerçekimi
      const next = _v2.copy(j.cur).sub(j.prev).multiplyScalar(1 - g.drag).add(j.cur);
      next.addScaledVector(_v3.copy(j.axis).applyQuaternion(_q2), g.stiffness * dt);
      if (g.gravity) next.addScaledVector(g.gravityDir, g.gravity * dt);
      // uzunluk kısıtı
      next.sub(bonePos).setLength(j.length).add(bonePos);
      // küre çarpıştırıcılar
      for (let i = 0; i < this.colliders.length; i++) {
        const c = this.colliders[i];
        if (!g.colliderSet.has(c.groupIndex)) continue;
        const r = g.hitRadius * scale + c.worldRadius, cen = this._centers[i];
        const d2 = next.distanceToSquared(cen);
        if (d2 <= r * r) {
          next.sub(cen).setLength(r).add(cen);
          next.sub(bonePos).setLength(j.length).add(bonePos);
        }
      }
      j.prev.copy(j.cur); j.cur.copy(next);
      // dönüşü uca bakacak şekilde ayarla: yerel = init * fromTo(axis, to)
      const to = _v3.copy(next).sub(bonePos).normalize().applyQuaternion(_q2.invert());
      bone.quaternion.setFromUnitVectors(j.axis, to).premultiply(j.initLocalRot);
      bone.updateMatrixWorld(true);
    }
  }
}

/**
 * GLTFLoader sonucundan VRM0 yay kemiklerini kurar. VRM uzantısı yoksa boş (etkisiz) nesne döner.
 * VRM0 değerleri Unity koordinatındadır: çarpıştırıcı ofseti ve yerçekimi yönünde z ekseni ters çevrilir.
 */
export async function createSpringBones(gltf, anchor) {
  const ext = gltf.parser.json.extensions?.VRM?.secondaryAnimation;
  if (!ext) return new SpringBones([], [], anchor);
  const node = (i) => gltf.parser.getDependency('node', i);
  const colliders = [];
  for (const [gi, cg] of (ext.colliderGroups || []).entries()) {
    const n = await node(cg.node);
    for (const c of cg.colliders || []) colliders.push({ node: n, groupIndex: gi, radius: c.radius, worldRadius: c.radius, offset: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z) });
  }
  const joints = [], seen = new Set();
  for (const bg of ext.boneGroups || []) {
    const gd = bg.gravityDir || { x: 0, y: -1, z: 0 };
    const group = {
      stiffness: bg.stiffiness ?? 1, drag: Math.max(MIN_DRAG, bg.dragForce ?? 0.4), gravity: bg.gravityPower ?? 0, hitRadius: bg.hitRadius ?? 0.02,
      gravityDir: new THREE.Vector3(gd.x, gd.y, -gd.z).normalize(), colliderSet: new Set(bg.colliderGroups || []),
    };
    const walk = (b) => {
      if (seen.has(b)) return; seen.add(b);
      const kids = b.children.filter((c) => c.isBone || c.type === 'Bone' || c.type === 'Object3D');
      joints.push(new Joint(b, kids[0] || null, group));
      for (const k of kids) walk(k);
    };
    for (const bi of bg.bones || []) walk(await node(bi));
  }
  // ebeveynler önce güncellensin
  const depth = (o) => { let d = 0; while (o.parent) { d++; o = o.parent; } return d; };
  joints.sort((a, b) => depth(a.bone) - depth(b.bone));
  return new SpringBones(joints, colliders, anchor);
}
