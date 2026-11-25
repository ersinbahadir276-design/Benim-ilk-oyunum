# PROGRESS — scheduled development runs

The live game is **Ay Kılıççısı** (`ay-kiliccisi/`, built into `index.html`). Its detailed design log is
`ay-kiliccisi/PROGRESS.md`; this file tracks the scheduled-run feature list.

## Feature list (status)

| # | Feature | Status |
|---|---|---|
| 1 | High-quality male protagonist character | **In progress.** Kael: a sculpted SDF model (~21k tris, 58 bones, PBR channels, cape bones). Still open: the armor redesign the user asked for (needs art direction). |
| 2 | Realistic 3D character animations | **In progress.** All animation is procedural (joint angles + arm IK). Added this run: terrain foot IK for the hero. Still open: foot IK for wolves/goblins/NPCs, stance-specific attack poses, hand-keyed clips, cloth/cape physics. |
| 3 | Integration of submitted GLB models | **Partly done.** Dragon (own clips), elf body for the Demon Queen, user hair GLB, and skeleton proportions from berserk_armor/kawaiope/aldrich/gwyndolin are in. Still open: Kawaiope girl, wolf_puppy skeleton for the wolves. |
| 4 | Multiple animals and creatures | **Partly done.** Wolves, goblins (melee/archer/big), croc, dragon, Veyra. Still open: skeletons, spiders, golems, deer/birds. |
| 5 | Creature taming and AI | **Partly done.** Wolf taming (trust), perception cones, group alerts, Veyra utility AI. |
| 6 | Open world, combat, inventory, progression | **Mostly done.** 2.8 km map, stance combat, loot/rarity, 7-tab system window, levels, skills, blacksmith, quests. Still open: dungeons, guild, bigger map. |
| 7 | Android performance and mobile controls | **Partly done.** Touch PlayStation layout, portrait/landscape, 30 m outline cutoff. Not yet tested on a real device. |

## Completed
- (Before the scheduled runs) Everything listed in `ay-kiliccisi/PROGRESS.md`, sessions 2–7.
- **Run 2026-11-25: hero terrain foot IK** (`footIK` in `ay-kiliccisi/src/30-player-model.js`, called each frame from `60-game.js`).
  - Each ankle goes to the ground under it with two-bone leg IK. The knee keeps its hinge axis.
  - The pelvis drops so the downhill foot can reach, and the sole tilts to the terrain normal (less while the foot is lifted).
  - It blends in and out by state. It is off in the air, while rolling, lying down, swimming and during takedowns.
  - New test `ay-kiliccisi/test/s-footik.js`, 5/5 passing:
    - On a slope of about 21°, ankle error at idle drops from 4.2 cm to 0.4 cm.
    - Walking with IK, no ankle sinks into the ground (worst 0 cm, against 3.5 cm without IK).
    - Flat ground is unchanged.
  - Regression tests: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-assn 5/5. s-perf still has the same logic cost (about 0.2 ms per frame).

## Known issues
- `test/s-ui.js` "hold ATTACK = charge, release = heavy" fails with or without this run's change. It was already failing before this run: since session 7 the PlayStation layout puts the heavy attack on its own △ button, so the test's expectation is out of date and needs updating.

## Next priorities
1. Protagonist: idle/locomotion polish. Breathing and weight shift, lean into turns and on slopes, heel-strike/toe-off in the walk cycle, and stance-specific attack poses (thrust, draw cut).
2. Extend foot IK to the quadrupeds (wolves) and humanoid NPCs/goblins.
3. Fix the outdated s-ui charge test (wire it to the △ heavy button).
4. Armor redesign for Kael once the user gives art direction.
