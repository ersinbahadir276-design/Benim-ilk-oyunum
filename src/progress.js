// İlerleme sistemi: oyuncu ve yoldaş deneyim puanı (XP) / seviye, ve tarayıcıya kayıt (localStorage).
import { SPECIES } from './creatures.js';
import { ITEMS } from './animal.js';

export const MAX_LEVEL = 20, PET_MAX_LEVEL = 10, SAVE_KEY = 'yaban-yoldaslari-save-v1';

// bir sonraki seviye için gereken XP (yumuşak üstel eğri)
export const xpToNext = (lv) => Math.round(30 + 25 * Math.pow(lv, 1.45));
export const petXpToNext = (lv) => Math.round(20 + 18 * Math.pow(lv, 1.4));
// seviye bonusları
export const playerHpMax = (lv) => 100 + (lv - 1) * 12;
export const playerDmgMul = (lv) => 1 + (lv - 1) * 0.08;
export const petHpMul = (lv) => 1 + (lv - 1) * 0.1;
export const petDmgMul = (lv) => 1 + (lv - 1) * 0.08;
// öldürülen yaratığın değeri: canı ve hasarıyla orantılı
export const killXp = (spec) => Math.max(4, Math.round(spec.hp / 6 + spec.dmg / 2));
export const tameXp = (spec) => 20 + (spec.tame?.steps || 1) * 10 + Math.round(spec.hp / 10);
export const GATHER_XP = 2;

export class Progress {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; }
  get need() { return xpToNext(this.level); }
  get frac() { return this.level >= MAX_LEVEL ? 1 : this.xp / this.need; }
  get dmgMul() { return playerDmgMul(this.level); }
  // oyuncuya XP ver; seviye atlarsa can artar ve dolar
  gain(n, show = true) {
    if (n <= 0 || this.level >= MAX_LEVEL) return;
    this.xp += n; const P = this.g.player;
    if (show && P) this.g.floatText(`+${n} XP`, P, '#9fd8ff');
    while (this.level < MAX_LEVEL && this.xp >= this.need) {
      this.xp -= this.need; this.level++;
      if (P) { P.hpMax = playerHpMax(this.level); P.hp = P.hpMax; P.stamina = 100; this.g.floatText(`SEVİYE ${this.level}!`, P, '#ffd75e'); }
      this.g.msg(`⭐ Seviye ${this.level}! Can ${playerHpMax(this.level)}, kılıç hasarı x${playerDmgMul(this.level).toFixed(2)}`);
    }
    if (this.level >= MAX_LEVEL) this.xp = 0;
  }
  // yoldaşa XP ver
  petGain(p, n) {
    if (!p.tamed || p.dead || n <= 0) return;
    p.level = p.level || 1; p.xp = (p.xp || 0) + n;
    while (p.level < PET_MAX_LEVEL && p.xp >= petXpToNext(p.level)) {
      p.xp -= petXpToNext(p.level); p.level++; applyPetLevel(p, true);
      this.g.msg(`🐾 ${p.petName} seviye ${p.level} oldu!`); this.g.floatText(`Sv. ${p.level}`, p, '#ffd75e');
    }
    if (p.level >= PET_MAX_LEVEL) p.xp = 0;
  }
  // bir yaban hayvanı öldü: öldüren oyuncuysa tam XP + yakındaki yoldaşlara pay; yoldaşsa yoldaşa tam, oyuncuya yarım
  onKill(a, from) {
    const g = this.g, xp = killXp(a.spec);
    if (from === g.player) {
      this.gain(xp);
      for (const p of g.pets) if (p.dist(g.player) < 20) this.petGain(p, Math.ceil(xp * 0.3));
    } else if (from?.tamed) { this.petGain(from, xp); this.gain(Math.ceil(xp / 2)); }
  }
  onTame(a) { this.gain(tameXp(a.spec)); }
  onGather() { this.gain(GATHER_XP, false); }
}

