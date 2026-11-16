// Ana oyun: sahne, yükleme, girdi, kamera, oyun döngüsü ve arayüz.
import * as THREE from 'three';
import { loadHero } from './hero.js';
import { loadGLBCreatures, SPECIES } from './creatures.js';
import { World, height, zone, rng, floorY, LAKE, PEAK, HALF } from './world.js';
import { Animal, ITEMS, eats } from './animal.js';
import { Player } from './player.js';
import { Progress, xpNeed } from './progress.js';

const $ = (id) => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const NODE_GIVE = { berry: ['berry', 2, 'Böğürtlen topla'], carrot: ['carrot', 2, 'Havuç sök'], apple: ['apple', 2, 'Elma topla'], honey: ['honey', 1, 'Bal al'], fish: ['fish', 1, 'Balık tut'], moonstone: ['moonstone', 1, 'Ay taşı topla'] };
const HEAL = { berry: 12, carrot: 12, apple: 18, meat: 30, fish: 25, honey: 40 };

class Inventory {
  constructor(ui) { this.items = { flute: 1, carrot: 2, berry: 3, apple: 1, meat: 2 }; this.sel = 'meat'; this.ui = ui; }
  count(k) { return this.items[k] || 0; }
  add(k, n = 1) { this.items[k] = this.count(k) + n; this.dirty = true; }
  take(k, n = 1) { if (this.count(k) < n) return false; this.items[k] -= n; if (k !== 'flute' && !this.items[k]) delete this.items[k]; this.dirty = true; return true; }
  list() { return Object.keys(ITEMS).filter((k) => this.count(k) > 0); }
}

