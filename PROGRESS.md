# PROGRESS — scheduled development runs

This file tracks the scheduled (automated) development runs against the feature list below.
The game being developed is **Ay Kılıççısı** (`ay-kiliccisi/`, published as the root `index.html`).
Its detailed design log, test list and history are in `ay-kiliccisi/PROGRESS.md`. Read both.

## Completed features

_None of the top-level features below is fully finished yet._

## Feature status

| # | Feature | Status | Notes |
| --- | --- | --- | --- |
| 1 | High-quality male protagonist character | **In progress** | Kael "Kara Zırh" is a sculpted SDF model (`tools/sculpt/models/hero.mjs`). Armor pass 2 done in run 1 (see below). |
| 2 | Realistic 3D character animations | Partial | Poses are procedural (`src/31-hero.js`, `src/55-player.js`); no motion-capture clips on the Ay Kılıççısı hero yet. |
| 3 | Integration of submitted GLB models | Partial | Dragon, elf body (queen), hair GLB in use; other GLBs only provide skeleton proportions (`tools/rigs/`). |
| 4 | Multiple animals and creatures | Partial | Wolves, crocodile, dragon, goblins. The older `yaban.html` has 14 species that have not been ported. |
| 5 | Creature taming and AI | Partial | Perception AI, packs and the Veyra companion exist; there is no taming in Ay Kılıççısı (only in `yaban.html`). |
| 6 | Open world, combat, inventory, progression | Mostly built | 2.8 km map, stance combat, loot/inventory, levels and skills. Map expansion and dungeons are still open. |
| 7 | Android performance and mobile controls | Partial | Touch layout done. Performance has only been measured with software WebGL; no real device test yet. |

## Run log

### Run 1 — 2026-11-25 (feature 1: protagonist)
- Created this file. Reviewed the repo: clean tree, no open work in progress.
- Hero armor pass 2 (`ay-kiliccisi/tools/sculpt/models/hero.mjs`):
  - Centre keel ridge on the breastplate (it used to be a featureless slab)
  - Raised bronze crescent-moon emblem with a pale moonstone (the game's "Moon Swordsman" identity), new `gem` material
  - Diagonal leather baldric across the cuirass with a bronze buckle and rivets (breaks the symmetry)
  - Oxblood front tabard hanging from the belt between the tassets. It has a frayed hem and folds, and it is weighted to the hips and both thighs so it swings with the legs.
  - Leather belt pouch with flap and stud on the rear hip
  - Triangle budget raised from 21k to 23k (now 22,822 triangles, 10,681 vertices)
- Rebuilt `data/models.js`. Only the hero entry changed; the other 15 models are byte-identical. Rebuilt `dist/` and synced the root `index.html`.
- Tests: `s-mech` 47/47, `s-loop` 71/71, `s-stance` 11/11, `s-hero` and `s-perf` with no page errors. The in-game shots were checked for tearing while running and during a heavy attack.
- Lesson: per-vertex decals (bronze inlay, a tabard emblem) do not survive simplification on flat cloth or plate. Model that kind of detail as geometry.
- Pipeline note: `tools/sculpt/cache/` is gitignored. Before a single-model rebuild, restore the cache from `data/models.js`. The first entry, `bigGoblin`, is on the `const MODELS={` line. Otherwise the other models are dropped.

## Next priorities
1. Protagonist, continued: tabard and cape back detail (fold geometry, a back plate emblem), a gauntlet knuckle plate, and a more distinctive helm visor. Then decide with the user whether Kael needs an unhelmeted face.
2. Animations: hand-authored keyframe clips (idle breathing, turn-in-place, landing recovery) to replace the purely procedural poses where they look stiff.
3. Creatures: port at least one `yaban.html` species (deer or bear) into Ay Kılıççısı as a sculpted model.
