// İlerleme sistemi: oyuncu ve yoldaş deneyimi (XP), seviye atlama, istatistik artışları ve tür kataloğu.
export const MAX_LEVEL = 30;
export const PET_MAX_LEVEL = 20;
// bir sonraki seviye için gereken XP (yumuşak artan eğri)
export const xpToNext = (lv) => Math.round(40 + 25 * lv + 6 * lv * lv);
export const petXpToNext = (lv) => Math.round(30 + 20 * lv + 5 * lv * lv);
// kaynaklara göre XP
export const XP = {
  kill: (spec) => Math.round(4 + spec.hp * 0.25),
  tame: (spec) => Math.round(20 + spec.hp * 0.4),
  firstTameBonus: 0.5, // türü ilk kez evcilleştirince +%50
  gather: 3,
  shareToPets: 0.35, // yakındaki diğer yoldaşlara düşen pay
};
// seviyeye göre istatistikler
export const playerHpMax = (lv) => 100 + (lv - 1) * 10;
export const playerDmgMul = (lv) => 1 + (lv - 1) * 0.06;
export const playerStaminaRegen = (lv) => 1 + (lv - 1) * 0.03;
export const petHpMax = (spec, lv) => Math.round(spec.hp * (1 + (lv - 1) * 0.08));
export const petDmgMul = (lv) => 1 + (lv - 1) * 0.07;

export class Progression {
  constructor(game) { this.g = game; this.level = 1; this.xp = 0; this.kills = 0; this.tames = 0; this.species = new Set(); this.dirty = true; }
  get dmgMul() { return playerDmgMul(this.level); }
  get need() { return this.level >= MAX_LEVEL ? Infinity : xpToNext(this.level); }
  get frac() { return this.level >= MAX_LEVEL ? 1 : this.xp / this.need; }
  // oyuncuya XP ver; seviye atlarsa can artar ve dolar
  gain(n, reason = '') {
    n = Math.max(0, Math.round(n)); if (!n || this.level >= MAX_LEVEL) return 0;
    const g = this.g, P = g.player; this.xp += n; let ups = 0;
    if (P && reason) g.floatText(`+${n} XP`, P, '#9fe0ff');
    while (this.level < MAX_LEVEL && this.xp >= xpToNext(this.level)) { this.xp -= xpToNext(this.level); this.level++; ups++; }
    if (this.level >= MAX_LEVEL) this.xp = 0;
    if (ups) {
      this.applyStats(true);
      g.msg(`⭐ Seviye ${this.level}! Can ${P.hpMax}, saldırı gücü +%${Math.round((this.dmgMul - 1) * 100)}.`);
      g.floatText(`SEVİYE ${this.level}!`, P, '#ffd75e'); g.ui.levelUp?.();
    }
    this.dirty = true; return ups;
  }
  applyStats(heal = false) { const P = this.g.player; if (!P) return; P.hpMax = playerHpMax(this.level); P.staminaRegen = playerStaminaRegen(this.level); if (heal) P.hp = P.hpMax; else P.hp = Math.min(P.hp, P.hpMax); }

  /* ---------------- olaylar */
  onKill(animal, from) {
    const g = this.g, x = XP.kill(animal.spec); this.kills++;
    this.gain(x, 'kill');
    if (from?.tamed) petGain(from, x, g);
    for (const p of g.pets) if (p !== from && !p.dead && p.dist(animal) < 18) petGain(p, x * XP.shareToPets, g);
  }
  onTame(animal) {
    const first = !this.species.has(animal.kind); this.species.add(animal.kind); this.tames++;
    const x = XP.tame(animal.spec) * (first ? 1 + XP.firstTameBonus : 1);
    if (first) this.g.msg(`📖 Yeni tür kataloğa eklendi: ${animal.spec.name} (${this.species.size} tür)`);
    this.gain(x, 'tame');
  }
  onGather() { this.gain(XP.gather, 'gather'); }

  toJSON() { return { level: this.level, xp: this.xp, kills: this.kills, tames: this.tames, species: [...this.species] }; }
  load(d) {
    if (!d) return;
    this.level = Math.min(MAX_LEVEL, Math.max(1, d.level | 0)); this.xp = Math.max(0, +d.xp || 0); this.kills = d.kills | 0; this.tames = d.tames | 0;
    this.species = new Set(Array.isArray(d.species) ? d.species : []); this.applyStats(false); this.dirty = true;
  }
}

// yoldaşa XP ver; seviye atlarsa can tavanı artar
export function petGain(pet, n, g) {
  n = Math.round(n); if (n <= 0 || !pet.tamed || pet.level >= PET_MAX_LEVEL) return 0;
  pet.xp += n; let ups = 0;
  while (pet.level < PET_MAX_LEVEL && pet.xp >= petXpToNext(pet.level)) { pet.xp -= petXpToNext(pet.level); pet.level++; ups++; }
  if (ups) {
    const old = pet.hpMax; pet.hpMax = petHpMax(pet.spec, pet.level); pet.hp = Math.min(pet.hpMax, pet.hp + (pet.hpMax - old) + pet.hpMax * 0.25);
    g?.msg(`🐾 ${pet.petName} seviye ${pet.level} oldu!`); g?.floatText(`Sv ${pet.level}`, pet, '#ffd75e');
  }
  return ups;
}
export function setPetLevel(pet, level, xp = 0) {
  pet.level = Math.min(PET_MAX_LEVEL, Math.max(1, level | 0)); pet.xp = Math.max(0, +xp || 0); pet.hpMax = petHpMax(pet.spec, pet.level);
}
