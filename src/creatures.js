// Hayvanlar ve yaratıklar: tür tablosu + modeller + animasyon sürücüleri.
//  - Ejderha ve tilki: gerçek iskeletli GLB modelleri (kendi klipleriyle).
//  - Diğer türler: kod içinde kurulan eklemli (rigli) modeller; yürüyüş/koşu/saldırı/yeme/ölüm
//    hareketleri eklem açıları üzerinden prosedürel olarak üretilir.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { clone as skeletonClone } from 'three/addons/utils/SkeletonUtils.js';
import { solveTwoBone, setWorldQuat, stanceLock } from './ik.js';

const PI = Math.PI, TAU = PI * 2;
const C = (h) => new THREE.Color(h);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => x * x * (3 - 2 * x);
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _fw = new THREE.Vector3(), _qc = new THREE.Quaternion();

/* ------------------------------------------------------------------ TÜR TABLOSU */
// tame.steps: evcilleştirme için gereken başarılı adım sayısı. Yöntemler taming.js içinde uygulanır.
export const SPECIES = {
  rabbit: { name: 'Tavşan', kind: 'quad', hp: 18, dmg: 0, walk: 1.6, run: 8.5, temper: 'prey', diet: 'herb', sense: 11, drops: { meat: 1 }, tame: { method: 'sneakFeed', item: 'carrot', steps: 1, hint: 'Çömelerek (C) yaklaş ve havuç ver' },
    len: 0.42, h: 0.2, bodyR: 0.115, width: 0.95, color: 0xb9a48c, belly: 0xf1ebe0, legR: 0.03, neckLen: 0.07, neckAng: 0.9, headR: 0.075, snoutLen: 0.05, snoutR: 0.045, ears: 'long', tail: { type: 'stub', r: 0.05, color: 0xffffff }, gait: 'hop', hindBoost: 1.5, cadence: 1.5, profile: [[-0.5, 0], [-0.46, 0.7], [-0.25, 1.05], [0.05, 0.95], [0.3, 0.75], [0.46, 0.55], [0.5, 0]] },
  fox: { name: 'Tilki', kind: 'glb', model: 'fox', hp: 40, dmg: 5, walk: 1.5, run: 7.5, temper: 'shy', diet: 'omni', sense: 14, drops: { meat: 1 }, tame: { method: 'bait', item: ['meat', 'berry'], steps: 2, hint: 'Yere et ya da böğürtlen bırak (G) ve 7 m geri çekil' },
    scale: 0.0115, len: 1.1, h: 0.55, viewSize: 1.2, clips: { idle: 'Survey', walk: 'Walk', run: 'Run' },
    // ayak IK'si zincirleri: [üst, orta, uç] — uç kemiğinin dünya yönü korunur, altındaki parmaklar onu izler
    ikLegs: ['Left', 'Right'].flatMap((S) => [[`b_${S}UpperArm`, `b_${S}ForeArm`, `b_${S}Hand`], [`b_${S}Leg01`, `b_${S}Leg02`, `b_${S}Foot01`]]) },
  deer: { name: 'Geyik', kind: 'quad', hp: 55, dmg: 6, walk: 1.5, run: 9, temper: 'prey', diet: 'herb', sense: 16, drops: { meat: 2 }, tame: { method: 'sneakFeed', item: 'berry', steps: 3, hint: 'Çömelerek (C) yaklaş, 3 kez böğürtlen ver' },
    len: 1.25, h: 1.0, bodyR: 0.24, width: 0.8, color: 0xa87343, belly: 0xe6d3b3, legR: 0.045, legTaper: 0.5, neckLen: 0.5, neckAng: 1.05, headR: 0.11, snoutLen: 0.17, snoutR: 0.065, headDown: 0.5, ears: 'leaf', antlers: true, hooves: true, tail: { type: 'stub', r: 0.06, color: 0xffffff }, gait: 'gallop', cadence: 1.0 },
  horse: { name: 'At', kind: 'quad', hp: 110, dmg: 12, walk: 1.8, run: 11, temper: 'prey', diet: 'herb', sense: 13, drops: { meat: 3 }, tame: { method: 'calm', item: 'apple', steps: 1, hint: 'Elma ver, sonra kıpırdamadan E basılı tutarak sakinleştir' },
    len: 1.75, h: 1.4, bodyR: 0.33, width: 0.82, color: 0x6b4226, belly: 0x7d5234, legR: 0.062, legTaper: 0.55, neckLen: 0.72, neckAng: 0.95, headR: 0.15, snoutLen: 0.36, snoutR: 0.1, headDown: 0.75, ears: 'point', earSize: 0.6, hooves: true, horseMane: 0x1d130c, tail: { type: 'hair', len: 0.9, r: 0.09, color: 0x1d130c }, gait: 'gallop', cadence: 0.9, rearAttack: true },
  wolf: { name: 'Kurt', kind: 'quad', hp: 70, dmg: 10, walk: 1.7, run: 8.2, temper: 'predator', diet: 'carn', sense: 20, drops: { meat: 1 }, tame: { method: 'weakenFeed', item: 'meat', hpBelow: 0.35, steps: 1, hint: 'Canını %35 altına düşür, sonra et ver' },
    len: 1.15, h: 0.72, bodyR: 0.2, width: 0.82, color: 0x767b82, belly: 0xd9d9d6, legR: 0.045, neckLen: 0.3, neckAng: 0.55, headR: 0.125, snoutLen: 0.2, snoutR: 0.065, ears: 'point', tail: { type: 'bushy', len: 0.55, r: 0.085, color: 0x5d6168, ang: -0.6 }, gait: 'gallop', cadence: 1.15 },
  bear: { name: 'Ayı', kind: 'quad', hp: 190, dmg: 22, walk: 1.3, run: 6.8, temper: 'territorial', diet: 'omni', sense: 12, drops: { meat: 4 }, tame: { method: 'feed', item: 'honey', steps: 2, hint: 'Saldırmadan yaklaş ve 2 kez bal ver' },
    len: 1.7, h: 1.02, bodyR: 0.42, width: 0.95, color: 0x4f3524, belly: 0x5d4230, legR: 0.105, legTaper: 0.9, neckLen: 0.32, neckAng: 0.3, headR: 0.2, snoutLen: 0.2, snoutR: 0.095, snoutColor: 0x9a7a5a, ears: 'round', tail: { type: 'stub', r: 0.07 }, gait: 'walk', runGait: 'gallop', cadence: 0.8, rearAttack: true, plantigrade: true, profile: [[-0.5, 0], [-0.46, 0.72], [-0.28, 1.0], [0, 0.98], [0.26, 1.06], [0.44, 0.78], [0.5, 0]] },
  lion: { name: 'Aslan', kind: 'quad', hp: 160, dmg: 20, walk: 1.5, run: 8.6, temper: 'predator', diet: 'carn', sense: 22, drops: { meat: 3 }, tame: { method: 'weakenFeed', item: 'meat', hpBelow: 0.25, steps: 2, hint: 'Canını %25 altına düşür, 2 kez et ver' },
    len: 1.65, h: 0.98, bodyR: 0.29, width: 0.8, color: 0xc79a55, belly: 0xe8d2a4, legR: 0.075, legTaper: 0.8, neckLen: 0.34, neckAng: 0.5, headR: 0.18, snoutLen: 0.17, snoutR: 0.1, ears: 'round', earSize: 0.7, mane: 0x6e4318, tail: { type: 'tuft', len: 0.95, r: 0.03, color: 0x4a2c10, ang: -0.9 }, gait: 'walk', runGait: 'gallop', cadence: 0.95 },
  tiger: { name: 'Kaplan', kind: 'quad', hp: 150, dmg: 21, walk: 1.5, run: 9, temper: 'predator', diet: 'carn', sense: 18, drops: { meat: 3 }, tame: { method: 'behindFeed', item: 'meat', steps: 2, hint: 'Çömelerek arkasından sokul ve 2 kez et ver (görürse saldırır)' },
    len: 1.75, h: 0.92, bodyR: 0.28, width: 0.8, color: 0xe08a2c, belly: 0xf6ead6, stripes: 0x1c120a, legR: 0.075, legTaper: 0.8, neckLen: 0.32, neckAng: 0.42, headR: 0.17, snoutLen: 0.15, snoutR: 0.1, snoutColor: 0xf6ead6, ears: 'round', earSize: 0.65, tail: { type: 'thin', len: 1.0, r: 0.04, color: 0xe08a2c, ang: -0.8, rings: 0x1c120a }, gait: 'walk', runGait: 'gallop', cadence: 0.95 },
  crocodile: { name: 'Timsah', kind: 'quad', hp: 140, dmg: 24, walk: 0.9, run: 4.6, temper: 'ambush', diet: 'carn', sense: 9, drops: { meat: 3 }, tame: { method: 'bait', item: ['fish'], steps: 3, hint: 'Yakınına 3 kez balık bırak (G) ve 7 m geri çekil' },
    len: 2.1, h: 0.3, bodyR: 0.27, width: 1.25, flat: 0.62, color: 0x4d5e37, belly: 0xc9c79a, legR: 0.07, legTaper: 0.8, sprawl: 0.95, neckLen: 0.2, neckAng: 0.05, headR: 0.17, snoutLen: 0.6, snoutR: 0.17, snoutFlat: 0.5, headDown: 0.0, jaw: true, ears: 'none', ridges: true, tail: { type: 'croc', len: 1.9, r: 0.2, color: 0x4d5e37, ang: -0.05 }, gait: 'walk', runGait: 'trot', cadence: 1.1, spineSway: 0.22 },
  shadowbeast: { name: 'Gölge Pençe', kind: 'quad', hp: 210, dmg: 26, walk: 1.6, run: 8.4, temper: 'predator', diet: 'carn', sense: 22, drops: { meat: 2, moonstone: 1 }, tame: { method: 'weakenFeed', item: 'moonstone', hpBelow: 0.3, steps: 1, hint: 'Canını %30 altına düşür, sonra ay taşı sun' },
    len: 1.9, h: 1.15, bodyR: 0.33, width: 0.85, color: 0x241a38, belly: 0x3a2a5c, legR: 0.08, legTaper: 0.7, neckLen: 0.42, neckAng: 0.5, headR: 0.19, snoutLen: 0.26, snoutR: 0.1, jaw: true, ears: 'point', horns: 0xb9a8ff, spikes: 0x8f6cff, glow: 0xc04bff, tail: { type: 'thin', len: 1.2, r: 0.05, color: 0x241a38, ang: -0.5, blade: 0x8f6cff }, gait: 'walk', runGait: 'gallop', cadence: 1.0 },
  snake: { name: 'Yılan', kind: 'snake', hp: 35, dmg: 14, walk: 1.0, run: 3.8, temper: 'ambush', diet: 'carn', sense: 7, drops: { meat: 1 }, tame: { method: 'charm', item: 'flute', steps: 1, hint: 'Yakınında kıpırdamadan E basılı tut: kaval çal (5 sn)' },
    len: 1.9, h: 0.12, color: 0x4f7a2e, belly: 0xd8d08a, pattern: 0x23351a, viewSize: 1.6 },
  eagle: { name: 'Kartal', kind: 'bird', hp: 45, dmg: 12, walk: 1.0, run: 11, temper: 'sky', diet: 'carn', sense: 30, drops: { meat: 1 }, tame: { method: 'bait', item: ['meat', 'fish'], steps: 2, hint: 'Açık alana et bırak (G), 7 m geri çekil ve inmesini bekle' },
    len: 0.75, h: 0.45, color: 0x4a3423, head: 0xf5f2ea, beak: 0xe8b21e, viewSize: 1.5 },
  ogre: { name: 'Mağara Devi', kind: 'biped', hp: 260, dmg: 30, walk: 1.3, run: 4.6, temper: 'predator', diet: 'carn', sense: 18, drops: { dragongem: 1, meat: 2 }, tame: null,
    len: 1.2, h: 2.9, color: 0x6c8a5a, belly: 0x8aa671, cloth: 0x5a4030, viewSize: 3.2 },
  dragon: { name: 'Ejderha', kind: 'glb', model: 'dragon', hp: 650, dmg: 45, walk: 2.4, run: 6.5, temper: 'territorial', diet: 'carn', sense: 26, drops: { dragongem: 1, meat: 6 }, tame: { method: 'weakenFeed', item: 'dragongem', hpBelow: 0.2, steps: 1, hint: 'Canını %20 altına düşür, sonra ejder mücevheri sun' },
    scale: 0.16, len: 10, h: 4.2, viewSize: 12, radius: 3.4, attackTime: 1.67, attackHit: 0.75, dieTime: 7.4,
    clips: { idle: 'stand', walk: 'walk', run: 'walk', attack: 'skill08', die: 'die', eat: 'stand' }, runScale: 1.7,
    ikLegs: ['L', 'R'].flatMap((S) => [[`Bip001-${S}-UpperArm`, `Bip001-${S}-Forearm`, `Bip001-${S}-Hand`], [`Bip001-${S}-Thigh`, `Bip001-${S}-Calf`, `Bip001-${S}-HorseLink`]]) },
};

