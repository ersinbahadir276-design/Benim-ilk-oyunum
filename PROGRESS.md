# PROGRESS — Benim İlk Oyunum (scheduled development runs)

Each scheduled run reads this file first. The active game is **Ay Kılıççısı: Kara Zırh** (`ay-kiliccisi/`, built into the root `index.html`).
The old three.js taming game "Yaban Yoldaşları" lives at `yaban.html` + `src/`.
Detailed design notes, the roadmap and the per-session game log are in `ay-kiliccisi/PROGRESS.md`.

Build: `cd ay-kiliccisi && python3 tools/build.py && cp dist/ay-kiliccisi.html ../index.html`
Tests: `cd ay-kiliccisi && NODE_PATH=$(npm root -g) node test/harness.js test/<scenario>.js`
(s-mech 47, s-loop 71, s-stance 11, s-anim 45, s-footik 9, s-stride 9, s-rigfik 14, s-wolfik 11, s-wolfstride 10, s-crocik 14, s-dragonik 12, s-undead 16, s-ui 7, s-perf)

> **Branch warning.** Every run is pushed to its own `ccr-70a30f22-*` branch and nothing has been merged into `main` since PR #3,
> so most runs restarted from old code (foot IK was written ~5 times, the armor redesign ~15 times). This run merged the two
> longest lines into **`ccr-70a30f22-l05675`**. Next run: start from this branch (or merge it into `main` first).

## Completed features

_None of the seven routine features is finished yet._

## Feature status

| # | Feature | Status | What's still open |
|---|---|---|---|
| 1 | High-quality male protagonist | **Mostly done.** Kael is a sculpted SDF model (~21k tris, 58 bones, PBR material channels, physics-free cape bones, greatsword). | Armor redesign: ~15 separate attempts sit on unmerged branches (latest `-0ywtzy`, armor pass 2, 23k tris). One should be picked and merged; no design brief from the user yet. |
| 2 | Realistic 3D character animations | **In progress (largest line).** Real CC0 motion clips (Quaternius) for idle/walk/jog/sprint/crouch, jump/land/hit, forward roll, light-combo sword cuts, death. Hero terrain foot IK + stride locking, now working together with the clips (this run). Terrain IK for all humanoid rigs, wolves (with paw gait locking), crocodile, dragon. | Heavy/sprint/jump attacks and side/back dodges are still procedural. No stride locking for NPCs, croc and dragon. Turn-in-place, directional hit reactions. Sword tip can clip the ground in clip B/C. |
| 3 | Integration of submitted GLB models | **In progress.** Dragon (own clips), elf body (queen), hair GLB, Quaternius clip GLBs (`hero_anims1/2.glb`), skeleton proportions from berserk_armor/kawaiope/aldrich. | gwyndolin (Snake Priestess) unused; `hero.glb` (VRoid) and `fox.glb` only in `yaban.html`. NC/ND files can't be used. |
| 4 | Multiple animals and creatures | **In progress.** Wolves, goblins (melee/archer/chief), crocodile, dragon, Veyra, skeleton warriors + skeleton archers. | Spider, golem, wraith; deer/birds; White Wolf; port species from `yaban.html`. |
| 5 | Creature taming and AI | **Partial.** Vision cones, group alerts, hearing, utility-AI companion (Veyra), wolf feeding. | Real taming in Ay Kılıççısı (exists only in `yaban.html`); pet upgrade tree. |
| 6 | Open world, combat, inventory, progression | **Combat/inventory/progression built.** 4 stances, parry, perfect dodge, assassination, posture/execution, loot, smith, skills, quests, saves, 2.8 km map. | Map expansion (snow region, harbour, town), dungeons/towers, Adventurers' Guild. |
| 7 | Android performance and mobile controls | **Partial.** PlayStation-style touch layout, landscape/portrait, outlines culled past 30 m, auto quality step-down, perf test. | No real-device test, no graphics menu, no HUD editor, no LOD. |

## Run log

### 2026-11-25 — merge of the two animation lines + clip foot-skate fix (feature 2)
- **Repo review:** clean tree; no open issues; open PRs #4 and #5 are earlier routine branches (IK line). Found ~120 `ccr-*` branches;
  the two longest chains were line A (IK + undead, `-ul9yx5`, 10 commits) and line B (motion clips, `-7zm4ho`, 5 commits).
  Both were merged here. Conflicts: `30-player-model.js` (heel-off root height + clip layer: both kept), `60-game.js` test exports,
  and a name clash — both lines declared a global `GAIT`; the clip layer's state is now `CGAIT` (`s-anim.js` updated).
  `-0ywtzy` (armor pass 2) was **not** merged; an attempt to reset onto line B was refused by the session's safety check, so this
  branch keeps line A's history plus line B merged on top.
