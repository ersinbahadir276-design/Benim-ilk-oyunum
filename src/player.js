// Oyuncu: erkek kahramanın hareketi, dövüşü ve animasyon durum makinesi.
// Dövüş, Ghost of Tsushima'nın temel döngüsünü izler: düşman saldırmadan önce parlar
// (mavi = savuşturulabilir, kırmızı = engellenemez, kaçınılmalı), doğru anda blok = savuşturma,
// ağır saldırı düşmanın duruşunu kırar, son anda kaçınma karşı saldırı açar, Kararlılık ile iyileşilir,
// fark edilmeden arkadan yaklaşınca suikast yapılır.
import * as THREE from 'three';
import { floorY, waterDepth } from './world.js';

const COMBO = ['Sword_Regular_A', 'Sword_Regular_B', 'Sword_Regular_C'];
export const PARRY_WINDOW = 0.22;   // blok tuşuna bu kadar erken basılırsa savuşturma sayılır (sn)
export const RESOLVE_MAX = 3;
const angDiff = (a, b) => { let d = (a - b) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; };

export class Player {
  constructor(game, hero) {
    this.g = game; this.hero = hero; this.x = 0; this.z = 4; this.y = floorY(0, 4, 0.95); this.vy = 0; this.yaw = Math.PI; this.speed = 0;
    this.hpMax = 100; this.hp = 100; this.stamina = 100; this.alive = true; this.crouching = false; this.radius = 0.4; this.alt = 0;
    this.state = 'move'; this.stT = 0; this.combo = 0; this.queued = false; this.hitDone = false; this.iframes = 0; this.cur = null; this.hurt = 0;
    this.blocking = false; this.blockT = 9; this.resolve = 1; this.counterT = 0; this.heavy = false; this.dodgeEl = 9; this.dodgeDir = { x: 0, z: 1 };
    this.lean = { x: 0, z: 0 }; this.victim = null; this.staDelay = 0;
    hero.root.rotation.order = 'YXZ';
    game.scene.add(hero.root); this.play('Idle_Loop');
  }
  play(name, { fade = 0.18, once = false, ts = 1 } = {}) {
    const clip = this.hero.clips[name]; if (!clip) return 0;
    const a = this.hero.mixer.clipAction(clip); a.timeScale = ts;
    if (a === this.cur) return clip.duration / ts;
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = true; a.enabled = true; a.setEffectiveWeight(1);
    if (this.cur) a.crossFadeFrom(this.cur, fade, false); a.play(); this.cur = a;
    return clip.duration / ts;
  }
  gainResolve(n) { const before = Math.floor(this.resolve); this.resolve = Math.min(RESOLVE_MAX, this.resolve + n); if (Math.floor(this.resolve) > before) this.g.floatText('✦ Kararlılık', this, '#8fd8ff'); }
  facing(from) { if (!from) return true; const d = Math.hypot(from.x - this.x, from.z - this.z) || 1; return (Math.sin(this.yaw) * (from.x - this.x) + Math.cos(this.yaw) * (from.z - this.z)) / d > -0.1; }

