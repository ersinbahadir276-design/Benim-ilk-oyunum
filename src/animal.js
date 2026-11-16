// Hayvan varlığı: yabani davranış (yapay zekâ), evcilleştirme adımları ve evcil yoldaş davranışı.
import { makeCreature, SPECIES } from './creatures.js';
import { height, floorY, waterDepth, HALF } from './world.js';

const TAU = Math.PI * 2;
const angDiff = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; };
export const ITEMS = {
  carrot: { name: 'Havuç', icon: '🥕', food: 'herb' }, berry: { name: 'Böğürtlen', icon: '🫐', food: 'herb' }, apple: { name: 'Elma', icon: '🍎', food: 'herb' },
  honey: { name: 'Bal', icon: '🍯', food: 'omni' }, meat: { name: 'Et', icon: '🍖', food: 'carn' }, fish: { name: 'Balık', icon: '🐟', food: 'carn' },
  flute: { name: 'Kaval', icon: '🪈' }, moonstone: { name: 'Ay Taşı', icon: '🔮' }, dragongem: { name: 'Ejder Mücevheri', icon: '💎' },
};
// türün yiyebildiği yiyecekler
export function eats(spec, item) {
  const f = ITEMS[item]?.food; if (!f) return false;
  return spec.diet === 'omni' || f === 'omni' || spec.diet === f;
}

export class Animal {
  constructor(game, kind, x, z) {
    this.g = game; this.kind = kind; this.spec = SPECIES[kind]; this.c = makeCreature(kind);
    this.x = x; this.z = z; this.y = height(x, z); this.yaw = Math.random() * TAU; this.home = { x, z };
    this.hpMax = this.spec.hp; this.hp = this.hpMax; this.radius = this.c.radius;
    this.state = 'idle'; this.stT = Math.random() * 3; this.anim = 'idle'; this.speed = 0;
    this.target = null; this.dead = false; this.deadT = 0; this.tamed = false; this.trust = 0; this.hunger = 100;
    this.po = 0; this.poMax = Math.max(30, this.hpMax * 0.45); this.poT = 9; this.staggerT = 0; this.victimT = 0; this.wuT = 0; this.wuDur = 0; this.unblock = false;
    this.hurtT = 0; this.byPlayerT = 0; this.calmT = 0; this.cowerT = 0; this.atkT = 0; this.cool = 0; this.holdP = 0; this.fed = false;
    this.alt = this.spec.kind === 'bird' ? 12 + Math.random() * 6 : 0; this.altGoal = this.alt; this.wp = null; this.stay = false; this.flash = 0; this.petName = '';
    this.aggroR = { predator: this.spec.sense, territorial: kind === 'dragon' ? 13 : 3.2, ambush: this.spec.sense * 0.6 }[this.spec.temper] || 0;
    game.scene.add(this.c.root); this._place();
  }
  get frac() { return this.hp / this.hpMax; }
  dist(o) { return Math.hypot(o.x - this.x, o.z - this.z); }
  _place() { const r = this.c.root; r.position.set(this.x, this.y + this.alt, this.z); r.rotation.y = this.yaw; }
  set(state, t = 0) { this.state = state; this.stT = t; }

