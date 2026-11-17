# PROGRESS — scheduled development runs

Active game: **Ay Kılıççısı: Kara Zırh** (`ay-kiliccisi/`). Detailed design log: `ay-kiliccisi/PROGRESS.md`.
Build: `cd ay-kiliccisi && python3 tools/build.py` → `dist/ay-kiliccisi.html`, then copy to root `index.html` (site).
Tests: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<s-mech|s-loop|s-hero|s-stance>.js`
Hero model: edit `ay-kiliccisi/tools/sculpt/models/hero.mjs`, then
`cd tools/sculpt && npm install` (once), restore the cache from `data/models.js` if `tools/sculpt/cache/` is missing
(see run 1 notes), and `node --max-old-space-size=6000 tools/sculpt/build.mjs hero` (~60 s).

## Feature status (routine list, priority order)

| # | Feature | Status |
|---|---|---|
| 1 | High-quality male protagonist character | **In progress** — Kael sculpted model (≈22k tris, 58 bones) exists; armour refinement ongoing |
| 2 | Realistic 3D character animations | Not started as a dedicated pass — all hero motion is procedural poses + IK; no keyframe clip system |
| 3 | Integration of submitted GLB models | Partial — dragon, elf body (queen), hair GLB, skeleton proportions from 4 GLBs integrated |
| 4 | Multiple animals and creatures | Partial — wolves, crocodile, dragon, goblins; no deer/birds/dungeon monsters yet |
| 5 | Creature taming and AI | Partial — perception/alert AI, Veyra companion AI; taming only in the old game (`yaban.html`) |
| 6 | Open world, combat, inventory, progression | Mostly done — 2.8 km map, Tsushima-style combat, loot/inventory/smith/skills; dungeons, guild, weather missing |
| 7 | Android performance and mobile controls | Partial — touch layout + perf test in software WebGL; never measured on a real device |

## Completed
- (before scheduled runs) see `ay-kiliccisi/PROGRESS.md` sessions 1–7.

## Run log

### Run 1 — 2026-11-17 (feature 1: protagonist)
- Created this file (root PROGRESS.md did not exist).
- Restored `tools/sculpt/cache/*.bin` from `data/models.js` so a single-model rebuild no longer drops the other 14 models
  (the cache folder is not in git).
- Hero armour (`tools/sculpt/models/hero.mjs`):
  - V-shaped waist: abdominal lames now narrow at the top and flare toward the hips (was a straight "stack of tyres").
  - New plackart: raised, pointed belly plate over the lower cuirass with a bronze edge ridge, 4 rivets and engraved lines.
  - Greaves: calf swell at the back and a slimmer ankle instead of a straight pipe; second bronze band at the ankle.
  - Helm face: smaller T-slit, two wider breath slots that resolve cleanly at 5 mm voxels (three thin ones were jagged),
    one continuous bronze brow band instead of two cones meeting in a lump above the slit.
  - Triangles 20 996 → 21 832.
- Rebuilt `dist/ay-kiliccisi.html` and root `index.html`. Tests: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-hero screenshots OK (no tearing in heavy-attack pose).

## Next priorities
1. Feature 1 (continue): fur mantle reads low-poly/spiky up close — rework as layered clumps; gauntlet knuckle plates;
   look at the hero in-game from the gameplay camera (not only T-pose) and check plackart/lames under bending.
2. Feature 2: keyframe clip system for the hero (idle breathing, walk/run cycles with foot locking, attack follow-through)
   blended with the existing procedural poses.
3. Feature 7: simplify touch HUD and add a graphics-quality setting (outline/scenery density) for low-end Android.
