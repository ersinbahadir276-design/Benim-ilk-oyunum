// Kahraman için VRM 0.x "ikincil" sistemleri: saç/palto yay kemikleri (spring bone),
// yüz ifadeleri (göz kırpma, öfke, acı, sevinç) ve başın yakındaki ilgi noktasına dönmesi.
// Standart GLTFLoader VRM uzantısını okumaz; bu modül uzantının JSON'unu doğrudan yorumlar.
import * as THREE from 'three';

const _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _m = new THREE.Matrix4();
// VRM0 Unity koordinatlarıyla dışa aktarılır: Z ekseni ters.
const vrm0Vec = (o) => new THREE.Vector3(o.x, o.y, -o.z);

class SpringJoint {
  constructor(bone, child, group, center) {
    this.bone = bone; this.child = child; this.g = group; this.center = center;
    this.initLocalQ = bone.quaternion.clone();
    // uç noktası (yerel): gerçek çocuk kemik ya da VRM0 kuralı gereği 7 cm'lik sanal uç
    this.localTail = child ? child.position.clone() : bone.position.clone().normalize().multiplyScalar(0.07);
    this.boneAxis = this.localTail.clone().normalize();
    bone.updateMatrixWorld(true);
    const tailW = this.localTail.clone().applyMatrix4(bone.matrixWorld);
    this.cur = this.toCenter(tailW.clone()); this.prev = this.cur.clone();
  }
  toCenter(w) { return this.center ? w.applyMatrix4(_m.copy(this.center.matrixWorld).invert()) : w; }
  fromCenter(c) { return this.center ? c.applyMatrix4(this.center.matrixWorld) : c; }
  reset() { this.bone.quaternion.copy(this.initLocalQ); this.bone.updateMatrixWorld(true); const w = this.localTail.clone().applyMatrix4(this.bone.matrixWorld); this.cur.copy(this.toCenter(w)); this.prev.copy(this.cur); }
  update(dt, colliders) {
    const bone = this.bone, parent = bone.parent, g = this.g;
    const head = bone.getWorldPosition(new THREE.Vector3());
    const scale = _v3.setFromMatrixScale(bone.matrixWorld).x;
    const len = this.localTail.length() * scale;
    // ebeveyn dünya dönüşü × ilk yerel dönüş: kemiğin dinlenme yönü
    const restW = parent.getWorldQuaternion(_q).multiply(this.initLocalQ);
    const cur = this.fromCenter(this.cur.clone()), prev = this.fromCenter(this.prev.clone());
    const next = cur.clone()
      .add(_v.subVectors(cur, prev).multiplyScalar(1 - g.drag))
      .add(_v.copy(this.boneAxis).applyQuaternion(restW).multiplyScalar(g.stiffness * dt))
      .add(_v.copy(g.gravityDir).multiplyScalar(g.gravityPower * dt));
    next.sub(head).normalize().multiplyScalar(len).add(head);
    for (const c of colliders) { // kürelerden dışarı it
      const r = g.hitRadius + c.r, d = next.distanceTo(c.p);
      if (d < r) { next.sub(c.p).normalize().multiplyScalar(r).add(c.p); next.sub(head).normalize().multiplyScalar(len).add(head); }
    }
    this.prev.copy(this.toCenter(cur)); this.cur.copy(this.toCenter(next.clone()));
    // kemiği yeni uç yönüne çevir
    const want = next.sub(head).applyQuaternion(_q2.copy(restW).invert()).normalize();
    // salınım konisi: dinlenme yönünden en fazla g.maxAngle (palto bacakların üstüne savrulmasın)
    const cos = want.dot(this.boneAxis);
    if (cos < Math.cos(g.maxAngle)) {
      const perp = _v.copy(want).addScaledVector(this.boneAxis, -cos);
      if (perp.lengthSq() < 1e-8) perp.set(1, 0, 0).cross(this.boneAxis);
      perp.normalize();
      want.copy(this.boneAxis).multiplyScalar(Math.cos(g.maxAngle)).addScaledVector(perp, Math.sin(g.maxAngle));
      const clamped = want.clone().applyQuaternion(restW).multiplyScalar(len).add(head);
      this.cur.copy(this.toCenter(clamped));
    }
    bone.quaternion.copy(this.initLocalQ).multiply(_q2.setFromUnitVectors(this.boneAxis, want));
    bone.updateMatrixWorld(true);
  }
}