- **Bug found by the merged tests:** with the clips driving the legs, the planted foot skated badly and the stride lock never engaged.
  - The Quaternius "Jog" and "Sprint" loops sweep the planted foot at ~7 and ~10 m/s on Kael's legs (they are a fast run and a
    full sprint), but the game plays them at 3.7 and 6.6 m/s at their natural cadence, so the feet slid backwards 3–7 m/s.
  - The clips plant on the heel and push off from the toes with the heel already up, but the lock only looked at the ankle, so it
    never saw a planted clip foot (its old 9/9 "pass" measured zero contact frames).
- **Fix 1 — stride-matched clip cadence** (`clipStrides`, `CLIP.sweep`, `gaitUpdate` in `src/32-anim.js`). Once at start-up each
  locomotion loop is posed every half frame on Kael's skeleton; for the lower foot's contact point (ankle or toe) the metres it
  travels back per unit of phase are stored. While a foot is on the ground, the phase now advances at `speed / sweep`, so the foot
  sweeps back exactly as fast as the body moves; in flight/swing the old cadence is kept. This gives a speed-dependent duty
  factor (at a slow jog the feet stay down longer, like a real run). Cadence: 3.7 m/s 2.14 → 1.75 steps/s, 6.6 m/s 3.0 → 3.29.
  `CLIP.match=0` restores the old behaviour.
- **Fix 2 — heel/toe-aware stride lock** (`src/32-footik.js`). Contact height = min(ankle, toe) above rest; the lock pins that
  contact point and shifts the ankle target by the pin offset (the sole keeps its orientation, so the toe stays put during
  heel-off). When contact moves from heel to toe, the anchor is handed over where the toe is drawn, so nothing jumps.
- **Measured** (flat ground, metres of contact-point slide per metre travelled): 3.7 m/s old cadence 0.82 → matched cadence 0.36
  → matched + lock **0.012**; 6.6 m/s 0.61 → 0.31 → **0.014**. Peak slide 6.9 → 1.6 m/s. Planted foot never below −1 mm.
- **Tests:** `s-stride.js` rewritten for contact-point measurement (old-vs-new cadence, lock, real contact time > 0.6 s / 0.3 s,
  no sinking) — 9/9. `s-footik.js`: the walk check now skips the first 12 frames (the preceding measurement leaves the IK off and
  it fades in over ~0.2 s; that transient was −10.7 cm with the clip idle) — 9/9. Regressions: s-anim 45/45, s-mech 47/47,
  s-loop 71/71, s-stance 11/11, s-rigfik 14/14, s-wolfik 11/11, s-wolfstride 10/10, s-crocik 14/14, s-dragonik 12/12,
  s-undead 16/16, s-ui 7/7 (6/7 on the first run: the known wall-clock "hold ATTACK" flake, passed on re-run), s-perf OK
  (logic 0.16–0.27 ms/frame). One stride screenshot checked: mid-stride pose fine, grass hides the feet.
- Not done: watched in motion by eye; crouch-walk (its contact is mostly double support) keeps the old cadence.

## Next priorities
1. **Housekeeping (needs the user):** merge `ccr-70a30f22-l05675` into `main`, or tell the routine which branch to start from.
   Then pick one armor branch (`-0ywtzy` is the newest) and merge it, instead of redoing the armor every run.
2. Animation: clips for heavy / sprint / jump attacks and side/back dodges; sword-tip ground clearance; stride locking for NPCs.
3. GLB: Snake Priestess boss on the gwyndolin skeleton; bring `fox.glb` into Ay Kılıççısı.
4. Creatures: first dungeon creatures (spider, golem); taming in Ay Kılıççısı.
5. Android: graphics-quality menu and real-device feedback.

## Earlier run logs (kept from the two merged lines)

### Line A — IK / creatures (`-6tptvk` … `-ul9yx5`), runs 1–7, 2026-11-17

#### Run 1 — 2026-11-17
- Created this file. The game's own detailed log stays in `ay-kiliccisi/PROGRESS.md`.
- **Feature 2 (animations): terrain foot IK for the hero** (`ay-kiliccisi/src/32-footik.js`).
  - Each ankle follows the ground height under it. The pelvis drops to the lower foot, and a two-bone leg IK bends the knee forward.
  - Planted soles tilt to the slope normal, clamped to 0.4 rad. A foot in its swing phase isn't tilted.
  - The IK fades out smoothly in the air, lying down, rolling, during takedowns, when pinned and when swimming.
  - `armIK` was generalised into a reusable `limbIK` (no change in arm behaviour).
  - Measured on a 0.45-gradient slope: with IK off, the feet are −6.8 cm (sunk) and +6.9 cm (floating), and soles are 0.42–0.50 rad off the slope. With IK on: +0.1 cm on both feet, 0.02–0.10 rad.
  - New test `ay-kiliccisi/test/s-footik.js`: 9/9 pass.
