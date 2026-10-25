## Canopy revision 03 — October 25, 2026

Palm crowns now use the exact endpoint of their leaning trunk; the former independent offsets could leave the crown visibly detached. Fronds have a continuous rachis at every LOD and a lower, drooping profile. Trunk-tip/crown-root agreement is checked across all four LODs.

Static canopy shading now uses 36 twig-cluster footprints per tree, baked from each of the same three form variants rendered on the island. Plant rotations, scales and terrain elevation transform these into world space. A cached 2 m horizontal / 0.5 m vertical light field estimates overlapping foliage transmission. Palms above a tree crown are not shaded by that crown. Optical density remains an experimental game assumption. The existing palm-neighbour competition is preserved; other species still do not consume soil nutrients or reproduce.

A paired deterministic 438-month run with seed 731 reproduced Ewan's screenshot exactly before the change: 4,275 palms, 1,601 coconuts, 135 crabs. Candidate: 4,398 palms, 1,501 coconuts, 70 crabs. Both encountered the technical capacity at month five, and both conserved the nutrient ledger within 2e-10 units. See [recorded comparison](experiments/canopy-comparison.json). This one pair does not demonstrate equilibrium, reduced density or better phone FPS. Canopy shading alone has not removed the population ceiling. Static-species root/soil competition is future work.

The first trial incorrectly replaced rather than retained palm-neighbour competition and grew to 5,535 palms with no crabs at month 438; it was rejected before release. The published candidate retains that tested competition.

All 17 automated checks and the static build pass. Real browser appearance and revision 03 phone performance remain pending. Ecology still runs on the main thread, so 100× can still hitch. The original screenshot's 30 FPS belongs to revision 02.

---

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