  /* ---------------- hasar / ölüm */
  // Duruş (posture): ağır vuruşlar ve savuşturmalar doldurur; dolunca düşman sendeler ve açık kalır.
  stagger(t, why) {
    this.staggerT = Math.max(this.staggerT, t); this.po = 0; this.cool = Math.max(this.cool, t * 0.6);
    if (this.state === 'windup' || this.state === 'attack') this.set('chase');
    if (why) this.g.floatText(why, this, '#ffd75e');
  }
  damage(n, from, opt = {}) {
    if (this.dead) return;
    if (this.staggerT > 0 && !opt.assassin) n *= 1.4;
    if (opt.posture && !this.tamed) { this.po += opt.posture; this.poT = 0; if (this.po >= this.poMax && this.staggerT <= 0) this.stagger(2.2, 'DURUŞ KIRILDI'); }
    this.hp -= n; this.hurtT = 6; this.flash = 0.18; this.holdP = 0;
    const fromPlayer = from === this.g.player; if (fromPlayer) this.byPlayerT = 8;
    this.g.floatText(`-${Math.round(n)}`, this, this.tamed ? '#ff8080' : '#ffe27a');
    if (this.hp <= 0) return this.die(from);
    if (this.tamed) { if (from && from !== this.g.player && !this.target) this.target = from; return; }
    if (this.victimT > 0) return;
    const tm = this.spec.tame, t = this.spec.temper;
    if (tm?.method === 'weakenFeed' && this.frac <= tm.hpBelow && this.cowerT <= 0 && (fromPlayer || from?.tamed)) {
      this.cowerT = 10; this.target = null; this.set('cower', 10);
      this.g.msg(`${this.spec.name} zayıf düştü — şimdi yaklaş ve E ile ${ITEMS[tm.item].name} sun!`);
      return;
    }
    if (this.cowerT > 0) return;
    this.calmT = 0;
    if (t === 'prey' || t === 'shy' || t === 'sky') { this.set('flee', 5); this.threat = from; if (t === 'sky') this.altGoal = 16; }
    else { this.target = from; this.set('chase'); }
  }
  die(from) {
    this.dead = true; this.deadT = 0; this.hp = 0; this.target = null; this.altGoal = 0;
    if (this.tamed) { this.g.msg(`💀 ${this.petName} öldü.`); return; }
    if (from === this.g.player || from?.tamed) {
      const got = []; for (const [k, v] of Object.entries(this.spec.drops || {})) { this.g.inv.add(k, v); got.push(`${v} ${ITEMS[k].name}`); }
      if (got.length) this.g.msg(`Ganimet: ${got.join(', ')}`);
    }
  }
  respawn() {
    this.dead = false; this.hp = this.hpMax; this.x = this.home.x; this.z = this.home.z; this.trust = 0; this.fed = false; this.cowerT = 0; this.calmT = 0;
    this.alt = this.altGoal = this.spec.kind === 'bird' ? 14 : 0; this.set('idle', 1); this.c.reset(); this.c.root.visible = true;
  }

  /* ---------------- hareket */
  steer(tx, tz, speed, dt, turn = 6) {
    const dx = tx - this.x, dz = tz - this.z, want = Math.atan2(dx, dz), d = angDiff(want, this.yaw);
    this.yaw += Math.sign(d) * Math.min(Math.abs(d), turn * dt * (this.kind === 'dragon' ? 0.45 : 1));
    const f = Math.max(0.15, Math.cos(d)), nx = this.x + Math.sin(this.yaw) * speed * f * dt, nz = this.z + Math.cos(this.yaw) * speed * f * dt;
    const swims = this.kind === 'crocodile' || this.alt > 1;
    if (!swims && waterDepth(nx, nz) > 0.45) { this.blocked = true; return false; }
    if (Math.abs(nx) > HALF || Math.abs(nz) > HALF) { this.blocked = true; return false; }
    this.x = nx; this.z = nz; this.speed = speed * f; this.blocked = false; return true;
  }
  wanderPoint(r = 14) { const a = Math.random() * TAU, d = 3 + Math.random() * r; this.wp = { x: this.home.x + Math.sin(a) * d, z: this.home.z + Math.cos(a) * d }; }
  face(o, dt) { const d = angDiff(Math.atan2(o.x - this.x, o.z - this.z), this.yaw); this.yaw += Math.sign(d) * Math.min(Math.abs(d), 7 * dt); }

