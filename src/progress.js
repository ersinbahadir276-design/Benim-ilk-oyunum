// İlerleme sistemi: oyuncu deneyimi/seviyesi, yoldaş bağ seviyeleri, kayıt (localStorage) ve yükleme.
import { ITEMS } from './animal.js';

export const MAX_LEVEL = 30, PET_MAX_LEVEL = 10;
export const SAVE_KEY = 'yaban-yoldaslari-save-v1';
// seviye L'den L+1'e geçmek için gereken deneyim
export const xpNeed = (L) => Math.round(40 * Math.pow(L, 1.45));
export const petXpNeed = (L) => Math.round(25 * Math.pow(L, 1.35));
// bir türü yenmenin / evcilleştirmenin değeri (güçlü türler daha değerli)
export const killXP = (spec) => Math.max(4, Math.round(spec.hp / 6 + spec.dmg * 0.6));
export const tameXP = (spec) => Math.round(15 + spec.hp / 4 + (spec.tame?.steps || 1) * 5);
export const GATHER_XP = 2;

// oyuncu seviyesinin etkileri
export const playerStats = (L) => ({ hpMax: 100 + (L - 1) * 10, dmgMul: 1 + (L - 1) * 0.08, staminaRegen: 1 + (L - 1) * 0.03 });
// yoldaş bağ seviyesinin etkileri
export const petStats = (L) => ({ hpMul: 1 + (L - 1) * 0.12, dmgMul: 1 + (L - 1) * 0.1 });