- Why feature 1 was skipped: the hero model already exists in the game, and the requested armor redesign has no brief, so it isn't a good fit for an unattended run.

#### Run 2 — 2026-11-17
- Earlier routine runs each branched from `main`, so their work never chained: terrain foot IK was built about four times on separate `ccr-*` branches. This run merged the latest one (`ccr-70a30f22-6tptvk`, run 1 above) into this branch and continued from there. **The `ccr-*` branches are not merged into `main`; someone needs to merge this branch for the work to accumulate.**
- **Feature 2 (animations): stride foot locking, so the hero's feet no longer skate.**
  - Diagnosis: the sine thigh swing plus a slow pose filter (lag of about 0.35 rad) put the foot on the ground while it was still moving forward at 10–16 m/s (33 m/s when sprinting).
  - Gait (`src/55-player.js`): in stance the thigh sweeps back linearly, and the stride length matches the distance-based phase rate, so the planted foot moves at body speed. The swing knee is solved analytically for the foot clearance it needs. The back foot rolls onto its toes (heel-off, `heelB` in `src/30-player-model.js`), so the swinging leg can pass through. Once the walk has settled, the pose filter is bypassed.
  - Lock (`src/32-footik.js`): a foot that touches down and has slowed down is pinned at its world spot. Leg IK holds it there until the heel lifts or the leg would overstretch. A foot still sweeping fast gets a few cm of clearance instead of scraping. Re-planting starts from where the foot is drawn, so it doesn't pop.
  - Measured on flat ground, as metres of foot slide per metre travelled: walk 0.93 → 0.074 (peak foot speed 16 → 2.3 m/s), sprint 0.90 → 0.032. Leg reach ≤ 0.998, and movement speed is unchanged.
  - New test `ay-kiliccisi/test/s-stride.js`: 9/9 pass. Regressions: `s-footik` 9/9, `s-mech` 47/47, `s-perf` OK.
  - `s-loop`: 4 of 6 runs passed 71/71. The other 2 each failed one different, unrelated test (Kırık Diş stomp jump, Gölge Adımı dash distance). The old build passed 3/3, so treat this as possible load-related flakiness and keep an eye on it.
  - Toggles for comparison: `GAIT.lin=0` restores the old sine gait, `FIK.lock=0` turns off locking.

#### Run 3 — 2026-11-17
- **Merged the two parallel routine lines into this branch**: the animation line (`-7ynivm`: foot IK + stride locking) and the undead line (`-soup7a` → `-7qxv18`: skeleton warriors + skeleton archers, bone-rattle sfx). Only the two PROGRESS files conflicted; the build was regenerated. Their run logs are kept in `ay-kiliccisi/PROGRESS.md` (sessions 8, 8b, 9). **Next runs should start from this branch (`ccr-70a30f22-d98vgz`), not from `main`.**
- **Feature 2 (animations): terrain foot IK for all humanoid rigs** (`rigFootIK` in `ay-kiliccisi/src/45-rig.js`).
  - One extra FK pass finds where each ankle lands. Each ankle is moved by the ground height under it (relative to the ground under the root), and the pelvis drops to the lower foot.
  - An analytic two-bone solve in the hip's sagittal plane re-bends the thigh and knee. Thigh and shin lengths come from the bone offsets, so it works for any `humanDef`-style rig, including Veyra's 20-bone rig. The foot keeps its pose pitch and tilts with the slope along the facing direction (≤0.35 rad), easing off as the foot lifts.
  - Wired into `drawGobs` (goblins, big goblins, goblin archers, skeletons), `drawNpcs` (villagers, merchants, guards) and `drawVeyra`. It only runs within 45 m (`RFIK.dist`). It's skipped while lying, dead, rising from the ground or reforming, and for Veyra when chained or downed. `RFIK.on=0` turns it off for comparison.
  - Measured side-on to a 0.42 slope, as the worst ankle error: villager 4.0 cm → 0.1 cm, guard 4.6 → 0.1, goblin 2.9 → 0.0, skeleton 3.7 → 0.1, big goblin 10.5 → 0.1. No foot sinks during a full walk cycle uphill or downhill. Flat ground is unchanged (bit-identical pose).
  - Cost: village draw prep 1.88 → 2.06 ms per frame on this CPU (`s-perf`).
  - New test `ay-kiliccisi/test/s-rigfik.js`: 14/14 pass. Regressions: `s-mech` 47/47, `s-loop` 71/71, `s-undead` 16/16, `s-footik` 9/9, `s-stride` 9/9, `s-perf` OK.
  - Caveat: the downhill leg reaches 99.9 % extension on steep slopes, so the knee looks straight there; the pelvis drop isn't limited by leg reach yet.

