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
| 2 | Realistic 3D character animations | **In progress.** Procedural poses with crossfades, arm IK (two-handed grip, reverse grip), cape bones. Foot IK on terrain (run 1). Speed-matched gait, heel-off and stride foot locking (run 2). Terrain foot IK for every humanoid rig: villagers, guards, merchants, goblins, big goblins, skeletons, Veyra (run 3). **Wolves fit the terrain: body pitch, body sink, paws placed on the ground under each paw (run 4).** Crocodiles fit the terrain: body pitch + roll, neck and tail bend along the ground, each foot reaches the ground (run 5). Wolf paw gait + stride locking: duty-factor gait, paws pinned in world space through turns and sideways circling (run 6). **Dragon fits the terrain: body pitch/roll/sink, two-bone IK on all four limbs of the GLB skeleton (run 7).** Combat-ready idle with breathing and weight shift, swing-side hip drop, banking into turns (merged from `-qfnm9q`, run 8). **Directional hit reactions for the hero, goblins and skeletons (run 8).** | No keyframe clip system of our own (the dragon uses its GLB clips). Foot locking covers only the hero's walk and run, not turning in place or crouch-walking. NPCs have terrain IK but no stride locking. The crocodile and the dragon have no stride locking (dragon paws still slide a little in its walk clip on slopes). Hit reactions are directional for the hero, goblins and skeletons (run 8) but not yet for wolves, NPCs, Veyra or bosses. |
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

### Run 4 — 2026-11-17
- Started from `ccr-70a30f22-d98vgz` (run 3), fast-forwarded into `ccr-70a30f22-ijomsl`. The parallel armor-redesign branches (`-kpnltt`, `-xztvch`, `-lsmbh1`, `-2ak8ow`, `-wx041a`) are still a separate line and were not merged.
- **Feature 2 (animations): wolves stand properly on slopes** (`wolfGround` + `WFIK` in `ay-kiliccisi/src/40-wolves.js`).
  - Before: the wolf body stayed level whatever the ground did, and each leg aimed at the ground under its hip. On a 0.42 slope the downhill paws hung up to 13 cm in the air (uphill facing) or 7 cm (downhill facing).
  - Now the body pitches to match the ground under the front and back paws (clamped to 0.55 rad, nose up uphill, nose down downhill). If a leg would still have to stretch past 96 % of its length, the body sinks (at most 22 cm). Each paw aims at the ground under the paw's own stride position, and leg angles take the body pitch into account. Everything is smoothed per wolf. It's off in the air, when dead, pinning the player or ridden. `WFIK.on=0` restores the old behaviour.
  - Measured on a 0.42 slope as the worst paw error compared with flat ground: facing uphill 13.0 cm → 0.5 cm, facing downhill 6.8 → 0.6 cm, side slope 0.3 → 0.5 cm (already fine before). No paw sinks while trotting across the slope (worst −0.5 cm). Flat ground is unchanged.
  - New test `ay-kiliccisi/test/s-wolfik.js`: 11/11 pass. Regressions: `s-mech` 47/47, `s-loop` 71/71, `s-rigfik` 14/14, `s-undead` 16/16, `s-perf` OK (village draw prep 2.24 ms per frame).
  - Not checked by eye: in the test screenshot, tall grass hides the paws.

### Run 5 — 2026-11-17
- Started from `ccr-70a30f22-ijomsl` (run 4), fast-forwarded into `ccr-70a30f22-kbldj4`. No uncommitted changes; the armor-redesign branches are still a separate, unmerged line.
- **Feature 2 (animations): crocodiles fit the terrain** (`crocFit` + `CFIK` in `ay-kiliccisi/src/48-croc.js`).
  - Before: the 3.5 m croc body was a rigid level plank at the height of the ground under its centre. On a 0.33 slope facing uphill the head sank 7.5 cm into the bank while the tail hung 37–56 cm in the air; facing downhill the tail tip was 44 cm underground. Feet were off by up to 37 cm.
  - Now the root pitches and rolls with the ground under the shoulders/hips and both sides (≤0.5 / 0.4 rad). The neck and the three tail segments are then bent one at a time (≤0.45 rad each) so the next joint keeps its rest height above the ground. Each leg rotates its upper bone up/down (splay, ≤0.7 rad) with the lower bone counter-rotated, three Newton steps, until the foot is back at its flat-ground height above the ground under the foot. Everything is smoothed per croc.
  - Off when the croc floats in water, when dead (death roll), or beyond 60 m. `CFIK.on=0` restores the old rigid body.
  - Measured on a 0.33 slope, worst foot error vs flat ground: uphill 24.8 → 1.3 cm, downhill 31.5 → 1.1 cm, side slope 32.5 → 0.4 cm, diagonal 37.5 → 1.3 cm. Head/tail joints now stay 26–33 cm above the ground (rest is ~28–33 cm) in all four directions. No foot sinks while crawling (worst −0.3 cm). Cost ≈ 0.03 ms per frame for a nearby croc.
  - New test `ay-kiliccisi/test/s-crocik.js`: 14/14 pass. Regressions: `s-mech` 47/47 (crocodile tests included), `s-loop` 71/71, `s-rigfik` 14/14, `s-wolfik` 11/11, `s-perf` OK (swamp draw prep 0.87 ms per frame).
  - Not checked by eye: tall grass hides the feet in the test screenshots; the body roll on the side slope is visible.

