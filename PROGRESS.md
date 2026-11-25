# PROGRESS — scheduled development runs

Tracks the recurring development task. The active game is **Ay Kılıççısı** (`ay-kiliccisi/`); its detailed
design log is `ay-kiliccisi/PROGRESS.md`. Build: `python3 ay-kiliccisi/tools/build.py`, then copy
`ay-kiliccisi/dist/ay-kiliccisi.html` to `index.html` (the site page). Tests: see `ay-kiliccisi/PROGRESS.md`.

## Feature list (priority order)

| # | Feature | Status |
| --- | --- | --- |
| 1 | High-quality male protagonist character (Kael, Kara Zırh) | In progress |
| 2 | Realistic 3D character animations | Not started by this routine (procedural rig animation exists) |
| 3 | Integration of submitted GLB models | Partly done earlier (dragon, hair GLB, elf body, skeleton proportions) |
| 4 | Multiple animals and creatures | Partly done earlier (wolves, crocodile, dragon, goblins) |
| 5 | Creature taming and AI | Partly done earlier (perception, Veyra companion AI) |
| 6 | Open world, combat, inventory, progression | Largely done earlier; world expansion still open |
| 7 | Android performance and mobile controls | Partly done earlier (touch layout, perf test); no real-device test |

## Completed

- (none of the seven features is fully finished yet)

## Run log

### Run 1 — 2026-11-25
Feature: **#1 male protagonist**.
- Gauntlets rebuilt: the flat "mitten" paddle is gone. Each finger is now its own chain of leather segments with
  overlapping plates, bound to its own finger bones, so the fist curls around the sword grip in game. Added a
  knuckle bar with knuckle studs, a fuller palm, a plated 3-segment thumb rooted in the palm (it used to float as
  a stick), and a wider flared cuff.
- Helm: brass keel ridge down the centre of the visor and brass rings at the horn roots.
- Torso: waist lames narrowed for a stronger V-taper.
- Mesh budget 21k → 25.7k triangles (12.1k verts) for a smoother helm; perf test difference within noise.
- Tests: s-mech 47/47, s-stance 11/11, s-loop 71/71, s-ui 7/7, s-perf and s-hero ran without errors.
  `s-hero.js` now also saves a close-up of the sword hand (`hr-hand.jpg`).
- Note for later runs: `tools/sculpt/cache/` is gitignored. Before rebuilding one model, seed the cache from the
  committed `data/models.js` (gunzip each base64 entry into `cache/<name>.bin`), otherwise the rebuilt
  `models.js` drops every model that was not rebuilt (and `king` can't be rebuilt without the elf GLB).

## Next priorities
1. Protagonist, continued: helm silhouette (it is still an egg-shaped dome); shape the chest plate (pectoral
   ridges); tassets are still boxy; give the cape more volume at the shoulders. The user also asked earlier for
   a full armour redesign (see `ay-kiliccisi/PROGRESS.md`), so get their direction before a full redesign.
2. Hero animations: stance-specific poses (thrust/lunge), combo finisher motions (AŞAMA 1 remainder).
3. Creatures: move the wolves to the wolf_puppy skeleton; new dungeon creatures (skeleton, spider, golem).
