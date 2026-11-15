// Oyuncu: erkek kahramanın hareketi, dövüşü ve animasyon durum makinesi.
import * as THREE from 'three';
import { floorY, waterDepth } from './world.js';
import { FootIK } from './ik.js';
import { analyzeGait, Locomotion } from './gait.js';

const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);

const COMBO = ['Sword_Regular_A', 'Sword_Regular_B', 'Sword_Regular_C'];
export class Player {
  constructor(game, hero) {
    this.g = game; this.hero = hero; this.x = 0; this.z = 4; this.y = floorY(0, 4, 0.95); this.vy = 0; this.yaw = Math.PI; this.speed = 0;
    this.hpMax = 100; this.hp = 100; this.stamina = 100; this.alive = true; this.crouching = false; this.radius = 0.4; this.alt = 0;
    this.state = 'move'; this.stT = 0; this.combo = 0; this.queued = false; this.hitDone = false; this.iframes = 0; this.cur = null; this.hurt = 0;
    this.kbx = 0; this.kbz = 0; this.hitT = 9; this.hitAmp = 0; this.hitDir = new THREE.Vector3(0, 0, 1);
    this.ik = new FootIK(hero.root, (x, z) => floorY(x, z, 0.95));
    this.spineB = ['J_Bip_C_Spine', 'J_Bip_C_Chest', 'J_Bip_C_UpperChest'].map((n) => hero.root.getObjectByName(n)).filter(Boolean);
    // hız–adım eşlemesi: kliplerin yer hızı yüklemede ölçülür, yürüme/koşu/depar faz senkronlu karışır
    const gait = (n) => ({ name: n, ...analyzeGait(hero.root, hero.clips[n]) });
    this.loco = new Locomotion(hero.mixer, hero.clips, ['Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop'].map(gait), hero.root);
    this.crouchLoco = new Locomotion(hero.mixer, hero.clips, [gait('Crouch_Fwd_Loop')]);
    game.scene.add(hero.root); this.play('Idle_Loop');
  }
  play(name, { fade = 0.18, once = false, ts = 1 } = {}) {
    const clip = this.hero.clips[name]; if (!clip) return 0;
    const a = this.hero.mixer.clipAction(clip); a.timeScale = ts;
    if (a === this.cur && !this.locoOn()) return clip.duration / ts;
    a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); a.clampWhenFinished = true; a.enabled = true; a.setEffectiveWeight(1);
    if (this.locoOn()) { this.loco.stop(fade); this.crouchLoco.stop(fade); this.cur = null; a.fadeIn(fade); }
    if (this.cur) a.crossFadeFrom(this.cur, fade, false); a.play(); this.cur = a;
    return clip.duration / ts;
  }
  locoOn() { return this.loco.on || this.crouchLoco.on; }
  // yürüme döngüsü: L (Locomotion) karışımını başlat/güncelle; diğer karışım ve tekil klip söner
  runLoco(L, other, dt, s, fade = 0.2) {
    if (other.on) other.stop(fade);
    if (!L.on) { if (this.cur && !this.locoOn()) this.cur.fadeOut(fade); L.start(fade); }
    this.cur = L.update(dt, s);
  }
  damage(n, from) {
    if (!this.alive || this.iframes > 0) return;
    this.hp -= n; this.hurt = 0.35; this.g.floatText(`-${Math.round(n)}`, this, '#ff5a5a'); this.g.ui.hurtFlash();
    if (this.hp > 0) this.hitReact(n, from);
    if (this.hp <= 0) { this.hp = 0; this.alive = false; this.state = 'dead'; this.stT = 4.5; this.crouching = false; this.cur = null; this.hero.mixer.stopAllAction(); this.loco.kill(); this.crouchLoco.kill(); this.play('Death01', { once: true, fade: 0 }); this.g.msg('Yenildin... Kampta yeniden doğacaksın.'); }
  }
  // Darbe tepkisi: üst gövdeye katmanlı Hit_Chest klibi + saldırganın tersine yönlü gövde savrulması + hafif geri itilme.
  hitReact(n, from) {
    const s = Math.min(1, 0.45 + n / 30);
    if (from && from.x != null) this.hitDir.set(this.x - from.x, 0, this.z - from.z); else this.hitDir.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    if (this.hitDir.lengthSq() < 1e-6) this.hitDir.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this.hitDir.normalize(); this.hitT = 0; this.hitAmp = 0.38 * s;
    const push = (this.state === 'attack' ? 1.2 : 2.6) * s; this.kbx = this.hitDir.x * push; this.kbz = this.hitDir.z * push;
    const clip = this.hero.clips.Hit_Chest_Add;
    if (clip && this.state !== 'roll') {
      // önden gelen darbede klip tam, arkadan gelende yarı ağırlıkta (klip göğse önden vuruşu gösterir)
      const front = -(Math.sin(this.yaw) * this.hitDir.x + Math.cos(this.yaw) * this.hitDir.z);
      const a = this.hero.mixer.clipAction(clip); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false;
      a.reset(); a.timeScale = 0.85; a.setEffectiveWeight(s * (front > 0 ? 1 : 0.5)); a.play(); this.hitAct = a;
    }
  }
  // Mixer'dan sonra: darbe yönüne göre omurga zincirine dünya uzayında eğilme (yükseliş 70 ms, sönüm ~0.4 sn).
  applyFlinch(dt) {
    this.hitT += dt; const t = this.hitT; if (t > 0.8 || !this.alive) return;
    const env = t < 0.07 ? Math.sin((t / 0.07) * Math.PI / 2) : Math.exp(-(t - 0.07) * 7);
    const ang = this.hitAmp * env; if (ang < 1e-3) return;
    _v.crossVectors(UP, this.hitDir).normalize();
    const share = [0.25, 0.35, 0.4];
    this.spineB.forEach((b, i) => {
      _q.setFromAxisAngle(_v, ang * share[i]);
      b.getWorldQuaternion(_q2).premultiply(_q);
      b.parent.getWorldQuaternion(_q).invert(); b.quaternion.copy(_q.multiply(_q2)); b.updateMatrixWorld(true);
    });
  }
  respawn() { this.alive = true; this.hp = this.hpMax; this.stamina = 100; this.x = 0; this.z = 4; this.vy = 0; this.state = 'move'; this.cur = null; this.hero.mixer.stopAllAction(); this.loco.kill(); this.crouchLoco.kill(); this.play('Idle_Loop', { fade: 0 }); this.hero.spring?.reset(); this.hero.face?.reset(); this.ik.reset(); this.kbx = this.kbz = 0; this.hitT = 9; for (const a of this.g.animals) if (a.target === this) a.target = null; }
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
      target = mag * (this.crouching ? 1.25 : run ? 7.6 : 4.4) * (wade ? 0.55 : 1);
      if (run) this.stamina -= dt * 11; else this.stamina = Math.min(100, this.stamina + dt * (mag > 0.1 ? 9 : 16));
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
    // darbe geri itmesi (oyuncu hızını değiştirmez; evcilleştirmedeki "kıpırdama" kontrolünü bozmaz)
    if (Math.abs(this.kbx) + Math.abs(this.kbz) > 0.01) {
      const nx = this.x + this.kbx * dt, nz = this.z + this.kbz * dt;
      if (waterDepth(nx, nz) < 1.15) { this.x = nx; this.z = nz; const p = { x: this.x, z: this.z }; g.world.collide(p, this.radius); this.x = p.x; this.z = p.z; }
      const f = Math.max(0, 1 - dt * 9); this.kbx *= f; this.kbz *= f;
    }
    // dikey
    this.vy -= 20 * dt; this.y += this.vy * dt; const gr = floorY(this.x, this.z, 0.95);
    if (this.y <= gr) { this.y = gr; this.vy = 0; if (this.state === 'jump' && this.airT > 0.1) { this.state = 'land'; this.stT = this.play('Jump_Land', { once: true, ts: 1.8, fade: 0.1 }) * 0.55; } }
    if (this.state === 'jump') { this.airT += dt; if (this.airT > 0.22) this.play('Jump_Loop', { fade: 0.15 }); }
    if (this.state === 'land' && this.stT <= 0) this.state = 'move';
    // hareket animasyonları
    if (this.state === 'move') {
      const s = this.speed;
      if (this.crouching) s > 0.3 ? this.runLoco(this.crouchLoco, this.loco, dt, s) : this.play('Crouch_Idle_Loop');
      else if (s < 0.3) this.play('Idle_Loop', { fade: 0.25 });
      else this.runLoco(this.loco, this.crouchLoco, dt, s);
    }
    this.hp = Math.min(this.hpMax, this.hp + (this.alive && this.hurt < -6 ? dt * 1.2 : 0));
    this.hero.mixer.update(dt);
    const r = this.hero.root; r.position.set(this.x, this.y, this.z); r.rotation.y = this.yaw;
    r.updateMatrixWorld(true);
    this.applyFlinch(dt);
    // ayak kilidi yalnızca yürüme döngüsünde (saldırı/etkileşimde bacaklar klipteki gibi kalır)
    this.ik.update(dt, this.alive && (this.state === 'move' || this.state === 'attack' || this.state === 'interact' || this.state === 'land') && this.y <= gr + 0.02, this.state === 'move' && this.locoOn() && this.speed > 0.3, this.speed);
    if (this.hero.face) this.updateFace(dt);
    if (this.hero.spring) this.hero.spring.update(dt);
  }
  // Yüz: duruma göre ifade, ilgi çeken hayvana baş/göz bakışı; evcilleştirince sevinç, saldırıya uğrayınca şaşkınlık.
  updateFace(dt) {
    const g = this.g, F = this.hero.face;
    const pets = g.pets ? g.pets.length : 0; if (pets > (this._pets ?? pets)) F.joy(); this._pets = pets;
    this._lookT = (this._lookT || 0) - dt;
    if (this._lookT <= 0) {
      this._lookT = 0.25; let best = null, bs = Infinity, threats = 0;
      for (const a of g.animals || []) {
        if (a.dead) continue; if (a.target === this) threats++;
        const dx = a.x - this.x, dz = a.z - this.z, d = Math.hypot(dx, dz); if (d > 10 || d < 0.4) continue;
        let df = Math.atan2(dx, dz) - this.yaw; df = Math.abs(Math.atan2(Math.sin(df), Math.cos(df))); if (df > 1.9) continue;
        // tehdit > etkileşim hedefi > yakın ve önde olan
        const s = d + df * 3 - (a.target === this ? 6 : 0) - (g.near?.animal === a ? 4 : 0);
        if (s < bs) { bs = s; best = a; }
      }
      if (threats > (this._threats || 0)) F.surprise(); this._threats = threats; this._lookA = best;
    }
    const a = this._lookA && !this._lookA.dead ? this._lookA : null;
    const head = this.hero.head; const eye = this._eye || (this._eye = head.position.clone()); head.getWorldPosition(eye); eye.y += 0.06;
    const tgt = a ? { x: a.x, y: (a.c?.root?.position.y ?? a.y) + (a.alt > 0 ? 0 : Math.max(0.3, a.radius * 0.9)), z: a.z } : null;
    const dur = this.atkDur || 1, phase = this.state === 'attack' ? 1 - Math.max(0, this.stT) / dur : 0;
    F.update(dt, { state: this.state, hurt: this.hurt, hpFrac: this.hp / this.hpMax, combo: this.combo, attackPhase: phase, stamina: this.stamina, sprinting: this.speed > 5.6, crouching: this.crouching, yaw: this.yaw, eye, target: tgt });
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
    const dmg = (this.combo === 2 ? 30 : 18) * (this.dmgMul || 1); let hit = false;
    for (const a of this.g.animals) {
      if (a.dead || a.tamed || a.alt > 2.5) continue; const dx = a.x - this.x, dz = a.z - this.z, d = Math.hypot(dx, dz);
      if (d > 2.1 + a.radius) continue; const dot = (Math.sin(this.yaw) * dx + Math.cos(this.yaw) * dz) / (d || 1);
      if (dot > 0.25 || d < a.radius + 0.6) { a.damage(dmg, this); hit = true; }
    }
    return hit;
  }
}
