# PROGRESS — scheduled development runs

The live game is **Ay Kılıççısı** (`ay-kiliccisi/`, built to `ay-kiliccisi/dist/ay-kiliccisi.html`, mirrored to the root
`index.html`). Its detailed design log is `ay-kiliccisi/PROGRESS.md`. The older prototype *Yaban Yoldaşları* lives in
`yaban.html` + `src/` and is not being developed further.

Build: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Tests: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<scenario>.js`

## Feature list (scheduled-task priority order)

| # | Feature | Status |
| --- | --- | --- |
| 1 | High-quality male protagonist character | **Mostly done, open item blocked on design input.** Kael "Kara Zırh" is a sculpted ~21k-triangle skinned model with PBR channels (`tools/sculpt/models/hero.mjs`). The user also asked for an armour redesign but gave no direction for it, so this stays open until they say what they want. |
| 2 | Realistic 3D character animations | **In progress.** Run 1 added the locomotion layer (see below). Still to do: see "Next priorities". |
| 3 | Integration of submitted GLB models | Partly done: dragon, elf body (Demon Queen), the user's hair GLB and several skeletons are integrated. Not done: kawaiope girl, wolf_puppy skeleton. |
| 4 | Multiple animals and creatures | Partly done: wolves, alpha wolf, goblins, big goblin, crocodile, dragon. Not done: dungeon creatures (skeleton, spider, golem…), night creatures. |
| 5 | Creature taming and AI | Partly done: perception cones, group alerts, Veyra's utility AI, wolf feeding. Not done: a full taming loop in this game. |
| 6 | Open world, combat, inventory, progression | Combat, inventory, loot, levels, skills, stances and the quest chain are done. World expansion (snow region, port, town, guild, dungeons) is not started. |
| 7 | Android performance and mobile controls | Touch layout and portrait/landscape are done, and performance was measured in software WebGL. Not yet tested on a real Android device or GPU. |

## Completed
- Run 1 (2026-11-25): **Feature 2, locomotion layer for Kael** (`ay-kiliccisi/src/33-anim.js`):
  - Terrain foot IK: each foot samples the terrain under it, and a two-bone sagittal IK shortens the uphill leg while the
    pelvis drops so the downhill foot still reaches the ground. Soles tilt to the slope (pitch and roll). The IK fades in and out
    by state (off in the air, while rolling, during ragdoll, takedowns and in water), and stale state is ignored after
    teleports and cut-scenes. Measured on a 0.54 slope: foot error goes from 7.9 cm / 6.7 cm to 2.3 cm / 1.2 cm.
  - Walk and run: the pelvis drops on the swing side, twists with the stride and shifts its weight over the stance foot.
    The torso and legs counter-rotate so they stay upright. The feet roll heel to toe (toes up at heel strike, toes down
    at push-off). The head stays level when the spine pitches forward.
  - Whole-body lean into turns and into acceleration (rotation about the feet), which settles back to 0 when he stops.
  - Idle: slow weight shift between the feet with one knee relaxed, plus breathing that roughly doubles in depth and
    speeds up when stamina is low.
  - New test `ay-kiliccisi/test/s-anim.js` (7/7 pass). Regression: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-save 1/1, s-assn 5/5.
- Known flaky test (not caused by this run): s-assn "okçu: duran hedefte…" hit rate is random and fails before this change too (0.30 and 0.90 at the previous commit). Its range or seed should be fixed.

## Next priorities
1. Feature 2, continued: foot locking during the stance phase (stops the slight sliding), procedural cape and fur
   secondary motion driven by velocity, upper-body hit reactions by hit direction, start/stop transitions (a plant
   step when stopping from a sprint), and turn-in-place steps.
2. Feature 1: ask the user for the armour redesign direction (reference image or description), then rebuild with
   `tools/sculpt`. Note that `tools/sculpt/build.mjs` rewrites `data/models.js` from `cache/*.bin`, and the cache is not in
   git, so first unpack the current `data/models.js` into the cache or the other models will be lost.
3. Feature 4: the dungeon creature set (skeleton, spider, golem) as sculpted models.