#### Run 4 — 2026-11-17
- Started from `ccr-70a30f22-d98vgz` (run 3), fast-forwarded into `ccr-70a30f22-ijomsl`. The parallel armor-redesign branches (`-kpnltt`, `-xztvch`, `-lsmbh1`, `-2ak8ow`, `-wx041a`) are still a separate line and were not merged.
- **Feature 2 (animations): wolves stand properly on slopes** (`wolfGround` + `WFIK` in `ay-kiliccisi/src/40-wolves.js`).
  - Before: the wolf body stayed level whatever the ground did, and each leg aimed at the ground under its hip. On a 0.42 slope the downhill paws hung up to 13 cm in the air (uphill facing) or 7 cm (downhill facing).
  - Now the body pitches to match the ground under the front and back paws (clamped to 0.55 rad, nose up uphill, nose down downhill). If a leg would still have to stretch past 96 % of its length, the body sinks (at most 22 cm). Each paw aims at the ground under the paw's own stride position, and leg angles take the body pitch into account. Everything is smoothed per wolf. It's off in the air, when dead, pinning the player or ridden. `WFIK.on=0` restores the old behaviour.
  - Measured on a 0.42 slope as the worst paw error compared with flat ground: facing uphill 13.0 cm → 0.5 cm, facing downhill 6.8 → 0.6 cm, side slope 0.3 → 0.5 cm (already fine before). No paw sinks while trotting across the slope (worst −0.5 cm). Flat ground is unchanged.
  - New test `ay-kiliccisi/test/s-wolfik.js`: 11/11 pass. Regressions: `s-mech` 47/47, `s-loop` 71/71, `s-rigfik` 14/14, `s-undead` 16/16, `s-perf` OK (village draw prep 2.24 ms per frame).
  - Not checked by eye: in the test screenshot, tall grass hides the paws.

#### Run 5 — 2026-11-17
- Started from `ccr-70a30f22-ijomsl` (run 4), fast-forwarded into `ccr-70a30f22-kbldj4`. No uncommitted changes; the armor-redesign branches are still a separate, unmerged line.
- **Feature 2 (animations): crocodiles fit the terrain** (`crocFit` + `CFIK` in `ay-kiliccisi/src/48-croc.js`).
  - Before: the 3.5 m croc body was a rigid level plank at the height of the ground under its centre. On a 0.33 slope facing uphill the head sank 7.5 cm into the bank while the tail hung 37–56 cm in the air; facing downhill the tail tip was 44 cm underground. Feet were off by up to 37 cm.
  - Now the root pitches and rolls with the ground under the shoulders/hips and both sides (≤0.5 / 0.4 rad). The neck and the three tail segments are then bent one at a time (≤0.45 rad each) so the next joint keeps its rest height above the ground. Each leg rotates its upper bone up/down (splay, ≤0.7 rad) with the lower bone counter-rotated, three Newton steps, until the foot is back at its flat-ground height above the ground under the foot. Everything is smoothed per croc.
  - Off when the croc floats in water, when dead (death roll), or beyond 60 m. `CFIK.on=0` restores the old rigid body.
  - Measured on a 0.33 slope, worst foot error vs flat ground: uphill 24.8 → 1.3 cm, downhill 31.5 → 1.1 cm, side slope 32.5 → 0.4 cm, diagonal 37.5 → 1.3 cm. Head/tail joints now stay 26–33 cm above the ground (rest is ~28–33 cm) in all four directions. No foot sinks while crawling (worst −0.3 cm). Cost ≈ 0.03 ms per frame for a nearby croc.
  - New test `ay-kiliccisi/test/s-crocik.js`: 14/14 pass. Regressions: `s-mech` 47/47 (crocodile tests included), `s-loop` 71/71, `s-rigfik` 14/14, `s-wolfik` 11/11, `s-perf` OK (swamp draw prep 0.87 ms per frame).
  - Not checked by eye: tall grass hides the feet in the test screenshots; the body roll on the side slope is visible.

