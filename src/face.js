// Kahramanın yüzü: VRM 0.x blendshape grupları (göz kırpma, ifadeler, ağız) ve baş/göz bakışı (look-at).
// Animasyon karıştırıcısından SONRA, yay kemiklerinden ÖNCE çalışır: klibin pozunun üstüne eklenir.
import * as THREE from 'three';

const DEG = Math.PI / 180;
const UP = new THREE.Vector3(0, 1, 0);

// VRM dosyasındaki blendShapeMaster gruplarını sahnedeki morph hedeflerine bağlar.
export function blendShapesFromVRM0(gltf) {
  const ext = gltf.parser.json.extensions?.VRM;
  const groups = ext?.blendShapeMaster?.blendShapeGroups;
  if (!groups) return null;
  // VRM mesh indeksi → o mesh'in sahnedeki tüm primitive'leri (her biri ayrı SkinnedMesh)
  const byMesh = new Map();
  gltf.scene.traverse((o) => {
    if (!o.isMesh || !o.morphTargetInfluences) return;
    const a = gltf.parser.associations.get(o);
    if (a?.meshes == null) return;
    if (!byMesh.has(a.meshes)) byMesh.set(a.meshes, []);
    byMesh.get(a.meshes).push(o);
  });
  const shapes = {};
  for (const g of groups) {
    const key = (g.presetName && g.presetName !== 'unknown' ? g.presetName : g.name).toLowerCase();
    const binds = [];
    for (const b of g.binds || []) for (const m of byMesh.get(b.mesh) || []) if (b.index < m.morphTargetInfluences.length) binds.push({ m, i: b.index, w: b.weight / 100 });
    if (binds.length) shapes[key] = binds;
  }
  return Object.keys(shapes).length ? shapes : null;
}

// Bakış açısı eğrisi (VRM firstPerson.lookAt*): girdi derece → çıktı derece. Eğri doğrusal (0,0)-(1,1).
const lookRange = (o, def) => ({ x: o?.xRange || 90, y: o?.yRange ?? def });

export class HeroFace {
  constructor(gltf, root) {
    this.shapes = blendShapesFromVRM0(gltf) || {};
    const fp = gltf.parser.json.extensions?.VRM?.firstPerson || {};
    this.range = { in: lookRange(fp.lookAtHorizontalInner, 8), out: lookRange(fp.lookAtHorizontalOuter, 12), down: lookRange(fp.lookAtVerticalDown, 10), up: lookRange(fp.lookAtVerticalUp, 10) };
    const get = (n) => root.getObjectByName(n);
    this.neck = get('J_Bip_C_Neck'); this.headBone = get('J_Bip_C_Head');
    this.eyes = [get('J_Adj_L_FaceEye'), get('J_Adj_R_FaceEye')].filter(Boolean);
    this.w = {}; this.goal = {}; // ifade ağırlıkları (anlık / hedef)
    for (const k of Object.keys(this.shapes)) this.w[k] = this.goal[k] = 0;
    this.blinkT = 2 + Math.random() * 3; this.blinkP = -1; // -1: kırpmıyor; 0..1 kırpma evresi
    this.yaw = 0; this.pitch = 0; this.lookW = 0; // yumuşatılmış bakış
    this.eyeYaw = 0; this.eyePitch = 0;
    this.joyT = 0; this.surpriseT = 0; this.target = null;
    this._q = new THREE.Quaternion(); this._q2 = new THREE.Quaternion(); this._pq = new THREE.Quaternion(); this._v = new THREE.Vector3(); this._f = new THREE.Vector3(); this._ax = new THREE.Vector3();
  }
  has(name) { return !!this.shapes[name]; }
  // anlık olaylar
  joy(t = 2.2) { this.joyT = Math.max(this.joyT, t); }
  surprise(t = 0.7) { this.surpriseT = Math.max(this.surpriseT, t); }
  reset() { for (const b of [this.neck, this.headBone, ...this.eyes]) if (b) this._undo(b); for (const k in this.w) this.w[k] = this.goal[k] = 0; this.yaw = this.pitch = this.lookW = this.eyeYaw = this.eyePitch = 0; this.joyT = this.surpriseT = 0; this.blinkP = -1; this._apply(); }

