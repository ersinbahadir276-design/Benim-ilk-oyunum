// VRM 0.x "secondaryAnimation" yay kemikleri: kahramanın saç tutamları ve ceket eteği için
// hafif Verlet fiziği. Veri (sertlik, sürükleme, yerçekimi, çarpışma küreleri) doğrudan
// hero.glb içindeki VRM uzantısından okunur; elle ayar yapılmaz.
//
// VRM'deki "center" (VRoid'de Root kemiği) uzayında çözülür: karakterin dünyada yer değiştirmesi
// saçı koparmaz, gövde animasyonu (sekme, dönüş, kol/bacak) salınım üretir. Koşu hızı ayrıca
// sınırlı bir "rüzgâr/sürükleme" kuvveti olarak eklenir; böylece koşarken saç ve etek geriye savrulur.
// Işınlanma (yeniden doğma, test yerleştirmesi) algılanınca durum sıfırlanır.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _head = new THREE.Vector3(), _next = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _s = new THREE.Vector3();
const STEP = 1 / 60;          // sabit fizik adımı (kare hızından bağımsız davranış)
const MAX_STEPS = 4;          // düşük FPS'te (mobil) en fazla 4 alt adım
const TELEPORT = 1.5;         // bir karede bundan fazla kayan kök = ışınlanma → sıfırla
const WIND = 0.06, WIND_MAX = 0.45; // hız (m/s) → geriye itme (kemik boyuyla ölçekli); depar ≈ 0.43 ≈ sertliğin yarısı
const MAX_SWING = 65 * Math.PI / 180; // eklem başına dinlenme yönünden en fazla sapma: saçın yüze/eteğin gövdeye katlanmasını önler
const _rest = new THREE.Vector3(), _dir = new THREE.Vector3(), _qs = new THREE.Quaternion(), _qi = new THREE.Quaternion();
const MIN_DRAG = 0.2;         // VRoid eteği dragForce=0 ile gelir: sönümsüz sallanıp bacak salınımıyla havaya kalkıyordu
const _m = new THREE.Matrix4(), _vel = new THREE.Vector3();

class Joint {
  constructor(bone, child, g, colliders) {
    this.bone = bone; this.child = child; this.g = g; this.colliders = colliders;
    this.restQ = bone.quaternion.clone();
    // yaprak kemikte (çocuğu yok) VRM0 kuralı: kemik yönünde 7 cm sanal uç
    this.localTail = child ? child.position.clone() : bone.position.clone().normalize().multiplyScalar(0.07);
    this.axis = this.localTail.clone().normalize();
    this.tail = new THREE.Vector3(); this.prev = new THREE.Vector3(); this.len = 0; this.wind = null;
  }
  reset() {
    this.bone.quaternion.copy(this.restQ);
    this.bone.updateMatrixWorld(true);
    this.tail.copy(this.localTail).applyMatrix4(this.bone.matrixWorld); this.prev.copy(this.tail);
    this.len = _v.setFromMatrixPosition(this.bone.matrixWorld).distanceTo(this.tail);
  }
  step(dt) {
    const b = this.bone, g = this.g;
    b.quaternion.copy(this.restQ); b.updateMatrixWorld(false);
    _head.setFromMatrixPosition(b.matrixWorld);
    // ebeveyn dünya dönüşü × dinlenme dönüşü (ölçeksiz)
    b.parent.matrixWorld.decompose(_v2, _q, _s); _q.multiply(this.restQ);
    _next.copy(this.tail).sub(this.prev).multiplyScalar(1 - g.drag).add(this.tail);           // eylemsizlik
    _rest.copy(this.axis).applyQuaternion(_q);
    _next.addScaledVector(_rest, g.stiff * dt * this.len);     // dinlenme yönüne çekilme
    _next.addScaledVector(g.gravDir, g.gravPow * dt).addScaledVector(this.wind, dt * this.len); // yerçekimi + koşu rüzgârı
    _next.sub(_head).normalize().multiplyScalar(this.len).add(_head);                          // boyu koru
    for (const c of this.colliders) {                                                         // gövde/kafa kürelerinden it
      _v.copy(c.offset).applyMatrix4(c.node.matrixWorld);
      const r = c.radius * c.scale + g.hit, d = _v.distanceTo(_next);
      if (d < r) { _next.sub(_v).normalize().multiplyScalar(r).add(_v).sub(_head).normalize().multiplyScalar(this.len).add(_head); }
    }
    _dir.copy(_next).sub(_head).normalize();                                                  // salınım sınırı
    const ang = _rest.angleTo(_dir);
    if (ang > MAX_SWING) { _qs.setFromUnitVectors(_rest, _dir); _qi.identity().slerp(_qs, MAX_SWING / ang); _next.copy(_rest).applyQuaternion(_qi).multiplyScalar(this.len).add(_head); }
    this.prev.copy(this.tail); this.tail.copy(_next);
    // yeni uç yönünü yerel uzaya çevirip kemiği döndür
    _v.copy(_next).sub(_head).applyQuaternion(_q2.copy(_q).invert()).normalize();
    b.quaternion.copy(this.restQ).multiply(_q2.setFromUnitVectors(this.axis, _v));
    b.updateMatrixWorld(true);
  }
}

