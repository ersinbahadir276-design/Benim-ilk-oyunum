// Saç ve palto eteği için yay kemiği (spring bone) fiziği.
// VRM 0.x "secondaryAnimation" verisini okur ve UniVRM'in Verlet tabanlı algoritmasını uygular:
// her kemiğin ucu (tail) ataletle hareket eder, sertlik onu dinlenme yönüne çeker, yerçekimi aşağı çeker,
// çarpışma küreleri (baş, göğüs, kollar, bacaklar) saçın/eteğin vücudun içine girmesini engeller.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _c = new THREE.Vector3();
const _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _iq = new THREE.Quaternion();

class Joint {
  constructor(bone, child, group) {
    this.bone = bone; this.g = group;
    this.initLocal = bone.quaternion.clone();
    bone.updateWorldMatrix(true, true);
    const head = bone.getWorldPosition(new THREE.Vector3());
    let tailW;
    if (child) tailW = child.getWorldPosition(new THREE.Vector3());
    else { // uç kemik: ebeveyn→kemik yönünde 7 cm sanal uç
      const p = bone.parent.getWorldPosition(new THREE.Vector3());
      tailW = head.clone().add(head.clone().sub(p).normalize().multiplyScalar(0.07));
    }
    this.length = Math.max(1e-4, head.distanceTo(tailW));
    this.axis = bone.worldToLocal(tailW.clone()).normalize(); // yerel kemik ekseni
    this.cur = tailW.clone(); this.prev = tailW.clone();
  }
  reset() {
    this.bone.quaternion.copy(this.initLocal); this.bone.updateWorldMatrix(false, false);
    this.bone.localToWorld(this.cur.copy(this.axis).multiplyScalar(this.length)); this.prev.copy(this.cur);
  }
  update(dt, colliders) {
    const b = this.bone, g = this.g;
    b.parent.getWorldQuaternion(_pq);
    _q.copy(_pq).multiply(this.initLocal); // dinlenme dünya dönüşü
    b.updateWorldMatrix(false, false);
    const head = _w.setFromMatrixPosition(b.matrixWorld);
    // Verlet: atalet + sertlik + yerçekimi
    const next = _v.copy(this.cur).sub(this.prev).multiplyScalar(1 - g.drag).add(this.cur)
      .add(_c.copy(this.axis).applyQuaternion(_q).multiplyScalar(g.stiffness * dt))
      .addScaledVector(g.gravityDir, g.gravity * dt);
    next.sub(head).normalize().multiplyScalar(this.length).add(head); // uzunluk sabit
    for (const s of colliders) { // küre çarpışması
      const r = g.radius + s.r, dx = next.x - s.p.x, dy = next.y - s.p.y, dz = next.z - s.p.z, d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < r * r) {
        const d = Math.sqrt(d2) || 1e-6;
        next.set(s.p.x + dx / d * r, s.p.y + dy / d * r, s.p.z + dz / d * r);
        next.sub(head).normalize().multiplyScalar(this.length).add(head);
      }
    }
    this.prev.copy(this.cur); this.cur.copy(next);
    // uç konumundan yerel dönüş: initLocal * fromTo(axis, yerel hedef yönü)
    _iq.copy(_q).invert();
    _c.copy(next).sub(head).applyQuaternion(_iq).normalize();
    b.quaternion.copy(this.initLocal).multiply(_iq.setFromUnitVectors(this.axis, _c));
    b.updateWorldMatrix(false, false);
  }
}

export class SpringBones {
  /** @param root sahnedeki model kökü  @param ext VRM eklentisi (gltf.parser.json.extensions.VRM)  @param nodeOf düğüm indeksi → Object3D */
  constructor(root, ext, nodeOf, extraColliders = []) {
    this.joints = []; this.colliderSets = []; this.root = root; this.lastRoot = new THREE.Vector3(); this.started = false;
    const sa = ext?.secondaryAnimation; if (!sa) return;
    root.updateWorldMatrix(true, true);
    const sets = (sa.colliderGroups || []).map((cg) => {
      const node = nodeOf(cg.node);
      // VRM0 ofsetleri Unity koordinatında: Z ekseni glTF'e göre ters
      return (cg.colliders || []).map((c) => ({ node, off: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), r: c.radius, p: new THREE.Vector3() }));
    });
    // ek çarpıştırıcılar: [{a: Object3D, b: Object3D, r, n}] → a-b doğrusu boyunca n küre (bacak kapsülü)
    const extra = [];
    for (const e of extraColliders) for (let i = 0; i < e.n; i++) extra.push({ a: e.a, b: e.b, t: e.n === 1 ? 0 : i / (e.n - 1), r: e.r, p: new THREE.Vector3() });
    this.extra = extra;
    for (const bg of sa.boneGroups || []) {
      const group = {
        stiffness: bg.stiffiness ?? bg.stiffness ?? 1, drag: bg.dragForce ?? 0.4, gravity: bg.gravityPower ?? 0,
        gravityDir: new THREE.Vector3(bg.gravityDir?.x ?? 0, bg.gravityDir?.y ?? -1, -(bg.gravityDir?.z ?? 0)).normalize(),
        radius: bg.hitRadius ?? 0.02,
      };
      const cols = []; for (const i of bg.colliderGroups || []) if (sets[i]) cols.push(...sets[i]);
      const useExtra = !!bg.useExtraColliders;
      const colliders = useExtra ? cols.concat(extra) : cols;
      this.colliderSets.push(colliders);
      const walk = (bone) => {
        const kids = bone.children.filter((c) => c.isBone || c.type === 'Bone' || c.type === 'Object3D');
        this.joints.push({ j: new Joint(bone, kids[0], group), cols: colliders });
        for (const k of kids) walk(k);
      };
      for (const bi of bg.bones || []) { const b = nodeOf(bi); if (b) walk(b); }
    }
    this.allColliders = [...new Set(this.colliderSets.flat())];
  }
  get count() { return this.joints.length; }
  reset() { for (const { j } of this.joints) j.reset(); this.started = false; }
  update(dt) {
    if (!this.joints.length) return;
    this.root.updateWorldMatrix(true, true);
    const rp = _v.setFromMatrixPosition(this.root.matrixWorld);
    // ışınlanma (yeniden doğma vb.) sonrası saç patlamasın
    if (!this.started || rp.distanceToSquared(this.lastRoot) > 4) { this.lastRoot.copy(rp); this.reset(); this.root.updateWorldMatrix(true, true); this.started = true; }
    this.lastRoot.copy(rp);
    dt = Math.min(dt, 1 / 30);
    for (const c of this.allColliders) {
      if (c.node) c.p.copy(c.off).applyMatrix4(c.node.matrixWorld);
      else { c.a.getWorldPosition(c.p); c.b.getWorldPosition(_w); c.p.lerp(_w, c.t); }
    }
    for (const { j, cols } of this.joints) j.update(dt, cols);
  }
}