/* ------------------------------------------------------------------ GEOMETRİ YARDIMCILARI */
const MAT = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0.02 });
function paint(g, color, fn) {
  const n = g.attributes.position.count, a = new Float32Array(n * 3), c = C(color), p = g.attributes.position, t = new THREE.Color();
  for (let i = 0; i < n; i++) { t.copy(c); if (fn) fn(t, p.getX(i), p.getY(i), p.getZ(i)); a[i * 3] = t.r; a[i * 3 + 1] = t.g; a[i * 3 + 2] = t.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g;
}
// -Y yönünde uzanan, uçları yuvarlak, incelen uzuv
function limb(r0, r1, len, color, seg = 10) {
  const pts = [[0, r0], [r0 * 0.7, r0 * 0.7], [r0, 0], [lerp(r0, r1, 0.5) * 1.04, -len * 0.5], [r1, -len], [r1 * 0.7, -len - r1 * 0.7], [0, -len - r1]].map((p) => new THREE.Vector2(p[0], p[1]));
  return paint(new THREE.LatheGeometry(pts, seg), color);
}
const ball = (r, color, sx = 1, sy = 1, sz = 1, w = 12, h = 9) => paint(new THREE.SphereGeometry(r, w, h).scale(sx, sy, sz), color);
const cone = (r, len, color, seg = 8) => paint(new THREE.ConeGeometry(r, len, seg).translate(0, len / 2, 0), color);
const at = (g, x, y, z, rx = 0, ry = 0, rz = 0) => { if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz))); return g.translate(x, y, z); };
function mesh(parts, mat = MAT) {
  const g = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)).map((p) => { for (const k of Object.keys(p.attributes)) if (!['position', 'normal', 'color'].includes(k)) p.deleteAttribute(k); if (!p.attributes.normal) p.computeVertexNormals(); return p; }));
  const m = new THREE.Mesh(g, mat); m.castShadow = true; return m;
}
const J = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
// Z ekseni boyunca uzanan gövde (kesit profili: [zOranı, yarıçapOranı])
function torso(sp, profile) {
  const curve = new THREE.SplineCurve(profile.map((p) => new THREE.Vector2(p[1] * sp.bodyR, p[0] * sp.len)));
  const pts = curve.getPoints(sp.stripes ? 44 : 26); pts[0].x = pts[pts.length - 1].x = 0; pts.forEach((p) => { p.x = Math.max(0, p.x); });
  const g = new THREE.LatheGeometry(pts, sp.stripes ? 22 : 16).rotateX(PI / 2).scale(sp.width, sp.flat || 1, 1);
  g.computeVertexNormals();
  const belly = C(sp.belly), str = sp.stripes != null ? C(sp.stripes) : null, R = sp.bodyR;
  return paint(g, sp.color, (c, x, y, z) => {
    const b = clamp01((-y / R - 0.25) * 2.2); c.lerp(belly, b);
    if (str && b < 0.6 && Math.sin(z * 27 / sp.len * 1.75 + Math.sin(y * 9 / R) * 0.8 + Math.abs(x) * 4) > 0.55) c.copy(str);
  });
}

/* ------------------------------------------------------------------ ORTAK TABAN */
class Creature {
  constructor(kind) {
    this.kind = kind; this.spec = SPECIES[kind];
    this.root = new THREE.Group(); this.root.name = kind;
    this.pivot = J(this.root);
    this.anim = 'idle'; this.at = 0; this.seed = Math.random() * 100; this.phase = Math.random() * TAU; this.amp = 0;
    this.radius = this.spec.radius || Math.max(0.25, this.spec.len * 0.38); this.height = this.spec.h * 1.5;
    this.attackTime = this.spec.attackTime || 0.6; this.attackHit = this.spec.attackHit || 0.3; this.dieTime = this.spec.dieTime || 1.0;
  }
  _begin(dt, anim) { if (anim !== this.anim) { this.anim = anim; this.at = 0; } this.at += dt; this.k = 1 - Math.exp(-dt * 12); }
  // eklemi hedef açıya yumuşakça götür: animasyonlar arası geçişler buradan gelir
  r(j, x = 0, y = 0, z = 0) { const k = this.k, e = j.rotation; e.x += (x - e.x) * k; e.y += (y - e.y) * k; e.z += (z - e.z) * k; }
  reset() { this.at = 0; this.anim = ''; if (this.legs) for (const l of this.legs) if (l.lockP) { l.locked = false; l.lockW = 0; l.prevZ = null; l.hMin = null; l.spent = false; } }
  // basma kilidi durumu (stanceLock için) — tilki, ejderha, Mağara Devi
  static lockState() { return { locked: false, lockW: 0, lockP: new THREE.Vector3(), loc: new THREE.Vector3(), hMin: null, prevZ: null, spent: false, slip: 0 }; }
}