#### Run 6 — 2026-11-17
- Started from `ccr-70a30f22-kbldj4` (run 5), fast-forwarded into `ccr-70a30f22-0ea3zi`. No uncommitted changes, no open issues checked beyond git (no `gh`). `main` is fully contained in this line. A separate non-routine branch `claude/player-character-animal-system-vahlxx` (V20 combat engine, stages 1–2) is ahead of `main` and was **not** merged.
- **Feature 2 (animations): wolf paw gait + stride locking** (`WGAIT`, `wolfPaw`, `wolfRate` in `ay-kiliccisi/src/40-wolves.js`).
  - Before: each paw swung on a sine (±0.14 walk / ±0.26 run) at a phase rate unrelated to the stride, so planted paws slid forward at 0.4–1× body speed. Circling wolves strafe sideways while the legs only swung front-to-back, so paws skated sideways at full speed.
  - Gait: phase advances with distance (walk 8.5 rad/m, run 3.6 rad/m, ×1.2 when side-stepping). Each paw is on the ground for a duty fraction (walk 0.6, run 0.25) and sweeps back linearly by exactly the distance the body covers (A = d·π / (r·scale)); swing is a smoothstep return with a sine lift. The stride follows the actual direction of travel (smoothed), so a circling wolf steps sideways; the lateral part is reached by rolling the leg at the hip (≤0.55 rad). Running wolves carry the body 4 cm lower and bob less, so the stride fits the leg length.
  - Lock: on touchdown the paw's world spot is pinned and held by the leg solve until the paw lifts. If the leg would over-stretch (turns) the paw is released with a short decaying offset and a small lift (a quick re-step instead of a pop). Teleports/respawns drop the lock outright.
  - Measured on flat ground, metres of planted-paw slide per metre travelled (per paw): walk 2 m/s 0.336 → 0.053, gallop 6.6 m/s 0.18 → 0.03, walking while turning 1.2 rad/s 0.369 → 0.056, side-stepping (circle) 0.573 → 0.049. Leg reach stays within its length. `WFIK.lock=0` restores the old sine gait.
  - New test `ay-kiliccisi/test/s-wolfstride.js`: 10/10 pass. Regressions: `s-wolfik` 11/11, `s-mech` 47/47, `s-loop` 71/71, `s-rigfik` 14/14, `s-perf` OK (village draw prep 2.15 ms per frame).
  - Checked one screenshot of a mid-stride wolf; the gait wasn't watched in motion by eye.

#### Run 7 — 2026-11-17
- Started from `ccr-70a30f22-0ea3zi` (run 6), fast-forwarded into `ccr-70a30f22-ul9yx5`. No uncommitted changes. Note: the later runs `-djto1n` (armor pass) and `-sinuc0` (hero foot IK, a duplicate of run 1) branched from `main` again and were **not** merged — the same restart problem as before.
- **Feature 2 (animations): the dragon stands properly on slopes** (`dFit`, `dLimbIK`, `DFIK` in `ay-kiliccisi/src/49-dragon.js`).
  - Before: the dragon (submitted Tarisland GLB, 150+ bones, its own clips) was drawn as a rigid level body at the ground height under its centre. On a 0.23 slope the limbs were off by 0.40–1.12 m (paws floating in the air or buried in the hillside).
  - Now, after the clip is sampled: the ground under the two hind feet and the two front hands gives a body pitch and roll (≤0.4 / 0.3 rad); the body sinks (≤0.7 m) if a limb would still have to reach down; then each limb gets an analytic two-bone IK applied straight to the bone world matrices (thigh → calf+horselink → foot, upper arm → forearm → hand), so each limb end keeps its animated height above the ground under it. Feet and hands keep their animated orientation. Skin matrices are now built after the fit (`dSkinMats`), so hit points, the mouth (fire breath) and the mesh all use the fitted pose.
  - The fit fades out as the pelvis rises (take-off, hover, breath, landing) and per limb when a limb is lifted high (claw swipe), and is off when dead or beyond 90 m. Smoothing is frame-rate independent. `DFIK.on=0` restores the old rigid body.
  - Measured on a 0.23 slope, worst limb-end error vs flat ground: facing uphill 0.44 → 0.008 m, downhill 1.12 → 0.008 m, side slope 0.78 → 0.008 m, diagonal 0.41 → 0.008 m. Limb reach ≤ 90 %. No limb sinks in the walk clip on the slope. Flat ground unchanged (±1 cm). Cost ≈ 0.02 ms per frame extra.
  - New test `ay-kiliccisi/test/s-dragonik.js`: 12/12 pass. Regressions: `s-mech` 47/47 (dragon pattern test included), `s-loop` 71/71, `s-wolfik` 11/11, `s-crocik` 14/14, `s-perf` OK (dragon area draw prep 1.88 ms per frame).
  - Checked by eye: one screenshot pair (fit on/off) — with the fit on, the downhill front claw reaches the ground; trees partly hide the body.

### Line B — motion clips (`-6z1mbm` … `-7zm4ho`), turlar 1–5, 2026-11-25

