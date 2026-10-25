## LOD revision 02 — October 24, 2026

Ewan's device playtest of v01: steady 30 FPS; noticeable walking hitch at 100× ecology speed; earlier detailed foliage missing. This is a human result for v01, not evidence about revision 02 performance.

Revision 02 restores the branch-following leaf geometry from Mobile Test 08, using the existing island tree transforms and three deterministic form variants. Canopy trees and palms use 30/60/90 m bands with 3 m hysteresis. Mid-distance leaves retain their original base, outline and tip; beyond 90 m the original twig groups become cheap crossed leaf masses. Palm crowns keep every frond; individual frond and trunk topology gets simpler with distance. Shrubs and ferns have reduced tiers and are hidden beyond roughly 90 m.

Coconuts use detailed husks within 12 m, a reduced husk at 12–30 m and a simple full-fruit form at 30–60 m, then are hidden. Crabs retain full detail within 12 m, simplified jointed anatomy at 12–30 m, and a single baked silhouette at 30–65 m, then are hidden. Small-object bands use 2 m hysteresis. Hidden organisms continue normal simulation.

Instance uploads cover active matrix ranges instead of reserved capacity. Stationary viewers do not repeatedly rebuild static vegetation batches. Simulation rules and the one-month solver remain unchanged; 100× can still hitch because ecology steps run on the main thread. WebGL appearance and revision 02 phone FPS remain unverified. All 15 automated checks and the build pass, including topology correspondence, LOD thresholds, every-frond retention, mesh tiers and standalone import resolution.

---

# Living palms and coconut crabs — first island integration

Candidate: Cooper West Living Island v01, October 24, 2026. Based on shared `main` at `08fd5bd5c30df6e8bbf71c54ab1066b54dab92e5` and the approved Living-Palms-Soil-v02.html artifact version 6.

The Cooper West browser walk now uses the lab's growing palms, husked coconuts and jointed crab models on the existing island terrain. This is the browser preview, not a Godot update. The old palm transforms remain the initial adult population; canopy trees, shrubs, ferns, height data, movement and water shader are retained. Those other plants remain static and are not part of the nutrient ledger.

`browser/ecology` contains the lab's unchanged monthly solver. `living-world.js` adapts its habitat, soil grid, initial population and crab travel tests to the actual height map. Initial organisms are explicit nutrient imports, not recurring rescue spawns. Canopy trees add light competition. Fruit falls, germination, growth, competition, predation, waste, death and decomposition run on the same clock. No fixed percentage predation is applied alongside actual crabs. The lab's artificial ellipse islands and eastward floating-seed transport are not used on this terrain; terrain-aware ocean dispersal remains future work.

`living-visuals.js` reuses the approved procedural forms and grounds them on sampled terrain. Walking crab motion is interpolated with terrain checks. Palms use fewer fronds at 40/100 m, ground coconuts render within 80 m, and detailed crabs within 65 m. These thresholds reduce draw work; transitions still need device review. Collision trunks rebuild after each simulated month. Crabs do not yet collide with the player or canopy trunks; existing player collision rules remain in terrain.js.

Controls: Walk the island as before. Visit a crab is an inspection-camera aid. Pause life freezes the ecology clock. Ecology speed defaults to one simulated month per real minute; 10× and 100× accelerate it. +1 year advances twelve solver steps in chunks while leaving walking/rendering responsive. The normal clock waits during this operation. Reset returns the player to the start; it does not reset ecology. Reload starts a new deterministic world. No save/persistence, harvesting, coconut-opening tools or combat is added.

Checks: `npm test` covers original terrain and build checks, island initialization, IDs and nutrient accounting, one year of real feeding/reproduction, dry-land crab travel, grounded render matrices, LOD/mesh budgets and app/control initialization with a mock WebGL renderer. `npm run build` produces the normal site plus a self-contained HTML. No Chrome/WebGL or real Android performance claim is made for this candidate. User review remains pending.

Source is prepared on a review branch; main/Pages deployment must not be described as updated until a merge and deployment actually succeed.