/* ------------------------------------------------------------------ DÖRT AYAKLI */
const GAITS = { // faz ofsetleri: [sol ön, sağ ön, sol arka, sağ arka]
  walk: [0.25, 0.75, 0, 0.5], trot: [0, 0.5, 0.5, 0], gallop: [0.08, 0.2, 0.55, 0.68], hop: [0.1, 0.1, 0.55, 0.55],
};
const DEFAULT_PROFILE = [[-0.5, 0], [-0.47, 0.62], [-0.3, 0.93], [-0.04, 0.8], [0.23, 1.04], [0.43, 0.84], [0.5, 0]];
class Quadruped extends Creature {
  constructor(kind) {
    super(kind); const sp = this.spec, R = sp.bodyR;
    const body = this.body = J(this.pivot, 0, sp.h, 0);
    const bodyParts = [torso(sp, sp.profile || DEFAULT_PROFILE)];
    if (sp.ridges) for (let i = 0; i < 9; i++) for (const s of [-1, 1]) bodyParts.push(at(cone(0.035, 0.07, 0x38452a, 5), s * 0.09, R * (sp.flat || 1) * 0.93, -sp.len * 0.4 + i * sp.len * 0.1));
    if (sp.spikes != null) for (let i = 0; i < 7; i++) bodyParts.push(at(cone(0.05, 0.22 + 0.1 * Math.sin(i * 0.5 + 0.5), sp.spikes, 5), 0, R * 0.93, -sp.len * 0.36 + i * sp.len * 0.12, -0.35));
    body.add(mesh(bodyParts));
    // boyun + baş
    const neck = this.neck = J(body, 0, R * 0.25 * (sp.flat || 1), sp.len * 0.4);
    const neckParts = [limb(R * 0.62, sp.headR * 0.85, sp.neckLen, sp.color).rotateX(-PI / 2).scale(1, sp.flat ? 0.75 : 1, 1)];
    if (sp.horseMane != null) neckParts.push(at(ball(0.07, sp.horseMane, 0.5, 1.3, sp.neckLen * 7), 0, R * 0.55, sp.neckLen * 0.5));
    neck.add(mesh(neckParts));
    const head = this.head = J(neck, 0, 0, sp.neckLen);
    const hr = sp.headR, hp = [ball(hr, sp.color, 1, sp.snoutFlat ? 0.7 : 0.92, 1.1)];
    const sf = sp.snoutFlat || 0.85, sc = sp.snoutColor ?? sp.color;
    const snout = () => at(limb(hr * 0.78, sp.snoutR * 0.75, sp.snoutLen, sc).rotateX(-PI / 2).scale(1, sf, 1), 0, -hr * 0.18, hr * 0.5);
    if (sp.jaw) { // üst çene başta, alt çene ayrı eklem
      hp.push(snout().scale(1, 0.6, 1).translate(0, hr * 0.02, 0));
      this.jaw = J(head, 0, -hr * 0.3, hr * 0.3);
      const jp = [limb(hr * 0.6, sp.snoutR * 0.6, sp.snoutLen * 0.95, sp.belly).rotateX(-PI / 2).scale(1, sf * 0.45, 1)];
      for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { jp.push(at(cone(0.012, 0.045, 0xfffbe8, 4), s * sp.snoutR * 0.55, 0.01, hr * 0.3 + i * sp.snoutLen * 0.17)); hp.push(at(cone(0.012, 0.05, 0xfffbe8, 4), s * sp.snoutR * 0.6, -hr * 0.2, hr * 0.75 + i * sp.snoutLen * 0.17, PI)); }
      this.jaw.add(mesh(jp));
    } else hp.push(snout());
    hp.push(at(ball(sp.snoutR * 0.42, 0x1a1210), 0, -hr * 0.12 * (sp.snoutFlat ? 0.2 : 1), hr * 0.5 + sp.snoutLen + sp.snoutR * 0.45));
    const eyeY = sp.snoutFlat ? hr * 0.5 : hr * 0.28;
    for (const s of [-1, 1]) {
      hp.push(at(ball(hr * 0.15, sp.glow != null ? 0x000000 : 0x15100c), s * hr * 0.62, eyeY, hr * 0.62));
      if (sp.glow == null) hp.push(at(ball(hr * 0.05, 0xffffff), s * hr * 0.66, eyeY + hr * 0.05, hr * 0.74));
      const es = hr * (sp.earSize || 1);
      if (sp.ears === 'point') hp.push(at(cone(es * 0.42, es * 0.95, sp.color, 6).scale(1, 1, 0.55), s * hr * 0.55, hr * 0.6, -hr * 0.1, 0, 0, -s * 0.3));
      if (sp.ears === 'round') hp.push(at(ball(es * 0.42, sp.color, 1, 1, 0.45), s * hr * 0.72, hr * 0.72, -hr * 0.05));
      if (sp.ears === 'leaf') hp.push(at(ball(es * 0.5, sp.color, 0.5, 1.3, 0.3), s * hr * 1.05, hr * 0.75, -hr * 0.25, 0, 0, -s * 1.0));
      if (sp.ears === 'long') { const e = this['ear' + s] = J(head, s * hr * 0.4, hr * 0.7, -hr * 0.2); e.add(mesh([at(ball(hr * 0.55, sp.color, 0.42, 2.0, 0.25), 0, hr * 1.0, 0), at(ball(hr * 0.4, 0xe9b7b0, 0.3, 1.7, 0.1), 0, hr * 1.0, hr * 0.12)])); e.rotation.z = -s * 0.2; }
      if (sp.antlers) { const a = (len, x, y, z, rx, rz) => hp.push(at(limb(0.016, 0.007, len, 0xd8c8a8, 5).rotateX(PI), x, y, z, rx, 0, rz));
        a(0.42, s * hr * 0.4, hr * 0.8, -hr * 0.2, -0.35, -s * 0.5); a(0.2, s * hr * 1.5, hr * 2.9, -hr * 0.9, 0.5, -s * 0.15); a(0.22, s * hr * 2.2, hr * 4.0, -hr * 1.45, 0.1, -s * 0.9); a(0.2, s * hr * 2.2, hr * 4.0, -hr * 1.45, -0.6, s * 0.2); }
      if (sp.horns != null) hp.push(at(cone(hr * 0.26, hr * 2.2, sp.horns, 6), s * hr * 0.55, hr * 0.55, -hr * 0.2, -0.75, 0, -s * 0.45));
    }
    if (sp.mane != null) { hp.push(at(ball(hr * 1.62, sp.mane, 1, 1.08, 0.72, 14, 10), 0, -hr * 0.12, -hr * 0.55)); hp.push(at(ball(hr * 1.2, sp.mane, 1.1, 1.3, 1.5), 0, -hr * 0.9, -hr * 1.6)); }
    head.add(mesh(hp));
    if (sp.glow != null) { const gm = new THREE.MeshBasicMaterial({ color: sp.glow }); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(hr * 0.13, 8, 6), gm); e.position.set(s * hr * 0.64, eyeY, hr * 0.68); head.add(e); } }
    // kuyruk
    const tl = sp.tail, segs = tl.type === 'stub' ? 1 : tl.type === 'croc' ? 5 : 3; this.tail = [];
    let tp = J(body, 0, R * 0.35 * (sp.flat || 1), -sp.len * 0.46);
    for (let i = 0; i < segs; i++) {
      const parts = [];
      if (tl.type === 'stub') parts.push(ball(tl.r, tl.color ?? sp.color));
      else {
        const L = tl.len / segs, f0 = 1 - i / segs, f1 = 1 - (i + 1) / segs, tapered = tl.type !== 'thin' && tl.type !== 'tuft';
        const r0 = tapered ? tl.r * (tl.type === 'bushy' ? (i === 0 ? 0.6 : 1.1 - i * 0.2) : tl.type === 'hair' ? 0.7 + i * 0.25 : f0 * 0.9 + 0.1) : tl.r, r1 = tapered ? tl.r * (tl.type === 'bushy' ? (i === 2 ? 0.25 : 1.0) : tl.type === 'hair' ? (i === 2 ? 0.3 : 1.0) : f1 * 0.9 + 0.1) : tl.r * 0.9;
        const g = limb(r0, r1, L, tl.rings != null && i % 2 === 1 ? tl.rings : tl.color).rotateX(PI / 2); if (tl.type === 'croc') g.scale(0.75, 1.15, 1); parts.push(g);
        if (tl.type === 'croc') for (let k = 0; k < 2; k++) parts.push(at(cone(0.03, 0.09 * (f0 + 0.3), 0x38452a, 4), 0, r0 * 1.0, -L * (0.25 + k * 0.5)));
        if (i === segs - 1 && tl.type === 'tuft') parts.push(at(ball(tl.r * 2.6, tl.color, 1, 1, 1.6), 0, 0, -L));
        if (i === segs - 1 && tl.blade != null) parts.push(at(cone(0.07, 0.35, tl.blade, 4).scale(1, 1, 0.3), 0, 0, -L, -PI / 2));
        if (i < segs - 1) { var next = [0, 0, -L]; }
      }
      tp.add(mesh(parts)); this.tail.push(tp);
      if (i < segs - 1) tp = J(tp, ...next);
    }
    // bacaklar
    this.legs = [];
    const hipY = -R * 0.3 * (sp.flat || 1), reach = (sp.h + hipY) / Math.cos(sp.sprawl || 0);
    const mk = (front, side) => {
      // yayvan bacaklı (timsah): gerçek "yüksek yürüyüş" duruşu gibi dirsek/diz ~55° bükük. Önceden bacak dinlenmede
      // neredeyse düzdü (kalça–bilek 0.315 m, bacak 0.316 m); gövde salınımı kalçayı yana kaydırınca basan ayağa erişim
      // kalmıyor, kilit basışların yarısında bırakılıyordu. Bükük diz IK'ye ~%10 erişim payı bırakır.
      const rest = sp.sprawl ? (front ? [0.45, -0.95, 0.5] : [-0.5, 1.0, -0.5]) : front ? [0.2, -0.27, 0.07] : [-0.32, 0.74, -0.42];
      const prop = front ? [0.44, 0.42, 0.14] : [0.4, 0.38, 0.22];
      const boost = front ? 1 : (sp.hindBoost || 1), lr = sp.legR * boost, tp2 = sp.legTaper || 0.62;
      let a = 0, vert = 0; const cs = rest.map((v) => (a += v, Math.cos(a))); prop.forEach((p, i) => { vert += p * cs[i]; });
      const footR = lr * (sp.hooves ? 0.75 : 1.0), s = (reach - footR * 0.9) / vert, L = prop.map((p) => p * s);
      const hip = J(body, side * R * sp.width * (sp.sprawl ? 0.8 : 0.52), hipY, (front ? 0.33 : -0.33) * sp.len); hip.rotation.z = side * (sp.sprawl || 0);
      const up = J(hip); up.add(mesh([limb(lr * (front ? 1.6 : 2.1), lr * 1.1, L[0], sp.color), at(ball(R * (front ? 0.55 : 0.68), sp.color, 0.55, 1.0, 0.85), -side * R * 0.12, R * 0.12, front ? -R * 0.05 : R * 0.1)]));
      const lo = J(up, 0, -L[0], 0); lo.add(mesh([limb(lr * 1.05, lr * tp2, L[1], sp.color)]));
      const ft = J(lo, 0, -L[1], 0); const fparts = [limb(lr * tp2, lr * tp2 * 0.95, L[2], sp.color)];
      if (sp.hooves) fparts.push(at(limb(footR * 1.0, footR * 1.15, footR * 0.9, 0x1c1612, 8), 0, -L[2] + footR * 0.3, footR * 0.15));
      else fparts.push(at(ball(footR * 1.25, sp.belly === sp.color ? sp.color : sp.color, 1, 0.62, sp.plantigrade ? 1.9 : 1.45), 0, -L[2] - footR * 0.2, footR * 0.5));
      ft.add(mesh(fparts));
      this.legs.push({ hip, up, lo, ft, rest, front, side, sprawl: sp.sprawl || 0 });
    };
    mk(true, 1); mk(true, -1); mk(false, 1); mk(false, -1); this.legReach = reach; this.strideK = 1; this.cadK = 1; this.dutyK = 0.5; this.dutyOn = false;
    this.legs.forEach((l) => {
      l.up.rotation.x = l.rest[0]; l.lo.rotation.x = l.rest[1]; l.ft.rotation.x = l.rest[2];
      // ayak IK'si durumu: animasyon açıları (au/al/af), zemin farkı, basma kilidi
      Object.assign(l, { L0: -l.lo.position.y, L1: -l.ft.position.y, au: 0, al: 0, af: 0, off: 0, lift: 0, locked: false, lockW: 0, lockP: new THREE.Vector3(), tgt: new THREE.Vector3(), anim: new THREE.Vector3(), bend: Math.sign(l.rest[1]) || 1, slip: 0, spent: false, hz: l.hip.rotation.z, lockDx: 0, lockDz: 0 });
    });
    neck.rotation.x = -sp.neckAng; head.rotation.x = sp.neckAng + (sp.headDown ?? 0.3);
    // düz zeminde, dinlenme pozunda ayak bileğinin köke göre yüksekliği (IK testleri ve ölçüm için)
    body.position.y = sp.h; this.root.updateMatrixWorld(true);
    this.legs.forEach((l) => {
      l.restH = l.ft.getWorldPosition(_v1).y; l.sweepR = _v1.distanceTo(l.hip.getWorldPosition(_v2));
      // dinlenme pozunda bilek kalçanın tam altında değil: kalça düzleminde açısı (a0) ve uzaklığı (sR); doğrusal süpürme için
      l.hip.worldToLocal(_v1); l.a0 = Math.atan2(-_v1.z, -_v1.y); l.sR = Math.hypot(_v1.y, _v1.z);
    });
    this.sweepR = this.legs.reduce((m, l) => m + l.sweepR, 0) / 4;
    this.ikW = 0; this.ikDrop = 0; this.sideRoll = 0; this.ikEnabled = true; this.ikReleases = 0; this._ikOn = false;
  }
  animate(dt, anim, t, o = {}) {
    // önceki karenin IK düzeltmesini geri al: yumuşatma (r) saf animasyon pozundan devam etsin, düzeltme birikmesin
    if (this._ikOn) { this.body.position.y = this._aby; for (const l of this.legs) { l.up.rotation.x = l.au; l.lo.rotation.x = l.al; l.ft.rotation.x = l.af; l.hip.rotation.z = l.hz; } this._ikOn = false; }
    this._begin(dt, anim); const sp = this.spec, k = this.k, at_ = this.at, sd = this.seed;
    const moving = anim === 'walk' || anim === 'run', run = anim === 'run';
    this.amp += ((moving ? (run ? 1 : 0.55) : 0) - this.amp) * k;
    const gaitName = run ? (sp.runGait || sp.gait) : (sp.gait === 'hop' ? 'hop' : sp.gait === 'gallop' ? 'walk' : sp.gait);
    const offs = GAITS[gaitName], hop = gaitName === 'hop', gal = gaitName === 'gallop';
    // adım boyu – hız eşlemesi (yürüyüş/tırıs): basan ayak bileği yarım döngüde 2·R·sin(salınım) kadar geri süpürür
    // (R = kalça–bilek uzaklığı). Bu, gövdenin aynı sürede aldığı yola eşit olmalı, yoksa ayak zeminde kayar.
    // Önce salınım genliği büyütülür (en çok 1.4×), yetmezse adım sıklığı artırılır.
    const base = (sp.sprawl ? 0.5 : 0.62) * 0.55, f0 = (run ? 2.3 : 1.25) * sp.cadence * (o.rate || 1);
    // görev oranlı (duty factor) döngü: dörtnal, sıçrama ve koşudaki tırıs. Sinüs döngüsünde basış hep döngünün yarısıydı
    // ve 7–11 m/sn'de ayak klipte gövdeyle neredeyse aynı hızda kayıyordu (her basış erken bırakılıyordu). Burada basış
    // döngünün D kadarı, ayak bu sürede doğrusal (sin uzayında) ve gövde hızıyla geri süpürülür: d = v·D/f = 2·R·sinθ.
    // Önce D küçülür (en az 0.2: gerçek dörtnalda ~0.2–0.4), yetmezse adım sıklığı artar (en çok 2×).
    const duty = moving && (run || hop);
    let sk = 1, fk = 1, dk = 0.5;
    if (moving && !duty && !gal && o.speed > 0.05) {
      const need = Math.asin(Math.min(0.9, o.speed / f0 / (4 * this.sweepR)));
      sk = THREE.MathUtils.clamp(need / base, 0.6, 1.4);
      if (need > base * 1.4) fk = Math.min(1.8, Math.sin(need) / Math.sin(base * 1.4));
    } else if (duty && o.speed > 0.05) {
      const sMax = Math.sin(run ? 0.68 : 0.5), avail = 2 * this.sweepR * sMax * 0.9;
      dk = THREE.MathUtils.clamp(avail * f0 / o.speed, 0.2, run ? 0.45 : 0.5);
      if (avail * f0 / o.speed < 0.2) fk = Math.min(2, o.speed * 0.2 / (avail * f0));
    }
    const ks = Math.min(1, dt * 4); this.strideK += (sk - this.strideK) * ks; this.cadK += (fk - this.cadK) * ks;
    this.dutyK += ((duty ? dk : 0.5) - this.dutyK) * ks;
    const fq = f0 * this.cadK;
    if (moving) this.phase += dt * TAU * fq;
    const A = this.amp, ph = this.phase;
    let pitch = 0, by = 0, bz = 0, roll = 0, py = 0, neckX = -sp.neckAng, headX = sp.neckAng + (sp.headDown ?? 0.3), headY = 0, jaw = 0, yaw = 0;
    const swing = (sp.sprawl ? 0.5 : 0.62) * A * this.strideK, lift = [0, 0, 0, 0], sw = [0, 0, 0, 0];
    this.dutyOn = duty;
    if (duty) {
      // basışta gereken süpürme mesafesi; her bacak kendi boyuna göre açısını seçer (ön/arka bacak boyları farklı)
      const D = this.dutyK, d = (o.speed || 0) * D / Math.max(0.1, fq);
      for (let i = 0; i < 4; i++) {
        // bilek kalça düzleminde z = −sR·sin(a0 + açı); basışta z doğrusal değişsin diye açı bu bağıntıdan çözülür
        const l = this.legs[i], h = d / (2 * l.sR), s0 = Math.sin(l.a0), u = ((ph / TAU + offs[i] + 0.25) % 1 + 1) % 1;
        const ang = (s) => Math.asin(THREE.MathUtils.clamp(s0 + s * h, -0.97, 0.97)) - l.a0;
        if (u < D) { sw[i] = ang(2 * u / D - 1) * A; lift[i] = 0; }
        else { const v = (u - D) / (1 - D), e = v * v * (3 - 2 * v); sw[i] = ang(1 - 2 * e) * A; lift[i] = Math.sin(PI * v) * A; }
      }
    } else for (let i = 0; i < 4; i++) { const p = ph + offs[i] * TAU; sw[i] = Math.sin(p) * swing; lift[i] = Math.max(0, -Math.cos(p)) * A; }
    if (duty) {
      // gövde basışlarla eş zamanlı: ayak yerdeyken çöker (yük alır), uçuş evresinde yükselir; ön ayaklar basarken burun
      // aşağı, arka ayaklar iterken burun yukarı. Önceki sinüs sıçraması basışla ilgisizdi; basış ortasında gövde
      // kalkınca bacak kilitli ayağa yetişemiyor, kilit bırakılıyordu.
      let Sf = 0, Sh = 0; const D = this.dutyK;
      for (let i = 0; i < 4; i++) { const u = ((ph / TAU + offs[i] + 0.25) % 1 + 1) % 1, st = u < D ? Math.sin(PI * u / D) : 0; if (this.legs[i].front) Sf = Math.max(Sf, st); else Sh = Math.max(Sh, st); }
      const S = Math.max(Sf, Sh);
      by = sp.h * A * ((hop ? 0.16 : 0.06) * (1 - S) - 0.035 * S);
      pitch = (Sh - Sf) * (hop ? 0.14 : 0.06) * A;
    } else {
      by = -Math.abs(Math.sin(ph * (gal || hop ? 0.5 : 1) + 0.6)) * sp.h * 0.05 * A;
      if (gal || hop) { pitch = Math.sin(ph + 1.2) * (hop ? 0.22 : 0.09) * A; by += Math.max(0, Math.sin(ph + 2.2)) * sp.h * (hop ? 0.5 : 0.12) * A; }
    }
    // yayvan bacaklılarda (timsah) gövde salınımı basışa kilitli: gövde, sol ön ayak basışın ortasındayken en çok sola
    // döner. Tırısta çapraz çift (sol ön + sağ arka) birlikte bastığı için tek bir gövde dönüşü iki kalçayı da kendi
    // basan ayağına doğru kaydırır (kertenkele/timsah omurgasının duran dalgası); salınım adımı uzatır, erişimi
    // bozmaz. Önceden faz rastgeleydi: koşuda ön kalça basan ayaktan uzaklaşıyor, kilit bırakılıyordu.
    const swPh = !sp.sprawl ? 0 : duty ? PI - PI * this.dutyK + TAU * offs[0] : PI / 2 + TAU * offs[0];
    yaw = Math.sin(ph + swPh) * (sp.spineSway || 0.04) * A; roll = Math.sin(ph) * 0.03 * A;
    let rear = 0, death = 0;
    if (anim === 'idle') { by += Math.sin(t * 1.7 + sd) * sp.h * 0.008; headY = Math.sin(t * 0.45 + sd) * 0.45 * (Math.sin(t * 0.13 + sd) > 0 ? 1 : 0.2); neckX += Math.sin(t * 0.6 + sd) * 0.05; }
    if (anim === 'eat') { neckX += Math.min(1.5, sp.neckAng + (sp.h - sp.bodyR) / Math.max(0.2, sp.neckLen) * 0.75); headX = 0.15 + Math.sin(t * 9) * 0.1; jaw = 0.2 + Math.sin(t * 9) * 0.2; pitch += 0.06; }
    if (anim === 'charm') { headY = Math.sin(t * 2) * 0.3; neckX -= 0.15; }
    if (anim === 'attack') { const p = clamp01(at_ / this.attackTime), l = Math.sin(PI * p);
      if (sp.rearAttack) { rear = l; jaw = l * 0.7; } else { bz = l * sp.len * 0.28; pitch += l * 0.12 - Math.sin(TAU * p) * 0.1; neckX += l * 0.4; headX -= l * 0.25; jaw = Math.sin(PI * clamp01(p * 1.6)) * 0.85; } }
    if (anim === 'die') { death = ease(clamp01(at_ / this.dieTime * 1.4)); neckX += death * 0.5; jaw = death * 0.3; }
    // yayvan bacaklılar yan eğimde gövdeyi eğime yatırır (gövde yere yakın, ayaklar 0.6 m yana açık: 31° yan eğimde iki
    // yandaki zemin arasında ~0.35 m fark var, bacak boyundan fazla). Yatış IK düzlemine de eklenir (_footIK).
    if (sp.sprawl) {
      let tr = 0;
      if (o.ground && !o.air && o.ik !== false && this.ikEnabled && anim !== 'die') {
        const ry = this.root.rotation.y, sx = Math.cos(ry), sz = -Math.sin(ry), e = sp.bodyR * sp.width, x = this.root.position.x, z = this.root.position.z;
        tr = THREE.MathUtils.clamp(Math.atan((o.ground(x + sx * e, z + sz * e) - o.ground(x - sx * e, z - sz * e)) / (2 * e)) * 0.85, -0.5, 0.5);
      }
      this.sideRoll += (tr - this.sideRoll) * Math.min(1, dt * 5); roll += this.sideRoll;
    }
    // gövde
    const b = this.body, pv = this.pivot;
    b.position.y += (sp.h + by - b.position.y) * k; b.position.z += (bz - b.position.z) * k;
    this.r(b, pitch - rear * 0.95 + (o.slope || 0), yaw, roll);
    if (rear) { b.position.y += (sp.h + rear * sp.len * 0.28 - b.position.y) * k; }
    const side = (sd % 2 > 1 ? 1 : -1);
    pv.rotation.z += (death * side * (sp.sprawl ? PI : PI / 2 * 0.96) - pv.rotation.z) * k;
    pv.position.y += (death * (sp.sprawl ? sp.h * 1.6 : sp.bodyR * sp.width * 0.9) - pv.position.y) * k; pv.position.x += (death * side * (sp.sprawl ? 0 : sp.h * 0.5) - pv.position.x) * k;
    this.r(this.neck, neckX + pitch * -0.6 + rear * 0.7, headY * 0.5 - yaw, 0); this.r(this.head, headX, headY * 0.6, 0);
    if (this.jaw) this.r(this.jaw, jaw, 0, 0);
    // kuyruk
    const tl = sp.tail, wag = anim === 'idle' ? Math.sin(t * (o.happy ? 9 : 2.2) + sd) * (o.happy ? 0.5 : 0.18) : Math.sin(ph - 1) * 0.3 * A + Math.sin(t * 2) * 0.05;
    this.tail.forEach((s, i) => this.r(s, i === 0 ? -(tl.ang ?? -0.3) + (run ? -0.25 : 0) * (tl.type === 'hair' ? -2 : 1) + death * 0.3 : (tl.type === 'hair' ? 0.12 : -0.12) + A * 0.1, wag * (sp.sprawl ? 1.4 : 1) * (1 - death), 0));
    // bacaklar
    this.legs.forEach((l, i) => {
      let s = sw[i], lf = lift[i], extra = 0;
      if (hop && !l.front && !this.dutyOn) { s *= 1.5; }
      let u = l.rest[0] + s, lo = l.rest[1], f = l.rest[2];
      if (l.front) { lo -= lf * 0.75; f += lf * 0.95; u -= lf * 0.12; if (rear) { u = -1.0 + Math.sin(at_ * 14 + i * PI) * 0.45 * rear + (1 - rear) * u; lo = -0.9 * rear + (1 - rear) * lo; } }
      else { lo += lf * 0.6; f -= lf * 0.55; u -= lf * 0.2; if (rear) { u += rear * 0.8; lo -= rear * 0.25; f -= rear * 0.3; } }
      if (death) { u = lerp(u, l.rest[0] + (l.front ? -0.5 : 0.4), death); lo = lerp(lo, l.rest[1] * 0.4, death); }
      u -= (pitch + (o.slope || 0)) * 0.9;
      // bacak hedefleri zaten sürekli (genlik, kaldırma, ölüm/şahlanma yumuşak eğrilerle geçiyor); genel yumuşatma (τ≈83 ms)
      // yürüyüş döngüsünü süzüp adımı kısaltıyor ve kaldırma evresinden kaydırıyordu → bacaklarda çok daha hızlı izleme
      // görev oranlı döngüde basış 2–4 kare sürer; süzgeç orada bile gecikme yaratıyordu → doğrudan uygulanır
      const kl = this.dutyOn ? 1 : 1 - Math.exp(-dt * 60);
      l.up.rotation.x += (u - l.up.rotation.x) * kl; l.lo.rotation.x += (lo - l.lo.rotation.x) * kl; l.ft.rotation.x += (f - l.ft.rotation.x) * kl;
    });
    if (this['ear1']) for (const s of [-1, 1]) this.r(this['ear' + s], -0.25 - A * 0.9 + Math.sin(t * 3 + sd) * 0.05, 0, -s * 0.2);
    this.legs.forEach((l, i) => { l.lift = lift[i]; });
    this._footIK(dt, o, anim, A, rear);
  }

  // Dört ayaklı ayak IK'si (animasyon pozunun üstüne, her kare):
  //  1) Animasyon, kökten geçen ve gövde eğimine (o.slope) eşit tek bir düzlem varsayar. Her ayağın altındaki gerçek
  //     zeminin bu düzlemden farkı (yan eğim, tümsek, çukur) ayak hedefine eklenir.
  //  2) Basma evresinde ayak dünyada kilitlenir (kayma olmaz); kilit fazla gerilirse ayak yeniden basar.
  //  3) Erişilemeyen hedef varsa gövde gerektiği kadar alçalır; uyluk + baldır düzlemsel iki kemikli IK ile çözülür.
  //  4) Basan ayağın tabanı yerel zemin eğimine yatırılır.
  _footIK(dt, o, anim, A, rear) {
    const sp = this.spec, G = o.ground, legs = this.legs;
    for (const l of legs) { l.au = l.up.rotation.x; l.al = l.lo.rotation.x; l.af = l.ft.rotation.x; }
    this._aby = this.body.position.y;
    const want = G && o.ik !== false && this.ikEnabled && anim !== 'die' && !o.air ? 1 : 0;
    this.ikW = want ? this.ikW + (1 - this.ikW) * Math.min(1, dt * 6) : 0;
    const w = this.ikW;
    if (w < 0.002) { for (const l of legs) { l.locked = false; l.lockW = 0; l.off = 0; } this.ikDrop = 0; return; }
    this._ikOn = true;
    const root = this.root, k = Math.min(1, dt * 14), rx = root.position.x, rz = root.position.z, rootY = root.position.y;
    root.updateMatrixWorld(true);
    const fx = Math.sin(root.rotation.y), fz = Math.cos(root.rotation.y), grad = -Math.tan(o.slope || 0), lgrad = Math.tan(this.sideRoll || 0), lsec = 1 / Math.cos(this.sideRoll || 0);
    const maxUp = sp.h * 0.45, maxDn = sp.h * 0.35, slipMax = Math.max(0.12, sp.len * 0.28), moving = A > 0.25;
    let need = 0;
    for (const l of legs) {
      l.ft.getWorldPosition(l.anim); l.tgt.copy(l.anim);
      // basma kilidi
      const stance = moving && l.lift < 0.03;
      if (stance && !l.spent) {
        l.hip.getWorldPosition(_v1);
        if (!l.locked) { l.locked = true; l.lockP.copy(l.anim); }
        // erişim: kalçadan kilit noktasına uzaklık. Yükseklik animasyondan gelir (kilit anındaki eski yükseklik değil;
        // gövde basışta inip kalkınca yanlış sonuç veriyordu). Gövde gerekirse aşağıda alçalır, bu yüzden %6 pay var.
        else if (Math.hypot(l.lockP.x - l.anim.x, l.lockP.z - l.anim.z) > slipMax || _v1.distanceTo(_v2.set(l.lockP.x, l.anim.y, l.lockP.z)) > (l.L0 + l.L1) * 0.995 + sp.h * 0.06) {
          // bacak fazla gerildi (adım boyu hızdan kısa): kilidi bu basışta bırak, ayak yumuşakça animasyona döner
          l.locked = false; l.spent = true; this.ikReleases++;
        }
      } else { l.locked = false; if (!stance) l.spent = false; }
      l.lockW += ((l.locked ? 1 : 0) - l.lockW) * Math.min(1, dt * (l.locked ? 30 : 9));
      // kilit, animasyona göre bir kayma (ofset) olarak uygulanır ve ayak kalkınca bu ofset söner. Önceden hedef eski
      // kilit noktasına doğru harmanlanıyordu: koşuda gövde hızla ilerlerken salınımdaki ayak geride sürükleniyor,
      // erişemediği için gövdeyi %20–30 alçaltıyordu.
      if (l.locked) { l.lockDx = l.lockP.x - l.anim.x; l.lockDz = l.lockP.z - l.anim.z; }
      l.tgt.x += l.lockDx * l.lockW; l.tgt.z += l.lockDz * l.lockW;
      // zemin farkı: gerçek zemin − animasyonun varsaydığı düzlem
      const fwd = (l.tgt.x - rx) * fx + (l.tgt.z - rz) * fz;
      // yan yatış (yayvan bacaklılar): animasyonun düzlemi gövde merkezi (kökten sp.h yukarıda) etrafında θ kadar döner.
      // Yanal uzaklığı X olan noktada düzlem X·tanθ + h(1 − 1/cosθ); bilek düzleme dik restH uzakta, dikeyde restH/cosθ.
      const lat = (l.tgt.x - rx) * fz - (l.tgt.z - rz) * fx; // gövdenin sol (+x) yönü dünyada (fz, 0, −fx)
      const rollY = lgrad ? lat * lgrad + (l.restH - sp.h) * (lsec - 1) : 0;
      const off = THREE.MathUtils.clamp(G(l.tgt.x, l.tgt.z) - (rootY + fwd * grad + rollY), -maxDn, maxUp);
      l.off += (off - l.off) * k; l.tgt.y += l.off;
      l.w = w * (rear > 0.05 && l.front ? 1 - rear : 1);
      l.tgt.lerpVectors(l.anim, l.tgt, l.w);
      // yalnızca animasyondakinden daha uzak ve erişimin sınırındaki hedefler gövdeyi alçaltır
      l.hip.getWorldPosition(_v1);
      // gereken dikey alçalma: kalça hedefe yatayda hd uzaklıkta; bacak Rm boyuna ulaşsın diye kalça ne kadar inmeli
      const Rm = Math.max(_v1.distanceTo(l.anim), (l.L0 + l.L1) * 0.97), hd = Math.hypot(_v1.x - l.tgt.x, _v1.z - l.tgt.z);
      need = Math.max(need, hd < Rm ? _v1.y - l.tgt.y - Math.sqrt(Rm * Rm - hd * hd) : sp.h);
    }
    // gövdeyi alçalt (aşağıdaki ayağa uzanabilsin)
    const nd = Math.min(need, sp.h * 0.3); this.ikDrop += (nd - this.ikDrop) * (nd > this.ikDrop ? Math.min(1, dt * 40) : k); // hızlı in, yumuşak kalk
    if (this.ikDrop > 1e-4) { this.body.position.y -= this.ikDrop; this.body.updateMatrixWorld(true); }
    const e = 0.2;
    for (const l of legs) {
      if (l.w < 1e-3) continue;
      // yana açılma: hedef bacak düzleminin dışındaysa (dönüş, yan eğim) kalça eklemi yana döner
      l.hip.worldToLocal(_v2.copy(l.tgt));
      const abM = l.sprawl ? 0.6 : 0.35, ab = THREE.MathUtils.clamp(Math.atan2(_v2.x, -_v2.y), -abM, abM);
      if (Math.abs(ab) > 1e-4) { l.hip.rotation.z = l.hz + ab; l.hip.updateMatrixWorld(true); l.hip.worldToLocal(_v2.copy(l.tgt)); }
      const L0 = l.L0, L1 = l.L1, d = THREE.MathUtils.clamp(Math.hypot(_v2.y, _v2.z), Math.abs(L0 - L1) + 1e-3, (L0 + L1) * 0.999);
      const phi = Math.atan2(-_v2.z, -_v2.y);
      const sb = Math.sign(l.al) || l.bend, b = sb * Math.acos(THREE.MathUtils.clamp((d * d - L0 * L0 - L1 * L1) / (2 * L0 * L1), -1, 1));
      const u = phi - Math.atan2(L1 * Math.sin(b), L0 + L1 * Math.cos(b));
      // ayak tabanının animasyondaki mutlak açısını koru, basarken yerel zemin eğimine yatır
      const gp = -Math.atan2(G(l.tgt.x + fx * e, l.tgt.z + fz * e) - G(l.tgt.x - fx * e, l.tgt.z - fz * e), 2 * e);
      const tilt = THREE.MathUtils.clamp(gp - (o.slope || 0), -0.4, 0.4) * l.lockW * Math.cos(l.sprawl);
      l.up.rotation.x = u; l.lo.rotation.x = b; l.ft.rotation.x = l.au + l.al + l.af - u - b + tilt * l.w;
      l.slip = l.locked ? Math.hypot(l.lockP.x - l.anim.x, l.lockP.z - l.anim.z) : 0;
    }
  }
}