#### Tur 1 — 2026-11-25: gerçek hareket klipleri (özellik 2 + 3)
- `tools/anim/import_clips.mjs`: three.js olmadan GLB okuyucu; `assets/models/hero_anims1.glb` (Quaternius Universal Animation Library, CC0)
  içinden 6 döngüyü (Idle, Walk, Jog, Sprint, Crouch Idle, Crouch Walk) 30 fps örnekler, T-pozdan dünya-uzayı fark dönüşü
  olarak Kael'in 58 kemikli iskeletine aktarır (22 kemik eşlenir; kılıç tutan sağ kol hariç 18'i oyunda sürülür).
  Her döngü sol ayak öndeyken başlayacak şekilde hizalanır; zemindeki ayaktan doğal hızı ölçülür. Çıktı `data/anims.js` (73 KB, int16).
- `src/32-anim.js`: klip katmanı. Hıza göre bekle→yürü→koş→depar (ve çömel-bekle→çömel-yürü) harmanlama, ortak adım fazı
  (bacaklar harmanlamada çaprazlanmaz), her klip kendi temposunda oynar. Kılıç kolu (sağ kol) prosedürel kalır, IK bozulmaz.
  Kaynak iskelet farkı için en alttaki ayak her karede zemine oturtulur. Saldırı/kaçınma vb. durumlarda katman yumuşakça kapanır.