class Game {
  constructor() {
    this.time = 0; this.animals = []; this.pets = []; this.baits = []; this.floats = []; this.petCounter = {};
    this.camYaw = 0; this.camPitch = 0.32; this.camDist = 6.5;
    this.keys = {}; this.edge = {}; this.touch = { mx: 0, mz: 0, run: false };
    this.ui = { hurtFlash: () => { const h = $('hurt'); h.style.transition = 'none'; h.style.opacity = 0.7; requestAnimationFrame(() => { h.style.transition = 'opacity .5s'; h.style.opacity = 0; }); } };
  }
  async init() {
    const canvas = $('c');
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.75)); r.setSize(innerWidth, innerHeight); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    const scene = this.scene = new THREE.Scene(); scene.background = new THREE.Color(0x9cc6ea); scene.fog = new THREE.Fog(0x9cc6ea, 70, 260);
    this.camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.2, 600);
    scene.add(new THREE.HemisphereLight(0xdfeeff, 0x54663c, 1.25));
    const sun = this.sun = new THREE.DirectionalLight(0xfff2d9, 2.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 160 }); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04; scene.add(sun, sun.target);
    addEventListener('resize', () => { r.setSize(innerWidth, innerHeight); this.camera.aspect = innerWidth / innerHeight; this.camera.updateProjectionMatrix(); });
    // yükleme
    let done = 0; const step = (t) => { done++; $('loadbar').style.transform = `scaleX(${done / 4})`; $('loadtxt').textContent = t; };
    step('Dünya kuruluyor…'); this.world = new World(scene);
    const hero = await loadHero(); step('Kahraman hazır…');
    await loadGLBCreatures('assets/models/', () => step('Yaratıklar yükleniyor…'));
    this.inv = new Inventory(); this.player = new Player(this, hero); this.prog = new Progress(this);
    this.spawnAll(); this.bindInput();
    // kayıt: ?test ve ?nosave kipinde ne okunur ne yazılır
    const useSave = !Q.has('test') && !Q.has('nosave'), save = useSave ? Progress.read() : null;
    if (save) { this.prog.load(save, (kind, x, z) => this.spawnPet(kind, x, z)); this.loaded = save; }
    this.prog.autosave = useSave;
    if (useSave) { const flush = () => { if (this.running || this.loaded || this.prog.kills || this.prog.tames) this.prog.save(); }; addEventListener('pagehide', flush); document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); }); }
    $('newgame').onclick = () => { if (confirm('Kayıt silinip yeni oyun başlasın mı?')) { this.prog.autosave = false; Progress.clear(); location.reload(); } };
    $('newgame').hidden = !save;
    this.buildHotbar();
    $('loadtxt').textContent = 'Hazır!'; $('loadbar').parentElement.hidden = true; $('start').hidden = false;
    $('start').onclick = () => this.start(); $('helpbtn').onclick = () => this.pause();
    if (Q.has('test')) this.start();
    this.last = performance.now(); r.setAnimationLoop(() => this.frame());
    window.GAME = this;
  }
  start() { $('overlay').style.display = 'none'; $('hud').hidden = false; this.running = true; if ('ontouchstart' in window || Q.has('touch')) { $('touch').hidden = false; $('log').style.bottom = '240px'; } if (!this.started) this.msg(this.loaded ? `Kayıt yüklendi: seviye ${this.prog.level}, ${this.pets.length} yoldaş.` : 'Kamptasın. Çevredeki hayvanlara yaklaş; üstte evcilleştirme ipucunu göreceksin.'); this.started = true; }
  pause() { if (this.prog.autosave) { this.prog.save(); $('newgame').hidden = false; } this.running = false; const o = $('overlay'); o.style.display = 'flex'; o.classList.add('pause'); $('loadtxt').textContent = 'Duraklatıldı'; $('start').textContent = 'Devam Et'; }

  spawnAll() {
    const R = rng(777), put = (kind, n, ok) => { let k = 0, tries = 0; while (k < n && tries++ < 5000) { const x = (R() - 0.5) * 2 * (HALF - 12), z = (R() - 0.5) * 2 * (HALF - 12), h = height(x, z); if (Math.hypot(x, z) < 16 || !ok(zone(x, z), h, x, z)) continue; this.animals.push(new Animal(this, kind, x, z)); k++; } };
    const land = (zs) => (zn, h) => zs.includes(zn) && h > -0.3;
    put('rabbit', 7, land(['meadow'])); put('deer', 4, land(['meadow'])); put('horse', 3, land(['meadow'])); put('fox', 3, land(['meadow']));
    put('wolf', 5, land(['forest'])); put('bear', 2, land(['forest'])); put('deer', 3, land(['forest'])); put('rabbit', 2, land(['forest'])); put('fox', 2, land(['forest']));
    put('lion', 3, land(['savanna'])); put('horse', 3, land(['savanna'])); put('tiger', 3, land(['jungle'])); put('snake', 4, land(['jungle']));
    put('crocodile', 4, (zn, h) => zn === 'lake' && h < -0.5 && h > -1.5); put('snake', 2, land(['lake']));
    put('eagle', 4, (zn, h) => zn === 'mountain' && h < 9); put('shadowbeast', 3, land(['dark'])); put('ogre', 2, land(['dark']));
    this.animals.push(new Animal(this, 'dragon', PEAK.x, PEAK.z));
    // kampın yakınına birer tanışma hayvanı
    this.animals.push(new Animal(this, 'rabbit', 12, 14), new Animal(this, 'horse', -18, 20), new Animal(this, 'fox', 22, -14));
  }

  /* ---------------- girdi */
  bindInput() {
    const map = { KeyW: 'w', KeyS: 's', KeyA: 'a', KeyD: 'd', ArrowUp: 'w', ArrowDown: 's', ArrowLeft: 'a', ArrowRight: 'd', ShiftLeft: 'run', ShiftRight: 'run', Space: 'jump', KeyC: 'crouch', KeyQ: 'roll', KeyJ: 'attack', KeyE: 'interact', KeyG: 'bait', KeyH: 'eat', KeyT: 'stay' };
    addEventListener('keydown', (e) => { if (e.code === 'Escape' && this.running) return this.pause(); const k = map[e.code]; if (k) { if (!this.keys[k]) this.edge[k] = true; this.keys[k] = true; e.preventDefault(); } const n = +e.key; if (n >= 1 && n <= 9) { const l = this.inv.list(); if (l[n - 1]) { this.inv.sel = l[n - 1]; this.inv.dirty = true; } } });
    addEventListener('keyup', (e) => { const k = map[e.code]; if (k) this.keys[k] = false; });
    addEventListener('blur', () => { this.keys = {}; });
    const c = $('c'); let drag = null;
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    c.addEventListener('pointerdown', (e) => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0, btn: e.button, type: e.pointerType }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => { if (!drag || drag.id !== e.pointerId) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy); this.camYaw -= dx * 0.005; this.camPitch = Math.min(1.25, Math.max(-0.15, this.camPitch + dy * 0.004)); });
    c.addEventListener('pointerup', (e) => { if (drag && drag.id === e.pointerId) { if (drag.moved < 6 && drag.btn === 0 && drag.type === 'mouse') this.edge.attack = true; drag = null; } });
    c.addEventListener('wheel', (e) => { this.camDist = Math.min(14, Math.max(2.5, this.camDist + e.deltaY * 0.006)); }, { passive: true });
    // dokunmatik
    const stick = $('stick'), knob = stick.firstElementChild; let sid = null;
    const sm = (e) => { const r = stick.getBoundingClientRect(), dx = (e.clientX - r.left - 60) / 50, dy = (e.clientY - r.top - 60) / 50, m = Math.max(1, Math.hypot(dx, dy)); this.touch.mx = -dx / m; this.touch.mz = -dy / m; knob.style.transform = `translate(${dx / m * 40}px,${dy / m * 40}px)`; };
    stick.addEventListener('pointerdown', (e) => { sid = e.pointerId; stick.setPointerCapture(sid); sm(e); });
    stick.addEventListener('pointermove', (e) => { if (e.pointerId === sid) sm(e); });
    const se = (e) => { if (e.pointerId === sid) { sid = null; this.touch.mx = this.touch.mz = 0; knob.style.transform = ''; } };
    stick.addEventListener('pointerup', se); stick.addEventListener('pointercancel', se);
    for (const b of document.querySelectorAll('#tbtns button')) {
      const k = b.dataset.k;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (k === 'run') { this.touch.run = !this.touch.run; b.classList.toggle('on', this.touch.run); return; } this.edge[k] = true; this.keys[k] = true; });
      const up = () => { if (k !== 'run') this.keys[k] = false; }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
    }
  }

  /* ---------------- arayüz yardımcıları */
  msg(text) { const d = document.createElement('div'); d.textContent = text; const log = $('log'); log.appendChild(d); while (log.children.length > 5) log.firstChild.remove(); setTimeout(() => d.remove(), 7000); this.lastMsg = text; }
  floatText(text, ent, color) { const s = document.createElement('span'); s.textContent = text; s.style.color = color; $('floats').appendChild(s); this.floats.push({ s, x: ent.x, y: (ent.y || 0) + (ent.alt || 0) + (ent.c ? ent.c.height : 1.9), z: ent.z, t: 0 }); }
  buildHotbar() {
    const hb = $('hotbar'); hb.innerHTML = ''; const l = this.inv.list(); if (!l.includes(this.inv.sel)) this.inv.sel = l[0];
    l.forEach((k, i) => { const d = document.createElement('div'); d.className = 'slot' + (k === this.inv.sel ? ' sel' : ''); d.innerHTML = `<u>${i + 1}</u>${ITEMS[k].icon}<b>${k === 'flute' ? '' : this.inv.count(k)}</b><small>${ITEMS[k].name}</small>`; d.onclick = () => { this.inv.sel = k; this.inv.dirty = true; }; hb.appendChild(d); });
    this.inv.dirty = false;
  }
  buildPets() {
    const list = $('petlist'); $('petcount').textContent = `${this.pets.length}/5`;
    if (list.children.length !== this.pets.length) {
      list.innerHTML = '';
      this.pets.forEach((p) => { const d = document.createElement('div'); d.className = 'pet'; d.innerHTML = '<div class="row"><b></b><span class="mood"></span><button title="Serbest bırak">Bırak</button></div><div class="bar hp"><i></i></div><div class="bar hunger"><i></i></div>'; d.querySelector('button').onclick = () => { this.msg(`${p.petName} serbest bırakıldı.`); this.removePet(p, false); }; list.appendChild(d); });
      if (!this.pets.length) list.innerHTML = '';
    }
    this.pets.forEach((p, i) => { const d = list.children[i]; if (!d) return; d.querySelector('b').textContent = `${p.petName} · Sv ${p.level || 1}`; d.querySelector('.mood').textContent = p.mood(); const b = d.querySelectorAll('.bar i'); b[0].style.transform = `scaleX(${Math.max(0, p.frac)})`; b[1].style.transform = `scaleX(${p.hunger / 100})`; });
  }
  removePet(p, dead) { const i = this.pets.indexOf(p); if (i >= 0) this.pets.splice(i, 1); p.level = 0; p.xp = 0; p.dmgMul = 1; p.hpMax = p.spec.hp; p.hp = Math.min(p.hp, p.hpMax); p.tamed = false; p.trust = 0; p.fed = false; p.stay = false; p.home = { x: p.x, z: p.z }; p.calmT = 40; p.target = null; if (!dead) { p.altGoal = p.spec.kind === 'bird' ? 14 : 0; p.set('idle', 2); } $('petlist').innerHTML = ''; }
  spawnPet(kind, x, z) { if (!SPECIES[kind]) return null; const a = new Animal(this, kind, x, z); a.home = { x, z }; this.animals.push(a); return a; }
  removeBait(b) { const i = this.baits.indexOf(b); if (i >= 0) this.baits.splice(i, 1); this.scene.remove(b.mesh); }
  dropBait() {
    const P = this.player, k = this.inv.sel; if (!P.alive) return;
    if (!ITEMS[k]?.food) return this.msg('Yem olarak bırakmak için bir yiyecek seç (1–9).');
    if (this.baits.length >= 6) this.removeBait(this.baits[0]);
    this.inv.take(k); const x = P.x + Math.sin(P.yaw) * 1.1, z = P.z + Math.cos(P.yaw) * 1.1;
    const col = { meat: 0xb5483a, fish: 0xb8c4d2, berry: 0x8e1f6b, carrot: 0xf07c1c, apple: 0xd4222a, honey: 0xe3a51d }[k];
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6).scale(1.4, 0.6, 1), new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })); mesh.position.set(x, floorY(x, z, 0) + 0.1, z); mesh.castShadow = true; this.scene.add(mesh);
    this.baits.push({ x, z, item: k, mesh, t: 0 }); P.interactAnim(true); this.msg(`${ITEMS[k].name} yere bırakıldı. Geri çekil (7 m) ve bekle.`);
  }
  eatFood() {
    const P = this.player, k = HEAL[this.inv.sel] ? this.inv.sel : Object.keys(HEAL).find((i) => this.inv.count(i) > 0);
    if (!k || !this.inv.count(k)) return this.msg('Yiyecek yok.'); if (P.hp >= P.hpMax) return this.msg('Canın zaten dolu.');
    this.inv.take(k); P.hp = Math.min(P.hpMax, P.hp + HEAL[k]); this.msg(`${ITEMS[k].name} yedin (+${HEAL[k]} can).`);
  }
  // E için en yakın etkileşim adayı
  nearest() {
    const P = this.player; let best = null, bd = 1e9;
    for (const n of this.world.nodes) { if (!n.ready) continue; const d = Math.hypot(n.x - P.x, n.z - P.z) - (n.type === 'apple' || n.type === 'honey' ? 1.2 : n.type === 'fish' ? 1.6 : 0.6); if (d < 1.9 && d < bd) { bd = d; best = { node: n }; } }
    // öncelik: yabani hayvan > kaynak > yoldaş (yoldaşlar oyuncunun dibinde durduğu için hedefi çalmasın)
    let wild = null, wd = 2.6, pet = null, pd = 2.6;
    for (const a of this.animals) { if (a.dead || a.alt > 2) continue; const d = a.dist(P) - a.radius; if (a.tamed) { if (d < pd) { pd = d; pet = a; } } else if (d < wd) { wd = d; wild = a; } }
    return wild ? { animal: wild } : best || (pet ? { animal: pet } : null);
  }
  interact() {
    const P = this.player, n = this.near; if (!n || !P.alive || (P.state !== 'move')) return;
    if (n.node) { const [item, cnt] = NODE_GIVE[n.node.type]; this.inv.add(item, cnt); n.node.ready = false; n.node.timer = 75; n.node.fruit.visible = false; P.interactAnim(n.node.type === 'carrot' || n.node.type === 'moonstone'); this.msg(`+${cnt} ${ITEMS[item].name}`); this.prog.onGather(); return; }
    const a = n.animal; P.yaw = Math.atan2(a.x - P.x, a.z - P.z);
    if (a.tamed) { a.feedPet(); P.interactAnim(false); } else if (a.tryTame()) P.interactAnim(false);
  }

  /* ---------------- döngü */
  frame() {
    const now = performance.now(), dt = Math.min((now - this.last) / 1000, 0.05); this.last = now;
    if (this.running) this.update(dt); else this.camYaw += dt * 0.05;
    this.updateCamera(dt); this.renderer.render(this.scene, this.camera);
  }
  update(dt) {
    this.time += dt; const P = this.player, k = this.keys, e = this.edge;
    const inp = { mx: (k.a ? 1 : 0) - (k.d ? 1 : 0) + this.touch.mx, mz: (k.w ? 1 : 0) - (k.s ? 1 : 0) + this.touch.mz, run: k.run || this.touch.run, jump: e.jump, attack: e.attack, roll: e.roll, crouch: e.crouch };
    P.update(dt, inp);
    this.near = this.nearest();
    if (e.interact) this.interact(); if (e.bait) this.dropBait(); if (e.eat) this.eatFood();
    if (e.stay && this.pets.length) { const s = !this.pets[0].stay; this.pets.forEach((p) => { p.stay = s; }); this.msg(s ? 'Yoldaşlar: BEKLE' : 'Yoldaşlar: TAKİP ET'); }
    // basılı tutma ile evcilleştirme (at / yılan)
    let holding = null;
    if (k.interact && this.near?.animal && !this.near.animal.tamed) { const a = this.near.animal; if (a.holdTame(dt)) holding = a; } else if (this.holdA) this.holdA.holdP = Math.max(0, this.holdA.holdP - dt);
    this.holdA = holding || this.holdA; $('hold').hidden = !(this.holdA && this.holdA.holdP > 0.01 && !this.holdA.tamed); if (!$('hold').hidden) $('hold').firstElementChild.style.width = `${this.holdA.holdP * 100}%`;
    for (const a of this.animals) a.update(dt);
    this.world.update(dt, this.time);
    for (const b of this.baits) { b.t += dt; b.mesh.rotation.y += dt; } if (this.baits[0]?.t > 150) this.removeBait(this.baits[0]);
    this.prog.update(dt);
    this.edge = {};
    this.updateHud(dt);
  }
  updateCamera(dt) {
    const P = this.player, cam = this.camera; if (!P) return;
    const ty = P.y + (P.crouching ? 1.15 : 1.5), cp = Math.cos(this.camPitch), d = this.camDist;
    let cx = P.x - Math.sin(this.camYaw) * cp * d, cz = P.z - Math.cos(this.camYaw) * cp * d, cy = ty + Math.sin(this.camPitch) * d;
    cy = Math.max(cy, floorY(cx, cz, 0) + 0.5);
    cam.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 14)); cam.lookAt(P.x, ty, P.z);
    this.sun.position.set(P.x + 30, P.y + 55, P.z + 22); this.sun.target.position.set(P.x, P.y, P.z);
  }
  updateHud(dt) {
    const P = this.player;
    $('hp').style.transform = `scaleX(${P.hp / P.hpMax})`; $('st').style.transform = `scaleX(${P.stamina / P.stMax})`;
    const pr = this.prog; if (pr.dirty || pr.shown !== pr.level) { pr.shown = pr.level; $('lvl').textContent = pr.level; $('xp').style.transform = `scaleX(${pr.xp / xpNeed(pr.level)})`; $('xptxt').textContent = `XP ${Math.floor(pr.xp)}/${xpNeed(pr.level)}`; }
    if (this.inv.dirty) this.buildHotbar();
    this.hudT = (this.hudT || 0) - dt;
    if (this.hudT <= 0) {
      this.hudT = 0.12; this.buildPets();
      // odak: en yakın canlı hayvan
      let f = null, fd = 16; for (const a of this.animals) { if (a.dead) continue; const d = a.dist(P) - a.radius; if (d < fd) { fd = d; f = a; } }
      const fo = $('focus'); fo.hidden = !f;
      if (f) { const tm = f.spec.tame; $('fname').textContent = f.tamed ? `${f.petName} (yoldaş)` : f.spec.name + (tm && tm.steps > 1 ? ` — güven ${f.trust}/${tm.steps}` : ''); $('fhp').style.transform = `scaleX(${Math.max(0, f.frac)})`;
        $('fhint').textContent = f.tamed ? `Açlık %${Math.round(f.hunger)} · ${f.mood()} · E: besle` : (f.cowerT > 0 ? `Şimdi! E: ${ITEMS[[].concat(tm.item)[0]].name} sun` : '🐾 ' + f.tameHint()); }
      const pr = $('prompt'), n = this.near; let txt = '';
      if (n?.node) txt = `E: ${NODE_GIVE[n.node.type][2]}`; else if (n?.animal) txt = n.animal.tamed ? `E: ${n.animal.petName} besle` : n.animal.spec.tame ? `E: Evcilleştir — ${n.animal.spec.name}` : '';
      pr.hidden = !txt; pr.textContent = txt;
    }
    // uçuşan yazılar
    const v = new THREE.Vector3();
    this.floats = this.floats.filter((f) => { f.t += dt; if (f.t > 1.1) { f.s.remove(); return false; } v.set(f.x, f.y + f.t * 1.2, f.z).project(this.camera); f.s.style.left = `${(v.x * 0.5 + 0.5) * innerWidth}px`; f.s.style.top = `${(-v.y * 0.5 + 0.5) * innerHeight}px`; f.s.style.opacity = v.z > 1 ? 0 : 1.1 - f.t; return true; });
  }
}

new Game().init().catch((e) => { console.error(e); $('loadtxt').textContent = 'Yükleme hatası: ' + e.message; });
export { SPECIES, eats, LAKE };