/* ------------------------------------------------------------------ YILAN */
class Snake extends Creature {
  constructor(kind) {
    super(kind); const sp = this.spec, N = this.N = 20; this.segs = []; this.segLen = sp.len / N; this.radius = 0.45; this.height = 0.6;
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1), r = sp.h * 0.5 * (i === 0 ? 0.85 : 1 - Math.pow(f, 2.2) * 0.85), g = J(this.pivot);
      const parts = [paint(new THREE.SphereGeometry(r, 9, 7).scale(1, 0.85, this.segLen / r * 1.1), i % 3 === 1 ? sp.pattern : sp.color, (c, x, y) => { if (y < -r * 0.3) c.set(sp.belly); })];
      if (i === 0) { parts.push(at(ball(r * 1.25, sp.color, 1, 0.6, 1.5), 0, 0, r * 1.4)); for (const s of [-1, 1]) parts.push(at(ball(r * 0.22, 0x111111), s * r * 0.75, r * 0.4, r * 2.1)); parts.push(at(paint(new THREE.BoxGeometry(r * 0.18, 0.006, r * 1.6), 0xd42a3a), 0, -r * 0.1, r * 3.3)); }
      g.add(mesh(parts)); this.segs.push(g);
    }
  }
  animate(dt, anim, t) {
    this._begin(dt, anim); const moving = anim === 'walk' || anim === 'run', sp = this.spec;
    this.amp += ((moving ? 1 : 0.45) - this.amp) * this.k; this.phase += dt * (moving ? (anim === 'run' ? 11 : 6) : 0.8);
    const death = anim === 'die' ? ease(clamp01(this.at / 0.8)) : 0, charm = anim === 'charm' ? 1 : 0;
    const strike = anim === 'attack' ? Math.sin(PI * clamp01(this.at / this.attackTime)) : 0;
    const raise = Math.max(charm, strike * 0.6, anim === 'idle' ? 0.35 : 0);
    let px = 0, pz = sp.len * 0.35, py = sp.h * 0.42, prevX = 0, prevZ = pz + this.segLen;
    for (let i = 0; i < this.N; i++) {
      const f = i / (this.N - 1), s = this.segs[i];
      const up = Math.max(0, 1 - i / 6) * raise; // ön bölüm kalkar
      const x = Math.sin(this.phase - i * 0.62) * 0.2 * this.amp * (0.35 + f) * (1 - death) * (1 - up * 0.7) + (charm ? Math.sin(t * 2.2) * 0.12 * up : 0);
      const z = sp.len * 0.35 - i * this.segLen * (1 - up * 0.45) + strike * Math.max(0, 1 - i / 7) * 0.55;
      const y = sp.h * 0.42 + up * 0.55;
      const k = this.k; s.position.x += (x - s.position.x) * k; s.position.y += (y - s.position.y) * k; s.position.z += (z - s.position.z) * k;
      const yaw = Math.atan2(prevX - s.position.x, Math.max(0.001, prevZ - s.position.z));
      s.rotation.y = i === 0 ? (this.segs[1] ? Math.atan2(s.position.x - this.segs[1].position.x, s.position.z - this.segs[1].position.z) : 0) : yaw;
      s.rotation.x = i === 0 ? -up * 0.2 : -up * 0.9; s.rotation.z += (death * PI - s.rotation.z) * k;
      prevX = s.position.x; prevZ = s.position.z;
    }
  }
}