// opts.minDrag: modelde sönümsüz (drag 0) tanımlı gruplar koşarken rezonansa girip ters dönüyordu.
// opts.legColliders: palto/etek gruplarına uyluk kürelerinden çarpıştırıcı ekler (modelde yok).
export class SpringBones {
  constructor(vrmExt, nodes, opts = {}) {
    const { minDrag = 0.2, maxAngle = 1.1, clothMaxAngle = 0.75, legColliders = [] } = opts;
    const sa = vrmExt.secondaryAnimation || { boneGroups: [], colliderGroups: [] };
    this.colliderGroups = sa.colliderGroups.map((cg) => ({ node: nodes[cg.node], spheres: cg.colliders.map((c) => ({ off: vrm0Vec(c.offset), r: c.radius })) }));
    this.joints = []; this.groups = [];
    for (const bg of sa.boneGroups) {
      const isCloth = bg.bones.some((b) => /coat|skirt|cloth|tops/i.test(nodes[b]?.name || '')) || /coat|skirt|tops/i.test(bg.comment || '');
      const g = {
        stiffness: bg.stiffiness ?? bg.stiffness ?? 1, drag: Math.max(minDrag, bg.dragForce ?? 0.4), gravityPower: bg.gravityPower ?? 0, maxAngle: isCloth ? clothMaxAngle : maxAngle,
        gravityDir: vrm0Vec(bg.gravityDir || { x: 0, y: -1, z: 0 }).normalize(), hitRadius: bg.hitRadius ?? 0.02,
        colliders: (bg.colliderGroups || []).map((i) => this.colliderGroups[i]).filter(Boolean),
      };
      if (isCloth) for (const leg of legColliders) { this.colliderGroups.push(leg); g.colliders.push(leg); }
      this.groups.push(g);
      const center = bg.center >= 0 ? nodes[bg.center] : null;
      const walk = (bone) => {
        const kids = bone.children.filter((c) => !c.isMesh);
        this.joints.push({ j: new SpringJoint(bone, kids[0] || null, g, center), g });
        kids.forEach(walk);
      };
      for (const b of bg.bones) if (nodes[b]) walk(nodes[b]);
    }
    // hiyerarşi sırası: ebeveyn önce güncellensin
    const depth = (o) => { let d = 0; while (o.parent) { d++; o = o.parent; } return d; };
    this.joints.sort((a, b) => depth(a.j.bone) - depth(b.j.bone));
    this.enabled = true; this._worldCols = new Map();
  }
  reset() { for (const { j } of this.joints) j.reset(); }
  update(dt) {
    if (!this.enabled || !this.joints.length) return;
    dt = Math.min(dt, 1 / 30);
    // çarpıştırıcıların dünya konumları (her karede bir kez)
    for (const cg of this.colliderGroups) {
      const s = _v2.setFromMatrixScale(cg.node.matrixWorld).x;
      this._worldCols.set(cg, cg.spheres.map((sp) => ({ p: sp.off.clone().applyMatrix4(cg.node.matrixWorld), r: sp.r * s })));
    }
    for (const { j, g } of this.joints) {
      const cols = []; for (const cg of g.colliders) cols.push(...this._worldCols.get(cg));
      j.update(dt, cols);
    }
  }
}

// Yüz ifadeleri: VRM blendShapeMaster gruplarını morf hedeflerine bağlar.
export class Face {
  constructor(vrmExt, meshesByIndex) {
    this.groups = {};
    for (const bg of vrmExt.blendShapeMaster?.blendShapeGroups || []) {
      const key = (bg.presetName && bg.presetName !== 'unknown' ? bg.presetName : bg.name).toLowerCase();
      this.groups[key] = bg.binds.map((b) => ({ meshes: meshesByIndex[b.mesh] || [], index: b.index, w: b.weight / 100 }));
    }
    this.values = {}; this.targets = {}; this.blinkT = 2 + Math.random() * 3; this.blink = 0; this.hold = {};
  }
  has(name) { return !!this.groups[name]; }
  // name: ifade, w: hedef ağırlık, sec: bu süre boyunca tut (sonra söner)
  set(name, w, sec = 0) { if (!this.groups[name]) return; this.targets[name] = w; if (sec) this.hold[name] = sec; }
  update(dt) {
    // rastgele göz kırpma; güçlü bir ifade varken (gözler zaten kısık) kırpma bastırılır
    this.blinkT -= dt;
    if (this.blinkT <= 0) { this.blink = 0.16; this.blinkT = 1.8 + Math.random() * 4 + (Math.random() < 0.2 ? -1.5 : 0); }
    const strong = Math.max(this.values.joy || 0, this.values.fun || 0, this.values.sorrow || 0);
    const b = this.blink > 0 ? Math.sin((1 - this.blink / 0.16) * Math.PI) : 0; this.blink -= dt;
    this.targets.blink = b * (1 - strong);
    for (const k of Object.keys(this.hold)) { this.hold[k] -= dt; if (this.hold[k] <= 0) { delete this.hold[k]; this.targets[k] = 0; } }
    const sum = new Map();
    for (const [name, binds] of Object.entries(this.groups)) {
      const t = this.targets[name] || 0, v0 = this.values[name] || 0;
      const v = name === 'blink' ? t : v0 + (t - v0) * Math.min(1, dt * 10);
      this.values[name] = v;
      for (const bd of binds) for (const m of bd.meshes) {
        const key = m.uuid + ':' + bd.index; sum.set(key, { m, i: bd.index, w: Math.min(1, (sum.get(key)?.w || 0) + v * bd.w) });
      }
    }
    for (const { m, i, w } of sum.values()) if (m.morphTargetInfluences && i < m.morphTargetInfluences.length) m.morphTargetInfluences[i] = w;
  }
}