### Run 6 — 2026-11-17
- Started from `ccr-70a30f22-kbldj4` (run 5), fast-forwarded into `ccr-70a30f22-0ea3zi`. No uncommitted changes, no open issues checked beyond git (no `gh`). `main` is fully contained in this line. A separate non-routine branch `claude/player-character-animal-system-vahlxx` (V20 combat engine, stages 1–2) is ahead of `main` and was **not** merged.
- **Feature 2 (animations): wolf paw gait + stride locking** (`WGAIT`, `wolfPaw`, `wolfRate` in `ay-kiliccisi/src/40-wolves.js`).
  - Before: each paw swung on a sine (±0.14 walk / ±0.26 run) at a phase rate unrelated to the stride, so planted paws slid forward at 0.4–1× body speed. Circling wolves strafe sideways while the legs only swung front-to-back, so paws skated sideways at full speed.
  - Gait: phase advances with distance (walk 8.5 rad/m, run 3.6 rad/m, ×1.2 when side-stepping). Each paw is on the ground for a duty fraction (walk 0.6, run 0.25) and sweeps back linearly by exactly the distance the body covers (A = d·π / (r·scale)); swing is a smoothstep return with a sine lift. The stride follows the actual direction of travel (smoothed), so a circling wolf steps sideways; the lateral part is reached by rolling the leg at the hip (≤0.55 rad). Running wolves carry the body 4 cm lower and bob less, so the stride fits the leg length.
  - Lock: on touchdown the paw's world spot is pinned and held by the leg solve until the paw lifts. If the leg would over-stretch (turns) the paw is released with a short decaying offset and a small lift (a quick re-step instead of a pop). Teleports/respawns drop the lock outright.
  - Measured on flat ground, metres of planted-paw slide per metre travelled (per paw): walk 2 m/s 0.336 → 0.053, gallop 6.6 m/s 0.18 → 0.03, walking while turning 1.2 rad/s 0.369 → 0.056, side-stepping (circle) 0.573 → 0.049. Leg reach stays within its length. `WFIK.lock=0` restores the old sine gait.
  - New test `ay-kiliccisi/test/s-wolfstride.js`: 10/10 pass. Regressions: `s-wolfik` 11/11, `s-mech` 47/47, `s-loop` 71/71, `s-rigfik` 14/14, `s-perf` OK (village draw prep 2.15 ms per frame).
  - Checked one screenshot of a mid-stride wolf; the gait wasn't watched in motion by eye.

### Run 7 — 2026-11-17
- Started from `ccr-70a30f22-0ea3zi` (run 6), fast-forwarded into `ccr-70a30f22-ul9yx5`. No uncommitted changes. Note: the later runs `-djto1n` (armor pass) and `-sinuc0` (hero foot IK, a duplicate of run 1) branched from `main` again and were **not** merged — the same restart problem as before.
- **Feature 2 (animations): the dragon stands properly on slopes** (`dFit`, `dLimbIK`, `DFIK` in `ay-kiliccisi/src/49-dragon.js`).
  - Before: the dragon (submitted Tarisland GLB, 150+ bones, its own clips) was drawn as a rigid level body at the ground height under its centre. On a 0.23 slope the limbs were off by 0.40–1.12 m (paws floating in the air or buried in the hillside).
  - Now, after the clip is sampled: the ground under the two hind feet and the two front hands gives a body pitch and roll (≤0.4 / 0.3 rad); the body sinks (≤0.7 m) if a limb would still have to reach down; then each limb gets an analytic two-bone IK applied straight to the bone world matrices (thigh → calf+horselink → foot, upper arm → forearm → hand), so each limb end keeps its animated height above the ground under it. Feet and hands keep their animated orientation. Skin matrices are now built after the fit (`dSkinMats`), so hit points, the mouth (fire breath) and the mesh all use the fitted pose.
  - The fit fades out as the pelvis rises (take-off, hover, breath, landing) and per limb when a limb is lifted high (claw swipe), and is off when dead or beyond 90 m. Smoothing is frame-rate independent. `DFIK.on=0` restores the old rigid body.
  - Measured on a 0.23 slope, worst limb-end error vs flat ground: facing uphill 0.44 → 0.008 m, downhill 1.12 → 0.008 m, side slope 0.78 → 0.008 m, diagonal 0.41 → 0.008 m. Limb reach ≤ 90 %. No limb sinks in the walk clip on the slope. Flat ground unchanged (±1 cm). Cost ≈ 0.02 ms per frame extra.
  - New test `ay-kiliccisi/test/s-dragonik.js`: 12/12 pass. Regressions: `s-mech` 47/47 (dragon pattern test included), `s-loop` 71/71, `s-wolfik` 11/11, `s-crocik` 14/14, `s-perf` OK (dragon area draw prep 1.88 ms per frame).
  - Checked by eye: one screenshot pair (fit on/off) — with the fit on, the downhill front claw reaches the ground; trees partly hide the body.

