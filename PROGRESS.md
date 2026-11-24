# PROGRESS — scheduled development runs

The active game is **Ay Kılıççısı** (`ay-kiliccisi/`, deployed as the root `index.html`). Its detailed design log
lives in `ay-kiliccisi/PROGRESS.md`; this file tracks the scheduled-run feature list.

## Feature list (priority order)

| # | Feature | Status |
| --- | --- | --- |
| 1 | High-quality male protagonist character (Kael, "Kara Zırh") | In progress: sculpted model exists; armor redesign pass 1 done (run 1) |
| 2 | Realistic 3D character animations | Not started this series (procedural poses exist in `31-hero.js` / `55-player.js`) |
| 3 | Integration of submitted GLB models | Partial: dragon, knight statue, elf queen, hair GLB integrated; others only used for skeleton proportions |
| 4 | Multiple animals and creatures | Partial: wolves, goblins, croc, dragon, Veyra; dungeon creatures still to do |
| 5 | Creature taming and AI | Partial: perception/AI exist; taming lives in the older `yaban.html` game, not in Ay Kılıççısı |
| 6 | Open world, combat, inventory, progression | Largely built (2.8 km map, combat, loot, levels); map expansion and dungeons still to do |
| 7 | Android performance and mobile controls | Touch controls done; not yet measured on a real Android device |

## Completed
- Run 1 (2026-11-24): protagonist armor pass 1. See below.

## Run log

### Run 1 — 2026-11-24 (feature 1: protagonist)
- `tools/sculpt/models/hero.mjs`:
  - Raised bronze **moon-and-blade crest** on the breastplate, the hero's emblem.
  - **Greaves** are no longer straight cylinders. They have a calf swell, two flutes beside the shin ridge, a bronze ankle band, rivets at the top and back, and leather straps on the outer side.
  - **Cuisses** have a bronze lower band and four rivets.
  - Fur mantle noise is smaller, so it gets fewer jagged spikes after simplification.
  - Triangle budget raised from 21k to 23k (actual 22.7k).
- Rebuilt `data/models.js`. Only the `hero` entry changed. Also rebuilt `dist/ay-kiliccisi.html` and the root `index.html`.
- Tooling note: `tools/sculpt/cache/` is gitignored. To rebuild a single model, first decode each `data/models.js` entry back into `cache/<name>.bin`. Use a regex that allows digits, or `villager2` gets dropped.
- Tests: s-mech 47/47, s-loop 71/71, s-stance 11/11, s-ui 7/7. s-perf and s-hero ran with no errors.

## Next priorities
1. Protagonist pass 2:
   - Breastplate surface is still soft and blobby. Add pectoral plate edges and a back plate.
   - Redesign the helm visor; the T-slit reads oddly up close.
   - The greave flutes are still subtle at game distance.
2. Animations (feature 2): weight shift and foot planting on the run cycle, hit reactions, a stance-specific idle.
3. Dungeon creatures (feature 4): skeleton and spider, built with the SDF pipeline.
