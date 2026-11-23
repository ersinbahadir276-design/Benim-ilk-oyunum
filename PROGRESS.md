# PROGRESS — routine tracker

Tracked by the scheduled "Game development continuous task". The active game is **Ay Kılıççısı**
(`ay-kiliccisi/`, single-file build `ay-kiliccisi/dist/ay-kiliccisi.html`, copied to root `index.html`).
The detailed design log lives in `ay-kiliccisi/PROGRESS.md` (Turkish); this file tracks the routine's feature list.

Build: `python3 ay-kiliccisi/tools/build.py` · Hero model: `cd ay-kiliccisi/tools/sculpt && npm install && node --max-old-space-size=6000 build.mjs hero`
Tests: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<s-mech|s-loop|s-stance|s-save|s-perf>.js`

Note: `tools/sculpt/cache/` is not in git. Before rebuilding one model, restore every cached model from
`data/models.js` (all `name:"base64"` entries, **including `bigGoblin`, which sits on the `const MODELS={` line**),
otherwise `build.mjs` writes a `models.js` that is missing models.

## Completed
_(nothing on the feature list is finished yet — see status below)_

## Feature status
| # | Feature | Status |
| --- | --- | --- |
| 1 | High-quality male protagonist | **In progress.** Kael (SDF-sculpted plate armour, 58 bones, ~22k tris). Run 1 added a field kit. Open: armour redesign the user asked for, face/visor variant, LOD |
| 2 | Realistic 3D character animations | Not started by the routine (hero uses procedural poses + IK) |
| 3 | Integration of submitted GLB models | Partial: dragon, elf body (Demon Queen), hair GLB in; others only donate skeleton proportions |
| 4 | Multiple animals and creatures | Partial: wolves, goblins (3 kinds), crocodile, dragon. Planned: skeleton, spider, golem, ghoul |
| 5 | Creature taming and AI | Partial: wolf taming, perception cones, Veyra utility AI |
| 6 | Open world, combat, inventory, progression | Mostly built (stances, parry, loot, 7-tab system window, altars, quests). Open: map expansion, dungeons |
| 7 | Android performance and mobile controls | Touch layout done; never measured on a real Android device |

## Run log
### Run 1 — 2026-11-23 (feature 1: male protagonist)
- Hero sculpt (`ay-kiliccisi/tools/sculpt/models/hero.mjs`): added a **baldric** that hugs the cuirass from right
  shoulder to left hip (wraps front and back) with bronze edge stitching and a glowing ember boss; a **crimson tabard**
  over the tassets with folds, a ragged hem and a raised bronze **crescent-and-blade emblem**, weighted Hips → thighs so it
  follows the legs; a **belt pouch** on the left hip; a **sheathed rondel dagger** on the right hip.
  Rebuilt `hero` only; every other model in `data/models.js` is byte-identical. Hero now 10.3k verts / 22.1k tris (was ~8.6k verts).
- Autosave fix (`src/60-game.js`): the 6 s autosave timer counted game time, which crawls when frames are slow
  (software GL, weak phones), so progress was often only saved on `pagehide`. It now saves every 5 s of wall-clock time.
  `s-save` went from 4/8 (new build) to 13/14 passes; the one remaining failure was not reproduced.
- Tests: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-perf ran clean (draw prep ~+15% with the heavier hero).

## Next priorities
1. Feature 1: the user's pending armour redesign (`ay-kiliccisi/PROGRESS.md` → "kahraman zırhını yeniden tasarla"); consider a
   lower-poly LOD for the hero since it is CPU-skinned.
2. Feature 2: better hero animation (attack anticipation/follow-through, foot planting).
3. Feature 4: first dungeon creature (skeleton warrior) using the sculpt pipeline.
