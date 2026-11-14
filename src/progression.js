// İlerleme sistemi: oyuncu ve yoldaş deneyimi (XP), seviyeler ve kayıt/yükleme (localStorage).
import { SPECIES } from './creatures.js';

export const MAX_LEVEL = 30, PET_MAX_LEVEL = 10;
export const SAVE_KEY = 'yaban-yoldaslari-save-v1';

// seviye l'den l+1'e geçmek için gereken XP
export const xpToNext = (l) => Math.round(60 * Math.pow(l, 1.45));
export const petXpToNext = (l) => Math.round(40 * Math.pow(l, 1.35));

// türün öldürülme / evcilleştirilme ödülü: canı ve hasarı ile ölçeklenir
export function killXP(kind) { const s = SPECIES[kind]; return s ? Math.max(5, Math.round(s.hp * 0.12 + s.dmg * 0.6)) : 0; }
export function tameXP(kind) {
  const s = SPECIES[kind]; if (!s?.tame) return 0;
  const hard = { sneakFeed: 1, feed: 1, calm: 1.3, bait: 1.4, charm: 1.3, behindFeed: 1.6, weakenFeed: 1.5 }[s.tame.method] || 1;
  return Math.round((25 + s.hp * 0.2 + s.dmg * 0.8) * hard * (1 + (s.tame.steps - 1) * 0.15));
}
export const GATHER_XP = 3;

// oyuncu seviyesine göre bonuslar (saf fonksiyonlar; testlerde de kullanılır)
export const playerStats = (lvl) => ({ hpMax: 100 + (lvl - 1) * 12, dmgMul: 1 + (lvl - 1) * 0.07, staminaRegen: 1 + (lvl - 1) * 0.04 });
export const petStats = (lvl) => ({ hpMul: 1 + (lvl - 1) * 0.1, dmgMul: 1 + (lvl - 1) * 0.08 });

export class Progression {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.stats = { kills: 0, tames: 0, gathered: 0 }; this.dirty = true; }
  get need() { return xpToNext(this.level); }
  get dmgMul() { return playerStats(this.level).dmgMul; }
  get staminaRegen() { return playerStats(this.level).staminaRegen; }

  // oyuncuya XP ver; seviye atlamalarını uygular. Kazanılan seviye sayısını döndürür.
  gain(n, src) {
    if (!(n > 0) || this.level >= MAX_LEVEL) return 0;
    this.xp += n; this.dirty = true; let ups = 0;
    const P = this.g.player; if (src && P) this.g.floatText(`+${n} XP`, src, '#9be7ff');
    while (this.level < MAX_LEVEL && this.xp >= this.need) { this.xp -= this.need; this.level++; ups++; }
    if (this.level >= MAX_LEVEL) this.xp = 0;
    if (ups) { this.applyStats(true); this.g.msg(`⭐ Seviye ${this.level}! Can +${12 * ups}, saldırı gücü %${Math.round((this.dmgMul - 1) * 100)} arttı.`); if (P) this.g.floatText(`SEVİYE ${this.level}`, P, '#ffd75e'); this.g.save?.(); }
    return ups;
  }
  applyStats(heal) {
    const P = this.g.player; if (!P) return; const s = playerStats(this.level);
    P.hpMax = s.hpMax; P.hp = heal ? P.hpMax : Math.min(P.hp, P.hpMax);
  }

  // yoldaşa XP ver (yoldaş seviyesi can ve hasarı artırır)
  petGain(pet, n) {
    if (!pet?.tamed || pet.dead || !(n > 0)) return 0;
    pet.lvl = pet.lvl || 1; pet.xp = (pet.xp || 0) + n; let ups = 0;
    while (pet.lvl < PET_MAX_LEVEL && pet.xp >= petXpToNext(pet.lvl)) { pet.xp -= petXpToNext(pet.lvl); pet.lvl++; ups++; }
    if (pet.lvl >= PET_MAX_LEVEL) pet.xp = 0;
    if (ups) { applyPetLevel(pet); pet.hp = pet.hpMax; this.g.msg(`🐾 ${pet.petName} seviye ${pet.lvl} oldu!`); this.g.floatText(`Sv ${pet.lvl}`, pet, '#ffd75e'); }
    return ups;
  }

  // olay kancaları
  onKill(animal, killer) {
    const n = killXP(animal.kind); this.stats.kills++;
    this.gain(n, animal);
    // yakındaki yoldaşlar payını alır; öldüren yoldaş tam pay alır
    for (const p of this.g.pets) { if (p.dead) continue; const share = p === killer ? 1 : p.dist(animal) < 25 ? 0.5 : 0; if (share) this.petGain(p, Math.round(n * share)); }
  }
  onTame(animal) { this.stats.tames++; animal.lvl = animal.lvl || 1; animal.xp = animal.xp || 0; applyPetLevel(animal); this.gain(tameXP(animal.kind), animal); }
  onGather(node) { this.stats.gathered++; this.gain(GATHER_XP, node ? { x: node.x, z: node.z, y: node.y || 0 } : null); }
}