  /* ---------------- evcilleştirme */
  tameHint() { const t = this.spec.tame; if (!t) return 'Evcilleştirilemez'; return t.hint; }
  addTrust() {
    this.trust++; this.calmT = 14; this.target = null; this.cowerT = Math.max(this.cowerT, 0);
    const need = this.spec.tame.steps;
    if (this.trust >= need) return this.becomePet();
    this.g.msg(`${this.spec.name} sana güvenmeye başladı (${this.trust}/${need}).`); this.g.floatText('❤', this, '#ff6f9c');
  }
  becomePet() {
    const g = this.g;
    this.tamed = true; this.target = null; this.cowerT = 0; this.calmT = 0; this.stay = false; this.hunger = 70; this.hp = Math.max(this.hp, this.hpMax * 0.5);
    const no = g.petCounter[this.kind] = (g.petCounter[this.kind] || 0) + 1; this.petName = this.spec.name + (no > 1 ? ' ' + no : '');
    this.altGoal = this.spec.kind === 'bird' ? 4 : 0; g.pets.push(this); this.set('follow');
    g.msg(`✨ ${this.petName} evcilleştirildi! (${g.pets.length}/5)`); g.floatText('❤❤❤', this, '#ff6f9c');
  }
  // E tuşu: bir evcilleştirme adımı dene. Başarılıysa true.
  tryTame() {
    const g = this.g, P = g.player, tm = this.spec.tame;
    if (!tm) { g.msg(`${this.spec.name} evcilleştirilemez.`); return false; }
    if (g.pets.length >= 5) { g.msg('Aynı anda en fazla 5 evcil yaratığın olabilir. Panelden birini serbest bırak.'); return false; }
    const items = [].concat(tm.item), have = items.find((i) => g.inv.count(i) > 0);
    const need = () => { g.msg(`Gerekli: ${items.map((i) => ITEMS[i].name).join(' / ')}. ${tm.hint}.`); return false; };
    switch (tm.method) {
      case 'sneakFeed': if (!P.crouching) { g.msg('Ürkek bir hayvan: çömelerek (C) yaklaşmalısın.'); return false; } if (!have) return need(); break;
      case 'feed': if (!have) return need(); break;
      case 'weakenFeed': if (this.frac > tm.hpBelow) { g.msg(`${this.spec.name} hâlâ çok güçlü. Önce canını %${Math.round(tm.hpBelow * 100)} altına düşür.`); return false; } if (!have) return need(); break;
      case 'behindFeed': {
        const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw), dx = P.x - this.x, dz = P.z - this.z, d = Math.hypot(dx, dz) || 1;
        if (!P.crouching || (fx * dx + fz * dz) / d > -0.15) { g.msg(`${this.spec.name} seni fark etti! Çömelerek arkasından yaklaşmalısın.`); this.calmT = 0; this.target = P; this.set('chase'); return false; }
        if (!have) return need(); break;
      }
      case 'calm': if (!this.fed) { if (!have) return need(); g.inv.take(have); this.fed = true; this.calmT = 30; g.msg(`${this.spec.name} elmayı yedi. Şimdi kıpırdamadan E tuşunu basılı tut ve sakinleştir.`); g.floatText('❤', this, '#ff6f9c'); return true; } return false;
      case 'charm': g.msg(have ? 'Kıpırdamadan E tuşunu basılı tut: kaval çal.' : 'Kaval gerekli.'); return false;
      case 'bait': g.msg(tm.hint + '.'); return false;
    }
    g.inv.take(have); this.addTrust(); return true;
  }
  // E basılı tutma: at sakinleştirme / yılan büyüleme. dt>0 ilerletir.
  holdTame(dt) {
    const g = this.g, P = g.player, tm = this.spec.tame;
    if (!tm || this.tamed || this.dead) return false;
    const ok = (tm.method === 'calm' && this.fed) || (tm.method === 'charm' && g.inv.count('flute') > 0);
    if (!ok || P.speed > 0.3 || this.dist(P) > 3.4 || g.pets.length >= 5) { this.holdP = Math.max(0, this.holdP - dt * 0.6); return false; }
    this.holdP += dt / (tm.method === 'calm' ? 4.5 : 5); this.calmT = 6; this.target = null; this.set('held', 0.3);
    if (this.holdP >= 1) { this.holdP = 0; this.becomePet(); }
    return true;
  }
  feedPet() {
    const g = this.g, item = Object.keys(ITEMS).find((i) => g.inv.count(i) > 0 && eats(this.spec, i));
    if (!item) { g.msg(`${this.petName} için uygun yiyecek yok (${this.spec.diet === 'carn' ? 'et / balık' : this.spec.diet === 'herb' ? 'havuç / böğürtlen / elma' : 'her yiyecek'}).`); return; }
    g.inv.take(item); this.hunger = Math.min(100, this.hunger + 50); this.hp = Math.min(this.hpMax, this.hp + this.hpMax * 0.3);
    this.set('eat', 1.6); g.msg(`${this.petName} ${ITEMS[item].name.toLowerCase()} yedi.`); g.floatText('❤', this, '#ff6f9c');
  }
  mood() {
    if (this.dead) return 'Öldü'; if (this.state === 'attack' || this.state === 'chase' || this.state === 'windup') return 'Savaşıyor';
    if (this.hunger < 25) return 'Aç!'; if (this.frac < 0.4) return 'Yaralı'; if (this.stay) return 'Bekliyor'; return 'Mutlu';
  }

  /* ---------------- ana güncelleme */
  update(dt) {
    const g = this.g, P = g.player, sp = this.spec, c = this.c;
    this.staggerT -= dt; this.victimT -= dt; this.poT += dt; if (this.poT > 2.5) this.po = Math.max(0, this.po - dt * this.poMax * 0.18);
    this.hurtT -= dt; this.byPlayerT -= dt; this.calmT -= dt; this.cowerT -= dt; this.cool -= dt; this.stT -= dt; this.flash -= dt;
    const dP = this.dist(P); this.dP = dP;
    // uzaktakileri uyut (performans)
    const QP = g.quality?.p, far = dP > (QP ? QP.sleep : 130) && !this.tamed; c.root.visible = !far && !(this.dead && this.deadT > 14);
    if (far && !this.dead) return;
    let anim = 'idle', rate = 1; this.speed = 0;
    if (this.dead) {
      this.deadT += dt; anim = 'die';
      if (this.tamed) { if (this.deadT > 6) g.removePet(this, true); }
      else if (this.deadT > 30 && dP > 25) this.respawn();
    } else if (this.tamed) anim = this.updatePet(dt);
    else anim = this.updateWild(dt);
    // irtifa (kartal)
    if (sp.kind === 'bird') { this.alt += (this.altGoal - this.alt) * Math.min(1, dt * 1.6); if (this.alt > 0.5 && anim !== 'die' && anim !== 'attack') anim = 'fly'; }
    const fd = this.kind === 'crocodile' ? 0.28 : 0.5; this.y = floorY(this.x, this.z, fd);
    this._place();
    const L = Math.max(0.4, sp.len * 0.5), fx = Math.sin(this.yaw) * L, fz = Math.cos(this.yaw) * L;
    const slope = this.alt > 0.5 || this.dead ? 0 : -Math.atan2(floorY(this.x + fx, this.z + fz, fd) - floorY(this.x - fx, this.z - fz, fd), L * 2);
    if (anim === 'walk' || anim === 'run') rate = Math.max(0.5, this.speed / (anim === 'run' ? sp.run : sp.walk));
    c.root.scale.setScalar(this.flash > 0 ? 1.06 : 1);
    if (this.state === 'windup' && !this.dead) { const k = Math.min(1, this.wuT / Math.max(0.01, this.wuDur)); c.root.scale.set(1 + 0.05 * k, 1 - 0.09 * k, 1 + 0.05 * k); }   // gerilip çömelme
    else if (this.staggerT > 0 && !this.dead) c.root.rotation.z = Math.sin(g.time * 18) * 0.06; else c.root.rotation.z = 0;
    // animasyon LOD: uzaktaki, dövüşmeyen hayvanların iskeleti her N karede bir (biriken dt ile) güncellenir
    this.animAcc = (this.animAcc || 0) + dt;
    if (QP && dP > QP.lod && !this.tamed && !this.dead && this.state !== 'windup' && this.state !== 'attack' && ((this.lodN = (this.lodN || 0) + 1) % QP.lodSkip)) { this.anim = anim; this.animSkipped = (this.animSkipped || 0) + 1; return; }
    const adt = this.animAcc; this.animAcc = 0;
    c.animate(adt, anim, g.time, { slope, rate, air: this.alt > 0.5, glide: this.state === 'wander' || this.state === 'idle', happy: this.tamed && dP < 4 });
    this.anim = anim;
  }

  // ortak saldırı döngüsü: hedefe koş, menzile girince vur
  fight(dt, tgt) {
    const reach = this.radius + (tgt.radius || 0.4) + 0.55, d = this.dist(tgt);
    if (this.spec.kind === 'bird') this.altGoal = d < 9 ? 0.7 : 5;
    // hazırlık (windup): saldırıdan önce görünür bir parlama. Mavi = blok/savuşturma, kırmızı = engellenemez (kaçın).
    if (this.state === 'windup') {
      this.wuT += dt; this.face(tgt, dt);
      if (d > reach * 2.4) { this.set('chase'); return 'run'; }
      if (this.wuT >= this.wuDur) { this.set('attack'); this.atkT = 0; this.hit = false; this.c.reset(); return 'attack'; }
      return 'idle';
    }
    if (this.state === 'attack') {
      this.atkT += dt; if (this.atkT < this.c.attackHit * 0.6) this.face(tgt, dt);
      if (!this.hit && this.atkT >= this.c.attackHit) {
        this.hit = true;
        if (d < reach * 1.4 && Math.abs(this.alt - (tgt.alt || 0)) < 2) {
          const r = tgt.damage(this.spec.dmg * (this.tamed && this.hunger < 25 ? 0.5 : 1), this, { unblockable: this.unblock });
          if (r === 'parry') { this.stagger(1.5); this.po = Math.min(this.poMax * 0.9, this.po + this.poMax * 0.5); return 'idle'; }
          if (r === 'block') { this.cool = Math.max(this.cool, 0.6); }
        }
      }
      if (this.atkT >= this.c.attackTime) { this.cool = 0.5 + Math.random() * 0.5; this.set('chase'); }
      return 'attack';
    }
    if (d <= reach) {
      if (this.cool <= 0) {
        const sp = this.spec, heavyHitter = sp.dmg >= 20;
        this.wuT = 0; this.unblock = !this.tamed && tgt === this.g.player && heavyHitter && Math.random() < (this.kind === 'dragon' ? 0.45 : 0.3);
        this.wuDur = (sp.windup || (sp.dmg >= 40 ? 0.95 : heavyHitter ? 0.72 : 0.55)) * (this.tamed || tgt !== this.g.player ? 0.4 : 1) * (this.unblock ? 1.2 : 1);
        this.set('windup'); return 'idle';
      }
      this.face(tgt, dt); return 'idle';
    }
    this.steer(tgt.x, tgt.z, this.spec.run * (this.tamed && this.hunger < 25 ? 0.7 : 1), dt); return 'run';
  }

  updateWild(dt) {
    const g = this.g, P = g.player, sp = this.spec, t = sp.temper, dP = this.dP;
    if (this.victimT > 0) return 'idle';                                   // suikast anında donar
    if (this.staggerT > 0) { if (this.target) this.face(this.target, dt * 0.3); return 'idle'; }   // sendeleme: açık
    if (this.state === 'held' && this.stT <= 0) this.set('idle', 1);
    if (this.state === 'held') { this.face(P, dt); return sp.tame.method === 'charm' ? 'charm' : (Math.sin(g.time * 5) > 0.6 ? 'attack' : 'idle'); }
    if (this.state === 'cower') { if (this.cowerT <= 0) { this.set('chase'); this.target = P; } return 'idle'; }
    const calm = this.calmT > 0;
    // yem (bait) arama
    if (sp.tame?.method === 'bait' && !this.target && this.state !== 'flee') {
      const items = sp.tame.item; let best = null, bd = 26;
      for (const b of g.baits) { if (!items.includes(b.item) || b.eater && b.eater !== this) continue; const d = this.dist(b); if (d < bd && Math.hypot(P.x - b.x, P.z - b.z) > 6.5) { bd = d; best = b; } }
      if (best) {
        best.eater = this; if (sp.kind === 'bird') this.altGoal = bd < 7 ? 0 : 5;
        if (bd > 0.9 + this.radius * 0.5) { this.steer(best.x, best.z, bd > 8 ? sp.run * 0.7 : sp.walk * 1.4, dt); this.eatT = 0; return 'walk'; }
        this.eatT = (this.eatT || 0) + dt; this.face(best, dt);
        if (this.eatT > 2.6 && this.alt < 0.6) { g.removeBait(best); this.eatT = 0; if (g.pets.length >= 5) g.msg('En fazla 5 evcil yaratık: bu hayvan yemi yedi ama katılamadı.'); else this.addTrust(); }
        return 'eat';
      }
      if (sp.kind === 'bird' && !calm) this.altGoal = 14;
    }
    // tehdit algısı
    if (!calm && P.alive) {
      if (t === 'prey' || t === 'shy') {
        const sense = sp.sense * (P.crouching && P.speed < 2.6 ? 0.13 : t === 'shy' ? 0.5 : P.speed > 5 ? 1 : 0.6);
        if (dP < sense && this.trust === 0 && !this.fed) { this.set('flee', 2.5); this.threat = P; }
      } else if (this.aggroR && !this.target) {
        const r = this.aggroR * (P.crouching ? 0.45 : 1);
        if (dP < r) { this.target = P; this.set('chase'); }
        else if (t === 'predator') for (const p of g.pets) if (!p.dead && this.dist(p) < r * 0.5) { this.target = p; this.set('chase'); break; }
      }
    }
    if (this.target) {
      const tg = this.target, lost = tg.dead || tg.alive === false || this.dist(tg) > Math.max(30, sp.sense * 2) || Math.hypot(this.x - this.home.x, this.z - this.home.z) > (t === 'ambush' ? 22 : 85);
      if (lost || calm) { this.target = null; this.set('return', 6); } else return this.fight(dt, tg);
    }
    switch (this.state) {
      case 'flee': {
        const th = this.threat || P, a = Math.atan2(this.x - th.x, this.z - th.z) + (this.blocked ? 1.2 : 0);
        this.steer(this.x + Math.sin(a) * 10, this.z + Math.cos(a) * 10, sp.run, dt, 9);
        if (this.stT <= 0 && this.dist(th) > sp.sense * 1.2) { this.set('idle', 2); this.home = { x: this.x, z: this.z }; }
        return 'run';
      }
      case 'return': if (this.stT <= 0 || Math.hypot(this.x - this.home.x, this.z - this.home.z) < 4) { this.set('idle', 2); this.hp = Math.min(this.hpMax, this.hp + this.hpMax * 0.2); } else this.steer(this.home.x, this.home.z, sp.walk * 1.6, dt); return 'walk';
      case 'wander':
        if (!this.wp || this.stT <= 0 || this.blocked || Math.hypot(this.wp.x - this.x, this.wp.z - this.z) < 1.2) { this.set(Math.random() < 0.5 && sp.diet !== 'carn' ? 'graze' : 'idle', 2 + Math.random() * 5); this.blocked = false; return 'idle'; }
        this.steer(this.wp.x, this.wp.z, sp.kind === 'bird' ? sp.run * 0.55 : sp.walk, dt, sp.kind === 'bird' ? 1.2 : 4); return 'walk';
      case 'graze': if (this.stT <= 0) this.set('idle', 1); return this.alt > 0.5 ? 'idle' : 'eat';
      default:
        if (this.stT <= 0 || sp.kind === 'bird') { this.wanderPoint(sp.kind === 'bird' ? 40 : t === 'ambush' ? 5 : 15); this.set('wander', 9); }
        if (calm && dP < 6) this.face(P, dt);
        return 'idle';
    }
  }

  updatePet(dt) {
    const g = this.g, P = g.player, sp = this.spec, dP = this.dP;
    // açlık ve can
    this.hunger = Math.max(0, this.hunger - dt * (this.state === 'attack' || this.state === 'chase' ? 0.55 : 0.3));
    if (this.hunger <= 0) { this.hp -= dt * 1.5; if (!this.starveWarn) { this.starveWarn = true; g.msg(`⚠ ${this.petName} açlıktan zayıflıyor! Yanına gidip E ile besle.`); } if (this.hp <= this.hpMax * 0.12) { g.msg(`${this.petName} aç kaldığı için seni terk etti.`); g.removePet(this, false); return 'run'; } }
    else { this.starveWarn = false; if (this.hunger > 40 && this.hurtT <= 0) this.hp = Math.min(this.hpMax, this.hp + this.hpMax * 0.02 * dt); }
    if (this.state === 'eat') { if (this.stT <= 0) this.set('follow'); return 'eat'; }
    // düşman algılama: oyuncuya/evcillere saldıranlar ve oyuncunun vurdukları
    if (this.target && (this.target.dead || this.target.tamed || this.target.cowerT > 0 || this.dist(this.target) > 34 || dP > 45)) { this.target = null; if (this.state !== 'follow') this.set('follow'); }
    if (!this.target && sp.dmg > 0 && this.hunger > 5) {
      let best = null, bd = 30;
      for (const e of g.animals) {
        if (e.dead || e.tamed || e === this || e.cowerT > 0 || e.alt > 3) continue;
        const hostile = e.target === P || e.target?.tamed || e.byPlayerT > 0; if (!hostile) continue;
        const d = this.dist(e) + (e.target === P ? -6 : 0); if (d < bd && e.dist(P) < 32) { bd = d; best = e; }
      }
      if (best) { this.target = best; this.set('chase'); }
    }
    if (this.target) return this.fight(dt, this.target);
    if (sp.kind === 'bird') this.altGoal = this.stay ? 0 : 4;
    if (this.stay) { if (dP < 5) this.face(P, dt); return 'idle'; }
    // takip: oyuncunun arkasında diziliş
    const idx = g.pets.indexOf(this), n = Math.max(1, g.pets.length), a = P.yaw + Math.PI + (idx - (n - 1) / 2) * 0.62, r = 2.4 + this.radius;
    const tx = P.x + Math.sin(a) * r, tz = P.z + Math.cos(a) * r, d = Math.hypot(tx - this.x, tz - this.z);
    if (dP > 70) { this.x = tx; this.z = tz; return 'idle'; }
    if (d > 1.1 && (d > 2.6 || this.moving)) {
      this.moving = d > 0.9; const fast = d > 7 || P.speed > 4.5;
      this.steer(tx, tz, Math.min(fast ? Math.max(sp.run, P.speed * 1.15) : sp.walk * 1.5, d * 3 + 0.6), dt, 8);
      return fast ? 'run' : 'walk';
    }
    this.moving = false; if (dP < 4.5 && P.speed < 0.3) this.face(P, dt);
    return 'idle';
  }
}
