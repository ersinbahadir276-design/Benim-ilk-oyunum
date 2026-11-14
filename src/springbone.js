// VRM 0.x "secondaryAnimation" yay kemikleri (saç, ceket eteği) için hafif fizik.
// UniVRM'deki Verlet tabanlı algoritmanın sadeleştirilmiş, three.js uyarlaması:
//   sonraki_uç = uç + atalet*(1-sürtünme) + sertlik*dinlenme_yönü + yerçekimi, sonra kemik boyuna sabitlenir
//   ve küre çarpıştırıcılardan (baş, göğüs, kollar) dışarı itilir.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
const _m = new THREE.Matrix4(), _s = new THREE.Vector3();
const STEP = 1 / 60; // sabit adım: düşük FPS'te (telefon) bile kararlı
const MIN_DRAG = 0.2;
const MAX_ANGLE = 1.2; // ~70°
const _IDENT = new THREE.Quaternion();

class Joint {
  constructor(bone, child, group, center) {
    this.bone = bone; this.group = group; this.center = center;
    this.initLocalRot = bone.quaternion.clone();
    bone.updateMatrixWorld(true);
    const bonePos = bone.getWorldPosition(new THREE.Vector3());
    if (child) {
      this.localTail = child.position.clone();
    } else { // uç kemik: UniVRM gibi kemik yönünde 7 cm sanal uç
      this.localTail = bone.position.clone().normalize().multiplyScalar(0.07);
      if (this.localTail.lengthSq() < 1e-8) this.localTail.set(0, -0.07, 0);
    }
    this.boneAxis = this.localTail.clone().normalize();
    const tailW = this.localTail.clone().applyMatrix4(bone.matrixWorld);
    this.length = tailW.distanceTo(bonePos);
    this.cur = this.toCenter(tailW.clone()); this.prev = this.cur.clone();
  }
  toCenter(v) { return this.center ? v.applyMatrix4(_m.copy(this.center.matrixWorld).invert()) : v; }
  fromCenter(v) { return this.center ? v.applyMatrix4(this.center.matrixWorld) : v; }
  reset() {
    this.bone.quaternion.copy(this.initLocalRot); this.bone.updateMatrixWorld(true);
    const t = this.localTail.clone().applyMatrix4(this.bone.matrixWorld);
    this.cur = this.toCenter(t); this.prev = this.cur.clone();
  }
  update(dt, colliders) {
    const g = this.group, bone = this.bone, parent = bone.parent;
    parent.updateMatrixWorld(false);
    parent.matrixWorld.decompose(_v2, _q, _s);
    const scale = (_s.x + _s.y + _s.z) / 3;
    // bone'un dünya konumu (dönüşünden bağımsız)
    const pos = new THREE.Vector3().copy(bone.position).applyMatrix4(parent.matrixWorld);
    const rest = _q2.copy(_q).multiply(this.initLocalRot); // ebeveyn dünya dönüşü * ilk yerel dönüş
    // Verlet adımı (merkez uzayında tutulan uçlar dünya uzayına çevrilir)
    const cur = this.fromCenter(this.cur.clone()), prev = this.fromCenter(this.prev.clone());
    const next = cur.clone()
      .add(_v.subVectors(cur, prev).multiplyScalar(1 - g.drag))
      .add(_v.copy(this.boneAxis).applyQuaternion(rest).multiplyScalar(g.stiffness * dt * scale))
      .add(_v.copy(g.gravityDir).multiplyScalar(g.gravityPower * dt * scale));
    const len = this.length;
    next.sub(pos).normalize().multiplyScalar(len).add(pos);
    // çarpışma: saç başın / göğsün içine girmesin
    for (const c of colliders) {
      const r = g.hitRadius * scale + c.r;
      const d = next.distanceTo(c.p);
      if (d < r && d > 1e-6) {
        next.sub(c.p).multiplyScalar(r / d).add(c.p);
        next.sub(pos).normalize().multiplyScalar(len).add(pos);
      }
    }
    // dinlenme yönünden yeni uç yönüne dönüş (aşırı savrulma açıyla sınırlanır: etek bacakların içine dönmesin)
    const from = _v.copy(this.boneAxis).applyQuaternion(rest).normalize();
    const to = next.sub(pos).normalize();
    const swing = new THREE.Quaternion().setFromUnitVectors(from, to);
    const ang = 2 * Math.acos(Math.min(1, Math.abs(swing.w)));
    if (ang > g.maxAngle) {
      swing.slerp(_IDENT, 1 - g.maxAngle / ang);
      to.copy(from).applyQuaternion(swing);
    }
    next.copy(to).multiplyScalar(len).add(pos);
    this.prev.copy(this.cur); this.cur = this.toCenter(next);
    const world = swing.multiply(rest);
    bone.quaternion.copy(_q.invert().multiply(world)); // yerel = ebeveyn⁻¹ * dünya
    bone.updateMatrixWorld(true);
  }
}