/* ------------------------------------------------------------------ KARTAL */
class Bird extends Creature {
  constructor(kind) {
    super(kind); const sp = this.spec; this.radius = 0.5; this.height = 0.9;
    const b = this.body = J(this.pivot, 0, sp.h, 0);
    b.add(mesh([torso({ ...sp, bodyR: 0.14, width: 1, belly: 0x5d4530 }, [[-0.5, 0], [-0.4, 0.5], [-0.1, 1], [0.2, 0.95], [0.42, 0.6], [0.5, 0]])]));
    this.head = J(b, 0, 0.06, sp.len * 0.42);
    this.head.add(mesh([ball(0.085, sp.head, 1, 1, 1.15), at(cone(0.035, 0.11, sp.beak, 6), 0, -0.015, 0.07, PI / 2 + 0.25), at(ball(0.016, 0x111111), 0.06, 0.02, 0.05), at(ball(0.016, 0x111111), -0.06, 0.02, 0.05), at(ball(0.1, sp.head, 1, 0.9, 1), 0, -0.04, -0.07)]));
    this.tailJ = J(b, 0, 0, -sp.len * 0.42);
    this.tailJ.add(mesh([at(paint(new THREE.CylinderGeometry(0.16, 0.05, 0.36, 7, 1).scale(1, 1, 0.08), sp.head), 0, 0, -0.17, -PI / 2)]));
    this.wings = [];
    for (const s of [-1, 1]) {
      const inner = J(b, s * 0.1, 0.05, 0.08), outer = J(inner, s * 0.52, 0, 0);
      const feathers = (len, chord, n, col) => { const parts = [at(ball(1, col, len * 0.52, 0.035, chord * 0.5), s * len * 0.5, 0, 0)]; for (let i = 0; i < n; i++) parts.push(at(ball(1, i % 2 ? 0x2c1f15 : col, 0.05, 0.012, chord * 0.62), s * (len * (i + 0.6) / n), -0.01, -chord * 0.42, 0, -s * i * 0.06)); return parts; };
      inner.add(mesh(feathers(0.55, 0.36, 5, sp.color)));
      const op = feathers(0.62, 0.3, 6, 0x3a281b); for (let i = 0; i < 4; i++) op.push(at(ball(1, 0x1e150f, 0.16, 0.01, 0.045), s * (0.62 + 0.07), 0, 0.08 - i * 0.09, 0, -s * (0.1 + i * 0.25)));
      outer.add(mesh(op)); this.wings.push({ inner, outer, s });
    }
    this.legsJ = [];
    for (const s of [-1, 1]) { const l = J(b, s * 0.07, -0.1, -0.02); const parts = [limb(0.035, 0.016, 0.2, 0x3a281b, 6), at(limb(0.014, 0.012, 0.1, sp.beak, 5), 0, -0.2, 0)]; for (let i = -1; i <= 1; i++) parts.push(at(cone(0.011, 0.085, sp.beak, 4), i * 0.02, -0.31, 0.0, PI / 2 + 0.1, 0, -i * 0.4)); l.add(mesh(parts)); this.legsJ.push(l); }
  }
  animate(dt, anim, t, o = {}) {
    this._begin(dt, anim); const k = this.k, sp = this.spec;
    const air = anim === 'fly' || anim === 'run' || (anim === 'attack' && o.air), death = anim === 'die' ? ease(clamp01(this.at / 0.7)) : 0;
    this.phase += dt * (air ? (o.glide ? 3 : 9.5) : 3); const ph = this.phase, flap = air ? (o.glide ? 0.12 : 0.75) : 0;
    const att = anim === 'attack' ? Math.sin(PI * clamp01(this.at / this.attackTime)) : 0;
    const b = this.body;
    b.position.y += ((air ? sp.h + Math.sin(ph - 1.2) * 0.05 * (flap > 0.3 ? 1 : 0) : 0.33 + (anim === 'walk' ? Math.abs(Math.sin(t * 9)) * 0.05 : 0)) - b.position.y) * k;
    this.r(b, air ? 0.08 - att * 0.7 : -0.85 + (anim === 'eat' ? 1.0 + Math.sin(t * 8) * 0.15 : 0), 0, (o.bank || 0));
    this.r(this.head, air ? att * 0.5 : 0.75 - (anim === 'eat' ? 0.3 : 0), anim === 'idle' ? Math.sin(t * 0.8 + this.seed) * 0.7 : 0, 0);
    this.r(this.tailJ, air ? Math.sin(ph) * 0.1 : 0.4, 0, 0);
    for (const w of this.wings) {
      if (air) { this.r(w.inner, 0, 0, w.s * (Math.sin(ph) * flap + 0.1 + att * 0.5)); this.r(w.outer, 0, 0, w.s * (Math.sin(ph - 0.9) * flap * 0.9 - 0.05)); }
      else { this.r(w.inner, 0.15, -w.s * (1.25 - death * 0.9), -w.s * (0.35 - death * 0.3)); this.r(w.outer, 0, -w.s * (-2.6 + death * 2.2), 0); } // katlanmış
    }
    this.legsJ.forEach((l, i) => this.r(l, air ? 1.2 - att * 1.9 : 0.85 + (anim === 'walk' ? Math.sin(t * 9 + i * PI) * 0.5 : 0), 0, 0));
    this.pivot.rotation.z += (death * 1.5 - this.pivot.rotation.z) * k; this.pivot.position.y += (death * 0.12 - this.pivot.position.y) * k;
  }
}

