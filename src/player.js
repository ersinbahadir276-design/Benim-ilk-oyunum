// Oyuncu: erkek kahramanın hareketi, dövüşü ve animasyon durum makinesi.
import * as THREE from 'three';
import { floorY, waterDepth } from './world.js';

const COMBO = ['Sword_Regular_A', 'Sword_Regular_B', 'Sword_Regular_C'];
export class Player {
  constructor(game, hero) {
    this.g = game; this.hero = hero; this.x = 0; this.z = 4; this.y = floorY(0, 4, 0.95); this.vy = 0; this.yaw = Math.PI; this.speed = 0;
    this.hpMax = 100; this.hp = 100; this.staminaMax = 100; this.stamina = 100; this.dmgMul = 1; this.alive = true; this.crouching = false; this.radius = 0.4; this.alt = 0;
    this.state = 'move'; this.stT = 0; this.combo = 0; this.queued = false; this.hitDone = false; this.iframes = 0; this.cur = null; this.hurt = 0;
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
  damage(n, from) {
    if (!this.alive || this.iframes > 0) return;
    this.hp -= n; this.hurt = 0.35; this.g.floatText(`-${Math.round(n)}`, this, '#ff5a5a'); this.g.ui.hurtFlash();
    if (this.hp <= 0) { this.hp = 0; this.alive = false; this.state = 'dead'; this.stT = 4.5; this.crouching = false; this.cur = null; this.hero.mixer.stopAllAction(); this.play('Death01', { once: true, fade: 0 }); this.g.msg('Yenildin... Kampta yeniden doğacaksın.'); }
  }
  respawn() { this.alive = true; this.hp = this.hpMax; this.stamina = this.staminaMax; this.x = 0; this.z = 4; this.vy = 0; this.snapToGround(); this.state = 'move'; this.cur = null; this.hero.mixer.stopAllAction(); this.play('Idle_Loop', { fade: 0 }); for (const a of this.g.animals) if (a.target === this) a.target = null; }
  snapToGround() { this.y = floorY(this.x, this.z, 0.95); this.vy = 0; }
  busy(name, time) { this.state = name; this.stT = time; }
  interactAnim(kneel) { if (this.state !== 'move') return; this.crouching && !kneel ? 0 : this.busy('interact', this.play(kneel ? 'PickUp_Kneeling' : 'Interact', { once: true, ts: 1.6 }) * 0.9); }

  update(dt, inp) {
    const g = this.g; this.stT -= dt; this.iframes -= dt; this.hurt -= dt;
    const ground = floorY(this.x, this.z, 0.95), onGround = this.y <= ground + 0.02;
    let mvx = 0, mvz = 0, target = 0; const mag = Math.min(1, Math.hypot(inp.mx, inp.mz));
    const canMove = this.state === 'move' || this.state === 'jump';
    if (mag > 0.1) { const a = Math.atan2(inp.mx, inp.mz) + g.camYaw; mvx = Math.sin(a); mvz = Math.cos(a); }
    if (this.state === 'dead') { if (this.stT <= 0) this.respawn(); }
    else if (this.state === 'attack') {
      const dur = this.atkDur, el = dur - this.stT;
      if (inp.attack) this.queued = true;
      if (mag > 0.1 && el < dur * 0.3) this.turn(Math.atan2(mvx, mvz), dt, 10);
      if (!this.hitDone && el >= dur * 0.38) { this.hitDone = true; this.swing(); }
      if (this.stT <= dur * 0.28 && this.queued) this.startAttack((this.combo + 1) % 3);
      else if (this.stT <= 0) { this.state = 'move'; this.combo = 0; }
      target = 0.6 * (el < dur * 0.4 ? 1 : 0); mvx = Math.sin(this.yaw); mvz = Math.cos(this.yaw);
    } else if (this.state === 'roll') { target = 8.2; mvx = Math.sin(this.yaw); mvz = Math.cos(this.yaw); if (this.stT <= 0) this.state = 'move'; }
    else if (this.state === 'interact') { if (this.stT <= 0) this.state = 'move'; }
    if (canMove) {
      if (inp.crouch && onGround) this.crouching = !this.crouching;
      const wade = waterDepth(this.x, this.z) > 0.35;
      const run = inp.run && mag > 0.1 && this.stamina > 1 && !this.crouching;
      target = mag * (this.crouching ? 1.9 : run ? 7.6 : 4.4) * (wade ? 0.55 : 1);
      if (run) this.stamina -= dt * 11; else this.stamina = Math.min(this.staminaMax, this.stamina + dt * (mag > 0.1 ? 9 : 16));
      if (mag > 0.1) this.turn(Math.atan2(mvx, mvz), dt, 12);
      if (inp.jump && onGround && this.state === 'move') { this.vy = 7.2; this.state = 'jump'; this.crouching = false; this.play('Jump_Start', { once: true, ts: 1.6 }); this.airT = 0; }
      else if (inp.roll && onGround && this.state === 'move' && this.stamina >= 22) { this.stamina -= 22; this.crouching = false; if (mag > 0.1) this.yaw = Math.atan2(mvx, mvz); const d = this.play('Roll', { once: true, ts: 1.5 }); this.busy('roll', d * 0.82); this.iframes = d * 0.7; }
      else if (inp.attack && onGround && this.state === 'move') { this.crouching = false; this.startAttack(0); }
    }
    // konum
    this.speed += (target - this.speed) * Math.min(1, dt * 10);
    if (this.speed > 0.05 && (mvx || mvz)) {
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
    if (this.state === 'move') {
      const s = this.speed;
      if (this.crouching) s > 0.3 ? this.play('Crouch_Fwd_Loop', { ts: Math.max(0.6, s / 1.5) }) : this.play('Crouch_Idle_Loop');
      else if (s < 0.3) this.play('Idle_Loop', { fade: 0.25 });
      else if (s < 2.8) this.play('Walk_Loop', { ts: Math.max(0.7, s / 1.6) });
      else if (s < 5.6) this.play('Jog_Fwd_Loop', { ts: s / 4.2 });
      else this.play('Sprint_Loop', { ts: s / 7.2 });
    }
    this.hp = Math.min(this.hpMax, this.hp + (this.alive && this.hurt < -6 ? dt * 1.2 : 0));
    this.hero.mixer.update(dt);
    const r = this.hero.root; r.position.set(this.x, this.y, this.z); r.rotation.y = this.yaw;
  }
  turn(want, dt, rate) { let d = (want - this.yaw) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; this.yaw += d * Math.min(1, dt * rate); }
  startAttack(i) {
    // en yakın düşmana hafif nişan yardımı
    let best = null, bd = 4.5; for (const a of this.g.animals) { if (a.dead || a.tamed || a.alt > 2.5) continue; const d = a.dist(this) - a.radius; if (d < bd && (a.target === this || a.byPlayerT > 0 || a.spec.temper !== 'prey')) { const ang = Math.atan2(a.x - this.x, a.z - this.z); let df = Math.abs(((ang - this.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI); if (df < 1.3) { bd = d; best = ang; } } }
    if (best != null) this.yaw = best;
    this.combo = i; this.queued = false; this.hitDone = false; this.state = 'attack';
    this.atkDur = this.play(COMBO[i], { once: true, ts: [0.85, 0.9, 1.7][i], fade: 0.1 }) * [1, 1, 0.72][i]; this.stT = this.atkDur;
    const a = this.cur; if (a) a.reset().play();
  }
  swing() {
    const dmg = (this.combo === 2 ? 30 : 18) * this.dmgMul; let hit = false;
    for (const a of this.g.animals) {
      if (a.dead || a.tamed || a.alt > 2.5) continue; const dx = a.x - this.x, dz = a.z - this.z, d = Math.hypot(dx, dz);
      if (d > 2.1 + a.radius) continue; const dot = (Math.sin(this.yaw) * dx + Math.cos(this.yaw) * dz) / (d || 1);
      if (dot > 0.25 || d < a.radius + 0.6) { a.damage(dmg, this); hit = true; }
    }
    return hit;
  }
}