  // Düşman vuruşu buraya gelir. Dönüş: 'parry' | 'block' | 'break' | 'dodge' | 'hit' | undefined
  damage(n, from, opt = {}) {
    if (!this.alive || this.state === 'assassin') return;
    const g = this.g;
    if (this.iframes > 0) {
      if ((this.state === 'dodge' || this.state === 'roll') && this.dodgeEl < 0.3 && from) {
        g.slowMo(0.55); this.counterT = 1.6; this.gainResolve(0.34); g.floatText('KUSURSUZ KAÇINMA', this, '#9fe8ff'); g.shake(0.15);
        return 'dodge';
      }
      return;
    }
    if (this.blocking && !opt.unblockable && this.facing(from)) {
      if (this.blockT <= PARRY_WINDOW) {
        g.hitStop(0.12); g.slowMo(0.45); g.shake(0.45); this.counterT = 1.6; this.gainResolve(0.5);
        g.floatText('SAVUŞTURMA!', this, '#ffffff'); g.spark(this, 0xbfe8ff, 14); this.stamina = Math.min(100, this.stamina + 15);
        return 'parry';
      }
      this.stamina -= n * 1.6; this.staDelay = 0.8; g.shake(0.15); g.spark(this, 0xffe2a0, 5);
      if (this.stamina <= 0) {
        this.stamina = 0; this.blocking = false; this.hp -= n * 0.5; this.hurt = 0.35; g.ui.hurtFlash();
        this.state = 'stagger'; this.stT = 0.95; this.play('Hit_Chest', { once: true, fade: 0.08 }); g.floatText('SAVUNMA KIRILDI', this, '#ff9b4a'); g.shake(0.5);
        if (this.hp <= 0) this.die();
        return 'break';
      }
      g.floatText('blok', this, '#cfd8e6');
      return 'block';
    }
    this.hp -= n; this.hurt = 0.35; g.floatText(`-${Math.round(n)}`, this, '#ff5a5a'); g.ui.hurtFlash(); g.shake(Math.min(0.6, 0.15 + n / 50));
    if (this.hp <= 0) { this.die(); return 'hit'; }
    // ağır darbe sendeletir (saldırıyı ve bloğu keser)
    if (n >= 10 && (this.state === 'move' || this.state === 'attack' || this.state === 'heal')) { this.state = 'stagger'; this.stT = 0.45; this.blocking = false; this.play('Hit_Chest', { once: true, fade: 0.06, ts: 1.4 }); }
    return 'hit';
  }
  die() {
    this.hp = 0; this.alive = false; this.state = 'dead'; this.stT = 4.5; this.crouching = false; this.blocking = false; this.cur = null;
    this.hero.mixer.stopAllAction(); this.play('Death01', { once: true, fade: 0 }); this.g.msg('Yenildin... Kampta yeniden doğacaksın.');
  }
  respawn() { this.alive = true; this.hp = this.hpMax; this.stamina = 100; this.x = 0; this.z = 4; this.vy = 0; this.state = 'move'; this.cur = null; this.hero.mixer.stopAllAction(); this.play('Idle_Loop', { fade: 0 }); for (const a of this.g.animals) if (a.target === this) a.target = null; }
  busy(name, time) { this.state = name; this.stT = time; }
  interactAnim(kneel) { if (this.state !== 'move') return; this.crouching && !kneel ? 0 : this.busy('interact', this.play(kneel ? 'PickUp_Kneeling' : 'Interact', { once: true, ts: 1.6 }) * 0.9); }

  // Suikast: çömelmiş oyuncu, onu fark etmemiş bir düşmanın arkasında ve yakınındaysa.
  assassinTarget() {
    if (!this.crouching || !this.alive || this.state !== 'move') return null;
    let best = null, bd = 9;
    for (const a of this.g.animals) {
      if (a.dead || a.tamed || a.alt > 1 || a.kind === 'dragon' || a.spec.dmg <= 0) continue;   // ejderha ve zararsız av hayvanları hariç
      if (a.target === this || a.state === 'chase' || a.state === 'attack' || a.state === 'windup' || a.state === 'flee' || a.state === 'cower') continue;
      const dx = this.x - a.x, dz = this.z - a.z, d = Math.hypot(dx, dz), reach = a.radius + 1.5;
      if (d > reach || d > bd) continue;
      if ((Math.sin(a.yaw) * dx + Math.cos(a.yaw) * dz) / (d || 1) > -0.25) continue;   // arkasında değil
      bd = d; best = a;
    }
    return best;
  }
  startAssassin(a) {
    const g = this.g; this.victim = a; this.state = 'assassin'; this.stT = 1.15; this.hitDone = false; this.crouching = false;
    const r = a.radius + 0.75; this.x = a.x - Math.sin(a.yaw) * r; this.z = a.z - Math.cos(a.yaw) * r; this.yaw = a.yaw; this.speed = 0;
    a.victimT = 1.4; a.target = null; a.set('idle', 2);
    this.play('Sword_Regular_C', { once: true, fade: 0.08, ts: 0.85 }); g.slowMo(0.9, 0.4);
  }