/* ------------------------------------------------------------------ İKİ AYAKLI DEV */
class Biped extends Creature {
  constructor(kind) {
    super(kind); const sp = this.spec, S = sp.h / 2.9; this.radius = 0.9 * S; this.height = sp.h * 1.08;
    const skin = sp.color, hipH = 1.25 * S;
    const hips = this.hips = J(this.pivot, 0, hipH, 0);
    hips.add(mesh([ball(0.5 * S, sp.cloth, 1.1, 0.75, 0.9), at(paint(new THREE.CylinderGeometry(0.5 * S, 0.62 * S, 0.5 * S, 10, 1, true), sp.cloth), 0, -0.25 * S, 0)]));
    const chest = this.chest = J(hips, 0, 0.2 * S, 0);
    chest.add(mesh([torso({ ...sp, bodyR: 0.6 * S, len: 1.35 * S, width: 1.15, flat: 0.85 }, [[-0.5, 0], [-0.45, 0.7], [-0.15, 0.95], [0.2, 1.05], [0.42, 0.8], [0.5, 0]]).rotateX(-PI / 2).translate(0, 0.6 * S, 0), at(ball(0.55 * S, sp.belly, 1, 0.9, 0.85), 0, 0.3 * S, 0.22 * S)]));
    const head = this.head = J(chest, 0, 1.3 * S, 0.1 * S);
    const hp = [ball(0.3 * S, skin, 1, 1.05, 1), at(ball(0.2 * S, skin, 1.3, 0.7, 0.9), 0, -0.14 * S, 0.16 * S), at(ball(0.07 * S, skin, 1, 1, 1), 0, -0.02 * S, 0.3 * S)];
    for (const s of [-1, 1]) { hp.push(at(cone(0.07 * S, 0.34 * S, 0xe9e2c8, 6), s * 0.2 * S, 0.2 * S, 0, 0.1, 0, -s * 0.7)); hp.push(at(cone(0.035 * S, 0.14 * S, 0xfff7dd, 5), s * 0.13 * S, -0.2 * S, 0.27 * S)); hp.push(at(ball(0.045 * S, 0xffd23a), s * 0.12 * S, 0.06 * S, 0.26 * S)); hp.push(at(ball(0.02 * S, 0x000000), s * 0.12 * S, 0.06 * S, 0.3 * S)); hp.push(at(ball(0.1 * S, skin, 0.4, 1, 0.8), s * 0.31 * S, 0.02 * S, 0, 0, 0, -s * 0.5)); }
    head.add(mesh(hp));
    this.arms = []; this.legs = [];
    for (const s of [-1, 1]) {
      const sh = J(chest, s * 0.72 * S, 1.02 * S, 0); sh.add(mesh([ball(0.26 * S, skin), limb(0.21 * S, 0.17 * S, 0.62 * S, skin)]));
      const el = J(sh, 0, -0.62 * S, 0); const ap = [limb(0.18 * S, 0.15 * S, 0.58 * S, skin), at(ball(0.2 * S, skin, 1, 1.1, 1), 0, -0.68 * S, 0)];
      if (s === 1) { ap.push(at(limb(0.07 * S, 0.19 * S, 1.25 * S, 0x5b3d22, 8), 0, -0.68 * S, -0.25 * S, -PI / 2)); for (let i = 0; i < 6; i++) ap.push(at(cone(0.04 * S, 0.13 * S, 0xcfcfcf, 4), 0, -0.68 * S, (0.75 + (i % 3) * 0.13) * S, 0, 0, i * 1.05).applyMatrix4(new THREE.Matrix4())); }
      el.add(mesh(ap)); this.arms.push({ sh, el, s });
      const th = J(hips, s * 0.3 * S, -0.1 * S, 0); th.rotation.order = 'ZXY'; th.add(mesh([limb(0.25 * S, 0.19 * S, 0.5 * S, skin)]));
      const kn = J(th, 0, -0.5 * S, 0); kn.add(mesh([limb(0.19 * S, 0.15 * S, 0.48 * S, skin), at(ball(0.2 * S, skin, 1, 0.55, 1.7), 0, -0.56 * S, 0.12 * S)]));
      // ayak IK'si: uyluk 0.5·S, baldır (diz → ayak bileği) 0.48·S
      this.legs.push({ th, kn, s, L0: 0.5 * S, L1: 0.48 * S, ank: new THREE.Vector3(0, -0.48 * S, 0), off: 0, ax: 0, kx: 0, p: new THREE.Vector3(), tgt: new THREE.Vector3(), ...Creature.lockState() });
    }
    this.ikStats = { locks: 0, releases: 0, early: 0 };
    this.hipH = hipH; this.stride = 0; this.omega = 0; this.ikW = 0; this.ikDrop = 0; this.sideRoll = 0; this.ikEnabled = true; this._ikOn = false;
  }
  animate(dt, anim, t, o = {}) {
    // önceki karenin IK düzeltmesini geri al: yumuşatma (r) saf animasyon açılarından devam etsin, düzeltme birikmesin
    if (this._ikOn) { this.hips.position.y = this._ahy; for (const l of this.legs) { l.th.rotation.x = l.ax; l.th.rotation.z = l.az; l.kn.rotation.x = l.kx; } this._ikOn = false; }
    this._begin(dt, anim); const k = this.k, moving = anim === 'walk' || anim === 'run';
    this.amp += ((moving ? (anim === 'run' ? 1 : 0.6) : 0) - this.amp) * k;
    // adım boyu–hız eşlemesi: basışta (yarım döngü, π/ω) ayak 2·L·sin(a) kadar geriye süpürülür. Gövde hızına eşit olsun
    // diye önce uyluk salınım açısı (a) büyür; sınıra gelince kadans (ω) artar (en çok 2 kat).
    const run = anim === 'run', L = this.legs[0].L0 + this.legs[0].L1, base = run ? 7.5 : 4.2, aMax = run ? 0.75 : 0.6, v = o.speed || 0;
    let sa = run ? 0.6 : 0.36, om = base;
    if (moving && v > 0.05) {
      const D = v * PI / base;
      if (D < 2 * L * Math.sin(aMax)) sa = Math.max(0.12, Math.asin(D / (2 * L)));
      else { sa = aMax; om = Math.min(base * 2, v * PI / (2 * L * Math.sin(aMax))); }
    }
    this.stride += ((moving ? sa : 0) - this.stride) * k; this.omega = om; this.cadence = om;
    if (moving) this.phase += dt * om;
    const A = this.amp, ph = this.phase, death = anim === 'die' ? ease(clamp01(this.at / 1.1)) : 0, sw = this.stride;
    const p = anim === 'attack' ? clamp01(this.at / this.attackTime) : 0, wind = p < 0.45 ? p / 0.45 : 0, smash = p >= 0.45 ? 1 - (p - 0.45) / 0.55 : 0;
    const kl = 1 - Math.exp(-dt * 60);
    this.r(this.hips, 0.05 + A * 0.08, Math.sin(ph) * 0.1 * A, Math.sin(ph) * 0.04 * A);
    this.r(this.chest, 0.12 + Math.sin(t * 1.5) * 0.02 - wind * 0.35 + smash * 0.55, -Math.sin(ph) * 0.14 * A + wind * 0.3, 0);
    this.r(this.head, -0.05 + smash * -0.2, anim === 'idle' ? Math.sin(t * 0.5 + this.seed) * 0.5 : 0, 0);
    // bacak hedefleri sürekli; genel yumuşatma (τ≈83 ms) yürüyüş döngüsünü süzüp adımı kısaltacağı için bacaklar hızlı izler
    this.legs.forEach((l) => {
      const s = Math.sin(ph + (l.s > 0 ? 0 : PI)), th = l.th.rotation, kn = l.kn.rotation;
      th.x += (-s * sw - 0.05 + smash * -0.2 - th.x) * kl; th.y += (0 - th.y) * k; th.z += (l.s * 0.06 - th.z) * k;
      kn.x += (Math.max(0, Math.cos(ph + (l.s > 0 ? 0 : PI))) * 0.9 * A + 0.1 + smash * 0.3 - kn.x) * kl;
    });
    // ters sarkaç: kalça, en uzun (basan) bacağın gerçek dikey boyuna göre iner/kalkar → basan ayak basış boyunca aynı
    // yükseklikte kalır (kalça eğimi ve diz bükümü de hesaba katılır; bekleme pozunda düşüş 0)
    const hp = this.hips.rotation.x, ext = (l) => l.L0 * Math.cos(l.th.rotation.x + hp) + l.L1 * Math.cos(l.th.rotation.x + hp + l.kn.rotation.x);
    const ref = this.legs[0].L0 + this.legs[0].L1 * Math.cos(0.1), vault = (ref - Math.max(...this.legs.map(ext))) * clamp01(A / 0.6);
    this.hips.position.y += (this.hipH - vault - smash * 0.15 - this.hips.position.y) * kl;
    this.arms.forEach((a) => {
      const s = Math.sin(ph + (a.s > 0 ? PI : 0));
      if (a.s === 1 && p > 0) { this.r(a.sh, -(wind * 2.9 + smash * 1.0), 0, 0.15); this.r(a.el, -(wind * 0.5 + smash * 0.2), 0, 0); }
      else { this.r(a.sh, -s * 0.5 * A + 0.1, 0, a.s * 0.22); this.r(a.el, -0.35 - A * 0.3, 0, 0); }
    });
    this.pivot.rotation.x += (-death * PI / 2 - this.pivot.rotation.x) * k; this.pivot.position.y += (death * 0.45 - this.pivot.position.y) * k;
    this._footIK(dt, o, anim);
  }
  // İki ayaklı ayak IK'si: dev animasyonu düz zemin varsayar (gövde eğime yatmaz). Her ayak bileğinin altındaki zeminin kök
  // zeminine göre farkı hedefe eklenir; erişilemeyen hedefte kalça alçalır; uyluk + baldır düzlemsel iki kemikli IK ile çözülür.
  _footIK(dt, o, anim) {
    const G = o.ground, sp = this.spec, legs = this.legs;
    for (const l of legs) { l.ax = l.th.rotation.x; l.az = l.th.rotation.z; l.kx = l.kn.rotation.x; }
    this._ahy = this.hips.position.y;
    const want = G && o.ik !== false && this.ikEnabled && anim !== 'die' && !o.air;
    this.ikW = want ? this.ikW + (1 - this.ikW) * Math.min(1, dt * 6) : 0;
    const w = this.ikW;
    if (w < 0.002) { for (const l of legs) { l.off = 0; l.locked = false; l.lockW = 0; l.prevZ = null; } this.ikDrop = 0; return; }
    this._ikOn = true;
    const root = this.root, k = Math.min(1, dt * 14), rootY = root.position.y, maxUp = sp.h * 0.2, maxDn = sp.h * 0.16;
    const speed = o.speed || 0, can = (anim === 'walk' || anim === 'run') && speed > 0.2;
    root.updateMatrixWorld(true);
    let need = 0;
    for (const l of legs) {
      l.kn.localToWorld(l.p.copy(l.ank));
      // basma kilidi: basan ayağın yatay konumu dünyada sabit
      l.th.getWorldPosition(_v1); this.pivot.worldToLocal(l.loc.copy(l.p));
      stanceLock(l, l.loc, l.p, _v1, l.L0 + l.L1, dt, speed, can, this.ikStats);
      l.tgt.copy(l.p); const lw = l.lockW * w; l.tgt.x += (l.lockP.x - l.p.x) * lw; l.tgt.z += (l.lockP.z - l.p.z) * lw;
      const off = THREE.MathUtils.clamp(G(l.tgt.x, l.tgt.z) - rootY, -maxDn, maxUp);
      l.off += (off - l.off) * k;
      l.tgt.y += l.off * w;
      need = Math.max(need, _v1.distanceTo(l.tgt) - Math.max(_v1.distanceTo(l.p), (l.L0 + l.L1) * 0.97));
    }
    const dn = Math.min(need, sp.h * 0.15); this.ikDrop += (dn - this.ikDrop) * Math.min(1, dt * (dn > this.ikDrop ? 40 : 14)); // alçalma hızlı (kilitli ayak düz bacakla erişilemez kalmasın), kalkış yumuşak
    if (this.ikDrop > 1e-4) this.hips.position.y -= this.ikDrop;
    this.hips.updateMatrixWorld(true);
    for (const l of legs) {
      this.hips.worldToLocal(_v2.copy(l.tgt)).sub(l.th.position);
      // yana açılma (uyluk z, 'ZXY' sırası: önce bacak düzleminde salınım, sonra düzlem yana döner): kalça yalpaladığında
      // ya da dönüşte kilitli ayak bacak düzleminin dışında kalır; düzlem hedefe çevrilir, ardından düzlemsel çözüm
      const ab = THREE.MathUtils.clamp(Math.atan2(_v2.x, -_v2.y), -0.4, 0.4), cy = -_v2.x * Math.sin(ab) + _v2.y * Math.cos(ab);
      l.th.rotation.z = ab;
      const L0 = l.L0, L1 = l.L1, d = THREE.MathUtils.clamp(Math.hypot(cy, _v2.z), Math.abs(L0 - L1) + 1e-3, (L0 + L1) * 0.999);
      const b = Math.acos(THREE.MathUtils.clamp((d * d - L0 * L0 - L1 * L1) / (2 * L0 * L1), -1, 1));
      l.th.rotation.x = Math.atan2(-_v2.z, -cy) - Math.atan2(L1 * Math.sin(b), L0 + L1 * Math.cos(b));
      l.kn.rotation.x = b;
    }
    this.root.updateMatrixWorld(true);
  }
}