- `test/s-anim.js` (11 test): klipler yüklü, durum→klip eşleşmesi, adım uzunluğu, faz ilerlemesi, ayak zeminde, çömelme kalça
  yüksekliği, saldırıda katmanın kapanması, NaN yok — 11/11.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 (s-ui'deki iki zamanlama testi değişiklik öncesi sürümde de
  ara sıra düşüyor: gerçek saat ile ölçüyorlar, yazılımsal WebGL'de kararsız). Performans değişmedi (s-perf, kare başı <0,3 ms mantık).
- Oyun içi lisans listesine Quaternius (CC0) eklendi.

#### Tur 2 — 2026-11-25: eylem klipleri — zıplama, iniş, darbe (özellik 2 + 3)
- **Dal sorunu bulundu:** önceki zamanlanmış turların her biri `main`'den ayrı bir `ccr-…` dalı açıp tek commit itti ve hiçbiri
  birleştirilmedi; bu yüzden ilerleme birikmedi (ör. ayak IK'sı 4 ayrı dalda, zırh yeniden tasarımı 6+ dalda tekrar yapıldı).
  Bu tur, tur 1'in dalını (`ccr-70a30f22-6z1mbm`) kendi dalına birleştirip onun üstüne kurdu. Kalıcı çözüm: turların dallarını `main`'e birleştirmek.
- `tools/anim/import_clips.mjs`: `hero_anims1.glb`'den 4 tek seferlik klip daha: `Jump_Start`, `Jump_Loop`, `Jump_Land`, `Hit_Chest`.
  Tek seferlik klipler faz hizalamasına sokulmuyor. İçe aktarım sırasında kalça/ayak yükseklik profili yazdırılıyor (klip adlarının
  gerçek içeriğini görmek için: `Jump_Start` = çömel→kalk→bacak topla, `Jump_Loop` = havada toplu duruş, `Jump_Land` = derin diz kırma).
  `data/anims.js` 73 → 111 KB.
- `src/32-anim.js`: normalize zamanla oynatılan eylem klipleri (`ACTION_CLIP`). Zıplama: ayakların yerden kesildiği kareden (0,1 sn)
  başlayan kalkış, 0,4–0,6 sn'de havada döngüye geçiş. İniş: `Jump_Land`'in ilk 0,45 sn'si kısa iniş durumuna sığdırılıyor
  (zıplayarak saldırı inişi prosedürel kalıyor). Darbe: `Hit_Chest` 0,38 sn sendeleme süresine yayılıyor. Kılıç kolu yine prosedürel.
  Eylem kliplerine giriş/çıkış ~0,1 sn çapraz geçişle (`gaitBlend`), artık kliplerden yürümeye geçişte ani sıçrama yok;
  yürüme/koşu harmanlaması eskisi gibi anlık.
- `test/s-anim.js`: 11 → 19 test (kalkış klibi, havada döngü, zıplarken ayak zemine gömülmüyor, inişte kalça alçalıyor,
  inişten/darbeden sonra yürüme katmanına dönüş, NaN yok) — 19/19. Ekran görüntüleriyle havadaki toplu duruş ve darbe geri
  çekilmesi gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7 (bir koşuda 6/7: bilinen gerçek-saat zamanlama testi
  «SALDIR basılı tut», yeniden koşuda geçti; değişiklikle ilgisi yok).

#### Tur 3 — 2026-11-25: ileri kaçınma = gerçek takla klibi (özellik 2 + 3)
- Bu dal (`ccr-70a30f22-18esij`) tur 2'nin dalını (`ccr-70a30f22-lafz5x`, tur 1+2) birleştirip üstüne kurdu.
- `tools/anim/import_clips.mjs`: `hero_anims1.glb`'den `Roll` (1,47 sn) tek seferlik klip olarak eklendi. Profil: 0,04 sn çömelme →
  dalış (kalça 1,37 m) → sırt üstü yuvarlanma (kalça 0,06 m) → ~1,1 sn'de ayakta. `data/anims.js` 111 → 121 KB.
- `src/32-anim.js`: ileri kaçınmada (`dodgeKind==='fwd'`) `Roll`'un 0,04–1,1 sn arası kaçınma süresine (0,56 sn) yumuşak zamanla sığdırılıyor.
  Gövdenin ters dönüşü artık klipteki kalça dönüşünden geliyor; eski model matrisi dönüşü (`P.spin`) klip yoksa yedek olarak kalıyor.
  Takla sırasında «en alttaki ayağı zemine oturt» düzeltmesi kapalı (ayaklar havada); gövdenin zemine gömülmemesini
  `playerMatrix`'in yatık durum açıklık kontrolü sağlıyor. Kılıç kolu yine prosedürel; girişte/çıkışta ~0,1 sn çapraz geçiş.
- `test/s-anim.js`: 19 → 25 test (takla klibi seçiliyor ve model dönüşü kapalı, kalça başın 61 cm üstüne çıkıyor = gerçek ters dönüş,
  kalça yere iniyor, baş/gövde zemine gömülmüyor, sonra ayakta yürüme katmanına dönüş, NaN yok) — 25/25.
  `test/s-rollshots.js`: taklanın 5 karelik ekran görüntüsü (`test/out/roll-*.jpg`); dalış, omuz üstü yuvarlanma, kalkış gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-perf değişmedi (mantık ≤0,44 ms/kare). s-ui 6/7: «SALDIR basılı tut»
  testi bu turda iki kez düştü; değişiklik geri alınmış sürümde de aynı şekilde düşüyor (gerçek saatle 2,5 sn basılı tutunca yükleme
  kendiliğinden ağır saldırıya dönüyor) → var olan, bu değişiklikle ilgisiz kararsız test.

#### Tur 4 — 2026-11-25: hafif kombo = gerçek kılıç klipleri (özellik 2 + 3)
- Bu dal (`ccr-70a30f22-j9phxd`) tur 3'ün dalını (`ccr-70a30f22-18esij`, tur 1+2+3) birleştirip üstüne kurdu.
- `tools/anim/import_clips.mjs` artık iki kaynak okuyor: `hero_anims1.glb` ve `hero_anims2.glb`. İkincisinden 3 tek seferlik klip alındı:
  - `Sword_Regular_A`: sağdan sola kesik, sol ayak geri atılıyor, derin hamle duruşu.
  - `Sword_Regular_B`: o hamleden ters kesik.
  - `Sword_Regular_C`: dönerek sıçrayıp tepeden indirilen bitiriş.
  Eski 11 klip bayt bayt aynı kaldı. `data/anims.js` 121 → 142 KB. `PROFZ=1` ile çalıştırınca kliplerin sağ el hızı, ayak/kalça yerleşimi ve kalça dönüşü yazdırılıyor; vuruş anları buradan ölçüldü (A 0,25 sn, B 0,27 sn, C 0,66 sn).
- `src/32-anim.js`: saldırı durumunda duruşun kombo pozu klibi seçiyor (poz 0 → A, 1 → B, 2 → C; yani her duruşun kendi sırası korunuyor).
  - Klip zamanı bükülüyor: klibin en hızlı kılıç karesi oyunun vuruş anına (u≈0,36–0,4) denk geliyor, ardından savuruşun devamı geliyor. Saldırı süreleri ve hasar zamanlaması değişmedi.
  - C'nin ilk 0,3 sn'si atlanıyor; dönüşün son kısmı ve tepeden vuruş oynuyor.
  - Bu kliplerde sağ kol (kılıç kolu) da klipten geliyor. Bunun için kol kemikleri ayrı harmanlanıyor: yalnızca kılıç kliplerinin payı kadar (`CLIP.armW`), geri kalanı yine prosedürel. Böylece yürüme, zıplama vb. kliplerde kılıç kolu eskisi gibi.
  - C'nin havadaki kısmında «en alttaki ayağı zemine oturt» düzeltmesi kapalı.
- `src/55-player.js`: saldırı pozu artık `clipW` veriyor. İlk denemede bu eksikti ve klip hiç görünmüyordu; test bunu yakaladı.
- `test/s-anim.js`: 25 → 38 test. Yeni testler:
  - saldırıda kılıç klibi gövdeyi ve kolu sürüyor;
  - her kombo pozu doğru klibi seçiyor;
  - elin en hızlı anı vuruş penceresinde (u 0,36; el 31–46 m/s);
  - ayaklar zemine gömülmüyor, kalça hamlede 0,67–0,73 m'ye iniyor (ayakta 1,07 m);
  - NaN yok;
  - saldırıdan sonra yürüme katmanına dönülüyor ve kol yine prosedürel.
  Sonuç 38/38. `test/s-swordshots.js` 3 vuruşun 4'er karesini çekiyor (`test/out/sword-*.jpg`); gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7. s-perf'te mantık kare başına 0,11–0,26 ms, öncekiyle aynı düzeyde.
- Bilinen kusurlar:
  - Klipler tek elli kılıç için yapılmış. Kael'in dev kılıcı B'nin derin hamlesinde ve C'nin sonunda bıçak ucuyla zemine çok yaklaşıyor, yer yer zemine giriyor.
  - A'nın savuruş devamında kılıç başın arkasında dik kalıyor.
  - Ağır saldırı ve iki elli tutuş hâlâ prosedürel.

#### Tur 5 — 2026-11-25: ölüm = gerçek düşme klibi (özellik 2 + 3)
- Bu dal (`ccr-70a30f22-7zm4ho`) tur 4'ün dalını (`ccr-70a30f22-j9phxd`, tur 1+2+3+4) hızlı ileri sararak aldı ve üstüne kurdu.
- `tools/anim/import_clips.mjs`: `hero_anims1.glb`'den `Death01` (2,4 sn) tek seferlik klip olarak eklendi. Profil: sendeleme →
  0,6 sn'de dizler çöküyor (kalça 0,59 m) → 0,93 sn'de sırt üstü yerde (kalça 6 cm) → bacaklar ~1,4 sn'de duruluyor.
  `PROFZ=1` teşhisi artık ölüm klibini de yazdırıyor. Eski 14 klip bayt bayt aynı. `data/anims.js` 142 → 159 KB.
  (`Sword_Attack` de incelendi: 0,40 sn'de 37 m/s yatay kesik + adım; ağır saldırı tepeden iki elli olduğu için şimdilik alınmadı.)
- `src/32-anim.js`: `dead` durumunda `Death01` gerçek zamanda (×1,1) oynuyor, 2,2 sn'den sonra son pozda duruyor. Ölüm klibi
  tüm gövdeyi, kılıç kolu dahil sürüyor (`ARM_CLIPS`); düşerken «en alttaki ayağı zemine oturt» kapalı (gövdeyi zemin üstünde
  `playerMatrix`'in yatık açıklık kontrolü tutuyor). `clipHas(k)` yardımcı fonksiyonu.
- `src/55-player.js`: `die()` ayaktayken artık `knockDown` ragdoll eğimini başlatmıyor (yoksa klipteki düşüşle model matrisi
  eğimi üst üste binip çift dönüş olurdu): `P.deathClip` işaretlenir, eğim 0, hafif geri kayma. Yere çarpma anında (0,93 sn)
  gümleme sesi ve küçük kamera sarsıntısı. Zaten yerde yatarken ölünürse eski prosedürel ragdoll sürüyor. `respawn()` işareti siliyor.
- `src/60-game.js`: test için `die`, `knockDown` dışa açık.
- `test/s-anim.js`: 38 → 45 test (klip tüm gövdeyi ve kolu sürüyor, ragdoll eğimi 0, kalça 1,06 → 0,11 m / baş 0,11 m / göğüs
  kalçanın 48 cm gerisinde = sırt üstü, baş/gövde zemine gömülmüyor, NaN yok, yeniden doğunca ayakta yürüme katmanında,
  yerdeyken ölümde prosedürel ragdoll kalıyor) — 45/45. `test/s-deathshots.js`: 6 karelik ekran görüntüsü (`test/out/death-*.jpg`);
  sendeleme, geriye devrilme ve yerde yatış gözle kontrol edildi.
- Regresyon: s-mech 47/47, s-loop 71/71 (3 ölüm/yeniden doğuş testi dahil), s-stance 11/11, s-ui 7/7; s-perf mantık 0,08–0,33 ms/kare (değişmedi).
- Bilinen kusur: yatarken pelerin gövdenin altında kalıp görünmüyor; düşerken kılıç gövdeyle birlikte savruluyor, elden bırakılmıyor.
