// VRM 0.x "secondaryAnimation" yay kemikleri: kahramanın saç tutamları ve ceket eteği için ikincil fizik.
// UniVRM'deki VRMSpringBoneLogic algoritmasının sadeleştirilmiş, bağımlılıksız bir uyarlaması.
// Simülasyon sabit 60 Hz alt adımlarla çalışır; böylece 30 fps'lik telefonlarda da masaüstüyle aynı davranır.
import * as THREE from 'three';

const STEP = 1 / 60, MAX_STEPS = 4;
const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _head = new THREE.Vector3(), _next = new THREE.Vector3();
const _cur = new THREE.Vector3(), _prev = new THREE.Vector3(), _from = new THREE.Vector3();
const _q = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _rq = new THREE.Quaternion();
const _m = new THREE.Matrix4();

class Joint {
  constructor(bone, localTail, group) {
    this.bone = bone; this.g = group;
    this.axis = localTail.clone().normalize();
    this.length = localTail.length();
    this.rest = bone.quaternion.clone();
    const tail = bone.localToWorld(localTail.clone());
    this.cur = group.toCenter(tail, new THREE.Vector3());
    this.prev = this.cur.clone();
  }
}

class Group {
  constructor(def, center, colliders) {
    this.stiffness = def.stiffiness ?? def.stiffness ?? 1; // VRM0 alan adı yazım hatasıyla "stiffiness"
    this.drag = def.dragForce ?? 0.4; this.radius = def.hitRadius ?? 0.02;
    const gd = def.gravityDir || { x: 0, y: -1, z: 0 };
    this.gravity = new THREE.Vector3(gd.x, gd.y, gd.z).multiplyScalar(def.gravityPower || 0);
    this.center = center; this.colliders = colliders; this.joints = [];
    this.centerInv = new THREE.Matrix4();
  }
  toCenter(world, out) { return this.center ? out.copy(world).applyMatrix4(_m.copy(this.center.matrixWorld).invert()) : out.copy(world); }
}

export class SpringBones {
  /** @param {Object} vrmExt  glTF JSON'daki extensions.VRM
   *  @param {(i:number)=>THREE.Object3D} node  düğüm indeksinden sahne nesnesi */
  constructor(vrmExt, node, root) {
    this.root = root; this.groups = []; this.acc = 0; this.enabled = true;
    const sa = vrmExt?.secondaryAnimation; if (!sa) return;
    root.updateMatrixWorld(true);
    const colGroups = (sa.colliderGroups || []).map((cg) => {
      const n = node(cg.node);
      return (cg.colliders || []).map((c) => ({ node: n, offset: new THREE.Vector3(c.offset.x, c.offset.y, c.offset.z), radius: c.radius, pos: new THREE.Vector3() }));
    });
    this.colliders = colGroups.flat();
    for (const def of sa.boneGroups || []) {
      const center = def.center >= 0 ? node(def.center) : null;
      const cols = (def.colliderGroups || []).flatMap((i) => colGroups[i] || []);
      const g = new Group(def, center, cols);
      const seen = new Set();
      for (const bi of def.bones || []) this._setup(node(bi), g, seen);
      if (g.joints.length) this.groups.push(g);
    }
    this.jointCount = this.groups.reduce((s, g) => s + g.joints.length, 0);
  }
  _setup(bone, g, seen) {
    if (!bone || seen.has(bone)) return; seen.add(bone);
    let tail;
    if (bone.children.length === 0) {
      // uç kemik: ebeveynden gelen yönde 7 cm'lik sanal kuyruk
      const wp = bone.getWorldPosition(new THREE.Vector3()), pp = bone.parent.getWorldPosition(new THREE.Vector3());
      const wt = wp.clone().add(wp.clone().sub(pp).normalize().multiplyScalar(0.07));
      tail = bone.worldToLocal(wt);
    } else {
      const c = bone.children[0]; tail = c.position.clone().multiply(c.scale);
    }
    if (tail.lengthSq() > 1e-10) g.joints.push(new Joint(bone, tail, g));
    for (const c of bone.children) this._setup(c, g, seen);
  }
  /** Animasyon karıştırıcısı güncellendikten ve kök konumu ayarlandıktan sonra çağrılır. */
  update(dt) {
    if (!this.enabled || !this.groups.length) return;
    this.acc = Math.min(this.acc + dt, STEP * MAX_STEPS);
    if (this.acc < STEP) return;
    this.root.updateMatrixWorld(true);
    for (const c of this.colliders) c.pos.copy(c.offset).applyMatrix4(c.node.matrixWorld);
    while (this.acc >= STEP) { this.acc -= STEP; for (const g of this.groups) this._step(g, STEP); }
  }
  _step(g, dt) {
    const cm = g.center ? g.center.matrixWorld : null;
    if (cm) g.centerInv.copy(cm).invert();
    for (const j of g.joints) {
      const b = j.bone, parent = b.parent;
      // güncel kemik dünya matrisi (ebeveyn bu adımda zaten güncellendi)
      b.matrix.compose(b.position, j.rest, b.scale); b.matrixWorld.multiplyMatrices(parent.matrixWorld, b.matrix);
      _head.setFromMatrixPosition(b.matrixWorld);
      parent.matrixWorld.decompose(_v, _pq, _v2);
      _cur.copy(j.cur); _prev.copy(j.prev); if (cm) { _cur.applyMatrix4(cm); _prev.applyMatrix4(cm); }
      _rq.copy(_pq).multiply(j.rest);
      _from.copy(j.axis).applyQuaternion(_rq);
      _next.copy(_cur).addScaledVector(_v.subVectors(_cur, _prev), 1 - g.drag)
        .addScaledVector(_from, g.stiffness * dt).addScaledVector(g.gravity, dt);
      _next.sub(_head).normalize().multiplyScalar(j.length).add(_head);
      for (const c of g.colliders) {
        const r = g.radius + c.radius;
        if (_next.distanceToSquared(c.pos) <= r * r) {
          _v.subVectors(_next, c.pos).normalize().multiplyScalar(r).add(c.pos);
          _next.copy(_v).sub(_head).normalize().multiplyScalar(j.length).add(_head);
        }
      }
      if (!Number.isFinite(_next.x + _next.y + _next.z)) { _next.copy(_from).multiplyScalar(j.length).add(_head); _cur.copy(_next); }
      j.prev.copy(_cur); j.cur.copy(_next); if (cm) { j.prev.applyMatrix4(g.centerInv); j.cur.applyMatrix4(g.centerInv); }
      // dünya dönüşü = (dinlenme yönü → yeni kuyruk yönü) * ebeveyn * dinlenme; yerel dönüşe çevir
      _v.subVectors(_next, _head).normalize();
      _q.setFromUnitVectors(_from, _v).multiply(_rq);
      b.quaternion.copy(_pq.invert().multiply(_q));
      b.matrix.compose(b.position, b.quaternion, b.scale); b.matrixWorld.multiplyMatrices(parent.matrixWorld, b.matrix);
    }
  }
  /** Işınlanma / yeniden doğma sonrası birikmiş ataleti sıfırlar. */
  reset() {
    this.root.updateMatrixWorld(true);
    for (const g of this.groups) for (const j of g.joints) {
      j.bone.quaternion.copy(j.rest); j.bone.updateMatrixWorld(true);
      const t = j.bone.localToWorld(j.axis.clone().multiplyScalar(j.length));
      g.toCenter(t, j.cur); j.prev.copy(j.cur);
    }
  }
}
