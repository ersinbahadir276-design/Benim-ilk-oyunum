# PROGRESS — scheduled development runs

Active game: **Ay Kılıççısı: Kara Zırh** (`ay-kiliccisi/`, single-file build `ay-kiliccisi/dist/ay-kiliccisi.html`,
copied to the root `index.html`). The old three.js game (Yaban Yoldaşları) lives in `yaban.html` + `src/` and is no
longer developed. Detailed design notes, session log and roadmap: `ay-kiliccisi/PROGRESS.md`.

How to build and test: `python3 ay-kiliccisi/tools/build.py`, then from `ay-kiliccisi/`:
`NODE_PATH=$(npm root -g) node test/harness.js test/<s-mech|s-loop|s-ui|s-stance>.js`.
Hero model: `cd ay-kiliccisi/tools/sculpt && npm install`, then `node --max-old-space-size=6000 tools/sculpt/build.mjs hero`.
**Important:** `tools/sculpt/cache/` is gitignored and `build.mjs` re-assembles `data/models.js` from that cache only.
On a fresh clone, seed the cache from `data/models.js` first (gunzip each entry into `cache/<name>.bin`;
note that the first entry sits on the `const MODELS={` line), otherwise every model you did not rebuild is dropped.

## Feature checklist (scheduled-run priority order)

- [ ] High-quality male protagonist character (Kael, the Black Armor). In progress.
- [ ] Realistic 3D character animations
- [ ] Integration of submitted GLB models
- [ ] Multiple animals and creatures
- [ ] Creature taming and AI
- [ ] Open world, combat, inventory, and progression systems
- [ ] Android performance and mobile controls

## Completed

(nothing on the checklist is finished yet)

## Run log

### 2026-11-25: protagonist armor redesign, pass 1
- Hero sculpt (`ay-kiliccisi/tools/sculpt/models/hero.mjs`):
  - Muscle cuirass: pectoral plates and an upper-abdomen swell blended into the breastplate, replacing the flat slab.
  - V-taper waist: the waist lames, belt, buckle, belt rivets and mail skirt were narrowed so they follow the bottom of
    the cuirass instead of bulging past it (previously the barrel silhouette).
  - Legs: slimmer cuisses with a thigh swell. The greaves now have a calf swell at the back and narrow to the ankle,
    replacing the stovepipe cone.
  - Visor: the T-slit and its glow decal are narrower, so they read as a burning slit instead of an orange blob.
  - Rebuilt: 21,226 triangles, 10,015 vertices (was 20,996 / 9,849). Other models unchanged (byte-identical).
- Test fix: `test/s-ui.js` charged-heavy test held the button 2.5 s, but charging auto-releases at 1.3 s and the swing
  ends ~0.7 s later, so it failed on the unchanged build too. Now it samples inside those windows: 7/7 three runs in a row.
- Tests: s-mech 47/47, s-loop 71/71, s-ui 7/7, s-stance 11/11. In-game screenshots checked (idle, side, helm, heavy swing).

## Next priorities
1. Protagonist, pass 2: arm silhouette (pauldrons are still very wide and boxy), articulated gauntlet fingers instead of
   mittens, a face or eyes behind the visor for close-ups, and a quality check of the cape hem and holes in motion.
   Then decide with the user whether the protagonist counts as finished.
2. Realistic animations: a keyframe clip layer on top of the procedural `poseTarget()` (idle breathing, foot IK on
   slopes, weight shift on turns), as ANALIZ.md section 3 suggests.
3. Known flaky test: the `s-ui` save/restore test returned `[0,0]` in 2 of 6 runs, before and after this change.
