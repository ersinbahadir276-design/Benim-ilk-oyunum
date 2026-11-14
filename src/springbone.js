// VRM 0.x "secondaryAnimation" yay kemikleri: kahramanın saçı ve ceket eteği için ikincil hareket.
// UniVRM'in VRMSpringBone algoritmasının sade bir uyarlaması (Verlet kuyruk + küre çarpıştırıcılar).
// Animasyon kliplerinde bu kemikler yoktur; karıştırıcı (mixer) güncellemesinden SONRA çalıştırılır.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3();
const LEAF_TAIL = 0.07; // çocuksuz uç kemik için sanal kuyruk uzunluğu (UniVRM ile aynı)
const MAX_DT = 1 / 20;

class Joint {
  constructor(bone, child, group) {
    this.bone = bone; this.g = group;
    this.initLocalQ = bone.quaternion.clone();
    // kemik yerel uzayında kuyruğun yönü ve uzunluğu
    this.localTail = child ? child.position.clone() : bone.position.clone().normalize().multiplyScalar(LEAF_TAIL);
    if (this.localTail.lengthSq() < 1e-10) this.localTail.set(0, LEAF_TAIL, 0);
    this.axis = this.localTail.clone().normalize();
    this.curTail = new THREE.Vector3(); this.prevTail = new THREE.Vector3(); this.length = 0;
  }
  reset() {
    this.bone.quaternion.copy(this.initLocalQ); this.bone.updateMatrixWorld(true);
    this.curTail.copy(this.localTail).applyMatrix4(this.bone.matrixWorld); this.prevTail.copy(this.curTail);
    this.length = this.curTail.distanceTo(_v.setFromMatrixPosition(this.bone.matrixWorld));
  }
}

export class SpringBones {
  /**
   * @param groups [{ joints:[{bone, child}], stiffness, gravityPower, gravityDir, drag, hitRadius, colliders:[{node, offset, radius}] }]
   * @param center Kuyruklar bu nesnenin yerel uzayında tutulur (karakter kökü). Böylece koşu/dönüş gibi tüm-gövde
   *   hareketi zinciri savurmaz; bunun yerine gövde hızından türetilen "hava direnci" (wind) uygulanır.
   */
  constructor(groups, { center = null, wind = 0.06 } = {}) {
    this.joints = []; this.colliders = []; this.enabled = true; this.center = center; this.wind = wind;
    this.step = 1 / 60; this.acc = 0; this.vel = new THREE.Vector3(); this.lastCenter = null;
    this.toWorld = new THREE.Matrix4(); this.toCenter = new THREE.Matrix4();
    for (const g of groups) {
      const grp = { stiffness: g.stiffness, gravity: g.gravityDir.clone().normalize().multiplyScalar(g.gravityPower), drag: g.drag, hitRadius: g.hitRadius, colliders: g.colliders, maxAngle: g.maxAngle ?? Math.PI };
      for (const c of g.colliders) if (!this.colliders.includes(c)) this.colliders.push(c);
      for (const j of g.joints) this.joints.push(new Joint(j.bone, j.child, grp));
    }
    // ebeveyn önce gelecek şekilde sırala (zincirler yukarıdan aşağı çözülür)
    const depth = (o) => { let d = 0; while (o.parent) { d++; o = o.parent; } return d; };
    this.joints.sort((a, b) => depth(a.bone) - depth(b.bone));
    for (const c of this.colliders) c.world = new THREE.Vector3();
    this.reset();
  }
  _space() {
    if (this.center) { this.toWorld.copy(this.center.matrixWorld); this.toCenter.copy(this.toWorld).invert(); }
    else { this.toWorld.identity(); this.toCenter.identity(); }
  }
  reset() {
    this._space();
    for (const j of this.joints) { j.reset(); j.curTail.applyMatrix4(this.toCenter); j.prevTail.copy(j.curTail); }
    this.vel.set(0, 0, 0); this.lastCenter = null; this.acc = 0;
  }

  update(dt) {
    if (!this.enabled || dt <= 0) return;
    dt = Math.min(dt, MAX_DT);
    this._space();
    // gövde hızı (dünya) → hava direnci
    const cp = _v.setFromMatrixPosition(this.toWorld);
    if (this.lastCenter) {
      const jump = cp.distanceTo(this.lastCenter);
      if (jump > 3) this.reset(); // ışınlanma
      else this.vel.lerp(_v2.subVectors(cp, this.lastCenter).divideScalar(dt), Math.min(1, dt * 8));
    }
    this.lastCenter = (this.lastCenter || new THREE.Vector3()).copy(cp);
    for (const c of this.colliders) {
      c.world.copy(c.offset).applyMatrix4(c.node.matrixWorld);
      c.node.matrixWorld.decompose(_v, _q, _s); c.worldRadius = c.radius * Math.max(_s.x, _s.y, _s.z);
    }
    // sabit adımlı çözüm (kare hızından bağımsız davranış); en fazla 4 alt adım
    this.acc = Math.min(this.acc + dt, this.step * 4);
    const n = Math.max(1, Math.floor(this.acc / this.step)); this.acc -= n * this.step; if (this.acc < 0) this.acc = 0;
    for (let i = 0; i < n; i++) this._solve(this.step, i === n - 1);
  }