  // st: { state, hurt, hpFrac, combo, attackPhase (0..1), stamina, sprinting, yaw, eye: Vector3 (dünya), target: {x,y,z}|null }
  update(dt, st) {
    this.joyT -= dt; this.surpriseT -= dt;
    const G = this.goal; for (const k in G) G[k] = 0;
    const set = (k, v) => { if (k in G) G[k] = Math.max(G[k], v); };
    let blinkAllowed = true, speed = 10;
    if (st.state === 'dead') { set('sorrow', 1); set('blink', 1); blinkAllowed = false; speed = 3; }
    else if (st.hurt > 0) { set('sorrow', 0.8); set('blink', 0.45); set('i', 0.5); blinkAllowed = false; speed = 25; }
    else if (st.state === 'attack') {
      set('angry', 0.85);
      // vuruş anında bağırış: ağız açılır (3. vuruşta tam)
      const p = st.attackPhase; const shout = p > 0.25 && p < 0.65 ? Math.sin(((p - 0.25) / 0.4) * Math.PI) : 0;
      set('a', shout * (st.combo === 2 ? 1 : 0.6)); speed = 18;
    } else if (this.surpriseT > 0) { set('surprised', 0.9); blinkAllowed = false; speed = 20; }
    else if (this.joyT > 0) { set('joy', 1); blinkAllowed = false; }
    else {
      if (st.hpFrac < 0.3) set('sorrow', 0.45);
      if (st.state === 'roll') set('angry', 0.4);
      if (st.sprinting && st.stamina < 35) { set('o', 0.35 + 0.15 * Math.sin(performance.now() / 120)); set('sorrow', 0.25); }
      else if (st.state === 'jump') set('o', 0.3);
      else if (st.crouching) set('angry', 0.2); // dikkatli, odaklanmış bakış
    }
    // göz kırpma: rastgele aralıklarla, 0.15 sn kapanıp açılan üçgen eğri
    let blink = 0;
    if (this.blinkP >= 0) { this.blinkP += dt / 0.15; blink = this.blinkP < 0.5 ? this.blinkP * 2 : Math.max(0, 2 - this.blinkP * 2); if (this.blinkP >= 1) { this.blinkP = -1; this.blinkT = Math.random() < 0.15 ? 0.25 : 2 + Math.random() * 4; } }
    else if ((this.blinkT -= dt) <= 0 && blinkAllowed) this.blinkP = 0;
    const k = Math.min(1, dt * speed);
    for (const n in this.w) this.w[n] += (G[n] - this.w[n]) * k;
    // kırpma ifade ağırlığının üstüne eklenir ama gözü fazla kapatmaz (Joy/Fun zaten gözü kısar)
    this.blinkNow = blinkAllowed ? blink * (1 - (this.w.joy || 0) - (this.w.fun || 0)) : 0;
    this._apply();
    this._look(dt, st);
  }

  _apply() {
    const acc = new Map();
    for (const n in this.shapes) {
      const v = (this.w[n] || 0) + (n === 'blink' ? this.blinkNow || 0 : 0);
      for (const b of this.shapes[n]) { const key = b.m.id * 1000 + b.i; const prev = acc.get(key); acc.set(key, { m: b.m, i: b.i, v: (prev ? prev.v : 0) + v * b.w }); }
    }
    for (const { m, i, v } of acc.values()) m.morphTargetInfluences[i] = Math.min(1, v);
  }