// yoldaş seviyesine göre can ve hasar çarpanı uygula
export function applyPetLevel(p, heal = false) {
  const lv = p.level || 1, frac = p.hpMax ? p.hp / p.hpMax : 1;
  p.hpMax = Math.round(p.spec.hp * petHpMul(lv)); p.hp = heal ? p.hpMax : Math.max(1, Math.round(p.hpMax * frac)); p.dmgMul = petDmgMul(lv);
}
// serbest bırakılan yoldaş yeniden yabani istatistiklerine döner
export function resetPetLevel(p) { p.level = 1; p.xp = 0; p.dmgMul = 1; const f = p.hp / p.hpMax; p.hpMax = p.spec.hp; p.hp = Math.max(1, p.hpMax * f); }

/* ---------------- kayıt */
export function serialize(g) {
  const P = g.player, pr = g.progress;
  return {
    v: 1, t: Date.now(),
    player: { level: pr.level, xp: pr.xp, hp: Math.round(P.alive ? P.hp : P.hpMax), x: +P.x.toFixed(2), z: +P.z.toFixed(2) },
    inv: { ...g.inv.items }, sel: g.inv.sel, petCounter: { ...g.petCounter },
    pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, level: p.level || 1, xp: p.xp || 0, hunger: Math.round(p.hunger), frac: +p.frac.toFixed(3), stay: !!p.stay })),
  };
}
// kayıt verisini doğrula (bozuk / eski kayıtlar oyunu kırmasın)
export function validSave(d) {
  if (!d || d.v !== 1 || typeof d.player !== 'object' || typeof d.inv !== 'object' || !Array.isArray(d.pets)) return false;
  return Number.isFinite(d.player.level) && Number.isFinite(d.player.x) && Number.isFinite(d.player.z);
}
// makePet(kind, x, z) → evcil Animal döndürür (main.js sağlar)
export function applySave(g, d, makePet) {
  if (!validSave(d)) return false;
  const P = g.player, pr = g.progress, clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  pr.level = clamp(Math.floor(d.player.level), 1, MAX_LEVEL); pr.xp = Math.max(0, +d.player.xp || 0);
  P.hpMax = playerHpMax(pr.level); P.hp = clamp(+d.player.hp || P.hpMax, 1, P.hpMax); P.x = d.player.x; P.z = d.player.z; P.vy = 0;
  g.inv.items = {}; for (const [k, n] of Object.entries(d.inv)) if (ITEMS[k] && n > 0) g.inv.items[k] = Math.floor(n);
  if (!g.inv.items.flute) g.inv.items.flute = 1;
  if (ITEMS[d.sel]) g.inv.sel = d.sel; g.inv.dirty = true;
  g.petCounter = { ...(d.petCounter || {}) };
  for (const [i, s] of d.pets.slice(0, 5).entries()) {
    if (!SPECIES[s.kind]?.tame) continue;
    const ang = (i / 5) * Math.PI * 2, p = makePet(s.kind, P.x + Math.sin(ang) * 3, P.z + Math.cos(ang) * 3);
    p.petName = String(s.name || SPECIES[s.kind].name).slice(0, 40); p.level = clamp(Math.floor(s.level) || 1, 1, PET_MAX_LEVEL); p.xp = Math.max(0, +s.xp || 0);
    p.hunger = clamp(+s.hunger || 70, 0, 100); p.stay = !!s.stay; p.hp = p.hpMax = 1; applyPetLevel(p); p.hp = Math.max(1, Math.round(p.hpMax * clamp(+s.frac || 1, 0.05, 1)));
  }
  return true;
}
export function readSave() { try { const s = localStorage.getItem(SAVE_KEY); const d = s && JSON.parse(s); return validSave(d) ? d : null; } catch { return null; } }
export function writeSave(g) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(serialize(g))); return true; } catch { return false; } }
export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* yok say */ } }