  update(dt, inp) {
    const g = this.g; this.stT -= dt; this.iframes -= dt; this.hurt -= dt; this.counterT -= dt; this.dodgeEl += dt; this.staDelay -= dt;
    const ground = floorY(this.x, this.z, 0.95), onGround = this.y <= ground + 0.02;
    let mvx = 0, mvz = 0, target = 0; const mag = Math.min(1, Math.hypot(inp.mx, inp.mz));
    if (mag > 0.1) { const a = Math.atan2(inp.mx, inp.mz) + g.camYaw; mvx = Math.sin(a); mvz = Math.cos(a); }
    const stickX = mvx, stickZ = mvz;
    // blok: basılı tutulur; basış anından itibaren geçen süre savuşturma penceresini belirler
    const wantBlock = !!inp.block && this.alive && onGround && (this.state === 'move' || (this.state === 'attack' && this.hitDone));
    if (wantBlock && !this.blocking) { this.blockT = 0; if (this.state === 'attack') this.state = 'move'; this.crouching = false; }
    this.blocking = wantBlock && this.state === 'move' && this.stamina > 0;
    this.blockT += dt;
    const canMove = this.state === 'move' || this.state === 'jump';

    if (this.state === 'dead') { if (this.stT <= 0) this.respawn(); }
    else if (this.state === 'attack') {
      const dur = this.atkDur, el = dur - this.stT, hitAt = this.heavy ? 0.5 : 0.38;
      if (inp.attack && !this.heavy) this.queued = true;
      if (mag > 0.1 && el < dur * 0.3) this.turn(Math.atan2(mvx, mvz), dt, 10);
      if (!this.hitDone && el >= dur * hitAt) { this.hitDone = true; this.swing(); }
      if (inp.dodge && this.hitDone && this.stamina >= 12) this.startDodge(stickX, stickZ, mag);
      else if (!this.heavy && this.stT <= dur * 0.28 && this.queued) this.startAttack((this.combo + 1) % 3);
      else if (this.stT <= 0) { this.state = 'move'; this.combo = 0; }
      if (this.state === 'attack') { target = (this.heavy ? 1.2 : 0.6) * (el < dur * 0.45 ? 1 : 0); mvx = Math.sin(this.yaw); mvz = Math.cos(this.yaw); }
    } else if (this.state === 'roll') { target = 8.2; mvx = Math.sin(this.yaw); mvz = Math.cos(this.yaw); if (this.stT <= 0) this.state = 'move'; }
    else if (this.state === 'dodge') {
      const k = Math.max(0, 1 - this.dodgeEl / 0.34); target = 10 * k + 1; mvx = this.dodgeDir.x; mvz = this.dodgeDir.z;
      if (inp.dodge && this.dodgeEl < 0.32 && this.stamina >= 10) this.startRoll(); // çift dokunuş: takla
      else if (this.dodgeEl >= 0.36) this.state = 'move';
    }
    else if (this.state === 'stagger') { if (this.stT <= 0) this.state = 'move'; }
    else if (this.state === 'heal') { if (this.stT <= 0) { this.hp = Math.min(this.hpMax, this.hp + 35); g.floatText('+35', this, '#7dff9b'); this.state = 'move'; } }
    else if (this.state === 'assassin') {
      const a = this.victim, el = 1.15 - this.stT;
      if (a && !this.hitDone && el >= 0.45) {
        this.hitDone = true; const big = a.kind === 'ogre' || a.kind === 'shadowbeast' || a.hpMax >= 200;
        a.victimT = 0; a.damage(big ? a.hpMax * 0.5 : a.hp + 1, this, { assassin: true }); g.hitStop(0.14); g.shake(0.55); g.spark(a, 0xff3b3b, 18); this.gainResolve(0.5);
        g.floatText(big ? 'SUİKAST — yaralandı' : 'SUİKAST', a, '#ff7070');
      }
      if (this.stT <= 0) { this.state = 'move'; this.victim = null; }
    }
    else if (this.state === 'interact') { if (this.stT <= 0) this.state = 'move'; }

    if (canMove) {
      if (inp.crouch && onGround) this.crouching = !this.crouching;
      const wade = waterDepth(this.x, this.z) > 0.35;
      const run = inp.run && mag > 0.1 && this.stamina > 1 && !this.crouching && !this.blocking;
      target = mag * (this.blocking ? 1.7 : this.crouching ? 1.9 : run ? 7.6 : 4.4) * (wade ? 0.55 : 1);
      if (run) this.stamina -= dt * 11;
      else if (this.staDelay <= 0) this.stamina = Math.min(100, this.stamina + dt * (this.blocking ? 6 : mag > 0.1 ? 12 : 20));
      if (this.blocking) { const f = this.threat(); if (f) this.turn(Math.atan2(f.x - this.x, f.z - this.z), dt, 14); else if (mag > 0.1) this.turn(Math.atan2(mvx, mvz), dt, 8); }
      else if (mag > 0.1) this.turn(Math.atan2(mvx, mvz), dt, 12);
      if (this.state === 'move' && onGround) {
        if (inp.jump) { this.vy = 7.2; this.state = 'jump'; this.crouching = false; this.blocking = false; this.play('Jump_Start', { once: true, ts: 1.6 }); this.airT = 0; }
        else if (inp.dodge && this.stamina >= 12) this.startDodge(stickX, stickZ, mag);
        else if (inp.heal) { if (this.resolve >= 1 && this.hp < this.hpMax) { this.resolve -= 1; this.blocking = false; this.state = 'heal'; this.stT = this.play('Interact', { once: true, ts: 1.3 }) * 0.8; } else g.msg(this.resolve < 1 ? 'Kararlılık yetmiyor: savuştur, kusursuz kaçın, düşman yen.' : 'Canın zaten dolu.'); }
        else if (inp.attack || inp.heavy) {
          const v = inp.attack && this.assassinTarget();
          if (v) this.startAssassin(v);
          else { this.crouching = false; this.blocking = false; this.startAttack(inp.heavy ? -1 : 0); }
        }
      }
    }
    // konum
    this.speed += (target - this.speed) * Math.min(1, dt * (this.state === 'dodge' ? 30 : 10));
    if (this.speed > 0.05 && (mvx || mvz) && this.state !== 'assassin') {
      const nx = this.x + mvx * this.speed * dt, nz = this.z + mvz * this.speed * dt;
      if (waterDepth(nx, nz) < 1.15) { this.x = nx; this.z = nz; }
      const p = { x: this.x, z: this.z }; g.world.collide(p, this.radius); this.x = p.x; this.z = p.z;
    } else if (!(mvx || mvz)) this.speed *= Math.max(0, 1 - dt * 12);
    // dikey
    this.vy -= 20 * dt; this.y += this.vy * dt; const gr = floorY(this.x, this.z, 0.95);
    if (this.y <= gr) { this.y = gr; this.vy = 0; if (this.state === 'jump' && this.airT > 0.1) { this.state = 'land'; this.stT = this.play('Jump_Land', { once: true, ts: 1.8, fade: 0.1 }) * 0.55; } }
    if (this.state === 'jump') { this.airT += dt; if (this.airT > 0.22) this.play('Jump_Loop', { fade: 0.15 }); }
    if (this.state === 'land' && this.stT <= 0) this.state = 'move';
    // hareket animasyonları
    if (this.state === 'move' || this.state === 'dodge') {
      const s = this.speed;
      if (this.blocking || this.state === 'dodge') this.play('Sword_Idle', { fade: 0.1, ts: this.blocking && s > 0.3 ? 1.6 : 1 });
      else if (this.crouching) s > 0.3 ? this.play('Crouch_Fwd_Loop', { ts: Math.max(0.6, s / 1.5) }) : this.play('Crouch_Idle_Loop');
      else if (s < 0.3) this.play('Idle_Loop', { fade: 0.25 });
      else if (s < 2.8) this.play('Walk_Loop', { ts: Math.max(0.7, s / 1.6) });
      else if (s < 5.6) this.play('Jog_Fwd_Loop', { ts: s / 4.2 });
      else this.play('Sprint_Loop', { ts: s / 7.2 });
    }
    if (this.alive && this.hurt < -6 && this.state !== 'heal') this.hp = Math.min(this.hpMax, this.hp + dt * 1.2);
    this.hero.mixer.update(dt);
    // kaçınmada gövde eğimi (kaçınma klibi olmadığı için yön verici eğim + hafif çömelme)
    let lx = 0, lz = 0;
    if (this.state === 'dodge') { const k = Math.sin(Math.min(1, this.dodgeEl / 0.36) * Math.PI); const fwd = Math.sin(this.yaw) * this.dodgeDir.x + Math.cos(this.yaw) * this.dodgeDir.z, side = Math.cos(this.yaw) * this.dodgeDir.x - Math.sin(this.yaw) * this.dodgeDir.z; lx = fwd * 0.35 * k; lz = -side * 0.42 * k; }
    this.lean.x += (lx - this.lean.x) * Math.min(1, dt * 20); this.lean.z += (lz - this.lean.z) * Math.min(1, dt * 20);
    const r = this.hero.root; r.position.set(this.x, this.y - Math.abs(this.lean.z) * 0.25, this.z); r.rotation.set(this.lean.x, this.yaw, this.lean.z);
  }
  // blok yaparken yüzü dönülecek en yakın tehdit
  threat() { let best = null, bd = 9; for (const a of this.g.animals) { if (a.dead || a.tamed || a.target !== this) continue; const d = a.dist(this); if (d < bd) { bd = d; best = a; } } return best; }
  turn(want, dt, rate) { const d = angDiff(want, this.yaw); this.yaw += d * Math.min(1, dt * rate); }
  startDodge(sx, sz, mag) {
    this.stamina -= 12; this.staDelay = 0.4; this.crouching = false; this.blocking = false;
    if (mag > 0.1) this.dodgeDir = { x: sx, z: sz }; else this.dodgeDir = { x: -Math.sin(this.yaw), z: -Math.cos(this.yaw) }; // yön yoksa geri sıçra
    const f = this.threat(); if (f) this.yaw = Math.atan2(f.x - this.x, f.z - this.z);
    this.state = 'dodge'; this.dodgeEl = 0; this.iframes = 0.3; this.speed = 10;
  }
  startRoll() {
    this.stamina -= 10; this.yaw = Math.atan2(this.dodgeDir.x, this.dodgeDir.z); const d = this.play('Roll', { once: true, ts: 1.5 });
    this.busy('roll', d * 0.82); this.iframes = d * 0.7; this.dodgeEl = 0;
  }
  // i = 0..2 hafif kombo, -1 ağır saldırı
  startAttack(i) {
    // en yakın düşmana hafif nişan yardımı
    let best = null, bd = 4.5; for (const a of this.g.animals) { if (a.dead || a.tamed || a.alt > 2.5) continue; const d = a.dist(this) - a.radius; if (d < bd && (a.target === this || a.byPlayerT > 0 || a.spec.temper !== 'prey')) { const ang = Math.atan2(a.x - this.x, a.z - this.z); if (Math.abs(angDiff(ang, this.yaw)) < 1.3) { bd = d; best = ang; } } }
    if (best != null) this.yaw = best;
    this.heavy = i < 0; this.combo = Math.max(0, i); this.queued = false; this.hitDone = false; this.state = 'attack';
    if (this.heavy) { this.stamina -= 8; this.atkDur = this.play('Sword_Attack', { once: true, ts: 1.05, fade: 0.1 }) * 0.85; }
    else this.atkDur = this.play(COMBO[i], { once: true, ts: [0.85, 0.9, 1.7][i], fade: 0.1 }) * [1, 1, 0.72][i];
    this.stT = this.atkDur;
    const a = this.cur; if (a) a.reset().play();
    this.g.sfxSwing?.();
  }
  swing() {
    const g = this.g, counter = this.counterT > 0;
    let dmg = this.heavy ? 30 : this.combo === 2 ? 26 : 16, posture = this.heavy ? 42 : this.combo === 2 ? 20 : 9;
    if (counter) { dmg *= 1.6; posture *= 1.5; }
    let hit = false;
    for (const a of g.animals) {
      if (a.dead || a.tamed || a.alt > 2.5) continue; const dx = a.x - this.x, dz = a.z - this.z, d = Math.hypot(dx, dz);
      if (d > (this.heavy ? 2.4 : 2.1) + a.radius) continue; const dot = (Math.sin(this.yaw) * dx + Math.cos(this.yaw) * dz) / (d || 1);
      if (dot > 0.25 || d < a.radius + 0.6) {
        const opened = a.staggerT > 0;
        a.damage(dmg, this, { posture, heavy: this.heavy }); hit = true;
        g.spark(a, counter || opened ? 0xffd75e : 0xffffff, this.heavy || counter ? 12 : 6);
        if (counter) g.floatText('KARŞI SALDIRI', a, '#ffd75e');
      }
    }
    if (hit) { if (counter) this.counterT = 0; g.hitStop(this.heavy || counter ? 0.11 : this.combo === 2 ? 0.08 : 0.05); g.shake(this.heavy || counter ? 0.4 : 0.2); }
    return hit;
  }
}