  _solve(dt, last) {
    const wind = _windV.copy(this.vel).multiplyScalar(-this.wind * dt);
    for (const j of this.joints) {
      const b = j.bone, g = j.g, parent = b.parent;
      b.quaternion.copy(j.initLocalQ); b.updateMatrixWorld(false);
      const head = _head.setFromMatrixPosition(b.matrixWorld);
      const cur = _cur.copy(j.curTail).applyMatrix4(this.toWorld), prev = _prev.copy(j.prevTail).applyMatrix4(this.toWorld);
      parent.getWorldQuaternion(_q); // ebeveyn dünya dönüşü
      const restRot = _q2.copy(_q).multiply(j.initLocalQ); // dinlenme hâlindeki dünya dönüşü
      const restDir = _v2.copy(j.axis).applyQuaternion(restRot);
      const next = _next.copy(cur)
        .addScaledVector(_s.subVectors(cur, prev), 1 - g.drag)
        .addScaledVector(restDir, g.stiffness * dt)
        .addScaledVector(g.gravity, dt)
        .add(wind);
      next.sub(head).normalize().multiplyScalar(j.length).add(head);
      for (const c of g.colliders) {
        const r = g.hitRadius + c.worldRadius;
        if (next.distanceToSquared(c.world) <= r * r) {
          const nn = _s.subVectors(next, c.world).normalize();
          next.copy(c.world).addScaledVector(nn, r).sub(head).normalize().multiplyScalar(j.length).add(head);
        }
      }
      // dinlenme yönünden yeni kuyruk yönüne dönüş (açı sınırı: kumaş gövdenin içinden dönüp geçmesin)
      const want = _s.subVectors(next, head).normalize();
      _dq.setFromUnitVectors(restDir, want);
      const ang = 2 * Math.acos(Math.min(1, Math.abs(_dq.w)));
      if (ang > g.maxAngle) {
        _dq.slerp(_idq, 1 - g.maxAngle / ang);
        next.copy(restDir).applyQuaternion(_dq).multiplyScalar(j.length).add(head);
      }
      j.prevTail.copy(j.curTail); j.curTail.copy(next).applyMatrix4(this.toCenter);
      const world = _dq.multiply(restRot);
      b.quaternion.copy(_q.invert().multiply(world));
      b.updateMatrixWorld(true);
    }
  }
  /** Kuyruğun kemik başına olan dünya uzaklığı (test/hata ayıklama). */
  tailWorld(j, out = new THREE.Vector3()) { return out.copy(j.curTail).applyMatrix4(this.center ? this.center.matrixWorld : this.toWorld); }
}
const _windV = new THREE.Vector3(), _head = new THREE.Vector3(), _cur = new THREE.Vector3(), _prev = new THREE.Vector3(), _next = new THREE.Vector3(), _dq = new THREE.Quaternion(), _idq = new THREE.Quaternion();

// VRM 0.x uzantısını okuyup SpringBones kurar. GLTFLoader sonucu (gltf) ile çağrılır.
export async function springBonesFromVRM0(gltf, { center = null, wind, extraColliders, tune } = {}) {
  const sa = gltf.parser.json.extensions?.VRM?.secondaryAnimation;
  if (!sa) return null;
  const node = (i) => gltf.parser.getDependency('node', i);
  const colliderGroups = [];
  for (const cg of sa.colliderGroups || []) {
    const n = await node(cg.node);
    // VRM0 Unity koordinatı: ofsetin z ekseni ters
    colliderGroups.push((cg.colliders || []).map((c) => ({ node: n, offset: new THREE.Vector3(c.offset?.x || 0, c.offset?.y || 0, -(c.offset?.z || 0)), radius: c.radius || 0 })));
  }
  const groups = [];
  for (const bg of sa.boneGroups || []) {
    const joints = [];
    const walk = (bone) => {
      const kids = bone.children.filter((c) => !c.isMesh);
      joints.push({ bone, child: kids[0] || null });
      for (const k of kids) walk(k);
    };
    for (const i of bg.bones || []) walk(await node(i));
    const gd = bg.gravityDir || { x: 0, y: -1, z: 0 };
    groups.push({
      joints, stiffness: bg.stiffiness ?? 1, gravityPower: bg.gravityPower ?? 0, gravityDir: new THREE.Vector3(gd.x, gd.y, -gd.z),
      drag: bg.dragForce ?? 0.4, hitRadius: bg.hitRadius ?? 0.02, colliders: (bg.colliderGroups || []).flatMap((k) => colliderGroups[k] || []),
    });
    const bones = joints.map((j) => j.bone);
    if (extraColliders) groups.at(-1).colliders.push(...extraColliders(bones));
    if (tune) tune(groups.at(-1), bones);
  }
  return new SpringBones(groups, { center, wind });
}
