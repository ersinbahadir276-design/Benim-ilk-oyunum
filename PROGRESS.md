# PROGRESS — Benim İlk Oyunum

Each scheduled run reads this file first. The active game is **Ay Kılıççısı: Kara Zırh** (`ay-kiliccisi/`, built into `index.html`).
The old taming game "Yaban Yoldaşları" lives at `yaban.html`.
Detailed design notes, the roadmap and the test commands are in `ay-kiliccisi/PROGRESS.md`.

Build: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Tests: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<scenario>.js`

## Feature status (routine list, in priority order)

| # | Feature | Status | What's still open |
|---|---|---|---|
| 1 | High-quality male protagonist | **Mostly done.** Kael is an in-game sculpted model (~21k triangles, 58 bones, gloss/metal/glow material channels, horned helm, fur mantle, cape, greatsword). | The user asked for an armor redesign but gave no design brief, so it waits on that. |
| 2 | Realistic 3D character animations | **In progress.** Procedural poses with crossfades, arm IK (two-handed grip, reverse grip), cape bones. **Foot IK on terrain added (run 1).** | No keyframe clip system. No foot locking during the walk cycle (stride sliding). Animals have no foot IK. No hit-reaction directionality. |
| 3 | Integration of submitted GLB models | **In progress.** Done: dragon (own clips), elf body (Şeytan Kraliçe), hair GLB, skeleton proportions from berserk_armor, kawaiope and aldrich. | gwyndolin (Snake Priestess boss) not used yet. The NC/ND-licensed files can't be used. |
| 4 | Multiple animals and creatures | **In progress.** Wolves, goblins (melee, archer, chief), crocodile, dragon, Veyra. The old game has 14 species. | Dungeon creatures (skeleton, spider, golem, wraith), deer and birds in the open world, the White Wolf. |
| 5 | Creature taming and AI | **In progress.** Vision cones, group alerts, hearing, utility-AI companion (Veyra). Taming exists in the old game (`yaban.html`). | Taming isn't in Ay Kılıççısı yet; no "pet upgrade tree". |
| 6 | Open world, combat, inventory, progression | **Combat, inventory and progression done.** 4 stances, parry, perfect dodge, assassination, posture/execution, loot rarities, smith, skills, quests, saves. 2.8 km map. | World expansion (snow region, harbour, town), dungeons and towers, Adventurers' Guild. |
| 7 | Android performance and mobile controls | **In progress.** PlayStation-style touch layout, landscape and portrait, outlines culled beyond 30 m, perf test. | Not tested on a real device. No graphics-quality menu, no HUD editor, no LOD. |

No feature is marked complete in the routine's sense yet.

## Run log

### Run 1 — 2026-11-17
- Created this file. The game's own detailed log stays in `ay-kiliccisi/PROGRESS.md`.
- **Feature 2 (animations): terrain foot IK for the hero** (`ay-kiliccisi/src/32-footik.js`).
  - Each ankle follows the ground height under it. The pelvis drops to the lower foot, and a two-bone leg IK bends the knee forward.
  - Planted soles tilt to the slope normal, clamped to 0.4 rad. A foot in its swing phase isn't tilted.
  - The IK fades out smoothly in the air, lying down, rolling, during takedowns, when pinned and when swimming.
  - `armIK` was generalised into a reusable `limbIK` (no change in arm behaviour).
  - Measured on a 0.45-gradient slope: with IK off, the feet are −6.8 cm (sunk) and +6.9 cm (floating), and soles are 0.42–0.50 rad off the slope. With IK on: +0.1 cm on both feet, 0.02–0.10 rad.
  - New test `ay-kiliccisi/test/s-footik.js`: 9/9 pass.
- Why feature 1 was skipped: the hero model already exists in the game, and the requested armor redesign has no brief, so it isn't a good fit for an unattended run.

## Next priorities
1. Animations: stride foot locking (no sliding while walking), the same terrain IK for wolves and humanoid NPCs, and a keyframe clip layer for the hero's signature moves.
2. Protagonist: armor redesign, once the user describes the look they want.
3. GLB: build the Snake Priestess boss on the gwyndolin skeleton.
4. Creatures: the first dungeon creatures (skeleton, spider).