### Run 8 — 2026-11-23
- **Housekeeping: the two routine lines are merged again.** Runs on 11-22/23 (`-p9gtgx` armor pass, `-qfnm9q` "Run 1" hero idle/gait) had restarted from `main` and written a fresh root `PROGRESS.md`. This branch (`ccr-70a30f22-em2gpp`) fast-forwarded `-ul9yx5` (runs 1–7) and merged `-qfnm9q`.
  - Conflicts in `30-player-model.js` and `55-player.js` were resolved by hand. The stride-locked linear gait and heel-off are kept. From `-qfnm9q`, these were added: `idlePose` (staggered combat stance, breathing, weight shift, glances), swing-side hip drop (`pelZ`), level gaze and banking into turns. Heel-strike roll (`LfX/RfX`) now applies only to the old sine gait (`GAIT.lin=0`), because the linear gait has its own heel-off and foot lock. The foot bone also cancels the stance spread and the hip tilt now.
  - The `s-anim` walk check now also counts heel-off as foot roll: 7/7.
  - The armor branches (`-p9gtgx`, `-djto1n`, `-kpnltt`, …) are **still not merged**, because they rebuild `data/models.js` from the sculpt cache.
- **Feature 2 (animations): directional hit reactions.**
  - Before: every hit that landed played the same recoil (arch back, arms forward), even a hit from behind. Goblins and skeletons also always leaned back.
  - Hero (`hitReact`, `hurtPose`, `flinchAdd`, `HREACT` in `55-player.js`): `hitPlayer` stores the push direction in the hero's own frame, plus a strength set by the damage. The `hurt` state snaps toward the push in about 70 ms and settles by 0.38 s:
    - From the front: the torso arches and the head whips back.
    - From behind: the torso folds and the head drops forward.
    - From the side: the torso bends sideways, twists away, and the hips tilt.
    - In every direction, one leg takes a stagger step toward the push, the knees give a little, and the arms trail opposite the push.
    - States that don't flinch (berserk, attacking, drinking) get a smaller additive flinch on top of their pose.
    - `HREACT.on=0` restores the old recoil.
  - Goblins and skeletons (`gobHurtPose`, `GREACT` in `46-goblins.js`): `gobHurt` stores the push direction in the goblin's own frame. `hurt` now bends toward it, with spine/head pitch and roll, a twist and a stagger step. The parried `stagger` pose is unchanged.
  - Measured as how far the head moves relative to the hips along the push direction, at its peak:
    - Hero: front 18 cm, behind 19 cm (the old pose moved it −12 cm, against the push), left/right 9 cm.
    - Goblin: 23 / 10 / 10 / 10 cm.
    - Skeleton: 37 / 15 / 16 / 16 cm.
    - Berserk flinch: 2.3 cm.
    - Feet stay on the ground: 6.6–15 cm ankle height. No NaN.
  - New test `ay-kiliccisi/test/s-hitreact.js`: 11/11 pass. Regressions: `s-mech` 47/47, `s-loop` 71/71, `s-anim` 7/7, `s-stride` 9/9, `s-footik` 9/9, `s-rigfik` 14/14, `s-undead` 16/16, `s-stance` 11/11, `s-perf` OK.
  - Checked by eye: one screenshot of a hit from the left, mid-recoil. The torso bends away from the hit. It wasn't watched in motion.

## Next priorities
1. Housekeeping first: merge this branch (`ccr-70a30f22-em2gpp`) into `main`, or tell the routine which branch to start from. Runs keep restarting from `main` and duplicating work. Until then, each run should start by merging the newest `ccr-*` branch.
2. Animations: directional hit reactions for wolves, villagers/guards, Veyra and bosses; stride locking for walking NPCs, the crocodile and the dragon; crouch-walk and turn-in-place gait for the hero; anticipation/follow-through in attacks; then a keyframe clip layer for signature moves.
3. Protagonist: merge one of the parallel armor-redesign branches (latest: `-djto1n`) or settle on a design brief with the user.
4. GLB: build the Snake Priestess boss on the gwyndolin skeleton.
5. Creatures: the first dungeon creatures (spider, golem).