// Baş/boyun bakışı: animasyonun üstüne sınırlı ek dönüş uygular (yumuşatılmış).
export class HeadLook {
  constructor(root, neck, head) { this.root = root; this.neck = neck; this.head = head; this.yaw = 0; this.pitch = 0; this.weight = 0; }
  update(dt, targetPos, active) {
    let wy = 0, wp = 0;
    if (targetPos && active) {
      this.head.getWorldPosition(_v);
      _v2.subVectors(targetPos, _v);
      const rootYaw = this.root.rotation.y;
      let yaw = Math.atan2(_v2.x, _v2.z) - rootYaw; yaw = Math.atan2(Math.sin(yaw), Math.cos(yaw));
      if (Math.abs(yaw) < 1.75) { // arkada kalan hedefe bakma
        wy = THREE.MathUtils.clamp(yaw, -1.0, 1.0);
        wp = THREE.MathUtils.clamp(-Math.atan2(_v2.y, Math.hypot(_v2.x, _v2.z)), -0.35, 0.45);
      }
    }
    const k = Math.min(1, dt * 5); this.yaw += (wy - this.yaw) * k; this.pitch += (wp - this.pitch) * k;
    if (Math.abs(this.yaw) < 1e-3 && Math.abs(this.pitch) < 1e-3) return;
    // boyun %40, baş %60 paylaşır
    this.apply(this.neck, this.yaw * 0.4, this.pitch * 0.4);
    this.apply(this.head, this.yaw * 0.6, this.pitch * 0.6);
  }
  apply(bone, yaw, pitch) {
    if (!bone) return;
    const ry = this.root.rotation.y;
    const right = _v3.set(Math.cos(ry), 0, -Math.sin(ry)); // kökün sağ ekseni (dünya)
    const rw = _q.setFromAxisAngle(_v.set(0, 1, 0), yaw).multiply(_q2.setFromAxisAngle(right, pitch));
    // yerel' = ebeveynDünya⁻¹ · R · ebeveynDünya · yerel
    const pw = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.premultiply(pw).premultiply(rw).premultiply(pw.invert());
    bone.updateMatrixWorld(true);
  }
}

// GLTFLoader sonucundan VRM uzantısını okuyup sistemleri kurar.
export async function setupVRMExtras(gltf, root) {
  const ext = gltf.parser.json.extensions?.VRM; if (!ext) return null;
  const json = gltf.parser.json;
  const nodes = await Promise.all(json.nodes.map((_, i) => gltf.parser.getDependency('node', i)));
  // glTF mesh indeksi → sahnedeki morflu Mesh nesneleri (çok primitifli mesh'ler Group olur)
  const meshesByIndex = {};
  json.nodes.forEach((n, i) => {
    if (n.mesh == null) return; const o = nodes[i]; const list = (meshesByIndex[n.mesh] ||= []);
    o.traverse((c) => { if (c.isMesh && c.morphTargetInfluences) list.push(c); });
  });
  root.updateMatrixWorld(true);
  // uyluk boyunca 3 küre (kalça, orta, diz): paltonun bacaklardan geçmesini önler
  const legColliders = ['L', 'R'].map((S) => {
    const thigh = root.getObjectByName(`J_Bip_${S}_UpperLeg`), knee = root.getObjectByName(`J_Bip_${S}_LowerLeg`);
    if (!thigh || !knee) return null;
    return { node: thigh, spheres: [0.1, 0.5, 0.9].map((t, i) => ({ off: knee.position.clone().multiplyScalar(t), r: [0.085, 0.075, 0.065][i] })) };
  }).filter(Boolean);
  return { springs: new SpringBones(ext, nodes, { legColliders }), face: new Face(ext, meshesByIndex) };
}