export function applyPetLevel(pet) {
  const s = petStats(pet.lvl || 1), base = pet.spec.hp, frac = pet.hp / pet.hpMax;
  pet.hpMax = Math.round(base * s.hpMul); pet.hp = Math.min(pet.hpMax, Math.max(1, frac * pet.hpMax)); pet.dmgMul = s.dmgMul;
}

/* ------------------------------------------------------------------ KAYIT */
// oyun durumunu düz bir JSON nesnesine çevirir
export function serialize(game) {
  const P = game.player, pr = game.prog;
  return {
    v: 1, t: Date.now(),
    player: { x: +P.x.toFixed(2), z: +P.z.toFixed(2), hp: Math.round(P.hp) },
    prog: { level: pr.level, xp: pr.xp, stats: { ...pr.stats } },
    inv: { ...game.inv.items }, sel: game.inv.sel,
    pets: game.pets.filter((p) => !p.dead).map((p) => ({ kind: p.kind, name: p.petName, lvl: p.lvl || 1, xp: p.xp || 0, hunger: Math.round(p.hunger), hp: Math.round(p.hp), stay: !!p.stay })),
    petCounter: { ...game.petCounter },
  };
}

// kayıttaki verilerin güvenli biçimde okunması (bozuk/elle değiştirilmiş kayda karşı)
const num = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);
export function sanitize(data, items) {
  if (!data || typeof data !== 'object' || data.v !== 1) return null;
  const inv = {}; for (const [k, v] of Object.entries(data.inv || {})) if (items[k]) { const n = Math.floor(num(v, 0, 999, 0)); if (n > 0) inv[k] = n; }
  const pets = (Array.isArray(data.pets) ? data.pets : []).filter((p) => SPECIES[p?.kind]?.tame).slice(0, 5).map((p) => ({
    kind: p.kind, name: String(p.name || SPECIES[p.kind].name).slice(0, 40), lvl: Math.floor(num(p.lvl, 1, PET_MAX_LEVEL, 1)), xp: num(p.xp, 0, 1e6, 0),
    hunger: num(p.hunger, 0, 100, 70), hp: num(p.hp, 1, 1e5, 1), stay: !!p.stay,
  }));
  const pr = data.prog || {}, st = pr.stats || {};
  return {
    player: { x: num(data.player?.x, -185, 185, 0), z: num(data.player?.z, -185, 185, 4), hp: num(data.player?.hp, 1, 1e4, 100) },
    prog: { level: Math.floor(num(pr.level, 1, MAX_LEVEL, 1)), xp: num(pr.xp, 0, 1e7, 0), stats: { kills: num(st.kills, 0, 1e7, 0), tames: num(st.tames, 0, 1e7, 0), gathered: num(st.gathered, 0, 1e7, 0) } },
    inv, sel: items[data.sel] ? data.sel : null, pets,
    petCounter: Object.fromEntries(Object.entries(data.petCounter || {}).filter(([k]) => SPECIES[k]).map(([k, v]) => [k, Math.floor(num(v, 0, 999, 0))])),
  };
}

export function readSave(storage = globalThis.localStorage) { try { const s = storage?.getItem(SAVE_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
export function writeSave(data, storage = globalThis.localStorage) { try { storage?.setItem(SAVE_KEY, JSON.stringify(data)); return true; } catch { return false; } }
export function clearSave(storage = globalThis.localStorage) { try { storage?.removeItem(SAVE_KEY); } catch { /* yok say */ } }