export class Progress {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.stats = { kills: 0, tamed: 0, gathered: 0 }; this.saveT = 30; }
  get need() { return xpNeed(this.level); }

  apply() {
    const P = this.g.player, s = playerStats(this.level), frac = P.hp / P.hpMax;
    P.hpMax = s.hpMax; P.hp = Math.min(P.hpMax, Math.max(1, frac * P.hpMax)); P.dmgMul = s.dmgMul; P.staminaRegen = s.staminaRegen;
  }
  gain(n, src) {
    if (n <= 0) return; const g = this.g;
    if (this.level >= MAX_LEVEL) return;
    this.xp += n; if (src && g.player) g.floatText(`+${n} XP`, g.player, '#9fe0ff');
    while (this.level < MAX_LEVEL && this.xp >= this.need) {
      this.xp -= this.need; this.level++; this.apply(); g.player.hp = g.player.hpMax;
      const s = playerStats(this.level);
      g.msg(`⭐ Seviye ${this.level}! Can ${s.hpMax}, saldırı gücü +%${Math.round((s.dmgMul - 1) * 100)}.`);
      g.floatText(`SEVİYE ${this.level}`, g.player, '#ffd75e');
    }
    if (this.level >= MAX_LEVEL) this.xp = 0;
  }
  // yoldaş bağ deneyimi
  petGain(p, n) {
    if (!p.tamed || p.dead) return; p.level = p.level || 1; p.xp = (p.xp || 0) + n;
    while (p.level < PET_MAX_LEVEL && p.xp >= petXpNeed(p.level)) {
      p.xp -= petXpNeed(p.level); p.level++; applyPetLevel(p, true);
      this.g.msg(`💞 ${p.petName} bağ seviyesi ${p.level} oldu! (can ×${petStats(p.level).hpMul.toFixed(2)}, güç ×${petStats(p.level).dmgMul.toFixed(2)})`);
      this.g.floatText(`Bağ ${p.level}`, p, '#ff9fd0');
    }
    if (p.level >= PET_MAX_LEVEL) p.xp = 0;
  }

  /* ---------------- olay kancaları */
  onKill(animal, from) {
    const g = this.g, xp = killXP(animal.spec);
    if (from === g.player || from?.tamed) { this.stats.kills++; this.gain(xp, true); }
    if (from?.tamed) this.petGain(from, Math.round(xp * 0.8));
  }
  onTame(animal) { this.stats.tamed++; animal.level = animal.level || 1; animal.xp = animal.xp || 0; applyPetLevel(animal, false); this.gain(tameXP(animal.spec), true); }
  applyPet(p) { p.level = p.level || 1; p.xp = p.xp || 0; applyPetLevel(p, false); }
  onGather() { this.stats.gathered++; this.gain(GATHER_XP, false); }
  onPetHit(p, dmg) { this.petGain(p, Math.max(1, Math.round(dmg / 8))); }
  onPetFed(p) { this.petGain(p, 4); }

  /* ---------------- kayıt */
  snapshot() {
    const g = this.g, P = g.player;
    return {
      v: 1, t: Date.now(), level: this.level, xp: this.xp, stats: { ...this.stats },
      player: { x: +P.x.toFixed(2), z: +P.z.toFixed(2), hp: Math.round(P.hp), yaw: +P.yaw.toFixed(3) },
      inv: { ...g.inv.items }, sel: g.inv.sel, petCounter: { ...g.petCounter },
      pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, level: p.level || 1, xp: p.xp || 0, hunger: Math.round(p.hunger), hpFrac: +(p.hp / p.hpMax).toFixed(3), stay: !!p.stay })),
    };
  }
  save(storage = globalThis.localStorage) {
    try { storage.setItem(SAVE_KEY, JSON.stringify(this.snapshot())); this.saveT = 30; return true; } catch { return false; }
  }
  static read(storage = globalThis.localStorage) {
    try { const d = JSON.parse(storage.getItem(SAVE_KEY) || 'null'); return validSave(d) ? d : null; } catch { return null; }
  }
  static clear(storage = globalThis.localStorage) { try { storage.removeItem(SAVE_KEY); } catch { /* yok say */ } }

  // kaydı oyuna uygula; makePet(kind, x, z) yeni bir hayvan döndürmeli
  restore(d, makePet) {
    const g = this.g, P = g.player;
    this.level = Math.min(MAX_LEVEL, Math.max(1, d.level | 0)); this.xp = Math.max(0, +d.xp || 0); Object.assign(this.stats, d.stats || {});
    g.inv.items = {}; for (const [k, v] of Object.entries(d.inv || {})) if (ITEMS[k] && v > 0) g.inv.items[k] = Math.floor(v);
    if (!g.inv.items.flute) g.inv.items.flute = 1; g.inv.sel = ITEMS[d.sel] ? d.sel : 'meat'; g.inv.dirty = true;
    g.petCounter = { ...(d.petCounter || {}) };
    if (d.player) { P.x = d.player.x; P.z = d.player.z; P.yaw = d.player.yaw || 0; }
    P.hpMax = playerStats(this.level).hpMax; P.hp = P.hpMax; this.apply(); if (d.player?.hp > 0) P.hp = Math.min(P.hpMax, d.player.hp);
    for (const [i, s] of (d.pets || []).slice(0, 5).entries()) {
      const a = Math.PI + i * 0.7, p = makePet(s.kind, P.x + Math.sin(a) * 3, P.z + Math.cos(a) * 3); if (!p) continue;
      p.level = Math.min(PET_MAX_LEVEL, Math.max(1, s.level | 0)); p.xp = Math.max(0, +s.xp || 0);
      p.becomePet({ silent: true, name: s.name });
      p.hunger = Math.min(100, Math.max(0, +s.hunger || 0)); p.hp = Math.max(1, p.hpMax * (+s.hpFrac || 1)); p.stay = !!s.stay;
    }
  }
  update(dt) { this.saveT -= dt; if (this.saveT <= 0 && this.autosave) this.save(); }
}

export function applyPetLevel(p, heal) {
  const s = petStats(p.level || 1), frac = p.hp / p.hpMax;
  p.hpMax = Math.round(p.spec.hp * s.hpMul); p.dmgMul = s.dmgMul; p.hp = heal ? p.hpMax : Math.max(1, frac * p.hpMax);
}
export function resetPetLevel(p) { p.level = 1; p.xp = 0; p.dmgMul = 1; const frac = p.hp / p.hpMax; p.hpMax = p.spec.hp; p.hp = Math.max(0, frac * p.hpMax); }

export function validSave(d) {
  return !!d && d.v === 1 && Number.isFinite(d.level) && typeof d.inv === 'object' && d.inv !== null && Array.isArray(d.pets);
}
