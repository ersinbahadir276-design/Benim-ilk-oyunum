# PROGRESS — scheduled development runs

Main game: **Ay Kılıççısı** (`ay-kiliccisi/`, built to `ay-kiliccisi/dist/ay-kiliccisi.html` and copied to the root `index.html`).
The detailed design log is `ay-kiliccisi/PROGRESS.md`. This file tracks the scheduled runs against the feature list below.
The older game `yaban.html` (Yaban Yoldaşları, three.js) is kept but no longer developed.

Build: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Tests: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<scenario>.js`

## Feature status

| # | Feature | Status |
|---|---|---|
| 1 | High-quality male protagonist character | **In progress.** Kael "Black Armor" is a sculpted SDF model (~21k triangles, 58 bones, PBR channels). Still open: the armour redesign the user asked for. |
| 2 | Realistic 3D character animations | **In progress.** Run 1 added the keyframed gait system (see below). Still open: foot IK on slopes, keyframed attack clips, strafe and backpedal cycles, turn-in-place steps, start/stop steps. |
| 3 | Integration of submitted GLB models | **Partial.** Dragon (its own clips), elf body for the Demon Queen, and the hair GLB are in the game. The other GLBs are used only for skeleton proportions (see the model table in `ay-kiliccisi/PROGRESS.md`). |
| 4 | Multiple animals and creatures | **Partial.** Wolves (and an alpha), goblins (archer, big, chief), a crocodile, and the dragon. Still open: skeletons, spiders, golems, deer and birds, and a rare white wolf. |
| 5 | Creature taming and AI | **Partial.** Vision cones, alerting, group AI and the utility-AI companion Veyra are in. Creature taming exists only in the old game (`yaban.html`) and has not been ported. |
| 6 | Open world, combat, inventory, progression | **Mostly done.** A 2.8 km world, Tsushima-style combat, a 7-tab system window, loot rarities, a blacksmith, skills and stances. Still open: a bigger map with new regions, dungeons, and a guild. |
| 7 | Android performance and mobile controls | **Partial.** PlayStation-style touch layout and portrait/landscape layouts are in, and the CPU budget is measured. It has never been tested on a real Android device. |

## Run log

### Run 1 — 2026-11-25 (feature 2: realistic animations, hero locomotion)
- New `ay-kiliccisi/src/32-gait.js` replaces the old single-sine leg swing with keyframed walk, run and sprint cycles.
  - Each cycle has hand-set thigh, knee and ankle keyframes from heel strike through toe-off and swing. They are sampled with periodic Catmull-Rom splines, and the right leg runs half a cycle behind the left.
  - The three cycles blend by ground speed, so walk to run to sprint changes without pops.
  - On top of the legs: ankle roll, pelvis twist and drop, a sideways weight shift over the stance foot, chest counter-rotation, lagging pendulum arms (the sword arm swings less), a flight phase when running, and lean into acceleration and into turns. The head is stabilised so it stays level and looks ahead.
  - Standing idle now breathes, slowly shifts weight from foot to foot with a relaxed knee, and looks around.
- `applyPose` (`ay-kiliccisi/src/30-player-model.js`) gained pelvis yaw and roll, head roll, a sideways root shift and per-foot ankle offsets. All of them default to 0, so the other poses are unchanged.
- New test `ay-kiliccisi/test/s-gait.js`: 17/17 pass. It checks spline continuity, that the legs alternate, that the stance foot stays on the ground, that no foot sinks, that there are no NaN values or frame pops, that stride grows walk < run < sprint, that the body banks into turns, and that idle breathes.
- Regressions: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-perf OK (logic 0.09–0.17 ms per frame).
- s-ui 6/7: the touch test "hold ATTACK to charge" fails, but it fails the same way on the code before this run. That is a known issue, not new.

## Next priorities
1. Feature 2 (continued): foot IK on slopes (plant each foot on the terrain height, lower the pelvis), and strafe and backpedal cycles while locked on.
2. Fix the pre-existing s-ui touch charge-attack test failure.
3. Feature 1: Kael armour redesign (`tools/sculpt/models/hero.mjs`).
4. Feature 4/5: new creature types (skeleton, spider), and port taming from the old game.