export class SpringBones {
  constructor(joints, root, center) {
    this.joints = joints; this.root = root; this.center = center || root; this.acc = 0; this.ready = false; this.enabled = true;
    this.lastRoot = new THREE.Vector3(); this.vel = new THREE.Vector3(); this.wind = new THREE.Vector3();
    for (const j of joints) j.wind = this.wind;
  }
  reset() {
    this.root.updateMatrixWorld(true); for (const j of this.joints) j.reset();
    this.toCenter(); this.lastRoot.setFromMatrixPosition(this.root.matrixWorld); this.vel.set(0, 0, 0); this.wind.set(0, 0, 0); this.ready = true; this.acc = 0;
  }
  // uç noktaları center uzayında saklanır; adım sırasında dünyaya açılır
  toCenter() { _m.copy(this.center.matrixWorld).invert(); for (const j of this.joints) { j.tail.applyMatrix4(_m); j.prev.applyMatrix4(_m); } }
  toWorld() { _m.copy(this.center.matrixWorld); for (const j of this.joints) { j.tail.applyMatrix4(_m); j.prev.applyMatrix4(_m); } }
  // mixer.update() ve kök konumu ayarlandıktan sonra, çizimden önce çağrılır
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    this.root.updateMatrixWorld(true);
    _v.setFromMatrixPosition(this.root.matrixWorld);
    if (!this.ready || _v.distanceTo(this.lastRoot) > TELEPORT) { this.reset(); return; }
    if (dt > 0) { _vel.copy(_v).sub(this.lastRoot).divideScalar(dt); _vel.y *= 0.3; this.vel.lerp(_vel, Math.min(1, dt * 8)); }
    this.lastRoot.copy(_v);
    this.wind.copy(this.vel).multiplyScalar(-WIND); if (this.wind.length() > WIND_MAX) this.wind.setLength(WIND_MAX);
    this.acc = Math.min(this.acc + dt, STEP * MAX_STEPS);
    if (this.acc < STEP) return;
    this.toWorld();
    while (this.acc >= STEP) { for (const j of this.joints) j.step(STEP); this.acc -= STEP; }
    this.toCenter();
    // alt adım yoksa bile kemikleri son çözülmüş durumda tut (mixer bunlara dokunmaz)
  }
  // test/hata ayıklama: tüm uçların dinlenme konumundan ortalama sapması (metre)
  deflection() {
    let s = 0; for (const j of this.joints) { _v.copy(j.localTail).applyQuaternion(j.restQ); _v2.copy(j.localTail).applyQuaternion(j.bone.quaternion); s += _v.distanceTo(_v2); } return s / (this.joints.length || 1);
  }
}

// gltf: GLTFLoader sonucu. root: karakterin hareket eden kök nesnesi.
export async function createSpringBones(gltf, root) {
  const vrm = gltf.parser.json.extensions?.VRM, sa = vrm?.secondaryAnimation;
  if (!sa) return new SpringBones([], root);
  const node = (i) => gltf.parser.getDependency('node', i);
  const scaleOf = (o) => { o.updateWorldMatrix(true, false); return o.matrixWorld.getMaxScaleOnAxis(); };
  const groups = await Promise.all((sa.colliderGroups || []).map(async (cg) => {
    const n = await node(cg.node);
    return cg.colliders.map((c) => ({ node: n, offset: new THREE.Vector3(c.offset.x, c.offset.y, -c.offset.z), radius: c.radius, scale: 1 }));
  }));
  // VRM0 çarpıştırıcı ofsetleri Unity (sol el) uzayında: z ekseni ters çevrildi. Ölçek başta bir kez alınır.
  for (const g of groups) for (const c of g) c.scale = scaleOf(c.node);
  const joints = [], seen = new Set();
  for (const bg of sa.boneGroups || []) {
    const g = { stiff: bg.stiffiness ?? 1, drag: Math.max(MIN_DRAG, bg.dragForce ?? 0.4), gravPow: bg.gravityPower ?? 0, hit: bg.hitRadius ?? 0.02,
      gravDir: new THREE.Vector3(bg.gravityDir?.x ?? 0, bg.gravityDir?.y ?? -1, -(bg.gravityDir?.z ?? 0)) };
    const cols = (bg.colliderGroups || []).flatMap((i) => groups[i] || []);
    for (const bi of bg.bones) {
      const walk = (b) => {
        if (seen.has(b)) return; seen.add(b);
        const kids = b.children.filter((c) => !c.isMesh);
        joints.push(new Joint(b, kids[0] || null, g, cols));
        for (const k of kids) walk(k);
      };
      walk(await node(bi));
    }
  }
  const ci = sa.boneGroups?.find((bg) => bg.center >= 0)?.center;
  return new SpringBones(joints, root, ci != null ? await node(ci) : root);
}