  // Bir kemiği DÜNYA uzayında q kadar ek döndürür (animasyon pozunun üstüne).
  _rotWorld(bone, q) {
    bone.parent.getWorldQuaternion(this._pq);
    // yerel' = P⁻¹ · q · P · yerel
    const d = this._q2.copy(this._pq).invert().multiply(q).multiply(this._pq);
    bone.quaternion.premultiply(d);
    bone.userData.lookAfter = (bone.userData.lookAfter || new THREE.Quaternion()).copy(bone.quaternion);
    bone.userData.lookDelta = (bone.userData.lookDelta || new THREE.Quaternion()).copy(d);
    bone.updateWorldMatrix(false, true);
  }
  // Klip bu kemiği bu karede yeniden yazmadıysa (ör. göz kemikleri hiç animasyonlu değil) önceki karenin
  // ek dönüşünü geri al; yoksa dönüş her karede birikir.
  _undo(bone) {
    const u = bone.userData;
    if (u.lookAfter && bone.quaternion.equals(u.lookAfter)) { bone.quaternion.premultiply(this._q2.copy(u.lookDelta).invert()); bone.updateWorldMatrix(false, true); }
    u.lookAfter = null;
  }

  _look(dt, st) {
    if (!this.neck || !this.headBone) return;
    for (const b of [this.neck, this.headBone, ...this.eyes]) this._undo(b);
    let wantYaw = 0, wantPitch = 0, want = 0;
    const free = st.state === 'move' || st.state === 'interact' || st.state === 'land' || st.state === 'jump';
    this.target = free ? st.target : null;
    if (this.target) {
      const e = st.eye, t = this.target, dx = t.x - e.x, dz = t.z - e.z, h = Math.hypot(dx, dz);
      let d = Math.atan2(dx, dz) - st.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(d) < 110 * DEG && h > 0.3) { wantYaw = d; wantPitch = Math.atan2(t.y - e.y, h); want = 1; }
    }
    const k = Math.min(1, dt * 5);
    this.yaw += (wantYaw - this.yaw) * k; this.pitch += (wantPitch - this.pitch) * k; this.lookW += (want - this.lookW) * Math.min(1, dt * 3);
    const w = this.lookW;
    // baş+boyun en fazla 65° yana, 25° yukarı/aşağı; kalanını gözler taşır
    const hy = THREE.MathUtils.clamp(this.yaw, -65 * DEG, 65 * DEG) * w, hp = THREE.MathUtils.clamp(this.pitch, -25 * DEG, 25 * DEG) * w;
    const f = this._f.set(Math.sin(st.yaw), 0, Math.cos(st.yaw)), ax = this._ax.crossVectors(f, UP).normalize();
    // ax = ileri × yukarı: bu eksen etrafında pozitif açı bakışı yukarı kaldırır
    const turn = (frac) => this._q.setFromAxisAngle(UP, hy * frac).multiply(this._q2.setFromAxisAngle(ax, hp * frac));
    if (w > 0.001) {
      this._rotWorld(this.neck, turn(0.4).clone());
      this._rotWorld(this.headBone, turn(0.6).clone());
    }
    // gözler: VRM eğrisine göre (90° girdi → yRange derece çıktı), sağ/sol göz için iç/dış aralık
    // gözler başın taşıyamadığı kalanı ve başın önüne geçen küçük bir payı (%15) taşır
    const ey = THREE.MathUtils.clamp((this.yaw - hy * 0.85) * w, -90 * DEG, 90 * DEG), ep = THREE.MathUtils.clamp((this.pitch - hp * 0.85) * w, -90 * DEG, 90 * DEG);
    this.eyeYaw = ey; this.eyePitch = ep;
    if (!this.eyes.length || Math.abs(ey) + Math.abs(ep) < 1e-4) return;
    const R = this.range;
    this.eyes.forEach((eye, i) => {
      const left = i === 0; // sol göz: sola (pozitif yaw = karakterin soluna) bakışta dış aralık
      const hr = (ey > 0) === left ? R.out : R.in, vr = ep > 0 ? R.up : R.down;
      const yy = ey / (hr.x * DEG) * hr.y * DEG, pp = ep / (vr.x * DEG) * vr.y * DEG;
      const q = this._q.setFromAxisAngle(UP, yy).multiply(this._q2.setFromAxisAngle(ax, pp)).clone();
      this._rotWorld(eye, q);
    });
  }
}
