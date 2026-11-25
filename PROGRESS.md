# PROGRESS — scheduled development runs

Main game: **Ay Kılıççısı** (`ay-kiliccisi/`, built to `ay-kiliccisi/dist/ay-kiliccisi.html`, copied to root `index.html`).
The detailed design log and roadmap lives in `ay-kiliccisi/PROGRESS.md`; this file tracks the scheduled-run feature list.

## Feature status

| # | Feature | Status |
|---|---|---|
| 1 | High-quality male protagonist character | **In progress.** Kael's sculpted plate armor (`tools/sculpt/models/hero.mjs`, ~21k tris, 58 bones) is in the game. Armor redesign started (run 1). Still open: pauldron shape, gauntlet detail, a face/hair variant without the helm. |
| 2 | Realistic 3D character animations | Not started this cycle. All motion is procedural (joint angles + IK). Next step is a keyframe clip system with blending for the hero. |
| 3 | Integration of submitted GLB models | Partly done in earlier sessions: dragon, elf body (Demon Queen), hair GLB; other GLBs used only for skeleton proportions. |
| 4 | Multiple animals and creatures | Partly done: wolves, goblins (3 kinds), crocodile, dragon. Missing: deer/birds, undead, spiders, golems. |
| 5 | Creature taming and AI | Ay Kılıççısı has no taming yet (the old game `yaban.html` had it). AI: vision cones, group alerts, companion Veyra. |
| 6 | Open world, combat, inventory, progression | Largely done: 2.8 km map, Tsushima-style combat, loot, 7-tab system window, levels, skills. Open: map expansion, dungeons. |
| 7 | Android performance and mobile controls | PlayStation-style touch layout done; never tested on a real Android device. |

## Completed
- Run 1 (2026-11-25): hero armor redesign, part 1 (see log).

## Run log

### Run 1 — 2026-11-25 · Feature 1 (protagonist)
- New armor pieces on Kael, all sculpted through the SDF pipeline and skinned to existing bones:
  - **Plackart:** a raised belly plate with a Gothic pointed-arch top, bronze rolled edge and 5 rivets. A new `onSurf` helper sphere-traces the rivets onto the plate surface.
  - **Chest sigil:** a bronze crescent moon with a star (the Moon Swordsman's mark).
  - **Helm sigil:** a small crescent on the forehead above the brow band.
  - **Crimson tabard:** a cloth panel hanging from the belt between the tassets, with soft vertical folds and a pointed hem. It is weighted Hips → thighs so it follows the legs when running.
  - **Haute-pieces:** standing neck flanges on both pauldrons with bronze tops.
- Triangle budget kept at ~21k (20,996 → 21,086).
- Tests: `s-mech` 47/47 and `s-loop` 71/71 pass. Checked visually in the model viewer and in-game (`s-hero.js` front and run shots).
- Tried and dropped: a gold border on the tabard. Per-vertex colour bled across the low-poly panel and smeared gold over the whole tabard.
- Note for future runs: `tools/sculpt/cache/` is gitignored. Before running `build.mjs` on a fresh clone, unpack every model from `data/models.js` into `cache/*.bin`. Otherwise the rebuild writes `data/models.js` with only the model you built.

## Next priorities
1. Feature 1, continued: reshape the pauldrons (layered fan rather than blob domes), add knuckle plates and flared cuffs to the gauntlets, and make an unhelmeted head/face variant for cutscenes.
2. Feature 2: a keyframe clip system for the hero (idle, walk, run, light/heavy attack), with crossfade blending over the procedural pose.
3. Feature 4: new creature types (deer, birds, skeletons).