export class SpringBones {
  /** gltf: GLTFLoader sonucu (parser.json içinde VRM uzantısı olmalı) */
  static async fromGLTF(gltf) {
    const sa = gltf.parser.json.extensions?.VRM?.secondaryAnimation;
    if (!sa) return null;
    const node = (i) => gltf.parser.getDependency('node', i);
    const colliderGroups = [];
    for (const cg of sa.colliderGroups || []) {
      const obj = await node(cg.node);
      // VRM0'da çarpıştırıcı ofsetinin z ekseni ters yazılır
      colliderGroups.push((cg.colliders || []).map((c) => ({ obj, off: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), radius: c.radius, p: new THREE.Vector3(), r: 0 })));
    }
    const sb = new SpringBones();
    for (const bg of sa.boneGroups || []) {
      const group = {
        stiffness: bg.stiffiness ?? bg.stiffness ?? 1,
        drag: Math.max(MIN_DRAG, bg.dragForce ?? 0.4), // sürtünmesiz (0) etek koşu ritmiyle rezonansa girip sönmüyordu
        gravityPower: bg.gravityPower ?? 0, gravityDir: new THREE.Vector3(bg.gravityDir?.x ?? 0, bg.gravityDir?.y ?? -1, bg.gravityDir?.z ?? 0),
        hitRadius: bg.hitRadius ?? 0.02,
        colliders: (bg.colliderGroups || []).flatMap((i) => colliderGroups[i] || []),
        maxAngle: MAX_ANGLE, bones: [],
      };
      const center = bg.center >= 0 ? await node(bg.center) : null;
      for (const bi of bg.bones || []) {
        const root = await node(bi);
        const walk = (b) => {
          const child = b.children.find((c) => c.isBone || c.type === 'Object3D' || c.isObject3D);
          sb.joints.push(new Joint(b, child || null, group, center));
          for (const c of b.children) walk(c);
        };
        walk(root); group.bones.push(root);
      }
      sb.groups.push(group);
    }
    sb.colliders = colliderGroups.flat();
    return sb;
  }
  constructor() { this.joints = []; this.groups = []; this.colliders = []; this.acc = 0; this.enabled = true; }
  updateColliders() {
    for (const c of this.colliders) {
      c.obj.matrixWorld.decompose(_v2, _q, _s);
      c.p.copy(c.off).applyMatrix4(c.obj.matrixWorld);
      c.r = c.radius * (_s.x + _s.y + _s.z) / 3;
    }
  }
  /** Animasyon ve kök dönüşü uygulandıktan SONRA çağrılır. */
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    this.acc = Math.min(this.acc + dt, STEP * 4); // büyük takılmalarda (sekme değişimi) patlamayı önle
    while (this.acc >= STEP) {
      this.acc -= STEP;
      this.updateColliders();
      for (const j of this.joints) j.update(STEP, j.group.colliders);
    }
  }
  /**
   * Modelde tanımlı olmayan ek kapsül çarpıştırıcı (kemik boyunca küre dizisi). Örn. ceket eteği için
   * uyluklar: VRoid eteği bacaklarla çarpıştırmadığı için depar sırasında etek bacakların içinden geçiyordu.
   * filter(group) true dönen gruplara eklenir; dönüş: eklenen çarpıştırıcı sayısı.
   */
  addBoneCapsule(bone, radius, count, filter) {
    const child = bone.children.find((c) => c.isBone) || bone.children[0];
    if (!child) return 0;
    const list = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      list.push({ obj: bone, off: child.position.clone().multiplyScalar(t), radius, p: new THREE.Vector3(), r: 0 });
    }
    for (const g of this.groups) if (filter(g)) g.colliders.push(...list);
    this.colliders.push(...list);
    return list.length;
  }
  /** Bir grubun en büyük savrulma açısını (radyan) ayarla. */
  setMaxAngle(filter, rad) { for (const g of this.groups) if (filter(g)) g.maxAngle = rad; }
  /** Işınlanma / yeniden doğma sonrası uçları dinlenme konumuna al (saç savrulmasın). */
  reset() { for (const j of this.joints) j.reset(); }
}
