# PROGRESS — Yaban Yoldaşları

Updated by the scheduled development routine. Each run picks the highest-priority incomplete feature, advances it, runs tests and records the outcome here.

## Feature status

| # | Feature | Status | Notes |
| --- | --- | --- | --- |
| 1 | High-quality male protagonist character | ✅ Done (PR #1) | VRoid AvatarSample_C, toon-shaded, sword attached. |
| 2 | Realistic 3D character animations | 🟡 In progress | Hero: retargeted Quaternius clips + crossfades (PR #1) + **hair/coat spring-bone physics (2026-11-14)**. Missing: foot–ground IK (hero and procedural animals), hand IK / look-at. |
| 3 | Integration of submitted GLB models | 🟡 Done for what was submitted | The dragon (only GLB submitted) and the Khronos fox are integrated via `GLBCreature`. The other 12 species are procedural until GLBs are provided. |
| 4 | Multiple animals and creatures | ✅ Done (PR #1) | 14 species across 7 biomes. |
| 5 | Creature taming and AI | ✅ Done (PR #1) | Species-specific taming, pet follow/guard/hunger. |
| 6 | Open world, combat, inventory, progression | 🟡 Partial | World, combat, inventory done. Missing: XP/levels/progression, save/load, quests, mounts, day/night. |
| 7 | Android performance and mobile controls | 🟡 Partial | Touch joystick + buttons exist. Missing: quality presets / adaptive resolution, real-device profiling, touch camera tuning. |

## Completed

- **PR #1** — Base game: open world with zones, male VRoid hero with retargeted animations, 14 creatures, AI, taming, pets, inventory, touch controls, 51 gameplay tests.
- **2026-11-14 — Hero secondary motion (feature 2)**
  - New `src/springbone.js`: VRM 0.x `secondaryAnimation` spring-bone solver (Verlet, length constraint, sphere colliders) driven by the data already inside `hero.glb`. 34 joints: 20 hair, 14 coat skirt.
  - Added "center space" (character root) with 30% world inertia so hair streams back naturally at a sprint instead of flipping over the head (without it, bangs hit ~2.6 rad at full sprint).
  - Added leg sphere colliders (upper and lower leg, both sides) so the coat skirt does not pass through the legs; the VRM data had none for the coat.
  - Damping floor for the coat group (VRM data has drag 0, which oscillates forever). Sub-steps for large frame times. Reset on respawn and teleport.
  - Hooked into `Player.update` and the model viewer (`test/model-viewer.html?m=hero`).
  - 6 new tests (57 total, all passing): chain setup, sway during sprint, no hair flip, bone length preserved, damping when stopped, no coat–leg penetration.

## Next priorities

1. **Feature 2 (continue):** foot–ground IK for the hero (slopes) and the procedural quadrupeds (foot sliding on fast turns is a known issue). Then head look-at toward the focused creature.
2. **Feature 6:** player progression (XP from combat and taming, levels raising HP, stamina and damage) and save/load via localStorage.
3. **Feature 7:** quality presets / adaptive pixel ratio and shadow toggles for Android; FPS measurement in tests.
4. **Feature 3:** swap procedural species for GLBs when the user submits them.