/* ------------------------------------------------------------------ GLB (İSKELETLİ) YARATIKLAR */
const GLB = {};
export async function loadGLBCreatures(base = 'assets/models/', onProgress) {
  const loader = new GLTFLoader();
  const load = (n) => new Promise((res, rej) => loader.load(base + n + '.glb', (g) => { GLB[n] = g; onProgress?.(n); res(g); }, undefined, rej));
  await Promise.all([load('dragon'), load('fox')]);
  return GLB;
}
class GLBCreature extends Creature {
  constructor(kind) {
    super(kind); const sp = this.spec, src = GLB[sp.model];
    if (!src) throw new Error(sp.model + '.glb yüklenmedi');
    const model = this.model = skeletonClone(src.scene); model.scale.setScalar(sp.scale);
    model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    this.pivot.add(model);
    this.mixer = new THREE.AnimationMixer(model); this.actions = {};
    for (const c of src.animations) this.actions[c.name] = this.mixer.clipAction(c);
    this.cur = null; this.radius = sp.radius || sp.len * 0.4; this.height = sp.h * 1.25;
    // ayak IK'si: modelin kendi bacak zincirleri
    this.legs = (sp.ikLegs || []).map(([a, b, c]) => {
      const f = (n) => { let r = null; model.traverse((x) => { if (!r && x.isBone && x.name.startsWith(n)) r = x; }); if (!r) throw new Error(kind + ': kemik yok ' + n); return r; };
      return { A: f(a), B: f(b), C: f(c), off: 0, p: new THREE.Vector3(), tgt: new THREE.Vector3(), qa: new THREE.Quaternion(), qb: new THREE.Quaternion(), ...Creature.lockState() };
    });
    this.ikStats = { locks: 0, releases: 0, early: 0 };
    this.ikW = 0; this.ikDrop = 0; this.ikEnabled = this.legs.length > 0; this._ikOn = false;
    // klip yer hızları (ayak süpürme hızı, m/sn): oynatma hızı gövde hızına göre ayarlanır, ayak kaymaz
    this.groundSpeed = {};
    if (this.legs.length) for (const n of new Set([sp.clips.walk, sp.clips.run])) if (this.actions[n]) this.groundSpeed[n] = clipGroundSpeed(this, n);
  }
  animate(dt, anim, t, o = {}) {
    // önceki karenin IK düzeltmesini geri al (klipte izi olmayan kemiklerde birikmesin)
    if (this._ikOn) { this.model.position.y = 0; for (const l of this.legs) { l.A.quaternion.copy(l.qa); l.B.quaternion.copy(l.qb); } this._ikOn = false; }
    this._begin(dt, anim); const sp = this.spec, k = this.k;
    let name = sp.clips[anim], procAttack = false, procDie = false;
    if (!name) { if (anim === 'attack') { name = sp.clips.run; procAttack = true; } else if (anim === 'die') { name = this.cur?._clip.name || sp.clips.idle; procDie = true; } else name = sp.clips.idle; }
    const a = this.actions[name];
    if (a && a !== this.cur) {
      const once = (anim === 'attack' && !procAttack) || (anim === 'die' && !procDie);
      a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = true; a.enabled = true;
      if (this.cur) a.crossFadeFrom(this.cur, 0.3, false); a.play(); this.cur = a;
    } else if (a && this.at === dt && (anim === 'attack') && !procAttack) { a.reset().play(); }
    // yürüme/koşu: klip, ölçülen yer hızına göre gövde hızıyla eşlenir (ölçüm yoksa eski oran)
    const gs = a && this.groundSpeed[a._clip.name], loco = anim === 'walk' || anim === 'run';
    if (a) a.timeScale = procDie ? 0 : loco && gs && o.speed > 0.05 ? THREE.MathUtils.clamp(o.speed / gs, 0.5, 2.2) : anim === 'run' && sp.runScale ? sp.runScale : (loco ? (o.rate || 1) : 1);
    this.mixer.update(dt);
    // klibi olmayan hareketler için prosedürel tamamlayıcı (tilki: saldırı/ölüm/yeme)
    const lunge = procAttack ? Math.sin(PI * clamp01(this.at / this.attackTime)) : 0, death = procDie ? ease(clamp01(this.at / 0.8)) : 0;
    const pv = this.pivot, eat = anim === 'eat' && !sp.clips.eat ? 0.5 + Math.sin(t * 8) * 0.06 : 0;
    pv.position.z += (lunge * sp.len * 0.35 - pv.position.z) * k;
    pv.rotation.x += (lunge * -0.25 + eat + (o.slope || 0) - pv.rotation.x) * k;
    pv.rotation.z += (death * PI / 2 * 0.95 - pv.rotation.z) * k; pv.position.y += (death * sp.h * 0.22 + eat * sp.h * 0.1 - pv.position.y) * k;
    this._footIK(dt, o, anim, procAttack || eat > 0);
  }
  // İskeletli (GLB) modellerde ayak IK'si: klip, kökten geçen ve gövde eğimine (o.slope) eşit bir düzlem varsayar. Her bacak
  // ucunun altındaki gerçek zeminin bu düzlemden farkı hedefe eklenir, erişilemeyen hedefte model alçalır ve her bacak
  // analitik iki kemikli IK ile çözülür (kemik boyları korunur). Uç kemiğin dünya yönü korunur, parmaklar onu izler.
  _footIK(dt, o, anim, proc) {
    const legs = this.legs, G = o.ground, sp = this.spec;
    if (!legs.length) return;
    const want = G && o.ik !== false && this.ikEnabled && !proc && anim !== 'die' && !o.air;
    this.ikW = want ? this.ikW + (1 - this.ikW) * Math.min(1, dt * 6) : 0;
    const w = this.ikW;
    if (w < 0.002) { for (const l of legs) { l.off = 0; l.locked = false; l.lockW = 0; l.prevZ = null; } this.ikDrop = 0; return; }
    this._ikOn = true;
    const root = this.root, k = Math.min(1, dt * 14), rx = root.position.x, rz = root.position.z, rootY = root.position.y;
    const speed = o.speed || 0, can = (anim === 'walk' || anim === 'run') && speed > 0.2;
    const fx = Math.sin(root.rotation.y), fz = Math.cos(root.rotation.y), grad = -Math.tan(o.slope || 0), maxUp = sp.h * 0.45, maxDn = sp.h * 0.35;
    root.updateMatrixWorld(true); _fw.set(fx, 0, fz);
    let need = 0;
    for (const l of legs) {
      l.qa.copy(l.A.quaternion); l.qb.copy(l.B.quaternion);
      l.C.getWorldPosition(l.p);
      l.A.getWorldPosition(_v1); l.B.getWorldPosition(_v2); const reach = _v1.distanceTo(_v2) + _v2.distanceTo(l.p);
      // basma kilidi (gövde uzayında tespit, pivot eğimle döndüğü için yükseklik eğimden bağımsız)
      this.pivot.worldToLocal(l.loc.copy(l.p));
      stanceLock(l, l.loc, l.p, _v1, reach, dt, speed, can, this.ikStats);
      l.tgt.copy(l.p); const lw = l.lockW * w; l.tgt.x += (l.lockP.x - l.p.x) * lw; l.tgt.z += (l.lockP.z - l.p.z) * lw;
      const fwd = (l.tgt.x - rx) * fx + (l.tgt.z - rz) * fz;
      const off = THREE.MathUtils.clamp(G(l.tgt.x, l.tgt.z) - (rootY + fwd * grad), -maxDn, maxUp);
      l.off += (off - l.off) * k;
      l.tgt.y = l.p.y + l.off * w;
      need = Math.max(need, _v1.distanceTo(l.tgt) - Math.max(_v1.distanceTo(l.p), reach * 0.97));
    }
    const nd = Math.min(need, sp.h * 0.3); this.ikDrop += (nd - this.ikDrop) * (nd > this.ikDrop ? Math.min(1, dt * 40) : k); // hızlı in, yumuşak kalk
    // model pivotun çocuğu; pivot eğimle döndüğü için alçaltma pivot uzayındaki dikey eksen boyunca yapılır (küçük açıda yeterli)
    this.model.position.y = -this.ikDrop;
    this.model.updateMatrixWorld(true);
    for (const l of legs) {
      l.C.getWorldQuaternion(_qc);
      solveTwoBone(l.A, l.B, l.C, l.tgt, _fw);
      setWorldQuat(l.C, _qc);
    }
  }
}

