// İlerleme sistemi: oyuncu deneyimi/seviyesi, yoldaş bağ seviyeleri ve kayıt (localStorage).
import { Animal } from './animal.js';
import { floorY } from './world.js';
import { SPECIES } from './creatures.js';

export const SAVE_KEY = 'yaban-yoldaslari-save-v1';
export const MAX_LEVEL = 30, PET_MAX_LEVEL = 10;
// bir sonraki seviye için gereken deneyim
export const xpNeed = (lvl) => Math.round(40 + 25 * Math.pow(lvl, 1.45));
export const petXpNeed = (lvl) => Math.round(20 + 18 * Math.pow(lvl, 1.35));
// türün öldürülmesinden gelen deneyim: dayanıklılık ve tehlikeye göre
export const killXp = (spec) => Math.max(3, Math.round(spec.hp * 0.18 + spec.dmg * 0.9));
export const tameXp = (spec) => Math.round(25 + spec.hp * 0.2 + (spec.tame?.steps || 1) * 6);
export const GATHER_XP = 3, FEED_PET_XP = 4;

// seviyeye bağlı oyuncu değerleri
export function playerStats(lvl) {
  const l = lvl - 1;
  return { hpMax: 100 + l * 12, dmgMul: 1 + l * 0.07, staminaRegen: 1 + l * 0.03 };
}
export function petStats(spec, lvl) {
  const l = lvl - 1;
  return { hpMax: Math.round(spec.hp * (1 + l * 0.12)), dmgMul: 1 + l * 0.1 };
}

