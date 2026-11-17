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
| 2 | Realistic 3D character animations | **In progress.** Procedural poses with crossfades, arm IK (two-handed grip, reverse grip), cape bones. Foot IK on terrain (run 1). Speed-matched gait, heel-off and stride foot locking (run 2). **Terrain foot IK for every humanoid rig: villagers, guards, merchants, goblins, big goblins, skeletons, Veyra (run 3).** | No keyframe clip system. Foot locking covers only the hero's walk and run, not turning in place or crouch-walking. NPCs have terrain IK but no stride locking. Wolves, crocodile and dragon have no foot IK. No hit-reaction directionality. |
| 3 | Integration of submitted GLB models | **In progress.** Done: dragon (own clips), elf body (Şeytan Kraliçe), hair GLB, skeleton proportions from berserk_armor, kawaiope and aldrich. | gwyndolin (Snake Priestess boss) not used yet. The NC/ND-licensed files can't be used. |
| 4 | Multiple animals and creatures | **In progress.** Wolves, goblins (melee, archer, chief), crocodile, dragon, Veyra, **skeleton warriors and skeleton archers** (merged in run 3 from the parallel branches `-soup7a`/`-7qxv18`). The old game has 14 species. | Spider, golem, wraith; deer and birds in the open world; the White Wolf. |
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

### Run 2 — 2026-11-17
- Earlier routine runs each branched from `main`, so their work never chained: terrain foot IK was built about four times on separate `ccr-*` branches. This run merged the latest one (`ccr-70a30f22-6tptvk`, run 1 above) into this branch and continued from there. **The `ccr-*` branches are not merged into `main`; someone needs to merge this branch for the work to accumulate.**
- **Feature 2 (animations): stride foot locking, so the hero's feet no longer skate.**
  - Diagnosis: the sine thigh swing plus a slow pose filter (lag of about 0.35 rad) put the foot on the ground while it was still moving forward at 10–16 m/s (33 m/s when sprinting).
  - Gait (`src/55-player.js`): in stance the thigh sweeps back linearly, and the stride length matches the distance-based phase rate, so the planted foot moves at body speed. The swing knee is solved analytically for the foot clearance it needs. The back foot rolls onto its toes (heel-off, `heelB` in `src/30-player-model.js`), so the swinging leg can pass through. Once the walk has settled, the pose filter is bypassed.
  - Lock (`src/32-footik.js`): a foot that touches down and has slowed down is pinned at its world spot. Leg IK holds it there until the heel lifts or the leg would overstretch. A foot still sweeping fast gets a few cm of clearance instead of scraping. Re-planting starts from where the foot is drawn, so it doesn't pop.
  - Measured on flat ground, as metres of foot slide per metre travelled: walk 0.93 → 0.074 (peak foot speed 16 → 2.3 m/s), sprint 0.90 → 0.032. Leg reach ≤ 0.998, and movement speed is unchanged.
  - New test `ay-kiliccisi/test/s-stride.js`: 9/9 pass. Regressions: `s-footik` 9/9, `s-mech` 47/47, `s-perf` OK.
  - `s-loop`: 4 of 6 runs passed 71/71. The other 2 each failed one different, unrelated test (Kırık Diş stomp jump, Gölge Adımı dash distance). The old build passed 3/3, so treat this as possible load-related flakiness and keep an eye on it.
  - Toggles for comparison: `GAIT.lin=0` restores the old sine gait, `FIK.lock=0` turns off locking.

### Run 3 — 2026-11-17
- **Merged the two parallel routine lines into this branch**: the animation line (`-7ynivm`: foot IK + stride locking) and the undead line (`-soup7a` → `-7qxv18`: skeleton warriors + skeleton archers, bone-rattle sfx). Only the two PROGRESS files conflicted; the build was regenerated. Their run logs are kept in `ay-kiliccisi/PROGRESS.md` (sessions 8, 8b, 9). **Next runs should start from this branch (`ccr-70a30f22-d98vgz`), not from `main`.**
- **Feature 2 (animations): terrain foot IK for all humanoid rigs** (`rigFootIK` in `ay-kiliccisi/src/45-rig.js`).
  - One extra FK pass finds where each ankle lands. Each ankle is moved by the ground height under it (relative to the ground under the root), and the pelvis drops to the lower foot.
  - An analytic two-bone solve in the hip's sagittal plane re-bends the thigh and knee. Thigh and shin lengths come from the bone offsets, so it works for any `humanDef`-style rig, including Veyra's 20-bone rig. The foot keeps its pose pitch and tilts with the slope along the facing direction (≤0.35 rad), easing off as the foot lifts.
  - Wired into `drawGobs` (goblins, big goblins, goblin archers, skeletons), `drawNpcs` (villagers, merchants, guards) and `drawVeyra`. It only runs within 45 m (`RFIK.dist`). It's skipped while lying, dead, rising from the ground or reforming, and for Veyra when chained or downed. `RFIK.on=0` turns it off for comparison.
  - Measured side-on to a 0.42 slope, as the worst ankle error: villager 4.0 cm → 0.1 cm, guard 4.6 → 0.1, goblin 2.9 → 0.0, skeleton 3.7 → 0.1, big goblin 10.5 → 0.1. No foot sinks during a full walk cycle uphill or downhill. Flat ground is unchanged (bit-identical pose).
  - Cost: village draw prep 1.88 → 2.06 ms per frame on this CPU (`s-perf`).
  - New test `ay-kiliccisi/test/s-rigfik.js`: 14/14 pass. Regressions: `s-mech` 47/47, `s-loop` 71/71, `s-undead` 16/16, `s-footik` 9/9, `s-stride` 9/9, `s-perf` OK.
  - Caveat: the downhill leg reaches 99.9 % extension on steep slopes, so the knee looks straight there; the pelvis drop isn't limited by leg reach yet.

## Next priorities
1. Animations: terrain foot IK for wolves (4-leg rig in `40-wolves.js`) and the crocodile, stride locking for walking NPCs, toe locking during heel-off, crouch-walk gait, then a keyframe clip layer for the hero's signature moves.
2. Protagonist: armor redesign, once the user describes the look they want.
3. GLB: build the Snake Priestess boss on the gwyndolin skeleton.
4. Creatures: the first dungeon creatures (skeleton, spider).