// Klibin doğal yer hızı: klip ayrı örneklenir, her bacak ucunun gövde (pivot) uzayındaki izi çıkarılır; yere yakın ve geriye
// giden karelerdeki süpürme hızlarının ortancası alınır (ortanca: yavaş iniş/kalkış kareleri ortalamayı bozmasın).
// Sonuç türe göre önbelleğe alınır (her hayvan kopyası yeniden ölçmez).
const GS_CACHE = {};
function clipGroundSpeed(cr, name) {
  const key = cr.kind + '/' + name; if (key in GS_CACHE) return GS_CACHE[key];
  const act = cr.actions[name], clip = act._clip, N = 90, dt = clip.duration / N, tracks = cr.legs.map(() => []);
  act.reset(); act.setLoop(THREE.LoopRepeat, Infinity); act.timeScale = 1; act.weight = 1; act.play();
  const p = new THREE.Vector3();
  cr.root.updateMatrixWorld(true);
  for (let i = 0; i <= N; i++) {
    cr.mixer.setTime(i * dt); cr.model.updateMatrixWorld(true);
    cr.legs.forEach((l, j) => { l.C.getWorldPosition(p); cr.pivot.worldToLocal(p); tracks[j].push([p.y, p.z]); });
  }
  act.stop(); cr.mixer.setTime(0);
  const v = [];
  for (const tr of tracks) {
    const lo = Math.min(...tr.map((q) => q[0])), hi = Math.max(...tr.map((q) => q[0])), band = lo + Math.max(0.02 * cr.spec.h, (hi - lo) * 0.2);
    for (let i = 1; i < tr.length; i++) { const vz = (tr[i][1] - tr[i - 1][1]) / dt; if (tr[i][0] < band && vz < 0) v.push(-vz); }
  }
  v.sort((a, b) => a - b);
  return (GS_CACHE[key] = v.length ? v[v.length >> 1] : 0);
}

export function makeCreature(kind) {
  const sp = SPECIES[kind]; if (!sp) throw new Error('Bilinmeyen tür: ' + kind);
  return sp.kind === 'quad' ? new Quadruped(kind) : sp.kind === 'snake' ? new Snake(kind) : sp.kind === 'bird' ? new Bird(kind) : sp.kind === 'biped' ? new Biped(kind) : new GLBCreature(kind);
}
