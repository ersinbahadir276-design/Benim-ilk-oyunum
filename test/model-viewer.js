// Her modeli ve animasyonunu tek tek oynatıp gözle kontrol etmek için: test/model-viewer.html?m=hero&a=Walk_Loop
import * as THREE from 'three';
import { loadHero } from '../src/hero.js';
import { loadGLBCreatures, makeCreature, SPECIES } from '../src/creatures.js';
const P = new URLSearchParams(location.search);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(innerWidth, innerHeight); document.body.appendChild(renderer.domElement); renderer.shadowMap.enabled = true;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x8fb7d9);
const cam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 500);
scene.add(new THREE.HemisphereLight(0xffffff, 0x556644, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(5, 10, 6); sun.castShadow = true; sun.shadow.camera.left = sun.shadow.camera.bottom = -12; sun.shadow.camera.right = sun.shadow.camera.top = 12; scene.add(sun);
const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 48).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x6f9a55 })); ground.receiveShadow = true; scene.add(ground);
scene.add(new THREE.GridHelper(40, 40, 0x335533, 0x447744));
const ui = document.getElementById('ui'); if (P.has('t')) ui.style.display = 'none';
const name = P.get('m') || 'hero';
let update = () => {}, size = 2;
if (name === 'hero') {
  const h = await loadHero('../assets/models/'); scene.add(h.root);
  let cur; const play = (n) => { cur?.stop(); cur = h.mixer.clipAction(h.clips[n]); cur.reset().play(); };
  Object.keys(h.clips).forEach((n) => { const b = document.createElement('button'); b.textContent = n; b.onclick = () => play(n); ui.appendChild(b); });
  if (P.get('a')) play(P.get('a'));
  update = (dt) => { h.mixer.update(dt); h.springs.update(dt); }; window.T = { setTime: (t) => { const n = Math.round(t * 60); h.mixer.setTime(0); for (let i = 0; i < n; i++) update(1 / 60); } };
} else {
  await loadGLBCreatures('../assets/models/');
  const c = makeCreature(name); scene.add(c.root); size = c.spec.viewSize || c.spec.len || 2;
  const anims = ['idle', 'walk', 'run', 'attack', 'eat', 'die', 'fly'];
  let speed = 0; c.debugAnim = P.get('a') || 'idle';
  anims.forEach((n) => { const b = document.createElement('button'); b.textContent = n; b.onclick = () => { c.reset?.(); c.debugAnim = n; }; ui.appendChild(b); });
  Object.keys(SPECIES).forEach((n) => { const a = document.createElement('a'); a.href = '?m=' + n; a.textContent = ' ' + n; a.style.color = '#fd8'; ui.appendChild(a); });
  let tt = 0; update = (dt) => { tt += dt; c.animate(dt, c.debugAnim, tt); };
  window.T = { setTime: (t) => { const n = Math.round(t * 60); for (let i = 0; i < n; i++) update(1 / 60); } };
}
const ang = +(P.get('ang') ?? 0.6), el = +(P.get('el') ?? 0.25), dist = +(P.get('d') ?? 2.6) * size;
cam.position.set(Math.sin(ang) * dist, size * 0.5 + el * dist, Math.cos(ang) * dist); cam.lookAt(0, size * +(P.get('ty') ?? 0.45), 0);
let last = performance.now(); const frozen = P.has('t');
if (frozen) { window.T.setTime(+P.get('t')); }
renderer.setAnimationLoop(() => { const now = performance.now(), dt = Math.min((now - last) / 1000, 0.05); last = now; if (!frozen) update(dt); renderer.render(scene, cam); window.READY = true; });
