# PROGRESS — Benim İlk Oyunum

Each scheduled run reads this file first. The active game is **Ay Kılıççısı: Kara Zırh** (`ay-kiliccisi/`, built into `index.html`).
The old taming game "Yaban Yoldaşları" lives at `yaban.html`.
Detailed design notes, the roadmap and the test commands are in `ay-kiliccisi/PROGRESS.md`.

Build: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Tests: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<scenario>.js`

## Feature status (routine list, in priority order)

| # | Feature | Status | What's still open |
|---|---|---|---|
| 1 | High-quality male protagonist | **In progress (most of it done).** Kael is an in-game sculpted model (~21k triangles, 58 bones, gloss/metal/glow material channels, horned helm, fur mantle, cape, greatsword). **Run 13 merged the armor line** (`-8xlo0y`→`-5bi10a`): each armor type adds its own sculpted layer (Wolf-pelt, Bone, Ash), and smith upgrades show on the armor (+3 silver inlay, +5 gold crescents and moonstones). **Run 13 also added weapon upgrade looks**: +3 silver runes and grip wire, +5 moonlight rails, gold crescent and moonstone pommel, on every blade size. **Run 14 added his bare head**: a sculpted face (`herohead`, 5k vertices, 10k triangles: square jaw, broken nose, amber eyes with real iris/pupil geometry, trimmed beard, swept-back hair, a scar through the left brow). The helm can come off: settings «Miğferi çıkar», and the two prologue panels before the armour takes him. | No facial animation (blinking, jaw, expressions) and no hair physics; the head is rigid on the Head bone. About 15 other armor-redesign branches (base-plate reshapes cut from `main`) remain unmerged; they all edit `hero.mjs` in different directions, so the user should pick one, or none. |
| 2 | Realistic 3D character animations | **In progress.** Procedural poses with crossfades, arm IK (two-handed grip, reverse grip), cape bones. Foot IK on terrain (run 1). Speed-matched gait, heel-off and stride foot locking (run 2). Terrain foot IK for every humanoid rig: villagers, guards, merchants, goblins, big goblins, skeletons, Veyra (run 3). **Wolves fit the terrain: body pitch, body sink, paws placed on the ground under each paw (run 4).** Crocodiles fit the terrain: body pitch + roll, neck and tail bend along the ground, each foot reaches the ground (run 5). Wolf paw gait + stride locking: duty-factor gait, paws pinned in world space through turns and sideways circling (run 6). **Dragon fits the terrain: body pitch/roll/sink, two-bone IK on all four limbs of the GLB skeleton (run 7).** Combat-ready idle with breathing and weight shift, swing-side hip drop, banking into turns (merged from `-qfnm9q`, run 8). **Directional hit reactions for the hero, goblins and skeletons (run 8), wolves (run 9), crocodiles (run 10), Veyra (run 11) and the dragon (run 12).** Cape cloth physics (merged from `-h6st0j`, run 9). | No keyframe clip system of our own (the dragon uses its GLB clips). Foot locking covers only the hero's walk and run, not turning in place or crouch-walking. NPCs have terrain IK but no stride locking. The crocodile and the dragon have no stride locking (dragon paws still slide a little in its walk clip on slopes). Hit reactions are directional for the hero, goblins, skeletons, wolves (Kül Yele included, it is a wolf), crocodiles, Veyra and the dragon. Big goblins and Kırık Diş still show nothing on light hits (they only react to heavy hits). Villagers/guards are never hit, so they need no reaction. |
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

### Run 9 — 2026-11-23
- **Housekeeping: the routine lines were merged again.** This branch (`ccr-70a30f22-v9jlpy`) started at `main`, then merged `-em2gpp` (runs 1–8, the richest line) and `-h6st0j` (a parallel 11-23 run: cape cloth physics in `src/32-cape.js` plus a 2-second autosave, because `pagehide` didn't fire reliably).
  - Conflicts: `60-game.js` (both calls kept, in this order: `footIK(PM,dt);updateCape(PM,dt);` — the cape collides with the IK-adjusted legs), both `__G` exports, and `ay-kiliccisi/PROGRESS.md` (both logs kept). The build was regenerated.
  - **Not merged, and deliberately so:** about 12 other runs on 11-22/23 each started from `main`. Most were mutually conflicting hero-armor redesigns (`-p9gtgx`, `-najr1d`, `-bw6jym`, `-hvbavz`, `-erk96l`, `-mw3078`, `-0ip2y6`, `-8xlo0y`→`-5bi10a`), each rebuilding `data/models.js`. One (`-bmdgqx`, `-grgyjk`) redid hero foot IK, which already exists here. Choosing between the armor designs is the user's call.
- **Feature 2 (animations): directional hit reactions for wolves** (`WREACT`, `wolfReact`, `wolfReactEnv` in `ay-kiliccisi/src/40-wolves.js`).
  - Before: every hit put the wolf in the same `hurt` crouch whichever way the blow came from. A wolf hit mid-attack showed no reaction at all.
  - Now `wolfHurt` stores the push direction in the wolf's own frame, plus a strength set by the damage (a wolf that shrugs the hit off mid-windup or mid-pounce gets 35 %). The draw adds a spring-like envelope: a 70 ms snap, then a damped cosine, so there is a small follow-through rebound, and it is settled by 0.75 s.
    - From the front: the body rears nose-up and the head is thrown back.
    - From behind: the rump is shoved, and the body and head dip forward.
    - From the side: the body rolls and slides away, and the head and tail swing with the push.
    - In every direction the legs buckle 7 cm. Leg angles compensate the extra pitch, so the paws stay planted.
    - `WREACT.on=0` restores the old behaviour.
  - Measured on flat ground as the peak nose movement along the push (knockback slide excluded): front 25.6 cm, behind 11.0 cm, left/right 29.3 cm. The old reaction moved it 0 cm sideways. Rebound 2–4 cm against the push. A hit during windup gives 9.7 cm and the attack continues. Paws stay within 2.5 cm of the ground (the same as standing). No NaN.
  - New test `ay-kiliccisi/test/s-wolfreact.js`: 11/11 pass. Regressions: `s-wolfik` 11/11, `s-wolfstride` 10/10, `s-mech` 47/47, `s-loop` 71/71, `s-hitreact` 11/11, `s-cape` 9/9, `s-anim` 7/7, `s-footik` 9/9, `s-stride` 9/9, `s-perf` OK (village draw prep 1.79 ms per frame).
  - Checked by eye: one screenshot mid side-recoil (`test/out/wolfreact-side.jpg`). The hit flash turns the wolf white, so the roll is hard to judge from a still. It wasn't watched in motion.

### Run 10 — 2026-11-23
- **Housekeeping:** this branch (`ccr-70a30f22-jmfw5r`) started at `main` again, so it was fast-forwarded to `ccr-70a30f22-v9jlpy` (runs 1–9, which contains `main`) before any work. The later run `-jytv5c` (14:41, another hero-armor pass from `main`) was **not** merged, for the same reason as the other armor branches. No uncommitted changes. Open GitHub issues were not checked.
- **Feature 2 (animations): directional hit reactions for crocodiles** (`CREACT`, `crocReact`, `crocReactEnv`, `crocReactPose` in `ay-kiliccisi/src/48-croc.js`).
  - Before: a hit put the croc into a silent 0.35 s `hurt` pause with no visible reaction except the white flash.
  - Now `c.hurt` stores the push direction in the croc's own frame plus a strength set by the damage. The draw adds the same spring envelope as the wolves (70 ms snap, damped rebound, settled by 0.75 s). It is applied after the terrain fit (`crocFit`), so the fit doesn't cancel it.
    - From the front: the head is thrown up and back, the body tips slightly nose-up, and the jaw gapes (a hiss).
    - From behind: the tail whips up, the body is shoved forward, and the head dips.
    - From the side: the body slides and rolls away while the head and tail lag behind, so the spine bows into a C and the head stays turned toward the attacker.
    - A croc hit while its jaws are open or snapping gets about a third of the reaction, and the bite continues.
    - The front legs hang off the neck bone, so the neck only yaws. The head lift is on the head bone; an earlier try that lifted the neck also lifted the front feet by 12 cm.
    - `CREACT.on=0` restores the old behaviour.
  - Measured on flat ground at the peak (3.5 m croc): body shift 13.7 cm along the push in every direction. Front: snout tip up 24 cm, back 18 cm, jaw +0.35 rad. Behind: tail tip up 31 cm. Side: snout lags the body by 32–33 cm, tail tip by 12–32 cm. Feet stay within 3–6.5 cm of their pre-hit height above the ground. Rebound 1.9 cm. Settled pose matches the no-reaction draw. Mid-bite: 4.8 cm shift.
  - New test `ay-kiliccisi/test/s-crocreact.js`: 13/13 pass. Regressions: `s-mech` 47/47 (crocodile tests included), `s-crocik` 14/14, `s-wolfreact` 11/11, `s-hitreact` 11/11, `s-perf` OK (swamp draw prep 0.76 ms per frame). `s-loop` failed one test once ("Gölge Adımı" dash distance 0, the flaky test noted in run 2), then passed 71/71 twice in a row. The build without this change also passed 71/71.
  - Checked by eye: one screenshot of a front-quarter hit held at its peak (`ay-kiliccisi/test/out/crocreact-front.jpg`). The head is raised and the jaw is open. It wasn't watched in motion.

### Run 11 — 2026-11-23
- **Housekeeping:** this branch (`ccr-70a30f22-s41d8k`) started at `main` again, so it was fast-forwarded to `ccr-70a30f22-jmfw5r` (runs 1–10) before any work. No uncommitted changes, no open issues. Two open PRs (#4, #5) are older snapshots of this same line (runs 4 and 7); everything in them is contained here.
  - **Not merged:** `-gkncak` (16:32, from `main`) wrote its own root `PROGRESS.md` and a keyframed hero gait (`src/32-gait.js`) that replaces the stride-locked gait this line already has; merging it means choosing one gait system. `-jytv5c` and the other armor passes are still waiting on the user, as before.
- **Feature 2 (animations): directional hit reactions for Veyra** (`VREACT`, `vHurt`, `vReactEnv`, `vReactPose`, `veyraPose` in `ay-kiliccisi/src/57-veyra.js`).
  - Before: when an enemy swing landed on Veyra, her HP dropped and she flashed white, with no reaction in the pose and no push.
  - Now `vHurt` stores the push direction in her own frame plus a strength by attacker (goblin/skeleton 0.5, wolf 0.67, boss/big goblin 1). The draw adds the same spring envelope as the wolves and crocodiles (70 ms snap, damped rebound, settled by 0.75 s):
    - From the front: the torso and head are thrown back.
    - From behind: she folds forward and the head drops.
    - From the side: the spine bends and twists away, and the hips tilt.
    - In every direction, one leg takes a stagger step toward the push, the knees give, the arms flare, and she slides along the push (about 20 cm; 31 cm for a heavy hit). The slide goes through `collide`, so she isn't pushed into walls.
    - Her hair, skirt and tail swing against the push (lag).
    - A heavy hit cancels a heal or fire bolt that hasn't fired yet. A light hit during an action gives about 40 % of the reaction, and the action continues.
    - Her pose code is split into `veyraPose()` so it can be measured without drawing. `VREACT.on=0` restores the old behaviour.
  - Measured as the peak head movement relative to the hips along the push: front 14.7 cm, behind 16.4 cm, left/right 9.4 cm (before: 0). Heavy hit from the front: 21.3 cm. Hair tip lags 4–14 cm. Rebound 1.3–2.3 cm against the push. Back within 3 mm of the rest pose after 0.75 s. Light hit mid-slash: 3.8 cm. No NaN.
  - New test `ay-kiliccisi/test/s-vreact.js`: 14/14 pass, including a real goblin swing going through `updateVeyra`. Regressions: `s-mech` 47/47, `s-loop` 71/71, `s-hitreact` 11/11, `s-rigfik` 14/14, `s-perf` OK (village draw prep 1.78 ms per frame).
  - Checked by eye: one screenshot of a left-side hit held at its peak (`ay-kiliccisi/test/out/vreact-left.jpg`). The arms flare and the torso leans away; the hero partly blocks the view. It wasn't watched in motion.

### Run 12 — 2026-11-23
- **Housekeeping:** this branch (`ccr-70a30f22-xvcnfq`) started at `main` again, so it was fast-forwarded to `ccr-70a30f22-s41d8k` (runs 1–11) before any work. No uncommitted changes. Not merged: `-fvp9yt` (18:32, another hero-armor pass from `main`), for the same reason as the other armor branches.
- Checked the boss list first: Kül Yele is a wolf (`wolfHurt` → `wolfReact`), so it already had the run-9 reaction. Kırık Diş is a big goblin. **The dragon had no hit reaction at all**: a hit only flashed it white. So this run did the dragon.
- **Feature 2 (animations): directional hit reaction for the dragon** (`DREACT`, `dHurtReact`, `dReactEnv`, `dReactSets`, `dReact` in `ay-kiliccisi/src/49-dragon.js`).
  - `d.hurt` stores the push direction in the dragon's own frame plus a strength (0.45–1 by damage). The envelope is a slower spring than the wolves' for the bigger body: 0.1 s snap, damped rebound, settled by 1.1 s.
  - `dReact` runs on the sampled GLB pose **before** the terrain fit (`dSample → dReact → dFit → dSkinMats`), so the slope fit still applies on top:
    - The whole skeleton tilts "up toward the push" about a pivot low under the pelvis, and slides 16 cm along the push.
    - The neck chain (from Neck1, so the clavicles and arms are not included) whips toward the push, aimed by the neck→head vector. The tail chain (from `Bone001`) swings with it.
    - Every limb end that is on or near the ground is pulled back to where the clip put it with the existing two-bone `dLimbIK`, so the feet stay planted while the body recoils. Lifted limbs follow the body.
  - Front hit: the dragon rears and the head is thrown up and back. From behind: shoved forward, the head dips. From the side: it leans and slides away, and the head and tail swing with the push.
  - During claw wind-up, breath, take-off, stomp and the wake-up roar it gets 35 % (super armour). `DREACT.on=0` turns it off.
  - Measured on flat ground at the peak, as world movement along the push: head 64 cm (front, plus 63 cm up), 45 cm (behind), 80 cm (sides). Chest 29–30 cm. Tail tip on side hits: about 1.5 m with the final 0.22 rad setting (2.4 m with the first 0.35 setting, which looked like too much). Planted feet slide at most 1.5 cm and rise at most 2.9 cm. Rebound 6–10 cm against the push. Back to the exact pre-hit pose after 1.2 s. Claw wind-up: 22 cm vs 64 cm. A light hit (8 dmg): 35 cm. Cost about 0.03 ms per frame while reacting, and 0 otherwise.
  - New test `ay-kiliccisi/test/s-dreact.js`: 15/15 pass (includes the live `updateDragon` path). Regressions: `s-dragonik` 12/12, `s-mech` 47/47, `s-loop` 71/71, `s-hitreact` 11/11, `s-perf` OK (dragon area draw prep 2.54 ms per frame, and 2.67 ms without this change; it's noise).
  - Checked by eye: one screenshot (`ay-kiliccisi/test/out/dreact-side.jpg`). The camera ended up behind the dragon, and the white hit flash washes it out, so it only shows the model renders intact mid-reaction. The reaction wasn't watched in motion.

### Run 13 — 2026-11-24
- **Branch housekeeping.** This run's branch was cut from `main` again. I merged the newest chained line (`-ul9yx5` → `-xvcnfq`, runs 7–12) and found 86 `ccr-*` branches. About 20 of them are separate hourly armor passes, each cut from `main`, so none of them ever saw the others.
- **Feature 1: merged the armor line** (`-8xlo0y` → `-5bi10a`, its own "Tur 1–2" log): armor-type overlays (`armwolf`, `armbone`, `armash`) and smith upgrade trim (`armup3`, `armup5`). I picked it over the other armor passes because it adds gameplay-visible features (equipment changes the silhouette, upgrades show) and doesn't reshape the shared base plate.
  - Conflicts: `data/models.js` was merged per model (it is one line per model), and the `__G` test hook in `60-game.js` was combined. The game log, the build and `index.html` were regenerated.
  - After the merge: `s-armor` 10/10, `s-armup` 12/12, `s-mech` 47/47, `s-hitreact` 11/11, `s-cape` 9/9, `s-footik` 9/9, `s-stride` 9/9, `s-anim` 7/7, `s-rigfik` 14/14, `s-undead` 16/16, `s-ui` 8/8, `s-save` 1/1. `s-loop` passed 71/71 in 3 of 4 runs; the failing run was a cascade from a story `TypeError` (`parameter 1 is not of type 'Element'`) and did not repeat.
- **Feature 1: weapon smith upgrades now show on the greatsword** (before this, only the armor showed them).
  - `+3 «Usta İşi»` (`tools/sculpt/models/swup3.mjs`, 5k triangles): a row of silver runes inlaid down both faces of the fuller (8 glyph shapes, `_swordup.mjs`), a double silver-wire wrap over the leather grip, and silver collars at both ends of the grip.
  - `+5 «Ay İşçiliği»` (`swup5.mjs`, 4k triangles, drawn together with +3): two glowing moonlight rails frame the runes, a gilded crescent cradles the guard's red gem on both faces, the pommel gets a gold-bezelled moonstone on each side, and a gold finial is added.
  - Both models are sculpted in the sword's canonical frame and stretched with the blade like the base mesh, so they fit every weapon (1.3 m cleaver to 1.62 m Gölge Kesen). They are one extra skin, lit with the armor trim's moonlight (`MOON_EM`), rebuilt on upgrade and equip, and removed cleanly.
  - Code: `buildSword` in `src/52-items.js` (`SW_UP`). The smith tab now lists what the weapon gets at +3 and +5. `__G.LOOKS.sword` was added for tests.
  - Two fixes during the build: `cone()` in `sdf.mjs` has round caps, so a "disc" made from it is really a ball (the first crescent stuck out 2.6 cm). I now use a flat disc. The finial and moonstone were clipped so no hidden surfaces sit inside the pommel.
  - New test `ay-kiliccisi/test/s-swup.js`: 15/15. It checks that ornaments appear at +3/+5 only, form one skin, carry the moon glow, move with the hand, and come off without leaks. It also checks that every ornament vertex lies within 1 cm of the skinned sword mesh, measured as point-to-triangle distance, on the Iron greatsword, Gölge Kesen and the cleaver (worst 0.57 cm at +3, 0.90 cm at +5). Screenshots: `test/out/swup-5-flat2.jpg` (runes, rails, crescent, pommel stone) and `swup-5-blade.jpg`.
  - Regressions on the final build: `s-armor` 10/10, `s-armup` 12/12, `s-mech` 47/47, `s-hitreact` 11/11, `s-cape` 9/9, `s-anim` 7/7, `s-ui` 8/8, `s-loop` 71/71, `s-save` 1/1 (it failed once at the end of a long batch, then passed 3/3; it is timing-based). `s-perf` village draw prep 1.45 ms per frame.
- Possible issue, not checked: `armup5.mjs` builds its crescents from `cone()` discs too, so they may be domed rather than flat. They look fine in `armup-5-chest.jpg`, but worth a closer look.

### Run 14 — 2026-11-24
- **Housekeeping:** this run's branch (`ccr-70a30f22-9e1sw0`) was cut from `main` again, so it was fast-forwarded to `ccr-70a30f22-q0trhh` (runs 1–13) before any work. No uncommitted changes. No open issues checked beyond git.
- **Feature 1 (protagonist): Kael's bare head and a removable helm.**
  - New sculpt `ay-kiliccisi/tools/sculpt/models/herohead.mjs` (10k triangles, 2.2 mm voxels), built on the hero skeleton so it sits where the helm was (eye bones at y 1.906):
    - Square jaw and jaw angles, heavy brow, cheekbones, a straight nose with a bump where it was broken, a firm mouth with a philtrum groove, ears with a hollow bowl.
    - Almond eye openings cut into a lid mass, with recessed eyeballs. The iris (amber) and pupil are real geometry (flat discs), because painted decals smeared after mesh reduction in the first try.
    - Eyebrows are geometry. The left one is split by a scar decal that runs from the brow to the cheekbone.
    - Trimmed beard and moustache (a displaced shell over the jaw line), short dark hair with cropped sides and a longer top swept back, and a neck that covers the leather under-layer and blends from the Head bone into the Neck bone.
    - Three look-dev passes were needed. Pass 1 had closed, skin-coloured eyes and noisy pores. Pass 2 had staring round eyes and blotchy painted irises. Pass 3 is the current version.
  - **Helm on/off without a second hero mesh** (`helmSplit`, `helmParts`, `setHelm` in `src/31-hero.js`). At load, every triangle skinned only to the Head bone is moved to the end of the index buffer. That covers the helm, crest, horns, bevor, neck guard, rivets and the glowing slit (1,745 triangles). Taking the helm off just draws fewer indices. Armour overlays get the same split (`overlaySkin` in `src/52-items.js`), so the Kül Zırh crown and the +5 helm crescent come off with the helm and everything else stays. The bare head has 0 indices and isn't skinned (`skin.off`) while the helm is on, so it costs nothing in normal play.
  - Where it shows:
    - Settings tab: «Miğferi çıkar (yüzü göster)» (`SYS.helmOff`, saved).
    - Story: a panel can set `hero.helm:0`. The prologue uses it for "Kael was one soldier among thousands on the walls" and for waking in the forest. The cursed-armour panel right after keeps the helm. After each panel the setting is restored.
  - New test `ay-kiliccisi/test/s-helm.js`: 13/13 pass. It covers: the model loads; by default the helm is on and the head isn't drawn or skinned; the split loses no triangles; hidden vertices are all above y 1.73; the settings button works; the face turns with the head bone; the head's box sits inside the helm's; the ash crown and +5 crescent hide and come back; the setting survives a reload; the story panel override works and restores.
  - Checked by eye: `test/out/helm-off.jpg` (front), `helm-off-side.jpg`, `helm-off-ash5.jpg`. It reads as a bearded, scarred man. Next to the bulky plate, the head looks a little small. From the side, the back edge of the beard ends in a hard line under the ear.
  - Regressions (still running at the first commit; the final numbers are in the follow-up commit): `s-armor` 10/10, `s-armup` 12/12.

## Next priorities
1. **Housekeeping (needs the user):** merge `ccr-70a30f22-9e1sw0` (this run, which contains runs 1–14 and the armor line) into `main`. Until `main` moves, each run is cut from `main` and must first merge the newest branch that contains this log. Parallel hourly runs that start from `main` keep re-doing armor passes.
2. Protagonist polish: blinking and a jaw/mouth bone for the bare head (story dialogue), a sideburn so the beard meets the hair, and possibly a 5–8 % larger head to match the bulky plate. Decide whether any of the unmerged base-plate reshapes (`-fqupu7`, `-bojytr`, `-rom5k9`, `-ld8k2u`, `-t1qekt`, …) should replace `hero.mjs`; merging one means re-running `tools/sculpt/build.mjs hero` and the overlays.
3. Animations: a light-hit flinch for big goblins and Kırık Diş; stride locking for NPCs, the crocodile and the dragon; crouch-walk and turn-in-place gait; anticipation and follow-through in attacks; then a keyframe clip layer (look at `-gkncak`/`-tnibz3` `32-gait.js` before writing a new one).
4. GLB: the Snake Priestess boss on the gwyndolin skeleton.
5. Creatures: the first dungeon creatures (spider, golem).