export class Progression {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.saveT = 0; this.storage = safeStorage(); }

  /* ---------------- oyuncu */
  apply() {
    const P = this.g.player, s = playerStats(this.level), frac = P.hp / P.hpMax;
    P.hpMax = s.hpMax; P.hp = Math.min(P.hpMax, Math.max(1, Math.round(frac * P.hpMax))); P.dmgMul = s.dmgMul; P.staminaRegen = s.staminaRegen;
    this.dirty = true;
  }
  gain(n, ent) {
    if (n <= 0 || this.level >= MAX_LEVEL) return;
    this.xp += n; this.dirty = true;
    if (ent) this.g.floatText(`+${n} DP`, ent, '#9fe0ff');
    let up = false;
    while (this.level < MAX_LEVEL && this.xp >= xpNeed(this.level)) { this.xp -= xpNeed(this.level); this.level++; up = true; }
    if (this.level >= MAX_LEVEL) this.xp = 0;
    if (up) {
      this.apply(); const P = this.g.player; P.hp = P.hpMax; P.stamina = 100;
      const s = playerStats(this.level);
      this.g.msg(`⭐ Seviye ${this.level}! Can ${s.hpMax}, saldırı gücü +%${Math.round((s.dmgMul - 1) * 100)}.`);
      this.g.floatText(`SEVİYE ${this.level}`, P, '#ffd75e'); this.save();
    }
  }
  /* ---------------- yoldaşlar */
  initPet(a, lvl = 1, xp = 0) { a.lvl = lvl; a.xp = xp; const s = petStats(a.spec, lvl), frac = a.hp / a.hpMax; a.hpMax = s.hpMax; a.hp = Math.max(1, Math.min(a.hpMax, frac * a.hpMax)); a.dmgMul = s.dmgMul; }
  petGain(a, n) {
    if (!a.tamed || a.dead) return; if (!a.lvl) this.initPet(a);
    if (a.lvl >= PET_MAX_LEVEL) return;
    a.xp += n; let up = false;
    while (a.lvl < PET_MAX_LEVEL && a.xp >= petXpNeed(a.lvl)) { a.xp -= petXpNeed(a.lvl); a.lvl++; up = true; }
    if (a.lvl >= PET_MAX_LEVEL) a.xp = 0;
    if (up) { this.initPet(a, a.lvl, a.xp); a.hp = a.hpMax; this.g.msg(`🐾 ${a.petName} bağ seviyesi ${a.lvl} oldu! (can ${a.hpMax}, güç +%${Math.round((a.dmgMul - 1) * 100)})`); this.g.floatText(`BAĞ ${a.lvl}`, a, '#ffb3d1'); }
  }
  /* ---------------- olaylar */
  onKill(victim, killer) {
    const g = this.g, xp = killXp(victim.spec);
    if (killer === g.player) { this.gain(xp, victim); for (const p of g.pets) if (p.target === victim) this.petGain(p, Math.ceil(xp * 0.5)); }
    else if (killer?.tamed) { this.gain(Math.ceil(xp * 0.6), victim); this.petGain(killer, xp); }
  }
  onTame(a) { this.initPet(a); this.gain(tameXp(a.spec), a); this.save(); }
  onGather(ent) { this.gain(GATHER_XP, ent); }
  onFeedPet(a) { this.petGain(a, FEED_PET_XP); }

  /* ---------------- kayıt */
  serialize() {
    const g = this.g, P = g.player;
    return {
      v: 1, t: Date.now(), level: this.level, xp: this.xp,
      player: { x: +P.x.toFixed(2), z: +P.z.toFixed(2), yaw: +P.yaw.toFixed(3), hp: Math.round(P.hp), stamina: Math.round(P.stamina) },
      inv: { ...g.inv.items }, sel: g.inv.sel, petCounter: { ...g.petCounter },
      pets: g.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, hp: Math.round(p.hp), hunger: Math.round(p.hunger), lvl: p.lvl || 1, xp: p.xp || 0, stay: !!p.stay })),
    };
  }
  restore(d) {
    if (!d || d.v !== 1) return false;
    const g = this.g, P = g.player;
    [...g.pets].forEach((p) => g.removePet(p, false));
    this.level = Math.min(MAX_LEVEL, Math.max(1, d.level | 0)); this.xp = Math.max(0, +d.xp || 0);
    g.inv.items = { flute: 1, ...d.inv }; g.inv.sel = d.sel; g.inv.dirty = true; g.petCounter = { ...d.petCounter };
    P.x = d.player.x; P.z = d.player.z; P.yaw = d.player.yaw || 0; P.y = floorY(P.x, P.z, 0.95); P.vy = 0;
    this.apply(); P.hp = Math.min(P.hpMax, Math.max(1, d.player.hp)); P.stamina = d.player.stamina ?? 100;
    (d.pets || []).slice(0, 5).forEach((s, i) => {
      if (!SPECIES[s.kind]?.tame) return;
      const ang = P.yaw + Math.PI + (i - 2) * 0.6, a = new Animal(g, s.kind, P.x + Math.sin(ang) * 2.5, P.z + Math.cos(ang) * 2.5);
      g.animals.push(a); a.tamed = true; a.petName = s.name; a.hunger = s.hunger; a.stay = s.stay; a.altGoal = a.alt = a.spec.kind === 'bird' ? 4 : 0;
      this.initPet(a, Math.min(PET_MAX_LEVEL, s.lvl || 1), s.xp || 0); a.hp = Math.min(a.hpMax, Math.max(1, s.hp)); g.pets.push(a); a.set('follow');
    });
    this.dirty = true; return true;
  }
  save() { if (!this.storage || this.g.noSave) return false; try { this.storage.setItem(SAVE_KEY, JSON.stringify(this.serialize())); this.saveT = 0; return true; } catch { return false; } }
  load() { if (!this.storage) return null; try { const s = this.storage.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
  clear() { try { this.storage?.removeItem(SAVE_KEY); } catch { /* yok say */ } }
  update(dt) { this.saveT += dt; if (this.saveT >= 20 && this.g.running && this.g.player.alive) this.save(); }
}
function safeStorage() { try { const s = window.localStorage; s.getItem('x'); return s; } catch { return null; } }
