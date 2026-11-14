# PROGRESS — Yaban Yoldaşları

Updated by the scheduled development routine. Each run picks the highest-priority incomplete feature.

## Feature status

| # | Feature | Status | Notes |
| --- | --- | --- | --- |
| 1 | High-quality male protagonist | ✅ Done | VRoid AvatarSample_C (`assets/models/hero.glb`). Missing: hair/cloth spring-bone physics. |
| 2 | Realistic 3D character animations | 🟡 Mostly done | Hero: 15+ retargeted Quaternius clips with crossfades. Procedural animals lack foot IK (feet can slide on fast turns). |
| 3 | Integration of submitted GLB models | ✅ Done for what was submitted | Only the dragon GLB was submitted (plus Khronos fox). Any new GLB plugs into `GLBCreature`. Dragon `fly2` clip unused (no flight yet). |
| 4 | Multiple animals and creatures | ✅ Done | 14 species across 7 zones; 12 are code-built rigged models (lower visual quality than GLBs). |
| 5 | Creature taming and AI | ✅ Done | Species-specific taming, pet follow/stay/defend/hunger, max 5 pets. |
| 6 | Open world, combat, inventory, progression | 🟡 In progress | World, combat, inventory done. **This run:** player XP/levels, pet levels, autosave/load. Missing: quests, day/night, horse riding, equipment/crafting. |
| 7 | Android performance and mobile controls | 🟡 Partial | Touch joystick + buttons exist. No quality presets, no FPS-adaptive resolution, not profiled on a real Android device. |

## Completed

- **Run 2026-11-14 — Progression & save system** (feature 6)
  - New `src/progression.js`: player levels 1–30 (XP from kills scaled by species, taming scaled by method difficulty, gathering); each level +12 max HP, +7% sword damage, faster stamina regen, full heal on level-up.
  - Pet levels 1–10: killer pet gets full kill XP, pets within 25 m get half; +10% HP / +8% damage per level; reset when released.
  - Autosave to `localStorage` (every 20 s, on tame, level-up, pause, tab hide/close): level, XP, stats, inventory, position, pets (name, level, hunger, HP, stay). Saved data is sanitized on load (clamped values, unknown items/species dropped).
  - Restored pets are matched to a wild animal of the same species (or spawned) and placed around the player.
  - HUD: level badge + XP bar; pet panel shows pet level; pause menu has **Yeni Oyun** (clear save). `?fresh` ignores the save; `?test` never saves.
  - Tests: 51 → 65 gameplay tests, all passing (`node test/run-tests.mjs`). Manually verified save → reload → resume in Chromium.

## Next priorities

1. **Feature 7 – Android performance:** quality presets (shadow map size, pixel ratio, draw distance/fog, grass density), automatic downgrade when FPS drops, measure on a mid-range phone profile; make touch buttons larger/configurable, add camera-drag area for touch.
2. **Feature 6 – remaining open-world systems:** simple quest/objective chain (tame X, reach dragon peak), day/night cycle, horse riding.
3. **Feature 2 – animation polish:** foot IK / ground alignment for procedural quadrupeds; VRM spring bones for hero hair.
4. **Feature 3:** if new GLB models are submitted, replace procedural species via `GLBCreature`; consider dragon flight using the `fly2` clip.
